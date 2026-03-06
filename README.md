# Horn-Fuel-Station

A comprehensive fuel station management system. This project provides tools for managing pumps, tanks, recording sales, generating receipts, and producing daily sales reports.

## Current Status
- **Progress:** 100% (Phases 0-7 complete).
- **Features:** Auth, Sales, Inventory, PDF Receipts, WS Telemetry, Payments, Audit Logs, and Swagger Docs.

## Quick Start (Docker)

Run everything with one command:
```bash
docker-compose up
```

- **Frontend**: [http://localhost](http://localhost)
- **API Docs (Swagger)**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Architecture

- **Backend**: Node.js + Express API with Sequelize ORM.
- **Frontend**: React (Vite) Single Page Application.
- **Real-time**: WebSocket server for live pump telemetry.
- **Security**: JWT Authentication, RBAC, Joi Input Validation, and Audit Logging.
- **Containerization**: Orchestrated via Docker Compose.

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** SQLite (Dev) / MySQL (Prod ready)
- **Frontend:** React (Vite) + Lucide Icons + Glassmorphism CSS
- **Communication**: REST API + WebSockets
- **Documentation**: Swagger UI

## Documentation
- [Operations Guide](docs/ops-guide.md)
- [Feature Specification](docs/feature-spec.md)
- [ERD Diagram](docs/erd.md)

## License
MIT