/**
 * Cursors store reference to a ReactiveObj and a path
 */

Cursor = function (reactiveObj, path) {
  this._reactiveObj = reactiveObj;
  this._path = path;
}

var methods = {
  get: {noKeyPath: [0]},
  equals: {noKeyPath: [1]},
  set: {noKeyPath: [1]},
  setDefault: {noKeyPath: [1]},
  update: undefined,
  select: undefined,
  forceInvalidate: {noKeyPath: [1]}
};
_.each(ArrayMethods, function (v, k) { methods[k] = undefined; });

_.each(methods, function (v, k) {
  Cursor.prototype[k] = _.partial(Helpers.applyCursorMethod, k, v);
});
