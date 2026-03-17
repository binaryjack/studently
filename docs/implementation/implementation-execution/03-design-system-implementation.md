# AGENT-3: Design System Implementation

## SYSTEM INSTRUCTIONS
Read: `.github/copilot-instructions.md` → React patterns, component design, Tailwind usage.

## SPECIFICATION
Read: `docs/implementation/21-design-system-redux-architecture.md` (Part 1: Dark Mode Design System)

## TASKS

### Task 1: Design Tokens (CSS Variables)
**Output**: `frontend/src/assets/styles/tokens.css`
- Color tokens (surfaces, text, borders, semantic)
- Opacity scales
- Spacing scale (0-12 tokens)
- Typography (font families, sizes, weights, line heights)
- Border radius scale
- Shadow system (elevation shadows + focus)
- Animations (durations, easing functions)
- Breakpoints

**Requirements**:
- Dark mode colors: #0f0f0f background, #1a1a1a surfaces
- 4.5:1 text contrast (WCAG AA)
- Organized by category (CSS custom properties)

### Task 2: Component Library - Base (Atoms)
**Output**: `frontend/src/shared/components/`
- Button.tsx (primary, secondary, tertiary, danger, disabled)
- IconButton.tsx (square, icon-only variant)
- Input.tsx (text, password, email, number, with error state)
- TextArea.tsx (multi-line, auto-resize, character count)
- Select.tsx (dropdown, multi-select, searchable, disabled)
- Checkbox.tsx (single, indeterminate, disabled)
- Radio.tsx (group, disabled)
- Label.tsx (required indicator, tooltip support)
- Badge.tsx (status colors: success, error, warning, info)
- Avatar.tsx (user avatar, initials fallback, sizes)

**Requirements**:
- Tailwind CSS classes
- TypeScript interfaces (props)
- Accessibility (aria-labels, keyboard navigation)
- 48px minimum touch target (mobile)
- Dark mode only (no light mode toggle)

### Task 3: Component Library - Form Components
**Output**: `frontend/src/shared/components/Forms/`
- FormField.tsx (label + input + error wrapper)
- FormGroup.tsx (group multiple fields)
- TextInput.tsx (wrapped Input + FormField)
- TextAreaField.tsx (wrapped TextArea + FormField)
- SelectField.tsx (wrapped Select + FormField)
- DatePicker.tsx (date input + calendar widget)
- TimePicker.tsx (time input + time selector)
- FileUpload.tsx (drag & drop, preview, progress)
- ToggleSwitch.tsx (on/off toggle)

**Requirements**:
- React Hook Form compatible
- Zod error message display
- Required field indicator
- Disabled state support

### Task 4: Component Library - Data Display
**Output**: `frontend/src/shared/components/DataDisplay/`
- Table.tsx (responsive, sortable, filterable, virtualized for 1000+ rows)
- TableHeader.tsx (with sort icons)
- TableBody.tsx (with striping, hover effects)
- TableCell.tsx (with overflow handling)
- Grid.tsx (responsive grid layout, mobile-first)
- Card.tsx (standard card + hover effect)
- List.tsx (item list with separators)
- Pagination.tsx (prev/next buttons, page numbers, cursor)
- EmptyState.tsx (no data message + icon)

**Requirements**:
- Desktop-first grids (hidden on mobile if admin-grid class)
- Responsive tables (stack on mobile)
- Virtual scrolling for performance

### Task 5: Component Library - Modals & Feedback
**Output**: `frontend/src/shared/components/`
- Modal.tsx (overlay, centered, close button, animations)
- ConfirmDialog.tsx (delete confirmation with cancel/confirm)
- FormModal.tsx (form inside modal)
- AlertDialog.tsx (alert with single action)
- Notification.tsx (toast at top, auto-dismiss, action button)
- Toast.tsx (bottom-right notifications)
- Spinner.tsx (loading indicator, sizes)
- SkeletonLoader.tsx (content placeholder)
- ProgressBar.tsx (linear progress, percentage)

