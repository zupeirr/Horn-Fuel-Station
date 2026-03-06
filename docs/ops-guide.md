# Operations & Deployment Guide

## Deployment (Docker)

To deploy the Horn Fuel Station system to a production environment:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/zupeirr/Horn-Fuel-Station.git
    cd Horn-Fuel-Station
    ```

2.  **Configure Environment**:
    Create a `.env` file in the root directory (based on `.env.example`). Ensure `JWT_SECRET` is set to a long, random string.

3.  **Build and Start Containers**:
    ```bash
    docker-compose up -d --build
    ```

## Database Maintenance

### Backups (SQLite)
If using the default SQLite database, simply backup the `server/database.sqlite` file.
```bash
cp server/database.sqlite ./backups/database_$(date +%F).sqlite
```

### Migrations
We use Sequelize Migrations for database structure changes.
To run pending migrations:
```bash
npx sequelize-cli db:migrate
```

## Monitoring & Logs

### View Application Logs
```bash
docker-compose logs -f api
```

### Error Tracking
All critical errors are logged to `logs/error.log` inside the server directory. The system uses **Winston** for structured logging.

## Security Procedures

1.  **Secret Rotation**: To rotate the JWT secret, update the `.env` file and restart the `api` container.
2.  **Audit Logs**: Transactional integrity is maintained in the `AuditLogs` table. Admins can query this table to investigate discrepancies.

## Rollback Strategy

To rollback to a previous version:
1.  Identify the stable git tag (e.g., `v0.9.0`).
2.  `git checkout v0.9.0`
3.  `docker-compose up -d --build` (Docker will rebuild the images based on the old version).
4.  If a database rollback is required, restore the corresponding SQLite backup.
