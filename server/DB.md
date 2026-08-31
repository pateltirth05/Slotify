USER
 │
 ├──────────────┐
 │              │
 │              ▼
 │           ARENA
 │              │
 │              ▼
 │          RESOURCE
 │              │
 │              ▼
 └────────── BOOKING
                 │
                 ▼
              PAYMENT



CREATE TABLE grounds (
    id SERIAL PRIMARY KEY,

    owner_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    photos TEXT[],

    location TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    facilities TEXT[],

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);