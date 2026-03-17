# AGENT-6: Showcase Website Implementation

## SYSTEM INSTRUCTIONS
Read: `.github/copilot-instructions.md` → Next.js app router, SSR/SSG, SEO, performance optimization.

## SPECIFICATION
Read: `docs/implementation/19-showcase-website.md` → All 18 pages, Swiss compliance, dark mode design.

## TASKS

### Task 1: Next.js Project Setup
**Output**: `showcase/` folder
- Create Next.js 14 project with App Router
- TypeScript strict mode
- Tailwind CSS configured (dark mode only)
- Folder structure:
  ```
  showcase/
  ├── app/
  │   ├── layout.tsx (root)
  │   ├── page.tsx (homepage)
  │   ├── globals.css (Tailwind)
  │   ├── (auth)/
  │   │   ├── layout.tsx
  │   │   └── contact/page.tsx
  │   └── legal/
  │       ├── privacy/page.tsx
  │       ├── terms/page.tsx
  │       ├── gdpr/page.tsx
  │       └── ...
  ├── components/ (shared components)
  ├── public/ (images, logos)
  └── next.config.js
  ```

### Task 2: Layout Components
**Output**: `showcase/components/`
- RootLayout.tsx (Header, Footer, dark mode provider)
- Header.tsx (Logo, navigation menu, CTA button, language switcher)
- Footer.tsx (Links, copyright, social media, contact)
- Navigation.tsx (Home, Features, Compliance, Case Studies, Blog, Pricing, Contact)
- ThemeProvider.tsx (dark mode only, no toggle needed)

**Requirements**:
- Responsive (mobile-first)
- Sticky header (stays on top while scrolling)
- Mobile hamburger menu
- Dark mode colors from design system

### Task 3: Homepage (`/`)
**Output**: `showcase/app/page.tsx` + hero component
- Hero section (80vh, headline, subheadline, CTA buttons)
- Value Propositions (3 columns: Student Management, Swiss Compliance, Modern Platform)
- Key Features Grid (6 cards: Student Mgmt, Learning Paths, Timesheets, Absences, Documents, Workflows)
- Statistics Section (metrics: students, paths, hours tracked, compliance rate)
- CTA Section (demo request form)
- Footer

**Requirements**:
- SSG (pre-render at build time)
- Performance: Lighthouse 95+
- Images: WebP with fallbacks, lazy loading
- Structured data (JSON-LD: Organization, BreadcrumbList)

### Task 4: Features Pages
**Output**: `showcase/app/features/` + individual feature pages

**A. Features Index** (`/features`)
- Feature category cards (6 cards, click to navigate)
- Brief description of each

**B. Feature Detail Pages** (`/features/{category}`)
- Student Management (`/features/students`)
  - Hero: "Complete student profiles with Swiss employment status"
  - Feature list with icons
  - Screenshot (dark mode)
  - Sub-features (LACI, RI, AI, AVS/ORP, documents, work permit)
  - CTA: "Explore in demo"

- Learning Paths (`/features/learning-paths`)
  - Hero: "Structured, competency-based learning"
  - Feature list (create, publish, competencies, progress, assessment, multi-language)
  - Screenshot
  - Use cases (3 scenarios)
  - CTA

- Timesheets (`/features/timesheets`)
  - Hero: "Accurate, compliant time tracking"
  - Workflow diagram (student → educator → manager)
  - Feature list + icons
  - ORP integration explanation
  - Screenshot (mobile-friendly timesheet form)
  - CTA

- Absences (`/features/absences`)
  - Hero: "Streamlined absence tracking & compliance"
  - Feature list
  - Calendar visualization example
  - CTA

- Documents (`/features/documents`)
  - Hero: "Secure document storage & retrieval"
  - Feature list (types, search, version control, access, audit)
  - Screenshot (document library)

- Workflows (`/features/workflows`)
  - Hero: "Flexible approval processes"
  - Feature list
  - Workflow builder example (visual)
  - CTA

**Requirements**:
- Markdown content OR Contentful CMS integration
- Responsive images (srcset)
- Code syntax highlighting (if any code samples)
- Internal linking (consistent URLs)

### Task 5: Compliance Page (`/compliance`)
**Output**: `showcase/app/compliance/page.tsx`
- Hero: "Built for Swiss institutional requirements"
- Compliance Frameworks (6 cards: ORP, LACI, RI, AI, Data Protection, Accessibility)
- Swiss Labor Law Compliance (canton-specific, work permit tracking)
- Security & Privacy (encryption, RLS, audit logging, backup, DPA template download)
- Certifications (ISO 27001 status, SOC 2, GDPR, Swiss assessment)

**Requirements**:
- Download DPA template (PDF link)
- Security badge/certifications (if available)
- Trust signals (compliance dates, audit results)

