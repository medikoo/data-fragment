'use strict';

var Fragment = require('../');

module.exports = function (t, a) {
	a(t({}), false);
	a(t(new Fragment()), true);
};
