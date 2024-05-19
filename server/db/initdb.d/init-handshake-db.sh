#!/usr/bin/env bash

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER handshake;
    CREATE DATABASE handshake_db ENCODING UTF8;
    GRANT ALL PRIVILEGES ON DATABASE handshake_db TO handshake;
    ALTER USER handshake WITH PASSWORD 'password123';
    ALTER USER handshake WITH SUPERUSER;
EOSQL