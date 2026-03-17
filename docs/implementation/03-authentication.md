# Identity Provider & Authentication

## Overview
The Identity Provider (IDP) is a standalone Fastify-based microservice responsible for authentication, authorization, and token management across the Studently platform. It uses RS256 JWT with asymmetric key pairs, supports MFA/TOTP, and implements refresh token rotation for enhanced security.

## Architecture

### Service Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│              Identity Provider (IDP)                     │
├─────────────────────────────────────────────────────────┤
│  • User registration & authentication                   │
│  • JWT generation & verification                        │
│  • Refresh token rotation                               │
│  • MFA/TOTP enrollment & validation                     │
│  • Session management                                   │
│  • Password reset & recovery                            │
│  • JWKS endpoint for public key distribution            │
│  • Multi-tenant user management                         │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Fastify (high-performance, schema-based)
- **Database**: PostgreSQL (user accounts, sessions)
- **Cache**: Redis (token blacklist, rate limiting)
- **JWT**: jose library (RS256 asymmetric signing)
- **Password**: bcrypt (hashing with salt)
- **MFA**: otpauth + qrcode (TOTP generation)
- **Validation**: Zod schemas

## JWT Strategy: RS256 Asymmetric

### Why RS256 Over HS256?

| Aspect | HS256 (Symmetric) | RS256 (Asymmetric) |
|--------|-------------------|-------------------|
| **Key Distribution** | Shared secret required | Public key distributed |
| **Security** | Secret leak = full compromise | Private key stays in IDP only |
| **Verification** | All services need secret | Services only need public key |
| **Key Rotation** | All services must update | Only IDP rotates private key |
| **Microservices** | Risky in distributed systems | Ideal for microservices |

### Key Pair Management

```typescript
// packages/identity-provider/src/lib/services/jwks.service.ts

import { generateKeyPair, exportJWK, exportPKCS8, exportSPKI } from 'jose';
import { promises as fs } from 'fs';

export const JwksService = function() {
  let currentKeyPair: { publicKey: string; privateKey: string } | null = null;
  let keyId: string = crypto.randomUUID();

  /**
   * Generate new RSA key pair for JWT signing
   */
  const generateKeys = async (): Promise<void> => {
    const { publicKey, privateKey } = await generateKeyPair('RS256', {
      modulusLength: 2048,
    });

    const publicPem = await exportSPKI(publicKey);
    const privatePem = await exportPKCS8(privateKey);

    currentKeyPair = { publicKey: publicPem, privateKey: privatePem };

    // Persist to disk for server restarts
    await fs.writeFile('/keys/private.pem', privatePem);
    await fs.writeFile('/keys/public.pem', publicPem);

    // Update key ID for rotation
    keyId = crypto.randomUUID();
  };

  /**
   * Get current private key for signing
   */
  const getPrivateKey = async (): Promise<string> => {
    if (!currentKeyPair) {
      await loadKeys();
    }
    return currentKeyPair!.privateKey;
  };

  /**
   * Get JWKS (JSON Web Key Set) for public distribution
   * Used by backend services to verify JWT signatures
   */
  const getJwks = async (): Promise<{ keys: any[] }> => {
    if (!currentKeyPair) {
      await loadKeys();
    }

    const publicKey = await importSPKI(currentKeyPair!.publicKey, 'RS256');
    const jwk = await exportJWK(publicKey);

    return {
      keys: [
        {
          ...jwk,
          kid: keyId,
          alg: 'RS256',
          use: 'sig',
        },
      ],
    };
  };

  /**
   * Load existing keys from disk
   */
  const loadKeys = async (): Promise<void> => {
    try {
      const publicPem = await fs.readFile('/keys/public.pem', 'utf-8');
      const privatePem = await fs.readFile('/keys/private.pem', 'utf-8');
      currentKeyPair = { publicKey: publicPem, privateKey: privatePem };
    } catch (error) {
      // No existing keys, generate new ones
      await generateKeys();
    }
  };

  /**
   * Rotate keys (scheduled task, e.g., every 90 days)
   */
  const rotateKeys = async (): Promise<void> => {
    // Archive old keys for grace period
    const timestamp = Date.now();
    await fs.writeFile(`/keys/archive/private-${timestamp}.pem`, currentKeyPair!.privateKey);
    await fs.writeFile(`/keys/archive/public-${timestamp}.pem`, currentKeyPair!.publicKey);

    // Generate new keys
    await generateKeys();
  };

  return {
    generateKeys,
    getPrivateKey,
    getJwks,
    loadKeys,
    rotateKeys,
  };
};
```

