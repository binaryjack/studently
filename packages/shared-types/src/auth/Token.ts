/**
 * Token
 * JWT access and refresh token pair returned from auth endpoints
 * Not persisted to database, generated on demand
 */

export interface Token {
  /** JWT access token (RS256) */
  accessToken: string;

  /** JWT refresh token (RS256) */
  refreshToken: string;

  /** Token expiration in seconds */
  expiresIn: number;

  /** Token type (always "Bearer") */
  tokenType: "Bearer";

  /** Authorized scopes */
  scope: string[];

  /** ISO8601 timestamp when token was issued */
  issuedAt: string;

  /** ISO8601 timestamp when token expires */
  expiresAt: string;
}
