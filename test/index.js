'use strict';

var nextTick = require('next-tick');

module.exports = function (T, a, d) {
	var fragment = new T(), savedEvent = null, e1, e2, e3, e4;
	fragment.on('update', function (event) {
		a(savedEvent, null);
		savedEvent = event;
	});
	e1 = { stamp: 1, value: 'bar' };
	fragment.update('foo', e1);
	e2 = { stamp: 2, value: 'marko' };
	fragment.update('fdf', e2);
	e3 = { stamp: 3, value: 'elo' };
	fragment.update('www', e3);
	e4 = { stamp: 4, value: 'fizka' };
	fragment.update('foo', e4);

	fragment.update('www', e2);
	fragment.delete('fdf');

	nextTick(function () {
		var e5;
		a.deep(savedEvent, {
			target: fragment,
			updated: { foo: e4, www: e3 },
			deleted: { fdf: true }
		});
		savedEvent = null;
		e5 = { stamp: 5, value: 'sdfs' };
		fragment.update('www', e5);
		nextTick(function () {
			a.deep(savedEvent, { target: fragment, updated: { www: e5 }, deleted: {} });
			savedEvent = null;
			d();
		});
	});
};
