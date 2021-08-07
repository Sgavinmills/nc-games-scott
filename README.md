# nc-games-scott, Northcoders project

## Background

This API uses a PSQL database and uses [node-postgres](https://node-postgres.com/) to interact with it.

The server is hosted on Heroku and is available [here](https://nc-games-scott.herokuapp.com/api/)

The server is intended to mimick a real world backend service. The database is designed as a board-game review service, it contains tables for reviews, comments, users and categories - all of which can be queried through the API. The server has been created using full TDD.

Database creation and seeding scripts are included.

## Usage

The app is available from [github](https://github.com/Sgavinmills/be-nc-games.git)

After cloning the repository follow these steps for setup:
-  `npm install` to install all dependencies
- Create `.env.test` & `.env.development` files and inside put `PGDATABASE=nc_games_test` & `PGDATABASE=nc_games` respectively. These env variables will ensure the correct databases are seeded when testing or running the server. 
- `npm run setup-dbs` to create a development & test database
- `npm run seed` to seed the development database
- `npm start` to start the server listening. The various endpoints can now be queried at localhost on port 9090 using insomnia or an alternative client.
- `npm test` will execute the testing suites. There is testing for the utility funtions used in seeding the database as well as the server endpoints. Use `npm test app` to run just the server tests. The server tests will use a test database with test data seeded before every test.
  

You will need at least version ___ of node and ___ of PSQL to run this project. 

