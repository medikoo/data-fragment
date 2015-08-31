'use strict';

var isObject = require('es5-ext/object/is-object');

module.exports = function (fragment) {
	if (!isObject(fragment)) return false;
	if (!isObject(fragment.dataMap)) return false;
	if (typeof fragment.update !== 'function') return false;
	if (typeof fragment.delete !== 'function') return false;
	return true;
};
