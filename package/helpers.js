NOTSET = {};

Helpers = {};

/**
 * With `this` as a reactiveObj, applys a given mutator on a key path.
 */
Helpers.applyMutator = function (mutator, options, keyPath/*, arguments*/) {
  options = options || {};
  var self = this;
  var node = Tracker.nonreactive(function () {
    return self.get(keyPath, NOTSET);
  });

  if (node === NOTSET) node = undefined;
  if (options.check && !options.check(node, keyPath)) return;

  var result = mutator.apply(node, Array.prototype.slice.call(arguments, 3));
  self.forceInvalidate(keyPath, {noChildren: true});
  return result;
};

Helpers.applyCursorMethod = function (methodName, options, keyPath/*, arguments*/) {
  options = options || {};
  var self = this;
  var args, results;

  // Add cursor path as prefix if key path is given
  if (options.noKeyPath &&
      options.noKeyPath.indexOf(arguments.length - 2) >= 0) {
    args = Array.prototype.slice.call(arguments, 2);
    keyPath = self._path;
  }
  else {
    args = Array.prototype.slice.call(arguments, 3);
    keyPath = self._path.concat(self._reactiveObj._matchKeyPath(keyPath));
  }

  result = self._reactiveObj[methodName].apply(
    self._reactiveObj,
    [keyPath].concat(args)
  );
  if (result === self._reactiveObj) return self;
  else return result;
};