### JWKS Endpoint

```typescript
// packages/identity-provider/src/routes/jwks.routes.ts

import { FastifyInstance } from 'fastify';
import { JwksService } from '../lib/services/jwks.service';

export const jwksRoutes = async (app: FastifyInstance) => {
  const jwksService = JwksService();

  /**
   * GET /.well-known/jwks.json
   * Public endpoint for JWT verification keys
   * No authentication required
   */
  app.get('/.well-known/jwks.json', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            keys: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const jwks = await jwksService.getJwks();
    
    // Cache for 1 hour
    reply.header('Cache-Control', 'public, max-age=3600');
    
    return jwks;
  });
};
```

## JWT Token Structure

### Access Token (Short-lived)

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-uuid"
  },
  "payload": {
    "sub": "user-uuid",
    "tenantId": "tenant-uuid",
    "userId": "user-uuid",
    "email": "user@example.com",
    "role": "tenant-admin",
    "iat": 1710691200,
    "exp": 1710694800,
    "iss": "https://idp.studently.com",
    "aud": "https://api.studently.com",
    "jti": "token-uuid"
  },
  "signature": "..." 
}
```

**Lifetime**: 15 minutes (configurable)

### Refresh Token (Long-lived)

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-uuid"
  },
  "payload": {
    "sub": "user-uuid",
    "tenantId": "tenant-uuid",
    "tokenFamily": "family-uuid",
    "iat": 1710691200,
    "exp": 1713283200,
    "iss": "https://idp.studently.com",
    "aud": "https://api.studently.com",
    "jti": "refresh-token-uuid"
  },
  "signature": "..."
}
```

**Lifetime**: 30 days (configurable)

## Token Service Implementation

### Token Generation

```typescript
// packages/identity-provider/src/lib/services/token.service.ts

import { SignJWT } from 'jose';
import { JwksService } from './jwks.service';

export const TokenService = function() {
  const jwksService = JwksService();

  /**
   * Generate access token
   */
  const generateAccessToken = async (
    userId: string,
    tenantId: string,
    email: string,
    role: string
  ): Promise<string> => {
    const privateKey = await jwksService.getPrivateKey();
    const keyPair = await importPKCS8(privateKey, 'RS256');

    const token = await new SignJWT({
      tenantId,
      userId,
      email,
      role,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setSubject(userId)
      .setIssuer(process.env.JWT_ISSUER!)
      .setAudience(process.env.JWT_AUDIENCE!)
      .setIssuedAt()
      .setExpirationTime('15m')
      .setJti(crypto.randomUUID())
      .sign(keyPair);

    return token;
  };

  /**
   * Generate refresh token with family tracking
   */
  const generateRefreshToken = async (
    userId: string,
    tenantId: string,
    tokenFamily: string
  ): Promise<string> => {
    const privateKey = await jwksService.getPrivateKey();
    const keyPair = await importPKCS8(privateKey, 'RS256');

    const token = await new SignJWT({
      tenantId,
      tokenFamily,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setSubject(userId)
      .setIssuer(process.env.JWT_ISSUER!)
      .setAudience(process.env.JWT_AUDIENCE!)
      .setIssuedAt()
      .setExpirationTime('30d')
      .setJti(crypto.randomUUID())
      .sign(keyPair);

    // Store refresh token in database for rotation tracking
    await storeRefreshToken(userId, tenantId, tokenFamily, token);

    return token;
  };

  /**
   * Store refresh token for rotation detection
   */
  const storeRefreshToken = async (
    userId: string,
    tenantId: string,
    tokenFamily: string,
    token: string
  ): Promise<void> => {
    const { payload } = await jwtVerify(token, ...); // Decode for expiry
    
    await db.query(
      `INSERT INTO refresh_tokens (user_id, tenant_id, token_family, jti, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tenantId, tokenFamily, payload.jti, new Date(payload.exp! * 1000)]
    );
  };

  return {
    generateAccessToken,
    generateRefreshToken,
  };
};
```

### Token Refresh with Rotation

```typescript
// packages/identity-provider/src/lib/services/token.service.ts

/**
 * Refresh tokens with automatic rotation
 * Detects reuse attacks and invalidates entire token family
 */