### Task 6: Pricing Page (`/pricing`)
**Output**: `showcase/app/pricing/page.tsx`
- Hero: "Accessible pricing for all institution sizes"
- Pricing Tiers (3: Starter, Professional, Enterprise)
  - Per tier: Features list, price/year (or "Government-funded"), CTA
- Features Comparison Table (rows = features, columns = tiers)
- FAQ section (collapsible)

**Requirements**:
- Pricing might be government-funded (adjust copy)
- Comparison table responsive (scroll on mobile)

### Task 7: Case Studies Page (`/case-studies`)
**Output**: `showcase/app/case-studies/page.tsx` + individual case study pages
- Case Studies Index: 3-4 case study cards
  - Per card: Organization name + logo, program type, challenge summary, results highlights
  - Click → detail page

- Individual Case Study (`/case-studies/{slug}`)
  - Organization info (name, logo, location)
  - Challenge (2-3 paragraphs)
  - Solution (how Studently helped)
  - Results (metrics with numbers)
  - Quote from organization head
  - Call-to-action (request demo)

**Requirements**:
- Markdown frontmatter (date, author, featured image)
- Case study data in JSON OR Contentful
- Open Graph meta tags (sharing)

### Task 8: Testimonials Page (`/testimonials`)
**Output**: `showcase/app/testimonials/page.tsx`
- Testimonials grid (8-10 cards)
- Per card: Quote, author name, role, organization, photo, rating
- Video testimonials section (embedded iframes, 2-3 videos)
- Trust badge (X institutions trust Studently)

### Task 9: About Page (`/about`)
**Output**: `showcase/app/about/page.tsx`
- Mission statement (company vision, commitment to education)
- Team section (3-5 key team members: photo, name, role, bio)
- Company highlights (founding date, location, focus areas)
- Roadmap preview (upcoming features by quarter)
- Call-to-action (join team or partner)

