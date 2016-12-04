'use strict';

var util = require('util');
var fork = require('child_process').fork;
var path = require('path');

/**
 * Build a URL from the Sails connection config.
 *
 * @param {object} connection Sails connection config.
 * @returns {string} URL for connecting to the specified database.
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
    case 'sails-mongo':
      scheme = 'mongodb'
      break;
    default:
      throw new Error('migrations not supported for ' + connection.adapter);
  }

  // return the connection url if one is configured
  if (connection.url) {
    return connection.url;
  }

  url = scheme + '://';
  if (connection.user) {
    url += connection.user;
    if (connection.password) {
      url += ':' + encodeURIComponent(connection.password)
    }
    url += '@';
  }
  url += connection.host || 'localhost';
  if (connection.port) {
    url += ':' + connection.port;
  }
  if (connection.database) {
    url += '/' + encodeURIComponent(connection.database);
  }

  var params = [];
  if (connection.multipleStatements) {
    params.push('multipleStatements=true');
  }

  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  return url;
}

/**
 * Parse out the database URL from the sails config.
 *
 * @param sailsConfig Sails config object.
 * @returns {object} .url and .cleanURL for the database connection.
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
  // check for ssl option in connection config
  if (connection.ssl) {
    res.adapter = connection.adapter;
    res.ssl = true;
  }
  // now build a clean one for logging, without the password
  if (connection.password != null) {
    connection.password = '****';
  }
  res.cleanURL = buildURL(connection);

  return res;
}

/**
 * Run the database migrations on the given sails object.
 *
 * @param args Command line arguments to pass to db:migrate
 * @param [sails] Sails object to migrate. Defaults to the global sails object.
 * @param done Completion callback.
 * @return The URL for the database to be migrated.
 */
module.exports = function (args, sails, done) {
  var dbMigrate = path.join(__dirname, 'db-migrate-wrapper.js');
  var parsed, child;

  if (!done && typeof (sails) === 'function') {
    done = sails;
    sails = global.sails;
  }

  parsed = parseSailsConfig(sails.config);

  // export DATABASE_URL for db-migrate
  process.env.DATABASE_URL = parsed.url;
  // export PGSSLMODE for db-migrate if ssl=true
  if (parsed.ssl) {
    // set the appropriate environment variable for postgres databases
    if (parsed.adapter === 'sails-postgresql') {
      process.env.PGSSLMODE = 'require';
    }
  }
  // run db-migrate
  // the empty execArgv option explicitly disables debugging options from being passed to the child,
  // which was causing problems when trying to interactively debug an application that calls sails-db-migrate.
  child = fork(dbMigrate, args, { execArgv: [] });
  child.on('exit', function (code) {
    if (code !== 0) {
      return done(new Error('Migrations failed'));
    }
    done();
  });

  return parsed.cleanURL;
};