const refreshTokens = async (refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> => {
  try {
    // Verify refresh token signature
    const publicKey = await jwksService.getJwks();
    const { payload } = await jwtVerify(refreshToken, publicKey.keys[0]);

    // Check if token has been used before (reuse detection)
    const existingToken = await db.queryOne(
      `SELECT * FROM refresh_tokens WHERE jti = $1`,
      [payload.jti]
    );

    if (!existingToken) {
      // Token reuse detected - invalidate entire family
      await invalidateTokenFamily(payload.tokenFamily);
      throw new Error('Token reuse detected - session invalidated');
    }

    // Mark current token as used
    await db.query(
      `UPDATE refresh_tokens SET used_at = NOW() WHERE jti = $1`,
      [payload.jti]
    );

    // Generate new token pair with same family
    const accessToken = await generateAccessToken(
      payload.sub!,
      payload.tenantId,
      existingToken.email,
      existingToken.role
    );

    const newRefreshToken = await generateRefreshToken(
      payload.sub!,
      payload.tenantId,
      payload.tokenFamily
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    // Invalid token or expired
    return null;
  }
};

/**
 * Invalidate all tokens in a family (on reuse detection)
 */
const invalidateTokenFamily = async (tokenFamily: string): Promise<void> => {
  await db.query(
    `DELETE FROM refresh_tokens WHERE token_family = $1`,
    [tokenFamily]
  );
};
```

## MFA / TOTP Implementation

### MFA Enrollment

```typescript
// packages/identity-provider/src/lib/services/mfa.service.ts

import { authenticator } from 'otpauth';
import QRCode from 'qrcode';

export const MfaService = function() {
  /**
   * Generate TOTP secret for user
   */
  const generateSecret = async (userId: string, email: string): Promise<{
    secret: string;
    qrCode: string;
    recoveryCodes: string[];
  }> => {
    // Generate secret
    const secret = authenticator.generateSecret();

    // Generate OTP auth URL
    const otpauth = authenticator.keyuri(email, 'Studently', secret);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauth);

    // Generate recovery codes (10 random codes)
    const recoveryCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store secret (encrypted) and recovery codes (hashed)
    await db.query(
      `UPDATE users 
       SET mfa_secret = pgp_sym_encrypt($1, $2),
           mfa_recovery_codes = $3,
           mfa_enabled = false
       WHERE id = $4`,
      [secret, process.env.ENCRYPTION_KEY!, JSON.stringify(recoveryCodes.map(hashRecoveryCode)), userId]
    );

    return {
      secret,
      qrCode,
      recoveryCodes,
    };
  };

  /**
   * Verify TOTP code during enrollment
   */
  const verifyEnrollment = async (userId: string, code: string): Promise<boolean> => {
    const user = await db.queryOne(
      `SELECT pgp_sym_decrypt(mfa_secret::bytea, $1) as secret 
       FROM users WHERE id = $2`,
      [process.env.ENCRYPTION_KEY!, userId]
    );

    if (!user || !user.secret) {
      return false;
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.secret,
    });

    if (isValid) {
      // Enable MFA
      await db.query(
        `UPDATE users SET mfa_enabled = true WHERE id = $1`,
        [userId]
      );
    }

    return isValid;
  };

  /**
   * Verify TOTP code during login
   */
  const verifyCode = async (userId: string, code: string): Promise<boolean> => {
    const user = await db.queryOne(
      `SELECT pgp_sym_decrypt(mfa_secret::bytea, $1) as secret 
       FROM users WHERE id = $2 AND mfa_enabled = true`,
      [process.env.ENCRYPTION_KEY!, userId]
    );

    if (!user || !user.secret) {
      return false;
    }

    return authenticator.verify({
      token: code,
      secret: user.secret,
    });
  };

  /**
   * Verify recovery code
   */
  const verifyRecoveryCode = async (userId: string, code: string): Promise<boolean> => {
    const user = await db.queryOne(
      `SELECT mfa_recovery_codes FROM users WHERE id = $1`,
      [userId]
    );

    if (!user || !user.mfa_recovery_codes) {
      return false;
    }

    const hashedCodes = JSON.parse(user.mfa_recovery_codes);
    const hashedInput = hashRecoveryCode(code);

    const codeIndex = hashedCodes.indexOf(hashedInput);
    if (codeIndex === -1) {
      return false;
    }

    // Remove used recovery code
    hashedCodes.splice(codeIndex, 1);
    await db.query(
      `UPDATE users SET mfa_recovery_codes = $1 WHERE id = $2`,
      [JSON.stringify(hashedCodes), userId]
    );

    return true;
  };

  const hashRecoveryCode = (code: string): string => {
    return crypto.createHash('sha256').update(code).digest('hex');
  };

  return {
    generateSecret,
    verifyEnrollment,
    verifyCode,
    verifyRecoveryCode,
  };
};
```

## Authentication Flow

### Login Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │   IDP   │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  POST /auth/login        │                          │
     ├─────────────────────────>│                          │
     │  { email, password }     │                          │
     │                          │  Query user              │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │<─────────────────────────┤
     │                          │  User record             │
     │                          │                          │
     │                          │  Verify password (bcrypt)│
     │                          │                          │
     │                          │  Check MFA enabled?      │
     │                          │                          │
     │  If MFA: { requiresMfa, │                          │
     │           sessionId }    │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │  POST /auth/mfa-verify   │                          │
     ├─────────────────────────>│                          │
     │  { sessionId, code }     │                          │
     │                          │  Verify TOTP             │
     │                          │                          │
     │  { accessToken,          │                          │
     │    refreshToken }        │                          │
     │<─────────────────────────┤                          │
     │                          │  Store refresh token     │
     │                          ├─────────────────────────>│
     │                          │                          │
```

