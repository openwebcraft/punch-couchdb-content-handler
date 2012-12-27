# Punch CouchDB Content Handler

A custom [Punch](http://laktek.github.com/punch) content handler to fetch data from [CouchDB](http://couchdb.apache.org).

## How to Use 

* Install the package:

	`npm install punch-couchdb-content-handler`

* Open your Punch project's configurations (`config.json`) and add the following:

		"plugins": {
			"content_handler": "punch-couchdb-content-handler"
		}

* You can use `couchdb` section to provide CouchDB specific configuration.

		"couchdb": {
			"server": "http://127.0.0.1:5984",
			"db": "example_com",
			"username": "admin",
			"password": "password"
		}

* `server` - the Url of the CouchDB server.

* `db` - the CouchDB database name.

* `username` - the CouchDB username.

* `password` - the CouchDB password.
