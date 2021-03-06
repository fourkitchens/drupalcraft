var Q               = require('Q'),
    uuid            = require('uuid'),
    mysql           = require('mysql'),
    debug           = require('debug')('drupalcraft:db'),
    db              = {
    /**
     * Creates some basic information for db interaction.
     */
      /**
       * Setup tasks for MYSQL related operations
       * @param  {object} appconfig Imported application config.
       * @param  {string} iid       container id
       * @param  {string} git_branch The branch you're checking out from.
       */
      setup         : function (appconfig, iid, git_branch) {

        var deferred              = Q.defer(),
            db_details            = {
              'user' : 'user-' + (Math.random() + 1).toString(36).substring(10),
              'pass' : uuid.v4(),
              'name' : (Math.random() + 1).toString(36).substring(10)
            },
            db_queries            = {
              'create_user'     : 'CREATE USER "' + db_details.user + '"@"localhost" IDENTIFIED BY "' + db_details.pass + '"',
              'create_database' : 'CREATE DATABASE `' + db_details.name + '`',
              'access_perms'    : 'GRANT ALL PRIVILEGES ON `' + db_details.name + '`.* TO "' + db_details.user + '"@"localhost"'
            },
            dbconnection          = mysql.createConnection({
              host     : appconfig.database.host,
              user     : appconfig.database.user,
              password : appconfig.database.password
            });
        debug(iid);
        debug(db_details);
        debug(git_branch);
        deferred.resolve({
          'details'     : db_details,
          'queries'     : db_queries,
          'connection'  : dbconnection,
          'docker'      : {
            'iid'       : iid
          },
          'git' : git_branch
        });
        return deferred.promise;
      },
      release           : function (options) {
        debug('MySQL connection released.');
        var deferred  = Q.defer();
        options.connection.end(function (err) {
          deferred.resolve(options);
        });
        return deferred.promise;
      },
      /**
       * Executes the create_user query.
       * @param  {object} options The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_cu              : function (options) {
        debug('Creating MySQL user.');
        var deferred  = Q.defer();
        options.connection.query({sql : options.queries.create_user}, deferred.resolve(options));
        return deferred.promise;
      },
      /**
       * Executes the create_database query.
       * @param  {object} options The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_cd              : function (options) {
        debug('Creating MySQL database.');
        var deferred  = Q.defer();
        options.connection.query({sql : options.queries.create_database}, deferred.resolve(options));
        return deferred.promise;
      },
      /**
       * Executes the access_perms query.
       * @param  {object} options The object containing the pool connection and the db info.
       * @return {promise} Returns a promise.
       */
      q_ap              : function (options) {
        debug('Setting MySQL access permissions.');
        var deferred  = Q.defer();
        options.connection.query({sql : options.queries.access_perms}, deferred.resolve(options));
        return deferred.promise;
      }
    };

module.exports = db;