### Token Verification (Backend)

```typescript
// packages/backend/src/common/middleware/auth.middleware.ts

import { jwtVerify, createRemoteJWKSet } from 'jose';
import { getTenantContext, tenantStorage } from '../tenant-context';

const JWKS_URL = process.env.IDP_JWKS_URL || 'http://localhost:3001/.well-known/jwks.json';
const getJwks = createRemoteJWKSet(new URL(JWKS_URL));

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify JWT signature using public key from JWKS
    const { payload } = await jwtVerify(token, getJwks, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    // Check token blacklist (logout)
    const isBlacklisted = await redis.exists(`blacklist:${payload.jti}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Set tenant context for request
    const context = {
      tenantId: payload.tenantId as string,
      userId: payload.userId as string,
      role: payload.role as string,
      email: payload.email as string,
    };

    // Execute request within tenant context
    tenantStorage.run(context, () => {
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Session Management

### Active Sessions

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  token_family UUID NOT NULL,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_tenant (tenant_id)
);
```

### Logout Implementation

```typescript
// packages/identity-provider/src/routes/auth.routes.ts

/**
 * POST /auth/logout
 * Blacklist current access token and invalidate refresh token
 */
app.post('/auth/logout', {
  preHandler: [authMiddleware],
}, async (request, reply) => {
  const { jti } = request.user; // From JWT payload
  const { refreshToken } = request.body;

  // Blacklist access token until expiry
  const ttl = request.user.exp - Math.floor(Date.now() / 1000);
  await redis.setex(`blacklist:${jti}`, ttl, '1');

  // Invalidate refresh token
  if (refreshToken) {
    const { payload } = await jwtVerify(refreshToken, ...);
    await db.query(
      `DELETE FROM refresh_tokens WHERE jti = $1`,
      [payload.jti]
    );
  }

  return { message: 'Logged out successfully' };
});

/**
 * POST /auth/logout-all
 * Invalidate all sessions for user (all devices)
 */
app.post('/auth/logout-all', {
  preHandler: [authMiddleware],
}, async (request, reply) => {
  const { userId } = request.user;

  // Delete all refresh tokens
  await db.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );

  // Note: Current access tokens will expire naturally (15 min)
  // For immediate revocation, maintain access token blacklist per user

  return { message: 'All sessions invalidated' };
});
```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret BYTEA,
  mfa_recovery_codes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  UNIQUE(tenant_id, email),
  INDEX idx_users_tenant (tenant_id),
  INDEX idx_users_email (email)
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  token_family UUID NOT NULL,
  jti UUID NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_family (token_family),
  INDEX idx_refresh_tokens_jti (jti)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  
  INDEX idx_password_reset_user (user_id)
);
```

## Environment Configuration

```env
# Identity Provider
IDP_PORT=3001
IDP_HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://admin:secret@localhost:5432/studently

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ISSUER=https://idp.studently.com
JWT_AUDIENCE=https://api.studently.com
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=30d

# Encryption
ENCRYPTION_KEY=<strong-encryption-key>

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://app.studently.com

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15m
```

---

**Document Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Final
