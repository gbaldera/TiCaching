TiCaching
================

**Version:** 1.0

**Platforms:** tested on iOS and Android 

**TiCaching** is a Commonjs module for caching data objects in apps made with [Appcelerator's Titanium Mobile](http://www.appcelerator.com/platform/titanium-sdk), useful for cache data returned from REST APIs. It is based on my [Caching library](https://github.com/gbaldera/CI-Caching/) for Codeigniter.

Usage
================

Just copy the "ticaching.js" anywhere in your project's Resources directory and references it like this:

```
var caching = require('ticaching');
```

After that, use the caching functions:

```
//cached some data
var data = {'name': 'Gustavo', 'age': 24, 'country': 'Dominican Republic'}
caching.save('my_key', data, 60) // cache data for 1 minute
caching.save('my_key', data) // or cache data for 30 seconds (default)
 
//get cached data
var data = caching.get('my_key');

// delete chached data
caching.del('my_key');

// delete all chached data
caching.clear();

// delete all expired data
caching.clear(true);

// check if especific key exists
caching.exists('my_key');

```