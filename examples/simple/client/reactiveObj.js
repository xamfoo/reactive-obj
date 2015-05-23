state = new ReactiveObj({
  owners: {
    john: {},
    alice: {}
  }
});

Session.set('renderAll', 0);
Session.set('renderJohn', 0);
Session.set('renderAlice', 0);

Template.state.helpers({
  renderAll: function () { return Session.get('renderAll'); },

  all: function () {
    Tracker.nonreactive(function () {
      Session.set('renderAll', Session.get('renderAll') + 1);
    });
    return JSON.stringify(state.get(), null, 2);
  },

  renderJohn: function () { return Session.get('renderJohn'); },

  john: function () {
    Tracker.nonreactive(function () {
      Session.set('renderJohn', Session.get('renderJohn') + 1);
    });
    return JSON.stringify(state.get(['owners', 'john']), null, 2);
  },

  renderAlice: function () { return Session.get('renderAlice'); },

  alice: function () {
    Tracker.nonreactive(function () {
      Session.set('renderAlice', Session.get('renderAlice') + 1);
    });
    return JSON.stringify(state.get(['owners', 'alice']), null, 2);
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
    var oldVal = state.get(path);
    state.set(path, _.size(oldVal) === 0 ? oldVal : {});
  });
}

Template.state.events({
  'click .js-restockJohn': function () { restock('john'); },

  'click .js-restockAlice': function () { restock('alice'); },

  'click .js-clearStock': function () { clearStock(); }
});
