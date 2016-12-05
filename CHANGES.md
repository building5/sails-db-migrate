# sails-db-migrate changelog

## v1.5.0 (2016-12-05)

 * #23 - Added MongoDB support (Thanks AngelMunoz)

## v1.4.0 (2016-06-28)

 * Added wishlist to README
 * PR#29, #28 - Adding support for `multipleStatements` in connection settings.

## v1.3.2 (2016-06-09)

 * PR#26 - Changed `sails.lift` to `sails.load` to avoid invalid port errors
   with newer versions of Sails.

## v1.3.1 (2016-02-16)

 * Fixed changelog

## v1.3.0 (2016-02-16)

 * Improved error handling when `./config/migrations.js` is missing
 * #21 - Added badges
 * Removed unused dev dependency

## v1.2.0 (2015-11-19)

 * #19 - Updated peer dependencies
   * sails to 0.12.x (including rc3 or better)
   * db-migrate to 0.10.x (including beta.4 or better)

## v1.1.0 (2015-07-27)

 * Add `LOG_LEVEL` environment variable to increase Sails debug logging.

## v1.0.0 (2015-07-23)

 * Set version to 1.0.0, because semver.
 * PR#17 - Added `--table` option. And added `coffeeFile`, `migrationsDir` and
   `table` config options.

## v0.8.0 (2015-07-08)

 * PR#15 - Expose `sql-file` and `coffee-file` options

## v0.7.0 (2015-05-27)

 * PR#14 - Add `--migrations-dir` option

## v0.6.1 (2015-02-20)

 * Added this changelog.
 * #13 - Updated peer dependencies
   * db-migrate 0.7.0 to 0.9.x
   * sails 0.10.4 to 0.11.x

## v0.6.0 (2014-12-05)

 * PR#11 - Add SSL support for PostgreSQL.
 * PR#12 - Update db-migrate to 0.8.0.

## v0.5.0

 * PR#9 - Add support for a url filed in the connection config.

## v0.4.0

 * PR#7 - Pass 'migrating: true' to the sails config, so sails bootstrap code
   can know that we're not _really_ trying to lift sails.

## v0.3.1

 * PR#6 - Disable passing debug into the child process. This fixes
   issues running an app under a debugger.

## v0.3.0

 * PR#3 - Ass support for env option.

## v0.2.2

 * Fix issue running migrations on Windows.

## v0.2.1

 * Fix issue with special characters in passwords.

## v0.2.0

 * Extract `sailsDbMigrate()` function, to allow migrations to be run
   outside of grunt.

## v0.1.0

 * Initial release.
