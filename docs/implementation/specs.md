# Implementation Specifications - Studently Platform

## Overview

This directory contains comprehensive implementation documentation for the **Studently** platform - a modern student and institute management system designed for Swiss educational institutions with ORP integration, AI capabilities, and workflow automation.

## Documentation Index

### 📋 [00 - Implementation Roadmap](00-implementation-roadmap.md)
**Master summary with project phases, cost estimation, and timeline**
- 10 implementation phases (60-78 weeks)
- Total cost: $238,000 - $328,000
- Team composition and resource requirements
- Revenue model and break-even analysis
- Risk assessment and success metrics

### 🧱 [01 - Base Interfaces](01-base-interfaces.md)
**Foundational TypeScript interfaces for all entities**
- `BaseEntity`: GUID, sequence, code, order, audit fields
- `TranslatableEntity`: Multi-language support with database-driven translations
- `FlaggedEntity`: isSelected, isActive flags
- Cursor-based pagination pattern
- Translation service and validation schemas

### 🏗️ [02 - Architecture](02-architecture.md)
**System architecture and technology stack**
- Monorepo structure with Feature Slice Design
- Node.js + Express backend, React frontend
- PostgreSQL + Redis infrastructure
- Multi-tenant architecture with AsyncLocalStorage
- API design and deployment strategies

### 🔐 [03 - Authentication](03-authentication.md)
**Identity Provider with RS256 JWT and MFA**
- Fastify-based authentication microservice
- Asymmetric JWT (RS256) with JWKS endpoint
- Refresh token rotation with reuse detection
- MFA/TOTP implementation
- Session management and token blacklisting

### 📊 [04 - Entities](04-entities.md)
**Core domain entities and database schemas**
- Student management (with Swiss-specific fields)
- Learning paths and competencies
- Career and experience tracking
- Time tracking (projects, timesheets, entries)
- Absence management
- Document versioning
- Evaluation and reporting
- Complete database schemas and Zod validation

### ⚙️ [05 - Workflow Engine](05-workflow-engine.md)
**Generic workflow orchestration system**
- State machine architecture
- 20+ action types (AI, email, document, approval, web search)
- Transition conditions and guards
- Timeout and escalation support
- Flexible payload system (documents, images, links, metadata)
- Complete workflow examples (CV approval, timesheet approval)

### 🏛️ [06 - Feature Slice Design](06-feature-slice-design.md)
**Architectural pattern implementation (NON-NEGOTIABLE)**
- Feature-first code organization
- Public API pattern for each feature
- Dependency rules and guidelines
- Complete feature slice examples (backend + frontend)
- Testing strategy per feature

### 🤖 [07 - AI Integration](07-ai-integration.md)
**AI capabilities and provider abstraction**
- Multi-provider support (OpenAI, Anthropic, Azure OpenAI)
- CV skills extraction and quality evaluation
- Company research agent with web search
- Evaluation assistance (comment generation)
- Prompt template management
- Usage tracking and cost monitoring

### 🇨🇭 [08 - Swiss Requirements](08-swiss-requirements.md)
**Swiss-specific compliance and integration**
- ORP (Office Régional de Placement) integration
- LACI/RI/AI employment status tracking
- AVS/AHV social security number management
- Swiss labor law compliance (working hours limits)
- Canton and work permit tracking
- Multilingual support (FR/DE/IT/RM/EN)
- FADP data privacy compliance

## Quick Reference

### Core Technologies

| Layer    | Technology         | Purpose                       |
| -------- | ------------------ | -------------------------------------- |
| backend  | docker PostgreSQL  | db.studently                           |
| backend  | docker NestJS Zod  | api.studently                          |
| backend  | docker Node.js     | services.studently                     |
| backend  | Redis              | services.studently                     |
| backend  | IDP                | idp.studently                          |
| frontend | docker Next.js     | services.studently (showcase website)  |



