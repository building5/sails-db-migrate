var Sails = require('sails').Sails;
var spawn = require('child_process').spawn;
var path = require('path');

function buildURL(scheme, config) {
  var url = scheme + '://';
  if (config.user) {
    url += config.user;
    if (config.password) {
      url += ':' + config.password
    }
    url += '@';
  }
  url += (config.host || 'localhost');
  if (config.port) {
    url += ':' + config.port;
  }
  if (config.database) {
    url += '/' + config.database;
  }
  return url;
}

function parseConnectionConfig(grunt, sails) {
  var connection, url;

  if (!sails.config.migrations) {
    grunt.fail.fatal('Migrations not configured. Please setup ./config/migrations.js');
    return;
  }

  var connectionName = sails.config.migrations.connection;
  if (!connectionName) {
    grunt.fail.fatal('connection missing from ./config/migrations.js');
    return;
  }

  connection = sails.config.connections[connectionName];

  if (!connection) {
    grunt.fail.fatal('could not find connection ' + connectionName + ' in ./config/connections.js');
    return;
  }

  switch (connection.adapter) {
  case 'sails-mysql':
    url = buildURL('mysql', connection);
    break;
  case 'sails-postgresql':
    url = buildURL('postgres', connection);
    break;
  default:
    grunt.fail.fatal('migrations not supported for ' + connection.adapter);
  }

  return url;
}

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

function buildDbMigrateArgs(grunt, command) {
  var opts = [];
  var name = grunt.option('name');

  opts.push(command);

  if (command === 'create') {
    if (!name) {
      grunt.fail.fatal('--name required to create migration');
      return [];
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

module.exports = function (grunt) {
  grunt.registerTask('db:migrate', 'Run the database migrations', function (command) {
    var done = this.async();
    var name = grunt.option('name');
    var sails;
    var args;
    var dbMigrate = path.join(__dirname, 'db-migrate-wrapper.js');

    if (!command) {
      usage(grunt);
      return done();
    }

    args = buildDbMigrateArgs(grunt, command);

    // lift Sails to get the effective configuration. We don't actually need to run it, and we
    // certainly don't want any log messages. We just want the config.
    sails = new Sails();
    sails.lift({ port: -1, log: { level: 'silent' } }, function (err) {
      var child;
      try {
        if (err) {
          grunt.fail.fatal('Could not lift sails', err);
          return done();
        }

        process.env.DATABASE_URL = parseConnectionConfig(grunt, sails);
        process.env.NODE_PATH = process.cwd();

        if (!process.env.DATABASE_URL) {
          grunt.fail.fatal('Could not generate database URL');
          return done();
        }
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
