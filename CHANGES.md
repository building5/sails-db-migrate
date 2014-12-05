# sails-db-migrate changelog

## v.next (20XX-XX-XX)

 * Added this changelog.

## v0.6.0

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
