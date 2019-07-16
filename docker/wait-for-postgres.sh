#!/bin/bash -x
# wait-for-postgres.sh

set -e

user="$1"
host="$2"
port="$3"
shift
shift
shift
cmd="$@"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -p "$port" -U "$user" -c '\q'; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - executing command"
source $cmd
