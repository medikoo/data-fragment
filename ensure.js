'use strict';

var is = require('./is');

module.exports = function (fragment) {
	if (is(fragment)) return fragment;
	throw new TypeError(String(fragment) + " is not a DataFragment");
};
