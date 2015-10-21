'use strict';

var assign       = require('es5-ext/object/assign')
  , forEach      = require('es5-ext/object/for-each')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject = require('es5-ext/object/valid-object')
  , d            = require('d')
  , autoBind     = require('d/auto-bind')
  , lazy         = require('d/lazy')
  , ee           = require('event-emitter')
  , once         = require('timers-ext/once')

  , keys = Object.keys, create = Object.create;

var DataFragment = module.exports = function () {
	if (!(this instanceof DataFragment)) return new DataFragment();
};

ee(Object.defineProperties(DataFragment.prototype, assign({
	update: d(function (id, nu) {
		var old = this._updated[id] || this.dataMap[ensureString(id)];
		ensureObject(nu);
		if (this._deleted[id]) delete this._deleted[id];
		if (old && (old.stamp >= nu.stamp)) return;
		this._updated[id] = nu;
		this._scheduleEmit();
	}),
	delete: d(function (id) {
		if (!this.dataMap[ensureString(id)] && !this._updated[id]) return;
		if (this._updated[id]) delete this._updated[id];
		this._deleted[id] = true;
		this._scheduleEmit();
	}),
	promise: d.gs(function () { return this._promise; }, function (promise) {
		this._promise = promise;
		// Ensure flush is done before eny external entity registers listener for promise
		promise.done(this.flush);
	})
}, autoBind({
	flush: d(function () {
		var hasUpdates;
		if (this.promise && !this.promise.resolved) return this;
		forEach(this._updated, function (value, id) {
			hasUpdates = true;
			this.dataMap[id] = value;
		}, this);
		keys(this._deleted).forEach(function (id) {
			hasUpdates = true;
			delete this.dataMap[id];
		}, this);
		if (!hasUpdates) return this;
		this.emit('update', { target: this, updated: this._updated, deleted: this._deleted });
		this._updated = create(null);
		this._deleted = create(null);
		return this;
	})
}), lazy({
	dataMap: d(function () { return create(null); }),
	_updated: d(function () { return create(null); }),
	_deleted: d(function () { return create(null); }),
	_scheduleEmit: d(function () { return once(this.flush); })
}))));
