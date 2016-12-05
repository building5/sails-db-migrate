# sails-db-migrate
[![devDependency Status](https://david-dm.org/building5/sails-db-migrate/dev-status.svg)](https://david-dm.org/building5/sails-db-migrate#info=devDependencies)
[![peerDependency Status](https://david-dm.org/building5/sails-db-migrate/peer-status.svg)](https://david-dm.org/building5/sails-db-migrate#info=peerDependencies)

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

Optionally, you can specify in the config file the name of the database table to
be used to track migrations (defaults to `migrations`), the directory to use for
migrations (defaults to `migrations`), and whether to create a coffeescript
file for the migrations instead of javascript file (defaults to `false`).

```JavaScript
// config/migrations.js
module.exports.migrations = {
  // connection name matches a field from config/connections.js
  connection: 'somePostgresqlServer', // or MySQL
  table: 'sails_migrations',
  migrationsDir: 'sails_migrations',
  coffeeFile: true
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

To specify your own migrations directory, use `--migrations-dir`.

```bash
$ grunt db:migrate:up --migrations-dir=migrations-special
```

### Debugging

Normally, migrations load Sails with a log level of `silent`, since you usually
don't need it. Sometimes, however, Sails will fail to load, and some debug
output would be nice.

You can set the `LOG_LEVEL` environment variable to turn up sails logging for
the migrations

```bash
$ LOG_LEVEL=debug grunt db:migrate:up
```

### Patches Welcome

If you'd like to contribute to sails-db-migrate, start by looking at some of the
[open issues][] in the issue tracker.

 [db-migrate]: https://github.com/kunklejr/node-db-migrate
 [sails.js]: http://sailsjs.org/
 [grunt]: http://gruntjs.com/
 [db-migrate docs]: https://github.com/kunklejr/node-db-migrate#migrations-api
 [open issues]: https://github.com/building5/sails-db-migrate/issues
