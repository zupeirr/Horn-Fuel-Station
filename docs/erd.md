# Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string password
        string role "Admin, Cashier"
        datetime created_at
    }

    FUEL_TYPES {
        int id PK
        string name "e.g., Diesel, Regular"
        decimal current_price
    }

    TANKS {
        int id PK
        string name
        int capacity
        int current_level
        int fuel_type_id FK
    }

    PUMPS {
        int id PK
        string name
        int tank_id FK
        boolean is_active
    }

    TRANSACTIONS {
        uuid id PK
        int pump_id FK
        uuid user_id FK
        decimal liters
        decimal price_per_liter
        decimal total_amount
        datetime created_at
    }

    SESSIONS {
        uuid id PK
        uuid user_id FK
        datetime start_time
        datetime end_time
    }

    USERS ||--o{ TRANSACTIONS : creates
    PUMPS ||--o{ TRANSACTIONS : dispenses
    TANKS ||--o{ PUMPS : supplies
    FUEL_TYPES ||--o{ TANKS : contains
    USERS ||--o{ SESSIONS : opens
```

## Description
- **USERS**: Represents both Admins and Cashiers.
- **FUEL_TYPES**: Defines standard fuel types and current pricing.
- **TANKS**: Physical storage of fuel, tracking capacity and alerts.
- **PUMPS**: The point of sale linked to specific tanks.
- **TRANSACTIONS**: Each individual fuel sale, recording liters, price, and calculating total.
- **SESSIONS**: User shifts/login sessions for auditing.
