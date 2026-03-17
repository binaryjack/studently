# Showcase Website - Implementation Specification

## Overview

**Purpose**: Public-facing website showcasing Studently platform for Swiss confederation employment office and institutional buyers

**Target Audience**: 
- Government officials (confederation employment office)
- Educational institutions (vocational schools, training centers)
- Training organizations (Träger)
- HR professionals
- Policy makers

**Design Philosophy**: 
- Minimalist, dark mode (Swiss government aesthetic)
- Professional, trustworthy appearance
- Accessibility-first (WCAG 2.1)
- Mobile-responsive (desktop-first for content-heavy pages)
- Government/institutional market positioning

**Tech Stack**:
- **Framework**: Next.js 14+ (App Router, SSR for SEO)
- **Styling**: Tailwind CSS + Headless UI
- **Language**: TypeScript
- **Content**: Markdown + MDX (for dynamic content)
- **CMS**: Contentful (optional, for blog/testimonials)
- **Analytics**: Plausible or Matomo (privacy-first)
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel or self-hosted

**Performance Targets**:
- Lighthouse: 95+ score
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Time to interactive: < 3.5s

---

## Page Structure (18 pages)

### 1. **HOMEPAGE** (`/`)
**Purpose**: First impression, feature highlights, CTA

**Sections**:
1. **Hero** (80vh)
   - Headline: "Unified vocational training platform for Swiss confederation"
   - Subheadline: "Streamline student management, learning paths, timekeeping, and government compliance"
   - CTA buttons: "Request Demo" | "View Features"
   - Background: Subtle gradient (dark blue → black)
   - Hero image: Dashboard screenshot (dark theme)

2. **Value Propositions** (3 columns)
   - Icon + title + 2-line description
   - Column 1: "Student Management"
     - "Complete student lifecycle from enrollment to graduation"
   - Column 2: "Swiss Compliance"
     - "ORP, LACI, RI, AI integration out of the box"
   - Column 3: "Modern Platform"
     - "Dark mode, responsive, accessible, security-first"

3. **Key Features Grid** (6 cards)
   - Student Management System
   - Learning Path Management
   - Timesheet Tracking
   - Absence Management
   - Document Management
   - Workflow & Approvals

4. **Statistics Section**
   - "Platform by the numbers" (4 metrics, initially from demo)
   - e.g., "1000+ students managed", "500+ learning paths", "10M+ hours tracked"

5. **CTA Section**
   - "Ready to transform your training program?"
   - "Request a 30-minute demo with our product team"
   - Form: Name, Email, Organization, Role

6. **Footer Navigation**
   - Links to all pages, legal pages

---

### 2. **FEATURES PAGE** (`/features`)
**Purpose**: Deep dive into platform capabilities

**Sections**:

1. **Hero**
   - "All-in-one solution for vocational training"
   - "Everything you need to manage training programs effectively"

2. **Feature Categories** (6 major categories, expandable cards)

   **A. Student Management**
   - "Complete student profiles with Swiss employment status"
   - Features:
     * Multi-profile support (LACI, RI, AI, employed, student)
     * AVS/ORP integration
     * Document management (ID, contracts, certificates)
     * Emergency contacts & family data
     * Work permit tracking
   - Screenshot: Student profile page (dark mode)

   **B. Learning Paths**
   - "Structured, competency-based learning"
   - Features:
     * Create & publish learning paths
     * Competency frameworks (5-level system)
     * Progress tracking
     * Assessment integration
     * Multi-language support
   - Screenshot: Learning path editor

   **C. Timekeeping**
   - "Accurate, compliant time tracking"
   - Features:
     * Weekly timesheet submission
     * Project & task categorization
     * Approver workflows
     * ORP export (unemployment tracking)
     * Historical reporting
   - Screenshot: Timesheet grid

   **D. Absence Management**
   - "Streamlined absence tracking & compliance"
   - Features:
     * Multiple absence types (sick, vacation, personal, excused)
     * Approval workflows
     * Calendar visualization
     * Evidence upload
     * ORP notification
   - Screenshot: Absence calendar

   **E. Document Management**
   - "Secure document storage & retrieval"
   - Features:
     * Document types (contracts, certificates, diplomas)
     * Full-text search
     * Version control
     * Access control
     * Audit trail
   - Screenshot: Document library

   **F. Workflows & Approvals**
   - "Flexible approval processes"
   - Features:
     * Visual workflow builder
     * Role-based approval chains
     * Conditional routing
     * Email notifications
     * Audit trail
   - Screenshot: Workflow designer

