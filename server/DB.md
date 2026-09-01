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


USER
 │
 └── OWNER
      │
      └── GROUND
           │
           ├── RESOURCE
           │    └── BOOKINGS
           │
           ├── RESOURCE
           │    └── BOOKINGS
           │
           └── RESOURCE
                └── BOOKINGS

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,

    ground_id INTEGER NOT NULL
        REFERENCES grounds(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    sport_type VARCHAR(50) NOT NULL,

    price_per_hour NUMERIC(10, 2) NOT NULL,

    opening_time TIME NOT NULL,

    closing_time TIME NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);