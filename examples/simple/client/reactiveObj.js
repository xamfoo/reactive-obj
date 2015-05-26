state = new ReactiveObj({
  owners: {
    john: {},
    alice: {}
  },
});

var rendered = new ReactiveObj({
  all: 0,
  john: 0,
  alice: 0
});

Template.state.helpers({
  all: function () {
    rendered.update('all', function (v) { return v + 1; });
    return JSON.stringify(state.get(), null, 2);
  },

  owner: function (name) {
    rendered.update(name, function (v) { return v + 1; });
    return JSON.stringify(state.get(['owners', name]), null, 2);
  },

  rendered: function (key) {
    return rendered.get(key);
  }
});

var fruits = ['apple', 'banana', 'pear'];

function restock (person) {
  var fruit = Random.choice(fruits);
  var path;
  path = ['owners', person, fruit];
  state.set(path, (state.get(path) || 0) + 1);
}

function clearStock () {
  _.each(state.get('owners'), function (v, k) {
    var path = ['owners', k];
    state.update(path, function (v) { return _.size(v) === 0 ? v : {}; });
  });
}

Template.state.events({
  'click .js-restockJohn': function () { restock('john'); },

  'click .js-restockAlice': function () { restock('alice'); },

  'click .js-clearStock': function () { clearStock(); }
});
