'use strict';

var assign       = require('es5-ext/object/assign')
  , isEmpty      = require('es5-ext/object/is-empty')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject = require('es5-ext/object/valid-object')
  , d            = require('d')
  , autoBind     = require('d/auto-bind')
  , lazy         = require('d/lazy')
  , ee           = require('event-emitter')
  , once         = require('timers-ext/once')

  , create = Object.create;

var DataFragment = module.exports = function () {
	if (!(this instanceof DataFragment)) return new DataFragment();
};

ee(Object.defineProperties(DataFragment.prototype, assign({
	update: d(function (id, nu) {
		var old = this.dataMap[ensureString(id)];
		ensureObject(nu);
		if (old && (old.stamp >= nu.stamp)) return;
		this.dataMap[id] = nu;
		if (this._deleted[id]) delete this._deleted[id];
		this._updated[id] = nu;
		this._scheduleEmit();
	}),
	delete: d(function (id) {
		if (!this.dataMap[ensureString(id)]) return;
		delete this.dataMap[id];
		if (this._updated[id]) delete this._updated[id];
		this._deleted[id] = true;
		this._scheduleEmit();
	})
}, autoBind({
	flush: d(function () {
		if (this.promise && !this.promise.resolved) {
			this.promise.done(this.flush);
			return;
		}
		if (isEmpty(this._updated) && isEmpty(this._deleted)) return;
		this.emit('update', { target: this, updated: this._updated, deleted: this._deleted });
		this._updated = create(null);
		this._deleted = create(null);
	})
}), lazy({
	dataMap: d(function () { return create(null); }),
	_updated: d(function () { return create(null); }),
	_deleted: d(function () { return create(null); }),
	_scheduleEmit: d(function () { return once(this.flush); })
}))));
