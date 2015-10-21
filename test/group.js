'use strict';

var Fragment = require('../');

module.exports = function (T, a, d) {
	var group = new T(), savedEvents = [], e1, e2, e3, e4, e6
	  , fragment = new Fragment(), fragment2 = new Fragment(), fragment3 = new Fragment();
	e6 = { stamp: 34, value: 'ohterfr' };
	fragment3.update('aside', e6);
	group.addFragment(fragment3);
	group.addFragment(fragment);
	group.on('update', function (event) { savedEvents.push(event); });
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
		a(savedEvents.length, 1);
		a.deep(savedEvents[0], {
			target: group,
			updated: { aside: e6, foo: e4, www: e3 },
			deleted: {}
		});
		savedEvents = [];
		fragment2.update('efefee', e2);
		fragment2.update('aside', e6);
		e5 = { stamp: 5, value: 'sdfs' };
		fragment.update('www', e5);
		group.addFragment(fragment2);
		group.deleteFragment(fragment3);
		fragment2.update('miszka', e5);
		setImmediate(function () {
			a.deep(savedEvents[0], { target: group, updated: { efefee: e2, www: e5, miszka: e5 },
				deleted: {} });
			a(savedEvents.length, 1);
			savedEvents = [];
			group.deleteFragment(fragment);
			setImmediate(function () {
				a.deep(savedEvents[0], { target: group, updated: {}, deleted: { foo: true, www: true } });
				a(savedEvents.length, 1);
				savedEvents = null;
				d();
			});
		});
	});
};
