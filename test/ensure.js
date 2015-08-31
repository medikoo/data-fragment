'use strict';

var Fragment = require('../');

module.exports = function (t, a) {
	var fragment = new Fragment();
	a.throws(function () { t({}); }, TypeError);
	a(t(fragment), fragment);
};
