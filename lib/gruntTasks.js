'use strict';

var Sails = require('sails').Sails;
var spawn = require('child_process').spawn;
var path = require('path');

/**
 * Build a URL from the Sails connection config.
 *
 * @param connection Sails connection config.
 * @returns URL for connecting to the specified database.
 * @throws Error if adapter is not supported.
 */
function buildURL(connection) {
  var scheme;
  var url;

  switch (connection.adapter) {
  case 'sails-mysql':
    scheme = 'mysql';
    break;
  case 'sails-postgresql':
    scheme = 'postgres';
    break;
  default:
    throw new Error('migrations not supported for ' + connection.adapter);
  }

  url = scheme + '://';
  if (connection.user) {
    url += connection.user;
    if (connection.password) {
      url += ':' + connection.password
    }
    url += '@';
  }
  url += (connection.host || 'localhost');
  if (connection.port) {
    url += ':' + connection.port;
  }
  if (connection.database) {
    url += '/' + connection.database;
  }
  return url;
}

/**
 * Parse out the database URL from the sails config.
 *
 * @param sailsConfig Sails config object.
 * @returns URL for connecting to the specified database.
 * @throws Error if adapter is not supported.
 */
function parseSailsConfig(sailsConfig) {
  var res = {};
  var connection;

  if (!sailsConfig.migrations) {
    throw new Error('Migrations not configured. Please setup ./config/migrations.js');
  }

  var connectionName = sailsConfig.migrations.connection;
  if (!connectionName) {
    throw new Error('connection missing from ./config/migrations.js');
  }

  connection = sailsConfig.connections[connectionName];

  if (!connection) {
    throw new Error('could not find connection ' + connectionName + ' in ./config/connections.js');
  }

  // build the db url, which contains the password
  res.url = buildURL(connection);
  // now build a clean one for logging, without the password
  if (connection.password != null) {
    connection.password = '****';
  }
  res.cleanURL = buildURL(connection);

  return res;
}

/**
 * Builds the command line arguments to pass to db-migrate.
 *
 * @param grunt Grunt object.
 * @param command The db-migrate command to run.
 * @returns Arguments array for the db-migrate command.
 */
function buildDbMigrateArgs(grunt, command) {
  var opts = [];
  var name = grunt.option('name');

  opts.push(command);

  if (command === 'create') {
    if (!name) {
      throw new Error('--name required to create migration');
    }
    opts.push(name);
  }

  if (grunt.option('count') !== undefined) {
    opts.push('--count');
    opts.push(grunt.option('count'));
  }

  if (grunt.option('dry-run')) {
    opts.push('--dry-run');
  }

  if (grunt.option('db-verbose')) {
    opts.push('--verbose');
  }

  return opts;
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
    var dbMigrate = path.join(__dirname, 'db-migrate-wrapper.js');
    var sails;
    var args;

    if (!command) {
      usage(grunt);
      return done();
    }

    args = buildDbMigrateArgs(grunt, command);

    // lift Sails to get the effective configuration. We don't actually need to
    // run it, and we certainly don't want any log messages. We just want the
    // config.
    sails = new Sails();
    sails.lift({ port: -1, log: { level: 'silent' } }, function (err) {
      var child, parsed;

      if (err) {
        grunt.fail.fatal('Could not lift sails', err);
        return done();
      }

      try {
        parsed = parseSailsConfig(sails.config);

        // export DATABASE_URL for db-migrate
        grunt.log.writeln('+ export DATABASE_URL=', parsed.cleanURL);
        process.env.DATABASE_URL = parsed.url;

        // run db-migrate.
        grunt.log.writeln('+ db-migrate', args.join(' '));
        child = spawn(dbMigrate, args, { stdio: 'inherit' });
        child.on('exit', function (code) {
          if (code !== 0) {
            grunt.fail.fatal('Error executing migrations');
          }
          return done();
        });
      } catch (err) {
        grunt.fail.fatal(err);
        done(err);
      }
    });
  });
};