3. **Comparison Table** (vs. spreadsheets, vs. generic HRIS)
   - Rows: Student management, compliance, time tracking, reporting, support
   - Columns: Studently | Excel | Generic HRIS
   - Studently wins all rows

4. **AI Integration Section**
   - "AI-powered document processing"
   - Automatic document classification
   - Data extraction
   - Compliance analysis
   - "Coming Q4 2024"

---

### 3. **LEARNING PATHS PAGE** (`/features/learning-paths`)
**Purpose**: Detailed feature walkthrough

**Content**:
- Step-by-step tutorial (screenshots with annotations)
- Demo video (3min)
- Use cases (3: Initial training, Advanced skills, Recertification)
- Competency framework explanation
- Assessment integration
- CTA: "Explore learning paths in demo"

---

### 4. **TIMESHEETS PAGE** (`/features/timesheets`)
**Purpose**: Time tracking feature deep-dive

**Content**:
- Workflow diagram: Student creates → Educator reviews → Manager approves
- Features list with icons
- ORP integration explanation
- Reporting capabilities
- Mobile timesheet entry (responsive design)
- CTA: "See timesheets in action"

---

### 5. **COMPLIANCE PAGE** (`/compliance`)
**Purpose**: Government compliance & Swiss-specific features

**Sections**:

1. **Hero**
   - "Built for Swiss institutional requirements"
   - "ORP, LACI, RI, AI, and more"

2. **Compliance Frameworks** (6 cards)
   - **ORP Integration**: Description + certification date
   - **LACI Support**: Unemployment insurance case management
   - **RI Support**: Early intervention program tracking
   - **AI Support**: Work hardening program integration
   - **Data Protection**: GDPR + Swiss FADP compliance
   - **Accessibility**: WCAG 2.1 Level AA

3. **Swiss Labor Law Compliance**
   - "Studently adheres to all Swiss employment regulations"
   - Canton-specific requirements
   - Work permit tracking (B, C, G, L, N, S permits)
   - Mandatory reporting features

4. **Security & Privacy**
   - Data encryption (AES-256)
   - Row-level security (multi-tenant isolation)
   - Audit logging (all actions)
   - Backup & disaster recovery
   - DPA template (download link)

5. **Certifications**
   - ISO 27001 (when achieved)
   - SOC 2 Type II (when achieved)
   - GDPR certification
   - Swiss data protection assessment

---

### 6. **PRICING PAGE** (`/pricing`)
**Purpose**: Transparent, government-friendly pricing

**Note**: Studently is government-funded, so this page focuses on institution size & features

**Sections**:

1. **Hero**
   - "Accessible pricing for all institution sizes"
   - "Supported by confederation employment office"

2. **Pricing Model** (3 tiers)

   **Tier 1: Starter** (20-100 students)
   - Features: Student management, basic learning paths
   - Cost: CHF X,XXX/year (or "Government-funded")
   - CTA: "Contact sales"

   **Tier 2: Professional** (100-500 students)
   - All Starter features +
   - Timesheets, Absences, Workflows
   - Advanced reporting
   - Cost: CHF X,XXX/year

   **Tier 3: Enterprise** (500+ students)
   - All Professional features +
   - Custom integrations
   - Dedicated support
   - API access
   - Cost: Custom quote

3. **Features Comparison Table**
   - Rows: Student management, learning paths, timesheets, compliance, support
   - Columns: Starter | Professional | Enterprise

4. **FAQ**
   - "What's included in government funding?"
   - "Can we customize the platform?"
   - "What's your support SLA?"
   - "Do you offer training for our team?"

---

### 7. **CASE STUDIES PAGE** (`/case-studies`)
**Purpose**: Real-world success stories

**Structure**: 3-4 case studies (to be updated as clients go live)

