'use strict';

var Sails = require('sails').Sails;
var sailsDbMigrate = require('./sailsDbMigrate');

/**
 * Builds the command line arguments to pass to db-migrate.
 *
 * @param grunt Grunt object.
 * @param command The db-migrate command to run.
 * @returns Arguments array for the db-migrate command.
 */
function buildDbMigrateArgs(grunt, config, command) {
  var args = [];
  var name = grunt.option('name');

  args.push(command);

  if (command === 'create') {
    if (!name) {
      throw new Error('--name required to create migration');
    }
    args.push(name);
  }

  if (grunt.option('count') !== undefined) {
    args.push('--count');
    args.push(grunt.option('count'));
  }

  if (grunt.option('dry-run')) {
    args.push('--dry-run');
  }

  if (grunt.option('db-verbose')) {
    args.push('--verbose');
  }

  if (grunt.option('sql-file')) {
    args.push('--sql-file');
  }

  if (grunt.option('coffee-file')) {
    args.push('--coffee-file');
  } else if (config.coffeeFile) {
    args.push('--coffee-file');
  }

  if (grunt.option('migrations-dir')) {
    args.push('--migrations-dir');
    args.push(grunt.option('migrations-dir'));
  } else if (config.migrationsDir) {
    args.push('--migrations-dir');
    args.push(config.migrationsDir);
  }

  if (grunt.option('table')) {
    args.push('--table');
    args.push(grunt.option('table'));
  } else if (config.table) {
    args.push('--table');
    args.push(config.table);
  }

  return args;
}

/**
 * Display command usage information.
 *
 * @param grunt Grunt object.
 */
function usage(grunt) {
  grunt.log.writeln('usage: grunt db:migrate[:up|:down|:create] [options]');
  grunt.log.writeln('  See ./migrations/README.md for more details');
  grunt.log.writeln();
  grunt.log.writeln('db:migrate:create Options:');
  grunt.log.writeln('  --name=NAME  Name of the migration to create');
  grunt.log.writeln();
  grunt.log.writeln('db:migrate[:up|:down] Options:');
  grunt.log.writeln('  --count=N         Max number of migrations to run.');
  grunt.log.writeln('  --dry-run         Prints the SQL but doesn\'t run it.');
  grunt.log.writeln('  --db-verbose      Verbose mode.');
  grunt.log.writeln('  --sql-file        Create sql files for up and down.');
  grunt.log.writeln('  --coffee-file     Create a coffeescript migration file.');
  grunt.log.writeln('  --migrations-dir  The directory to use for migration files.');
  grunt.log.writeln('                    Defaults to "migrations".');
  grunt.log.writeln('  --table           Specify the table to track migrations in.');
  grunt.log.writeln('                    Defaults to "migrations".');
}

/**
 * Grunt registration function.
 *
 * @param grunt Grunt object.
 */
module.exports = function (grunt) {
  grunt.registerTask('db:migrate', 'Run the database migrations', function (command) {
    var done = this.async();
    var name = grunt.option('name');
    var sails;
    var sailsConfig;
    var env;

    if (!command) {
      usage(grunt);
      return done();
    }

    if (grunt.option('env')){
      env = grunt.option('env');
    }else{
      env = process.env.NODE_ENV;
    }

    sailsConfig = {
      port: -1,
      log: { level: process.env.LOG_LEVEL || 'silent' },
      environment: env,
      migrating: true
    };

    // load Sails to get the effective configuration. We don't actually need to
    // run it, and we certainly don't want any log messages. We just want the
    // config.
    sails = new Sails();
    sails.load(sailsConfig, function (err) {
      var url;
      var args;

      if (err) {
        grunt.fail.fatal('Could not load sails', err);
        return done(err);
      }

      if (!sails.config.migrations) {
        grunt.fail.fatal('Migrations not configured. Please setup ./config/migrations.js');
        return done();
      }

      try {
        args = buildDbMigrateArgs(grunt, sails.config.migrations, command);
        grunt.log.writeln('+ db-migrate', args.join(' '));
        url = sailsDbMigrate(args, sails, done);
        grunt.log.writeln('DATABASE_URL=' + url);
      } catch (err) {
        grunt.fail.fatal(err);
        done(err);
      }
    });
  });
};