### Task 10: Contact Page (`/contact`)
**Output**: `showcase/app/contact/page.tsx`
- Contact form (name, email, organization, role, message type dropdown, message)
- Form validation (Zod)
- Success message (thank you, we'll contact within 24 hours)
- Direct contact info (email, phone, address)
- FAQ link
- Maps embed (office location)

**Requirements**:
- Server action (form submission)
- Email notification (send to info@studently.swiss)
- Spam protection (reCAPTCHA v3)

### Task 11-17: Legal Pages
**Output**: `showcase/app/legal/` folder
Each page: SSG (pre-render), Markdown content OR direct HTML

- Privacy Policy (`/legal/privacy`)
  - GDPR compliance, data collection, user rights (access, deletion, portability)
  - Swiss FADP requirements
  - Cookie policy (Plausible analytics)
  - Contact for privacy concerns

- Terms of Service (`/legal/terms`)
  - License grant, user responsibilities, acceptable use policy
  - Limitation of liability, indemnification
  - Dispute resolution (Swiss law, Zurich courts)
  - Link to DPA

- GDPR DPA (`/legal/dpa`)
  - Downloadable PDF template
  - Article 28 compliant
  - Scope, obligations, sub-processors, rights, audit

- Cookie Policy (`/legal/cookies`)
  - Cookie list (essential, analytics, marketing)
  - User consent management
  - Preferences link

- Accessibility Statement (`/legal/accessibility`)
  - WCAG 2.1 Level AA commitment
  - Known issues & workarounds
  - Accessibility features
  - Contact for concerns
  - Request accessible version option

- Imprint (`/legal/imprint`)
  - Company name, address, phone, email
  - CEO, registration number, VAT
  - Responsible for editorial content

- Security & Compliance (`/legal/security`)
  - SSL/TLS encryption, data backup, penetration testing
  - Vulnerability disclosure program
  - Incident response, DPA template download

### Task 12: Blog Index Page (`/blog`)
**Output**: `showcase/app/blog/page.tsx`
- Blog post grid (12 most recent)
- Search & category filter
- Featured post (hero)
- "Subscribe for updates" CTA

**Requirements**:
- Markdown-based (files in `content/blog/`) OR Contentful
- Pagination (12 per page)
- Category filtering

### Task 13: Blog Post Template (`/blog/[slug]`)
**Output**: `showcase/app/blog/[slug]/page.tsx`
- Post title, author, date, reading time
- Featured image
- Content (markdown → HTML)
- Related posts (3, same category)
- Comment section (optional, Disqus or similar)
- Share buttons (Twitter, LinkedIn)
- Next/previous navigation

**Requirements**:
- SEO (meta tags, OpenGraph)
- JSON-LD (BlogPosting schema)
- Auto-calculate reading time

### Task 14: 404 & Error Pages
**Output**: `showcase/app/not-found.tsx` + `showcase/app/error.tsx`
- 404: Friendly message + link to homepage
- Error: Apologize + email support link

### Task 15: SEO & Performance
**Output**: `showcase/next.config.js` + `showcase/app/layout.tsx`
- Sitemap generation (next-sitemap OR manual)
- robots.txt configuration
- Meta tags (title, description, og:image)
- JSON-LD structured data (Organization, FAQ, BreadcrumbList)
- Image optimization (Image component, srcset)
- Code splitting (dynamic imports)
- Static generation (SSG for all pages)
- ISR (Incremental Static Regeneration) for blog posts

**Performance Targets**:
- Lighthouse: 95+ score
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Task 16: Internationalization (i18n)
**Output**: `showcase/next.config.js` + language routing
- Languages: German (de-CH), French (fr-CH), Italian (it-CH), English (en)
- URL structure: `/de/`, `/fr/`, `/it/`, `/en/`
- Language switcher in header/footer
- Automatic language detection (Accept-Language header)
- Translated content (markdown files per language)

**Tool**: next-intl OR next-i18next

### Task 17: Analytics & Monitoring
**Output**: `showcase/components/Analytics.tsx`
- Plausible Analytics integration (privacy-first, no cookies)
- Goal tracking (form submissions, email signups, CTA clicks)
- Custom events (feature explores, demo requests)
- Uptime monitoring (Freshping integration)
- Error monitoring (Sentry integration)

## TESTS

### Unit Tests
**File**: `showcase/__tests__/components/`
- RootLayout: Render → verify header, footer present
- Header: Render → verify navigation links → verify mobile menu toggle
- ContactForm: Render → fill form → verify validation → submit dispatch

**Target**: ≥75% coverage (component logic)

### Integration Tests
**File**: `showcase/__tests__/integration/`
- Homepage: Render → verify hero, features, CTA sections present
- Contact flow: Render contact page → fill form → submit → success message
- Navigation: Click features link → verify /features page loads
- Legal pages: Verify all 7 legal pages load without errors

**Target**: ≥70% coverage (page flows)

### E2E Tests
**File**: `showcase/__tests__/e2e/`
- Homepage load: Navigate to / → verify hero visible → verify Lighthouse score > 90
- Feature navigation: / → Click Features → See feature cards → Click Student Mgmt → Detail page loads
- Contact form: / → Click "Request Demo" → Contact page → Fill form → Submit → Success message
- Legal pages: Footer → Click Privacy → Privacy page loads → Verify content → Back → Footer visible
- Mobile responsive: All pages render on 375px viewport → buttons/inputs accessible

**Tool**: Playwright  
**Target**: ≥70% coverage (user journeys)

## REPORTING

```
[AGENT-6] SHOWCASE WEBSITE
Status: [COMPLETED|IN-PROGRESS|FAILED]
Tasks: [n/17] completed
  ✓ Next.js Project Setup
  ✓ Layout Components
  ✓ Homepage (hero, features, CTA)
  ✓ Features Pages (6 detail pages)
  ✓ Compliance Page
  ✓ Pricing Page
  ✓ Case Studies Page
  ✓ Testimonials Page
  ✓ About Page
  ✓ Contact Page
  ✓ Legal Pages (7)
  ✓ Blog System (index + dynamic posts)
  ✓ 404 & Error Pages
  ✓ SEO & Performance
  ✓ Internationalization (4 languages)
  ✓ Analytics & Monitoring

Tests: unit=X/X | integration=Y/Y | e2e=Z/Z
Code: showcase/
Performance:
  - Lighthouse: X/100
  - LCP: Xms
  - FID: Xms
  - CLS: X

Files Created:
  - app/ (18 pages)
  - components/ (layout, navigation, cards, forms)
  - content/blog/ (markdown posts)
  - public/ (images, logos)
  - __tests__/ (unit + integration + e2e)
  - next.config.js (SEO, i18n, optimization)

Issues: [0|list]
Next: [Ready for testing and deployment]
```

## SUCCESS CRITERIA

- [ ] All 18 pages render without errors
- [ ] Homepage load time < 2.5s (LCP)
- [ ] Lighthouse score ≥95
- [ ] Mobile responsive (375px viewport works)
- [ ] All links work (internal + external)
- [ ] Contact form submits successfully
- [ ] Dark mode applied (no light mode)
- [ ] SEO: meta tags present, structured data valid
- [ ] i18n: All 4 languages have content
- [ ] Legal pages complete (7 pages)
- [ ] Blog system works (SSG + dynamic rendering)
- [ ] Unit tests: ≥75% pass rate
- [ ] Integration tests: ≥70% pass rate
- [ ] E2E tests: ≥70% pass rate
- [ ] Zero blocking issues

---

**Agent-6 Version**: 1.0  
**Estimated Duration**: 3-4 days  
**Start When**: After Agent-3 (Design System) available (can use same design tokens/colors)