**Per Case Study**:
- Organization name & logo
- Program type (e.g., "Vocational training center, Zurich")
- Challenge (2-3 sentences)
- Solution (how Studently helped)
- Results (metrics: students trained, hours tracked, compliance achieved)
- Quote from institution head
- "Read full case study" link

**Example Case Study**:
- **Organization**: Berufsbildungszentrum Zurich
- **Challenge**: Manual timesheet management, no ORP tracking, student data scattered across spreadsheets
- **Solution**: Implemented Studently for 200 students across 5 programs
- **Results**: 
  - 95% timesheet submission rate (vs. 60% manual)
  - ORP compliance 100%
  - Administrative time reduced by 40 hours/week
- **Quote**: "Studently has transformed how we manage student data and compliance. It's become indispensable to our program delivery." — Director, BBZ Zurich

---

### 8. **TESTIMONIALS PAGE** (`/testimonials`)
**Purpose**: Social proof from institutional users

**Content**:
- 8-10 testimonials (cards with photo, name, role, organization, quote)
- Video testimonials (embedded, 2-3 brief interviews)
- "X institutions trust Studently" (metric with logo grid)

---

### 9. **ABOUT US PAGE** (`/about`)
**Purpose**: Company background & mission

**Sections**:
1. **Mission Statement**
   - "Streamline vocational training through technology"
   - "Supporting Swiss confederation in education"

2. **Team**
   - Bios of 3-5 key team members (name, role, background)
   - Photos

3. **Company Highlights**
   - Founded: 202X
   - Based: Switzerland
   - Focus: Vocational education
   - Commitment: Swiss data protection, accessibility

4. **Roadmap Preview**
   - Q3 2024: Feature 1
   - Q4 2024: AI document processing
   - Q1 2025: Feature 2

5. **CTA**: "Join our team" or "Partner with us"

---

### 10. **CONTACT US PAGE** (`/contact`)
**Purpose**: Lead generation & support

**Sections**:
1. **Contact Form**
   - Name, Email, Organization, Role
   - Message type: Demo request, Integration inquiry, Support, Other
   - Message
   - Validation with Zod
   - Success: "Thank you, we'll be in touch within 24 hours"

2. **Direct Contact Info**
   - Email: info@studently.swiss
   - Phone: +41 XX XXX XXXX
   - Office address
   - Maps embed

3. **FAQ Link**
   - "Quick answers to common questions"

---

### 11-17. **LEGAL PAGES** (7 pages)

#### 11. **Privacy Policy** (`/legal/privacy`)
- GDPR compliance
- Data collection & usage
- User rights (access, deletion, portability)
- Cookie policy
- Third-party processors (Vercel, Contentful, etc.)
- Swiss FADP requirements
- Contact for privacy concerns

**Template**: 
```markdown
# Datenschutz & Privatsphäre

## Wer wir sind
Studently AG, Zurich, Switzerland

## Welche Daten wir sammeln
- Kontaktdaten (Name, Email, Organization)
- Usage data (IP, pages visited, session duration)
- Student data (managed by institution admins)

## Ihre Rechte
- Right to access your data
- Right to deletion (GDPR Art. 17)
- Right to portability (GDPR Art. 20)
- Right to object to processing
- Right to withdraw consent

## How to contact us
privacy@studently.swiss
```

#### 12. **Terms of Service** (`/legal/terms`)
- License grant (non-exclusive, non-transferable)
- User responsibilities
- Acceptable use policy
- Limitation of liability
- Indemnification
- Dispute resolution (Swiss law, Zurich courts)
- GDPR Data Processing Agreement (link)

#### 13. **GDPR Data Processing Agreement** (`/legal/dpa`)
- Downloadable PDF template
- Article 28 compliant
- Scope of data processing
- Processor obligations
- Sub-processor list
- Data subject rights support
- Audit rights
- Signature fields (Institution + Studently)

#### 14. **Cookie Policy** (`/legal/cookies`)
- List of cookies used
- Essential (authentication, security)
- Analytics (Plausible, privacy-focused)
- Marketing (none, privacy-first approach)
- User consent banner
- Cookie preferences link

