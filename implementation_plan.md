# Implementation Plan: Horn Fuel Station

This plan details the steps to take the Horn-Fuel-Station project from its current state (~10%) to a completed production-ready MVP, broken down exactly into the 4 phases outlined in the project requirements.

## Proposed Changes

### Phase 0 — Prep
- **Create internal Git structure**: Ensure `main` and `develop` branches exist. We will do our work on `develop`.
- **Add top-level Config files**: 
  - `[NEW] .gitignore`
  - `[NEW] LICENSE` (MIT)

### Phase 1 — Project Foundation
- **Documentation**:
  - `[MODIFY] README.md` (Update with starter content and project overview)
  - `[NEW] CONTRIBUTING.md`
  - `[NEW] CODE_OF_CONDUCT.md`
- **Configuration & Tooling**:
  - `[MODIFY] package.json` (Add scripts: start, dev, test, lint, build)
  - `[NEW] .prettierrc` and `[NEW] eslint.config.js` or `.eslintrc.js` (Install ESLint + Prettier)
  - `[NEW] .env.example`
- **Folder Structure Restructuring**:
  - Rename the existing `src/` folder to `server/` to house the backend API.
  - Create the `client/` folder to prepare for the React application.
- **CI/CD setup**:
  - `[NEW] .github/workflows/ci.yml` (Skeleton for lint, test, build).

### Phase 2 — Define MVP & Data Model
- **Documentation**:
  - `[NEW] docs/feature-spec.md` (MVP scope)
  - `[NEW] docs/erd.md` (Entity-Relationship Diagram using Mermaid)
  - `[NEW] docs/openapi.yml` (Swagger API skeleton)

### Phase 3 — Core Implementation
- **Backend (`server/`)**:
  - Adapt the existing Express code to correctly serve standalone REST endpoints instead of EJS views.
  - Finalize database choice (Sequelize + MySQL/SQLite) and set up `migrations` and `seeders`.
  - Implement Auth0 or JWT-based authentication in `/api/auth`.
  - Implement CRUD logic for `/users`, `/pumps`, `/tanks`, `/transactions`, `/reports`.
  - Add simple HTML-to-PDF logic for receipts.
- **Frontend (`client/`)**:
  - Initialize React + Vite application.
  - Set up routing (React Router) and state management/API fetching (React Query / Axios).
  - Build UI pages: Login, Dashboard, Pumps, New Sale, Transactions, Reports, Settings.

### Phase 4 — Testing, CI/CD & Containerization
- **Testing**:
  - Add Jest unit tests for the backend.
  - Add Supertest for backend API endpoints.
  - Add Jest + React Testing Library tests for frontend components.
  - Add Cypress for E2E testing of the full system flow.
- **Containerization**:
  - `[NEW] server/Dockerfile`
  - `[NEW] client/Dockerfile`
  - `[NEW] docker-compose.yml` (Server, Client, DB)

### Phase 5 — Integrations & Ops
- **PDF Generation**: Integrate `html-pdf-node` or similar library on the server to convert the current HTML receipt into a downloadable PDF format.
- **Mock Payment Gateway**: Setup a `/api/payments/mock` endpoint that simulates a Stripe/Local Gateway response.
- **WS Integration**: Implement an `UpdatePumpData` WebSocket in `server/server.js` for real-time telemetry simulations.
- **Robust Migrations**: Setup `sequelize-cli` to prepare for switching from SQLite to MySQL for production consistency.

### Phase 6 — Security, Roles & Compliance
- **RBAC Hardening**: Extend the `authenticate` and `requireAdmin` middlewares to support more granular roles if needed.
- **Request Validation**: Implement `Joi` or `express-validator` across all POST/PUT routes to sanitize user input.
- **Audit Logs**:
  - `[NEW] server/models/AuditLog.js` (Capturing who performed which action).
  - Add a specialized `auditLogger` middleware for transaction endpoints.
- **Secrets Management**: Ensure all sensitive credentials (JWT secrets, etc.) are moved exclusively to `.env`.

### Phase 7 — Documentation & Release
- **API Documentation**:
  - Use `swagger-jsdoc` to generate the OpenAPI spec from route comments.
  - Setup `/docs` route using `swagger-ui-express`.
- **Ops Guide**:
  - `[NEW] docs/ops-guide.md` (Backup, Restore, Rollback instructions).
- **Release**: Prepare a final `v1.0.0` tag in git.

---

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run test` in both `server/` and `client/` to verify code quality and logic.
- Run Cypress headless locally to ensure E2E flows work.

### Manual Verification
- **Local Dev Server**: Start `docker-compose up` to run the DB, API, and Frontend. Ensure the local frontend properly communicates with the backend API.
- **MVP Flow**: Manually log in as a cashier, perform a sample fuel sale transaction, verify that the transaction is saved in the database, the pump fuel level goes down, and a receipt is generated.
- Verify Admin dashboard accurately reflects the new transaction total.
- **New Integration Verification**: Download a receipt as PDF and verify the formatting matches the HTML view.
- **Security Verification**: Try accessing `/api/reports` with a cashier account and ensure access is denied.
