CREATE_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    uuid UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS cars (
    car_id SERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS car_details (
    detail_id SERIAL PRIMARY KEY,
    car_id INTEGER NOT NULL REFERENCES cars(car_id) ON DELETE CASCADE,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    mileage INTEGER,
    last_maintenance_checkup DATE,
    last_oil_change DATE,
    purchase_date DATE,
    last_brake_pad_change DATE
);

CREATE TABLE IF NOT EXISTS error_events (
    error_event_id SERIAL PRIMARY KEY,
    car_id INTEGER NOT NULL REFERENCES cars(car_id) ON DELETE CASCADE,
    error_codes TEXT,
    occurrence_mileage INTEGER,
    occurrence_date DATE
);

CREATE TABLE IF NOT EXISTS error_parts (
    part_id SERIAL PRIMARY KEY,
    error_event_id INTEGER NOT NULL REFERENCES error_events(error_event_id) ON DELETE CASCADE,
    part_name VARCHAR(255)
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
"""