#### 15. **Accessibility Statement** (`/legal/accessibility`)
- WCAG 2.1 Level AA commitment
- Known issues & workarounds
- Accessibility features
- Testing tools & methods
- Contact for accessibility concerns
- Request accessible version (PDF, large print, etc.)

#### 16. **Imprint** (`/legal/imprint`)
- Company name: Studently AG
- Address: [Address], Switzerland
- Phone: +41 XX XXX XXXX
- Email: info@studently.swiss
- CEO: [Name]
- Company registration number
- VAT number
- Responsible for editorial content: [Name]

#### 17. **Security & Compliance** (`/legal/security`)
- SSL/TLS encryption
- Data backup & recovery
- Penetration testing (annual)
- Vulnerability disclosure program
- Incident response procedure
- DPA template download

---

### 18. **BLOG INDEX PAGE** (`/blog`)
**Purpose**: Educational content, thought leadership

**Content**:
- Blog post grid (12 most recent)
- Search & category filter
- Featured post (hero section)
- "Subscribe for updates" CTA

**Sample Blog Posts** (initial 6):
1. "ORP Integration: How to streamline unemployment tracking"
2. "LACI Case Management Best Practices"
3. "Building competency frameworks for vocational programs"
4. "Time tracking for apprenticeships: A Swiss guide"
5. "Data protection in student information systems"
6. "Transitioning from spreadsheets to Studently"

**Per Blog Post**:
- Headline + slug
- Author (name, company)
- Publication date + last updated
- Reading time (auto-calculated)
- Category (Compliance, Best Practices, Case Study, Tutorial)
- Featured image
- Content (markdown)
- Call-to-action: "Ready to implement this?"
- Related posts (3, auto-linked by category)

---

## Design System

### Color Palette

**Dark Mode** (Primary):
- Background: `#0f0f0f` (near black)
- Surface: `#1a1a1a` (dark gray)
- Border: `#2a2a2a` (medium gray)
- Text Primary: `#ffffff` (white)
- Text Secondary: `#b0b0b0` (light gray)
- Text Tertiary: `#808080` (medium gray)

**Accent Colors**:
- Primary Blue: `#0071e3` (action buttons, links)
- Success Green: `#10b981` (confirmations, success states)
- Warning Orange: `#f59e0b` (alerts, cautions)
- Error Red: `#ef4444` (errors, destructive actions)

**Government Aesthetic**:
- Minimalist, professional
- High contrast for accessibility
- Avoid vibrant colors
- Use icons consistently

### Typography

- **Headline Font**: Inter (sans-serif, modern, government-appropriate)
- **Body Font**: Inter (same, consistency)
- **Sizes**:
  - H1: 48px (hero headlines)
  - H2: 36px (section headlines)
  - H3: 24px (subsections)
  - Body: 16px
  - Small: 14px

### Component Library (Reusable)

- **Buttons**: Primary, secondary, tertiary, disabled states
- **Cards**: Standard card layout, hover effect
- **Forms**: Input, textarea, select, checkbox, radio
- **Navigation**: Header, footer, breadcrumbs
- **Modals**: Form modal, confirmation modal
- **Alerts**: Success, warning, error, info
- **Tags**: Feature tags, category tags
- **Icons**: 30+ SVG icons (feature-specific)

### Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px - 1440px
- Large Desktop: 1441px+

**Mobile-First Approach**:
- Single column on mobile
- 2-3 columns on tablet
- Full layout on desktop
- Touch-friendly buttons (48px × 48px minimum)

---

## Performance Optimization

### Image Optimization
- Next.js Image component (auto-optimization)
- WebP format with fallbacks
- Lazy loading for below-fold images
- Responsive images (multiple sizes)

### Code Splitting
- Route-based code splitting (Next.js)
- Component lazy loading
- Avoid large dependencies

### Caching Strategy
- Static generation (SSG) for legal pages, blog
- Incremental Static Regeneration (ISR) for dynamic content
- 60-second revalidation for case studies

### Third-Party Scripts
- Plausible Analytics (lightweight, privacy-first)
- No tracking cookies
- Embed after page load (non-blocking)

---

## SEO Strategy

