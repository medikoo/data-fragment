'use strict';

var includes       = require('es5-ext/array/#/contains')
  , remove         = require('es5-ext/array/#/remove')
  , assign         = require('es5-ext/object/assign')
  , forEach        = require('es5-ext/object/for-each')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d')
  , autoBind       = require('d/auto-bind')
  , lazy           = require('d/lazy')
  , DynamicQueue   = require('deferred/dynamic-queue')
  , ensureFragment = require('./ensure')
  , DataFragment   = require('./')

  , create = Object.create, keys = Object.keys;

var DataFragmentGroup = module.exports = setPrototypeOf(function () {
	if (!(this instanceof DataFragmentGroup)) return new DataFragmentGroup();
}, DataFragment);

DataFragmentGroup.prototype = create(DataFragment.prototype, assign({
	constructor: d(DataFragmentGroup),
	addFragment: d(function (fragment) {
		if (includes.call(this._fragments, ensureFragment(fragment))) return;
		this._fragments.push(fragment);
		fragment.on('update', this._onUpdate);
		forEach(fragment.dataMap, this._onItemUpdate, this);
		if (!fragment.promise || fragment.promise.resolved) return;
		if (this.queue && !this.promise.resolved) {
			this.queue.add(fragment.promise);
			return;
		}
		this.queue = new DynamicQueue([fragment.promise]);
		this.promise = this.queue.promise;
	}),
	deleteFragment: d(function (fragment) {
		if (!includes.call(this._fragments, ensureFragment(fragment))) return;
		remove.call(this._fragments, fragment);
		fragment.off('update', this._onUpdate);
		keys(fragment.dataMap).forEach(this._onItemDelete, this);
	}),
	_onItemUpdate: d(function (event, id) { this.update(id, event); }),
	_onItemDelete: d(function (id) {
		if (this._fragments.some(function (fragment) { return fragment.dataMap[id]; })) {
			return;
		}
		this.delete(id);
	})
}, lazy({
	_fragments: d(function () { return []; })
}), autoBind({
	_onUpdate: d(function (data) {
		forEach(data.updated, this._onItemUpdate, this);
		keys(data.deleted).forEach(this._onItemDelete, this);
	})
})));