**Requirements**:
- Focus management (focus trap in modal)
- Keyboard dismissal (Esc key)
- Accessibility (aria-modal, role="alertdialog")

### Task 6: Component Library - Charts
**Output**: `frontend/src/shared/components/Charts/`
- BarChart.tsx (recharts wrapper)
- LineChart.tsx (recharts wrapper)
- PieChart.tsx (recharts wrapper)
- AreaChart.tsx (recharts wrapper)
- ChartTooltip.tsx (dark mode tooltip)

**Requirements**:
- Recharts integration
- Dark mode colors
- Responsive sizing
- Legend support

### Task 7: Tailwind Configuration
**Output**: `frontend/tailwind.config.ts`
- Extend colors (from tokens.css)
- Custom breakpoints
- Dark mode configuration (class-based)
- Plugins (forms, typography)
- Utility class generation

### Task 8: Global Styles
**Output**: `frontend/src/assets/styles/globals.css`
- Tailwind directives (@tailwind base, components, utilities)
- Reset styles (normalize.css merged with Tailwind)
- Typography defaults (body font, line height)
- Scrollbar styling (dark mode)
- Dark mode variables override
- Focus ring customization (3px blue)

## TESTS

### Unit Tests
**File**: `frontend/__tests__/components/atoms/Button.test.tsx`, etc.
- Render test (component mounts without error)
- Props test (variant, size, disabled states)
- Event test (onClick fires, disabled prevents click)
- Accessibility test (aria-labels present, keyboard accessible)
- Snapshot test (visual regression check)

**Target**: ≥90% coverage (all components, all variants)

### Visual Regression Tests
**File**: `frontend/__tests__/visual/`
- Screenshot each component variant (dark mode only)
- Button: primary, secondary, tertiary, danger, disabled
- Input: focused, error, disabled, placeholder
- Badge: success, error, warning, info
- Modal: open, with form
- Compare against baseline

**Tool**: Playwright visual comparisons OR Percy  
**Target**: All 50+ component variants covered

### E2E Component Tests
**File**: `frontend/__tests__/e2e/components/`
- Modal open → fill form → submit → close
- Table sort → filter → paginate
- DatePicker select date → verify input value
- FileUpload drag & drop → verify preview → upload
- Notification trigger → verify display → auto-dismiss

**Target**: ≥80% coverage (user interactions)

## REPORTING

```
[AGENT-3] DESIGN SYSTEM
Status: [COMPLETED|IN-PROGRESS|FAILED]
Tasks: [n/8] completed
  ✓ Design Tokens (50+ CSS variables)
  ✓ Base Components (Atoms: 10+)
  ✓ Form Components (10+)
  ✓ Data Display (8+)
  ✓ Modals & Feedback (9+)
  ✓ Charts (5)
  ✓ Tailwind Config
  ✓ Global Styles

Tests: unit=X/X | visual=Y/Y | e2e=Z/Z
Code: frontend/src/shared/components/
Files Created:
  - assets/styles/tokens.css (design tokens)
  - assets/styles/globals.css (base styles)
  - shared/components/ (40+ components)
  - tailwind.config.ts
  - __tests__/ (unit + visual + e2e)

Issues: [0|list]
Next: [Ready for Agent-6 (Backoffice) and Agent-7 (Showcase)]
```

## SUCCESS CRITERIA

- [ ] All design tokens defined in CSS
- [ ] 40+ components created with full variants
- [ ] Dark mode colors applied (no light mode)
- [ ] Accessibility: WCAG 2.1 Level AA (4.5:1 contrast, keyboard nav)
- [ ] Touch targets: 48px minimum
- [ ] Unit tests: ≥90% pass rate
- [ ] Visual regression: all variants covered
- [ ] E2E tests: ≥80% pass rate
- [ ] Tailwind configured correctly
- [ ] Zero blocking issues

---

**Agent-3 Version**: 1.0  
**Estimated Duration**: 3-4 days  
**Start When**: Anytime (no dependencies)
