# studently

Student Management Software — pnpm + TypeScript monorepo.

## Repository structure

```
studently/
├── apps/        # Applications (added as the project grows)
├── packages/    # Shared libraries / packages (added as the project grows)
├── .github/     # GitHub Actions, issue templates, PR template
├── package.json # Monorepo root — workspace scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json  # Shared TS compiler options (extended by each package/app)
└── tsconfig.json       # Root project-references config
```

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — `npm install -g pnpm`

## Getting started

```bash
# Install all workspace dependencies
pnpm install

# Build all packages / apps
pnpm build

# Run all tests
pnpm test

# Lint all packages / apps
pnpm lint
```

## Adding a new package

```bash
mkdir -p packages/my-package
cd packages/my-package
pnpm init
```

Each package should have its own `tsconfig.json` that extends the root base:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## Adding a new app

```bash
mkdir -p apps/my-app
cd apps/my-app
pnpm init
```
