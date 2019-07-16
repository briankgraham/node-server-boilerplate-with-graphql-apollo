#!/bin/bash
echo "Initialize and seed the test database"
echo "DROP DATABASE IF EXISTS MOCK_TEST; CREATE DATABASE MOCK_TEST;" | psql --host=db --port=5432 --username=postgres
export PGDATABASE=mock_test
/go/bin/rambler --debug --configuration /container/config/rambler.json --environment dockertest apply --all
cd /container && NODE_ENV=test node src/db/seeders/index.js
