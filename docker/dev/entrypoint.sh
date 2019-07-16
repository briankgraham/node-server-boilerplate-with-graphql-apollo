#!/bin/bash -x
source /container/docker/dev/reset-dev-db.sh
source /container/docker/dev/reset-test-db.sh

echo "Starting the dev server"
cd /container && yarn dev
