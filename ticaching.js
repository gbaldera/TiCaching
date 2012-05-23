/**
 * TiCaching
 *
 * @author Gustavo Rodriguez Baldera
 * @link https://github.com/gbaldera/TiCaching
 * @version 1.0
 */

var TiCaching = function() {

	//database params
	this.dbname = 'cache';
	this.database = Titanium.Database.open(this.dbname);

	//Controlling backups to iCloud
	if ((Ti.Platform.osname === 'iphone') || (Ti.Platform.osname === 'ipad')) {
		
		Ti.API.log('Controlling backups to iCloud.');
		
		this.database.file.setRemoteBackup(false);
	}

	this.database.execute('PRAGMA read_uncommitted=true');

	//create table
	this.database.execute('CREATE TABLE IF NOT EXISTS cache (id INTEGER PRIMARY KEY AUTOINCREMENT, key VARCHAR UNIQUE, time INTEGER, data TEXT)');

	/**
	 * Returns the data that was previously cached under the given key. If the key is not found or
	 * the given time for the data has expired it returns false.
	 *
	 * @param    {string}  key  The key that identify the cached data.
	 *
	 * @returns  {Object|boolean}  The cached data.
	 */

	this.get = function(key) {

		if ( typeof key == 'undefined') {
			return false;
		}

		var res = this.database.execute('SELECT * from cache WHERE key = ? LIMIT 1', key), ret = {};

		while (res.isValidRow()) {
			ret = {
				time : res.fieldByName('time'),
				data : JSON.parse(res.fieldByName('data'))
			};

			res.next();
		}

		res.close();

		//check if the time is still valid
		if ((typeof ret.time == 'undefined') || (this.time() > ret.time)) {

			Ti.API.log('No valid time: ' + ret.time + ' != ' + this.time());
			return false;
		}

		return ret.data;
	};

	/**
	 * Cache the given data for the number of seconds specified.
	 *
	 * @param    {string}  key  The key to identify the data.
	 * @param    {object|array}  data  The data to be cached.
	 * @param    {number}  time  The number of seconds to keep the data cached before expires.
	 *
	 * @returns  {boolean}
	 */

	this.save = function(key, data, time) {

		if ( typeof key == 'undefined') {
			Ti.API.error('Key is undefined.');
			return false;
		}

		data = ( typeof data == 'undefined' ? '' : JSON.stringify(data));
		//30 seconds default
		time = ( typeof time == 'undefined' ? (30 + this.time()) : (time + this.time() ));

		try {

			Ti.API.log('Saving Key.');
			return this.database.execute('INSERT OR REPLACE INTO cache (key,data,time) VALUES (?,?,?)', key, data, time);

		} catch(e) {
			Ti.API.error(e);
		}
	};

	/**
	 * Remove the cached data associated with the given key.
	 *
	 * @param    {string}  key  The key that identify the cached data.
	 *
	 * @returns  {boolean}
	 */

	this.del = function(key) {

		if ( typeof key == 'undefined') {
			return false;
		}

		try {

			Ti.API.log('Deleting key: ' + key);
			return this.database.execute('DELETE FROM cache WHERE key=?', key);

		} catch(e) {
			Ti.API.error(e);
		}

	};

	/**
	 * Remove all cached data, optionally only the expired ones.
	 *
	 * @param    {boolean}  Expired data only.
	 *
	 * @returns  {boolean}
	 */

	this.clear = function(expired_only) {
		
		var q = 'DELETE FROM cache';
		
		if(expired_only === true){
			q += ' WHERE time < ' + this.time();
		}
		
		try {

			Ti.API.log('Clearing data..');
			return this.database.execute(q);

		} catch(e) {
			Ti.API.error(e);
		}
	};

	/**
	 * Checks if the given key exists in the cache.
	 *
	 * @param    {string}  key  The key that identify the cached data.
	 *
	 * @returns  {boolean}  Whether the key exists or not.
	 */

	this.exists = function(key) {
		var rows = this.database.execute('SELECT id FROM cache WHERE key=?', key), 
		no = (rows.rowCount > 0);
		rows.close();
		
		return no;
	};

	/**
	 * Returns the current Unix timestamp measured in seconds.
	 * 
	 * Taken from: http://phpjs.org/functions/time
	 *
	 * @returns  {Number}  The current Unix timestamp.
	 */

	this.time = function() {
		return Math.floor(new Date().getTime() / 1000);
	};

};

module.exports = new TiCaching();
