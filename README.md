
# Mock Node+GraphQL Server

Node / ES6+ / Express / Postgres / Redis / Yarn / Apollo + GraphQL

* Node version: 12.6.0
* Apollo / Graphql for most needs
* Has the option for REST if it's needed
* Contains an opinionated CircleCI `config` that can run your tests, build the docker container, and push to AWS/ECS
* Express for middleware
* Jest for testing, Supertest for mocking express
* Tests & Linter run on `prepush` to prevent failing tests entering the codebase
* Persistence using Sequelize/Postgres
* Dockerized using Alpine and Yarn
* User signup, login and password reset API using JSON Web Token
* JSON Rest API for user management (admin)
* User encryption using BCrypt
* Auth via cookies, but a token option exists, see `lib/users/retrieval`
* Redis if needed (connected in `docker-compose` and mocked for testing, up to you on how to use it, see `lib/cache/index.js`)
* AirBnB style syntax and ES linting
* Configuration using environment variables
* Prettier on precommit to verify your code style is consistent
* lint-watcher ```yarn run lint:watch```
* test-watcher ```yarn run test:watch```
* default user: `admin@imfake.ai`, pw: `admin.mockserver`

## Directory Structure

* `package.json` - Configure dependencies
* `config/defaults.json` - Default configuration, all values can be controlled via env vars
* `src` - All source code
* `src/*/__tests__` - Unit tests
* `src/run.js` - Entrypoint for running and binding API
* `src/lib` - Library files like utils etc
* `src/api` - Express routes
* `src/middleware` - Middleware libs
* `src/db` - Sequelize Directory (Postgres, Migrations, configs)
* `src/index.js` - Entrypoint into API (does not bind, so can be used in unit tests)

## API Routes

All routes are name spaced with a v1 version:

```
POST    /v1/users                                               # Create user (signup)
POST    /v1/users/sessions                                      # Create session cookies or option of jwt (login)
GET     /v1/users/self                                          # Get my user info
DELETE  /v1/users/self                                          # Delete my account
POST    /v1/users/self                                          # Update my account
POST    /v1/users/password/forgot                               # Get forgot password token
GET     /v1/users                                               # Admin: Search/List users
GET     /v1/users/:user_id                                      # Admin: Get user
DELETE  /v1/users/:user_id                                      # Admin: Delete user
POST    /v1/users/:user_id                                      # Admin: Update user
```

When creating a new route, always use catchErrors HOC in utils/asyncErrorHandler.
See api/v1/users/index.js to see how its used. Basically wrap it around the request function.
Will bubble any errors to the response handler.

## Database Structure

See /src/db/models/index.js to understand how the DB gets initiated and used with each request.


## Running locally

We use Docker for setting up and configuring our local environment. Install [Docker for Mac](https://docs.docker.com/docker-for-mac/) or [Docker for Windows](https://docs.docker.com/docker-for-windows/), if you don't have it yet.


## Getting Started

First setup the local environment variables.

Copy `.env.example` to `.env` (By default, `.env.example` is setup to point to the docker containers)

Next, install the node modules and start the docker containers.

```
yarn install                      # install node modules locally
docker-compose up                 # start postgres, redis, and app containers
```

Optional method to start docker containers and run containers in the background.

```
docker-compose up --detach        # OPTIONAL: start postgres, redis and app containers and run in background
```

Other useful commands via package.json scripts.

```
yarn run docker:test              # run unit tests in docker container
yarn run docker:resetTestDb       # reset the mock_test database in docker container
yarn run docker:resetDevDb        # reset the mock_development database in docker container
```

```
docker-compose exec -T app sh -c 'NODE_ENV=test yarn run test --bail --testNamePattern "testpattern"'
```

If you are having problems

```
docker-compose stop               # stop the docker containers
docker-compose up --build         # rebuild and start the docker containers
```


### MISC PACKAGES

https://github.com/dylang/shortid - used for lookupIds and can be used for url shortening.

https://github.com/express-validator/express-validator - can be used for server validation middleware for any requests



# Setup locally without Docker (not recommended)

## Setup Database
Make sure to have Postgres installed, ideally through something like ```brew install postgresql```.

Next make sure the PG server is running.

Then run ```yarn run initDb``` from the root directory to initiate the Databases / Run migrations / Seed data (test, development)

Follow the instructions below regarding Sequelize and migrations.

## Sequelize

Rambler is used for a migration tool. https://github.com/elwinar/rambler -> for config options, env options, etc.

You have two options in development to run migrations (BELOW ONLY MATTERS IF YOU ARE NOT USING DOCKER-COMPOSE).

One, use the code below from the root of the directory, and use the correct .env vars for Rambler (see `.env.example`)

```
cd config && (env $(cat ./../.env | xargs) ./../../go/bin/rambler -c rambler.json apply -a)
```

Two, you can use the config file in `/config` without reading the `.env` file, and use the `-e` flag to switch environments:

```
cd config && (env $(cat ./../.env | xargs) ./../../go/bin/rambler -c rambler.json -e testing apply -a)
```

Rambler will always look at the config file for what to do, unless you override it with the `.env` file.

To create a new migration:

```
019_create_table_name.sql
```

In production: see the `Dockerfile`.

## Seeding Data

```
yarn run seeder
```

Seed function call is located in ```db/seeders/index.js```

## Testing & Linting

```
yarn test
yarn lint
```

To initiate tests locally:

1. run the `src/db/initTestDb` script
2. run migrations: `cd config && (env $(cat ./../.env | xargs) ./../../go/bin/rambler -c rambler.json -e testing apply -a)` - see `.env.example` for env vars
3. run seeder: `NODE_ENV=test yarn run seeder`
4. run `yarn test` to verify it works

### Adding a new test

You can use ```npm run lint:watch``` in a window to constantly scan for linting errors.

`npm run lint` will be called during the precommit process.

## Running in Development

Code reload using nodemon:

```
yarn dev
```

To start the app without nodemon:

```
yarn start
```

## Configuration

You will need a .env on the entry point of the directory. See .env.example to get an idea.


### Running the Container (prefer using `docker-compose up --build` instead)

Before calling Docker Run, make sure you have a Postgres container running.


Example: ```docker run --name some-postgres -e -d -p 5432:5432 postgres```

`\du` in `psql postgres` to display roles
```
CREATE ROLE postgres WITH LOGIN PASSWORD '';
```
```
ALTER ROLE postgres SUPERUSER;
```

On Mac (local postgres setup):

```
pg_ctl -D /usr/local/var/postgres start
```

```
pg_ctl -D /usr/local/var/postgres stop
```


Next, make sure you setup Databases through that connection. See initDB.

After it's up and running, in another terminal window, run ```docker ps```


Find the postgres container then run ```docker inspect <container_id>```


Search for the IP_ADDRESS and that will be your Host variable for Postgres.


Next, in another terminal window...

Setup a redis container

This command will create and run the container named `some-redis`:

`docker run --name some-redis -e -d -p 6379:6379 redis`

If the container `some-redis` already exists, then execute the following command:

`docker run -e -d -p 6379:6379 redis`

Next, in another terminal window...

```
docker run -p 3005:3005 mockserver
```
You can now access the api via localhost:3005
