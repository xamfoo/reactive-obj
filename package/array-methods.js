function newArray () { return []; };

var mutatorOpt = {
  check: function (v, path) {
    if (!_.isArray(v))
      throw new Meteor.Error(JSON.stringify(path) + ' is not an array');

    return true;
  }
};

var mutators = ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift',
  'sort', 'splice', 'unshift'];

ArrayMethods = _.reduce(mutators, function (acc, v) {
  var method = Array.prototype[v];
  if (method)
    acc[v] = _.partial(Helpers.applyMutator, Array.prototype[v], mutatorOpt);

  return acc;
}, {});
