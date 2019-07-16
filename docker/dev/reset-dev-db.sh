#!/bin/bash -x
echo "Initialize and seed the development database"
echo "DROP DATABASE IF EXISTS MOCK_DEVELOPMENT; CREATE DATABASE MOCK_DEVELOPMENT;" | psql --host=db --port=5432 --username=postgres
export PGDATABASE=mock_development
/go/bin/rambler --debug --configuration /container/config/rambler.json --environment dockerdev apply --all
cd /container && NODE_ENV=development node src/db/seeders/index.js
