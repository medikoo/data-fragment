'use strict';

var Fragment = require('../');

module.exports = function (T, a, d) {
	var group = new T(), savedEvent = null, e1, e2, e3, e4
	  , fragment = new Fragment(), fragment2 = new Fragment();
	group.addFragment(fragment);
	group.on('update', function (event) {
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

	setImmediate(function () {
		var e5;
		a.deep(savedEvent, {
			target: group,
			updated: { foo: e4, www: e3 },
			deleted: {}
		});
		savedEvent = null;
		fragment2.update('efefee', e2);
		e5 = { stamp: 5, value: 'sdfs' };
		fragment.update('www', e5);
		group.addFragment(fragment2);
		fragment2.update('miszka', e5);
		setImmediate(function () {
			a.deep(savedEvent, { target: group, updated: { efefee: e2, www: e5, miszka: e5 },
				deleted: {} });
			savedEvent = null;
			group.deleteFragment(fragment);
			setImmediate(function () {
				a.deep(savedEvent, { target: group, updated: {}, deleted: { foo: true, www: true } });
				savedEvent = null;
				d();
			});
		});
	});
};
