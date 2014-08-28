# sails-db-migrate

[db-migrate][] integration for [Sails.js][]. This is a fairly simple wrapper,
which provides [grunt][] tasks for running and creating migrations. It also
extracts the database configuration from the Sails config, so you don't have to
duplicate you config in a `database.json` file.

Supports Sails 0.10.x.

## Setup

Installation is very typical.

```bash
$ npm install --save sails-db-migrate
```

You may also have to explicitly install your database driver. Normallys it's
installed under `sails-{postgresql,mysql}`, but that won't be found outside of
that package.

```bash
$ npm install --save pg # or mysql
```

You need to setup `config/migrations.js` to name the connection which you will
use to run migrations.

```JavaScript
// config/migrations.js
module.exports.migrations = {
  // connection name matches a field from config/connections.js
  connection: 'somePostgresqlServer' // or MySQL
};
```

You'll also need to setup `tasks/register/dbMigrate.js` to add the `db:migrate`
tasks to grunt.

```JavaScript
// tasks/register/dbMigrate.js
module.exports = require('sails-db-migrate').gruntTasks;
```

## Usage

### Help

Help can be found by running `grunt db:migrate`.

```bash
$ grunt db:migrate
```

### Creating migrations

You create migrations using the `grunt db:migrate:create`

```bash
$ grunt db:migrate:create --name add-some-fooz

+ db-migrate create add-some-fooz
[INFO] Created migration at /Users/dlee/prj/test/migrations/20140829025723-add-some-fooz.js

Done, without errors.
```

You can edit your new migration file. This is fully documented in the
[db-migrate docs][].

### Running migrations

Migrations can be run up or down. To run only a certain number of migrations,
specify the `--count` flag.`

```bash
$ grunt db:migrate:up
Running "db:migrate:up" (db:migrate) task
+ db-migrate up
[INFO] Processed migration 20140829025723-add-some-fooz
[INFO] Done

Done, without errors.

$ grunt db:migrate:down --count 2
Running "db:migrate:down" (db:migrate) task
+ db-migrate down --count 2
[INFO] Processed migration 20140829025723-add-some-fooz
[INFO] Processed migration 20140829025008-init
[INFO] Done

Done, without errors.
```

 [db-migrate]: https://github.com/kunklejr/node-db-migrate
 [sails.js]: http://sailsjs.org/
 [grunt]: http://gruntjs.com/
 [db-migrate docs]: https://github.com/kunklejr/node-db-migrate#migrations-api
