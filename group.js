'use strict';

var includes       = require('es5-ext/array/#/contains')
  , remove         = require('es5-ext/array/#/remove')
  , assign         = require('es5-ext/object/assign')
  , forEach        = require('es5-ext/object/for-each')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , randomUniq     = require('es5-ext/string/random-uniq')
  , d              = require('d')
  , autoBind       = require('d/auto-bind')
  , lazy           = require('d/lazy')
  , DynamicQueue   = require('deferred/dynamic-queue')
  , ensureFragment = require('./ensure')
  , DataFragment   = require('./')

  , create = Object.create, defineProperty = Object.defineProperty, keys = Object.keys
  , flush = DataFragment.prototype.flush;

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
		this.promise = fragment.promise;
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
	}),
	promise: d.gs(function () {
		var unresolved;
		this._fragments.forEach(function (fragment) {
			if (fragment.promise && !fragment.promise.resolved && !fragment.promise[this._id]) {
				if (!unresolved) unresolved = [];
				defineProperty(fragment.promise,  this._id, d(true));
				unresolved.push(fragment.promise);
			}
		}, this);
		if (unresolved) {
			if (!this.queue || this.queue.promise.resolved) {
				this.queue = new DynamicQueue(unresolved);
				this.queue.promise.done(this.flush);
			}
		}
		if (this.queue) return this.queue.promise;
	}, function (promise) {
		if (promise.resolved || promise[this._id]) return;
		defineProperty(promise,  this._id, d(true));
		if (this.queue && !this.queue.promise.resolved) {
			this.queue.add(promise);
			return;
		}
		this.queue = new DynamicQueue([promise]);
		this.queue.promise.done(this.flush);
	})
}, lazy({
	_id: d(function () { return 'df' + randomUniq(); }),
	_fragments: d(function () { return []; })
}), autoBind({
	flush: d(function () {
		this._fragments.forEach(function (fragment) { fragment.flush(); });
		return flush.call(this);
	}),
	_onUpdate: d(function (data) {
		forEach(data.updated, this._onItemUpdate, this);
		keys(data.deleted).forEach(this._onItemDelete, this);
	})
})));
