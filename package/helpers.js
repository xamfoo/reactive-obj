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
