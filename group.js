'use strict';

var assign         = require('es5-ext/object/assign')
  , forEach        = require('es5-ext/object/for-each')
  , some           = require('es5-ext/object/some')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , autoBind       = require('d/auto-bind')
  , lazy           = require('d/lazy')
  , Set            = require('es6-set')
  , ensureFragment = require('./ensure')
  , DataFragment   = require('./')

  , create = Object.create, keys = Object.keys;

var DataFragmentGroup = module.exports = setPrototypeOf(function () {
	if (!(this instanceof DataFragmentGroup)) return new DataFragmentGroup();
}, DataFragment);

DataFragmentGroup.prototype = create(DataFragment.prototype, assign({
	constructor: d(DataFragmentGroup),
	addFragment: d(function (fragment) {
		if (this._fragments.has(ensureFragment(fragment))) return;
		this._fragments.add(fragment);
		fragment.on('update', this._onUpdate);
		forEach(fragment.data, this._onItemUpdate, this);
	}),
	deleteFragment: d(function (fragment) {
		if (!this._fragments.has(ensureFragment(fragment))) return;
		this._fragments.delete(fragment);
		fragment.off('update', this._onUpdate);
		keys(fragment.data).forEach(this._onItemDelete, this);
	}),
	_onItemUpdate: d(function (event, id) { this.update(id, event); }),
	_onItemDelete: d(function (id) {
		if (some(this._fragments, function (fragment) { return fragment.data[id]; })) {
			return;
		}
		this.delete(id);
	})
}, lazy({
	_fragments: d(function () { return new Set(); })
}), autoBind({
	_onUpdate: d(function (data) {
		forEach(data.updated, this._onItemUpdate, this);
		keys(data.deleted).forEach(this._onItemDelete, this);
	})
})));
