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

function applyCursorMethod (methodName /*, arguments*/) {
  var result = this._reactiveObj[methodName].apply(
    this._reactiveObj,
    [this._path].concat(Array.prototype.slice.call(arguments, 1))
  );
  if (result === this._reactiveObj) return this;
  else return result;
}

_.each(methodNames, function (v) {
  Cursor.prototype[v] = _.partial(applyCursorMethod, v);
});

Cursor.prototype.select = function (keyPath) {
  return this._reactiveObj.select.call(
    this._reactiveObj,
    this._path.concat(this._reactiveObj._matchKeyPath(keyPath))
  );
};
