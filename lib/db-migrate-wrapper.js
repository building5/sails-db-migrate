/**
 * db-migrate doesn't provide a programmatic interface. Or at least there's a lot of work in the
 * bin script I don't want to duplicate. But there's not a great way to search the path for it
 * so I can spawn it directly.
 *
 * Instead, I have this wrapper that I can easily spawn, which simply runs the db-migrate CLI.
 */

require('db-migrate/bin/db-migrate');
