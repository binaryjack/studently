## Summary

<!-- One paragraph: what does this PR do and why? -->

Fixes #<!-- issue number, or "N/A" -->

---

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing behaviour to change)
- [ ] Refactor (no functional change, code quality improvement)
- [ ] Documentation update
- [ ] CI / tooling / dependency update

---

## Affected packages / apps

- [ ] Root / CI / tooling
- [ ] `packages/*` (shared library)
- [ ] `apps/*` (application)

---

## How to test this

<!-- Exact commands a reviewer can run to verify the change. -->

```bash
pnpm install
pnpm build
pnpm test
```

---

## Checklist

- [ ] `pnpm build` passes with no TypeScript errors
- [ ] `pnpm test` passes (no regressions)
- [ ] `pnpm lint` passes for all affected packages
- [ ] Tests added or updated for changed behaviour
- [ ] No API keys, secrets, or PII introduced in any file
- [ ] Docs updated if the public API changed

---

## Screenshots / output (if applicable)

<!-- Terminal output, UI screenshot, or diff of generated files. -->

---

## Notes for reviewers

<!-- Anything the reviewer should know: trade-offs made, known limitations, follow-up issues. -->
