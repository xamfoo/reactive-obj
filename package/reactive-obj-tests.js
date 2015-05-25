Tinytest.add('Initialize a given object and get the root node', function (test) {
  var obj = {a: 1};
  var x = new ReactiveObj(obj);
  test.equal(x.get(), obj);
  test.equal(x.get([]), obj);
});

Tinytest.add('Get nested nodes', function (test) {
  var obj = {a: 1, b: {c: 2}, d: [0, 42, {e: 13}]};
  var x = new ReactiveObj(obj);

  test.equal(x.get('a'), 1);
  test.equal(x.get(['a']), 1);
  test.equal(x.get(['b', 'c']), 2);
  test.equal(x.get(['d', 1]), 42);
  test.equal(x.get(['d', 2, 'e']), 13);
});

Tinytest.add('Replace root node', function (test) {
  var obj = {a: 1};
  var x = new ReactiveObj(obj);
  x.set([], {b: 1});
  test.equal(x.get().b, 1);
});

Tinytest.add('Replace nested nodes', function (test) {
  var obj = {a: 1, b: {c: 2}, d: [0, 42, {e: 13}]};
  var x = new ReactiveObj(obj);

  x.set('a', {aa: 1});
  x.set(['aa'], 11);
  x.set(['b', 'c'], 20);
  x.set(['d', 1], 'forty-two');
  x.set(['d', 2, 'e'], {f: 'thirteen'});
  test.equal(x.get(['a', 'aa']), 1);
  test.equal(x.get('aa'), 11);
  test.equal(x.get(['b', 'c']), 20);
  test.equal(x.get(['d', 1]), 'forty-two');
  test.equal(x.get(['d', 2, 'e', 'f']), 'thirteen');
});

Tinytest.add('Root node getter is reactive', function (test) {
  var obj = {a: 1};
  var num = 1;
  var count = 0;
  var x = new ReactiveObj(obj);

  var c = Tracker.autorun(function () {
    test.equal(x.get().a, num);
    count += 1;
  });

  x.set(['a'], 2);
  num = 2;
  Tracker.flush();

  x.set([], {a: 3});
  num = 3;
  Tracker.flush();

  test.equal(count, num);
  c.stop();
});

Tinytest.add('Nested node getter is reactive', function (test) {
  var obj = {a: {b: 1}};
  var num = 1;
  var count = 0;
  var x = new ReactiveObj(obj);

  var c = Tracker.autorun(function () {
    test.equal(x.get('a').b, num);
    count += 1;
  });

  x.set(['a'], {b: 2});
  num = 2;
  Tracker.flush();

  x.set([], {a: {b: 3}});
  num = 3;
  Tracker.flush();

  x.set(['a', 'b'], 4);
  num = 4;
  Tracker.flush();

  test.equal(count, num);
  c.stop();
});

Tinytest.add('Reactivity is isolated between sibling nodes', function (test) {
  var obj = {a: {b: 1}, z: 0};
  var count = 1;
  var x = new ReactiveObj(obj);

  var c = Tracker.autorun(function () {
    test.equal(x.get('z'), 0);
    count += 1;
  });

  x.set(['a', 'b'], 2);
  Tracker.flush();

  x.set(['a'], {b: 3});
  Tracker.flush();

  test.equal(count, 2);
  c.stop();
});

Tinytest.add('Reactivity is triggered only upon flush', function (test) {
  var x = new ReactiveObj({a: 1});
  var num = 1;
  var count = 1;

  var c = Tracker.autorun(function () {
    test.equal(x.get('a'), num);
    count += 1;
  });

  x.set('a', 2);
  x.set('a', 1);

  test.equal(count, 2);
  c.stop();
});

Tinytest.add('Empty nodes in deps are cleaned up when removed', function (test) {
  var x = new ReactiveObj({a: 1});

  var depState = JSON.stringify(x._deps);

  var c = Tracker.autorun(function () {
    for (var i=0; i<10; i+=1) {
      x.get(i + '');
      for (var j=0; j<10; j+=1) {
        x.get([i+'', j+'']);
      }
    }
  });
  c.stop();

  Tracker.flush();
  test.equal(JSON.stringify(x._deps), depState);
});

Tinytest.add('Update value if not set', function (test) {
  var x = new ReactiveObj({a: 1});

  x.update('b', 2, function () {});
  test.equal(x.get('b'), 2);
});

Tinytest.add('Update existing value', function (test) {
  var x = new ReactiveObj({a: 1});

  x.update('a', function (v) { return v + 10; });
  test.equal(x.get('a'), 11);

  x.update('a', 13, function (v) { return v + 10; });
  test.equal(x.get('a'), 21);
});

Tinytest.add('Get value if not set', function (test) {
  var x = new ReactiveObj({a: 1});

  test.equal(x.get('a'), 1);
  test.equal(x.get('b', 2), 2);
});

Tinytest.add('Transform function is used when specified', function (test) {
  var count = 0;
  var x = new ReactiveObj({a: 1}, {
    transform: function (v) { count+=1; return v; }
  });

  test.equal(x.get('a'), 1);
  test.equal(count, 1);

  test.equal(x.update('a', function (v) { return v; }), x);
  test.equal(count, 2);
});

Tinytest.add('Force invalidate', function (test) {
  var count0 = 0;
  var count1 = 0;
  var count2 = 0;
  var count3 = 0;
  var bc = {b: 1, c: 2};
  var a = {a: bc};
  var x = new ReactiveObj(a);
  var c0 = Tracker.autorun(function () {
    test.equal(x.get(), a);
    count0 += 1;
  });
  var c1 = Tracker.autorun(function () {
    test.equal(x.get('a'), bc);
    count1 += 1;
  });
  var c2 = Tracker.autorun(function () {
    test.equal(x.get(['a', 'b']), 1);
    count2 += 1;
  });
  var c3 = Tracker.autorun(function () {
    test.equal(x.get(['a', 'c']), 2);
    count3 += 1;
  });

  x.forceInvalidate();
  Tracker.flush();
  test.equal(count0, 2);
  test.equal(count1, 2);
  test.equal(count2, 1);
  test.equal(count3, 1);

  x.forceInvalidate('a', {allTypes: true});
  Tracker.flush();
  test.equal(count0, 2);
  test.equal(count1, 3);
  test.equal(count2, 2);
  test.equal(count3, 2);

  x.forceInvalidate(['a', 'b'], {allTypes: true});
  Tracker.flush();
  test.equal(count0, 2);
  test.equal(count1, 3);
  test.equal(count2, 3);
  test.equal(count3, 2);

  c0.stop();
  c1.stop();
  c2.stop();
  c3.stop();
});

