# Implementation Specs

## Monorepo

Initiate a monorepo structure for the project.

## Services

| Layer    | Technology         | Domain / Service                       |
| -------- | ------------------ | -------------------------------------- |
| backend  | docker PostgreSQL  | db.studently                           |
| backend  | docker NestJS Zod  | api.studently                          |
| backend  | docker Node.js     | services.studently                     |
| backend  | Redis              | services.studently                     |
| backend  | IDP                | idp.studently                          |
| frontend | docker Next.js     | services.studently (showcase website)  |
