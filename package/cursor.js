/**
 * Cursors store reference to a ReactiveObj and a path
 */

Cursor = function (reactiveObj, path) {
  this._reactiveObj = reactiveObj;
  this._path = path;
}

var methodNames = [
  'get', 'equals', 'set', 'setDefault', 'update', 'forceInvalidate'
].concat(_.keys(ArrayMethods));

_.each(methodNames, function (v) {
  Cursor.prototype[v] = _.partial(applyCursorMethod, v);
});

Cursor.prototype.select = function (keyPath) {
  return this._reactiveObj.select.call(
    this._reactiveObj,
    this._path.concat(this._reactiveObj._matchKeyPath(keyPath))
  );
};
