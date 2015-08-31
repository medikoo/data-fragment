'use strict';

var assign       = require('es5-ext/object/assign')
  , ensureString = require('es5-ext/object/validate-stringifiable-value')
  , ensureObject = require('es5-ext/object/valid-object')
  , d            = require('d')
  , lazy         = require('d/lazy')
  , ee           = require('event-emitter')
  , once         = require('timers-ext/once')

  , create = Object.create;

var DataFragment = module.exports = function () {
	if (!(this instanceof DataFragment)) return new DataFragment();
};

ee(Object.defineProperties(DataFragment.prototype, assign({
	update: d(function (id, nu) {
		var old = this.data[ensureString(id)];
		ensureObject(nu);
		if (old && (old.stamp >= nu.stamp)) return;
		this.data[id] = nu;
		if (this._deleted[id]) delete this._deleted[id];
		this._updated[id] = nu;
		this._scheduleEmit();
	}),
	delete: d(function (id) {
		if (!this.data[ensureString(id)]) return;
		delete this.data[id];
		if (this._updated[id]) delete this._updated[id];
		this._deleted[id] = true;
		this._scheduleEmit();
	})
}, lazy({
	data: d(function () { return create(null); }),
	_updated: d(function () { return create(null); }),
	_deleted: d(function () { return create(null); }),
	_scheduleEmit: d(function () {
		return once(function () {
			this.emit('update', { target: this, updated: this._updated, deleted: this._deleted });
			this._updated = create(null);
			this._deleted = create(null);
		}.bind(this));
	})
}))));
