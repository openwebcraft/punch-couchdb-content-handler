var _ = require("underscore"),
    fs = require('fs'),
    cradle = require('cradle'),
    default_content_handler = require("punch").ContentHandler,
    module_utils = require("punch").Utils.Module,
    url = require('url');

module.exports = {

	parsers: {},

	server: "http://127.0.0.1:5984",

	username: "admin",

	password: "password",

	db: "example_com",

	_couch_config: {},
	_couch: null,
	_couch_db: null,

	setup: function(config) {

		var self = this;

		_.each(config.plugins.parsers, function(value, key){
			self.parsers[key] = module_utils.requireAndSetup(value, config);
		});

		// setup default content handler
		default_content_handler.setup(config);

		// return setup if there's no couchdb specific settings
		if (config.couchdb) {
			self.server = config.couchdb.server || self.server;

			self.username = config.couchdb.username || self.username;

			self.password = config.couchdb.password || self.password;

			self.db = config.couchdb.db || self.db;
		}

		self._couch_config  = url.parse(self.server);
		self._couch_config.auth = {
		  username: self.username,
		  password: self.password
		};

		// couchdb connection
		self._couch  = new(cradle.Connection)(self._couch_config);
  		self._couch_db  = self._couch.database(self.db);

  		// check if database exists
		self._couch_db.exists(function (err, exists) {
		  if (err) {
		    console.log('error', err);
		  } else if (exists) {
		    // console.log('the force is with you.');
		    return self;
		  } else {
		    console.log('error', 'couchdb database does not exist.');
		  }
		});
	},

	isSection: function(request_path) {
		var self = this;
		// site just has a flat structure
		return false;
	},

	negotiateContent: function(request_path, file_extension, request_options, callback) {
		var self = this;
		var error = null;
		var collected_contents = {};
		var content_options = {};
		var last_modified = new Date().getTime();

		var docId = request_path.substr(1);

		self._couch_db.get(docId, function (err, doc) {
			if (!err) {
				// fetch couchdb document content
				collected_contents = _.extend(collected_contents, doc);
				// fetch and mix shared content
				default_content_handler.getSharedContent(function(err, shared_content, shared_modified_date) {
					if (!err) {
						collected_contents = _.extend(collected_contents, shared_content);
						if (shared_modified_date > last_modified) {
							last_modified = shared_modified_date;
						}
					}		
				});
		    	return callback(error, collected_contents, content_options, last_modified);
			} else {
				// falback: default content_handler
				default_content_handler.negotiateContent(request_path, file_extension, request_options, callback);
			}
		});

	}
}