### Technical SEO
- Sitemap XML generation
- robots.txt configuration
- Canonical URLs
- JSON-LD structured data (Organization, FAQ, BreadcrumbList)
- Meta tags (title, description, og:image)

### Content SEO
- Target keywords:
  - "Vocational training platform Switzerland"
  - "Student information system"
  - "ORP integration"
  - "Swiss timesheet software"
- Long-tail keywords in blog
- Internal linking strategy

### Internationalization (i18n)

**Languages**:
- German (de-CH) - primary
- French (fr-CH)
- Italian (it-CH)
- English (en) - optional

**Implementation**:
- Next.js i18n-router (or next-intl)
- Translated markdown files
- Language switcher in header/footer
- URL structure: `/de/`, `/fr/`, `/it/`, `/en/`

---

## Accessibility (WCAG 2.1 Level AA)

### Standards Compliance
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support (ARIA labels, semantic HTML)
- Color contrast (4.5:1 for text)
- Focus indicators (visible, 3px)
- Alternative text for images

### Forms
- Labels associated with inputs
- Error messages linked to fields
- Required field indicators
- Placeholder text not as label

### Navigation
- Logical heading structure (h1 → h2 → h3)
- Skip navigation link
- Breadcrumbs for context
- Clear page titles

---

## Security

### HTTPS & TLS
- All traffic encrypted
- HSTS header enabled
- Certificate pinning (optional)

### Content Security Policy
- Restrict script sources
- Prevent XSS attacks
- No inline scripts

### CORS & CSRF
- CORS restricted to trusted domains
- CSRF tokens for forms
- SameSite cookie attribute

### Form Security
- Input validation (server & client)
- Rate limiting on contact form
- CAPTCHA (reCAPTCHA v3, invisible)
- Email verification for newsletter

---

## Analytics & Monitoring

### Plausible Analytics
- Track pageviews, referrers, bounce rate
- Goal tracking (form submissions, email signups)
- Custom events (CTA clicks, feature explores)
- No cookies, GDPR-compliant

### Error Monitoring
- Sentry integration (error tracking)
- Automatic error reporting
- Source map upload
- Performance monitoring

### Uptime Monitoring
- Freshping or similar
- Endpoint monitoring (API health)
- Alert on downtime

---

## Content Management

### Blog & Case Studies
- Markdown files (git-based) OR Contentful CMS
- Frontmatter: title, author, date, category, featured
- MDX support for interactive components

### Dynamic Content
- Testimonials (JSON data file or CMS)
- Feature list (component-based)
- Case study data (structured data)

---

## Deployment & Hosting

### Hosting Options
1. **Vercel** (Recommended)
   - Git integration (GitHub)
   - Automatic deployments on push
   - Edge caching & CDN
   - Serverless functions for contact form
   - Cost: $20-50/month

2. **Self-Hosted**
   - Docker container
   - AWS/Azure/DigitalOcean
   - Nginx reverse proxy
   - Cost: $50-200/month

### CI/CD Pipeline
- GitHub Actions
- Test on every push
- Build & deploy on merge to main
- Preview deployments for PRs
- Production deploy with manual approval

---

## Development Roadmap

**Phase 1: Launch (Weeks 1-4)**
- Homepage, Features, Compliance, Contact pages
- Legal pages (privacy, terms, GDPR DPA)
- Design system & components
- Deploy to staging environment
- SEO optimization

**Phase 2: Content (Weeks 5-6)**
- Blog platform (3-5 initial posts)
- Case studies page (2-3 case studies)
- Testimonials (6-8)
- Blog post publishing workflow

**Phase 3: Polish (Weeks 7-8)**
- A/B testing on CTAs
- Accessibility audit (external)
- Performance optimization
- Analytics setup
- Production launch

---

## Future Enhancements
- Dark/light mode toggle (currently dark-only)
- Multi-language blog (initial German only)
- Video testimonials (recorded interviews)
- Demo request → Automated scheduling (Calendly integration)
- Live chat (optional, for support)
- Affiliate program (for training organizations)

---

**Document Version**: 1.0  
**Date**: March 17, 2026  
**Status**: READY FOR DEVELOPMENT
