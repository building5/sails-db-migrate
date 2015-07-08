'use strict';

var sailsDbMigrate = require('./sailsDbMigrate');

/**
 * Builds the command line arguments to pass to db-migrate.
 *
 * @param grunt Grunt object.
 * @param command The db-migrate command to run.
 * @returns Arguments array for the db-migrate command.
 */
function buildDbMigrateArgs(grunt, command) {
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
    args.push('--sql-file')
  }

  if (grunt.option('coffee-file')) {
    args.push('--coffee-file')
  }
  
  if (grunt.option('migrations-dir')) {
    args.push('--migrations-dir');
    args.push(grunt.option('migrations-dir'));
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
  grunt.log.writeln('  --count=N      Max number of migrations to run.');
  grunt.log.writeln('  --dry-run      Prints the SQL but doesn\'t run it.');
  grunt.log.writeln('  --db-verbose   Verbose mode.');
  grunt.log.writeln('  --sql-file     Create sql files for up and down.');
  grunt.log.writeln('  --coffee-file  Create a coffeescript migration file.');
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
    var args;
    var env;

    if (!command) {
      usage(grunt);
      return done();
    }

    args = buildDbMigrateArgs(grunt, command);

    if (grunt.option('env')){
      env = grunt.option('env');
    }else{
      env = process.env.NODE_ENV;
    }

    var appRoot = require('app-root-path');

    var connectionsConfig = require(appRoot.path+'/config/connections');
    var migrationsConfig = require(appRoot.path+'/config/migrations');

    var config = {};
    if(connectionsConfig.connections) {
        config.connections = connectionsConfig.connections;
    } else {
        config.connections = connectionsConfig;
    }
    config.migrations = migrationsConfig.migrations;

    try {
      grunt.log.writeln('+ db-migrate', args.join(' '));
      var url = sailsDbMigrate(args, config, done);
      grunt.log.writeln('DATABASE_URL=' + url);
    } catch (err) {
      grunt.fail.fatal(err);
      done(err);
    }
  });
};
