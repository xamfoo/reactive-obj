Tinytest.add('Initialize a given object and get the root node', function (test) {
  var obj = {a: 1};
  var x = new ReactiveObj(obj);
  test.equal(x.get(), obj);
  test.equal(x.get([]), obj);
});

Tinytest.add('Get nested nodes', function (test) {
  var obj = {a: 1, b: {c: 2}, d: [0, 42, {e: 13}]};
  var x = new ReactiveObj(obj);

  test.equal(x.get(), obj);

  test.equal(x.get(['a']), 1);
  test.equal(x.get(['b', 'c']), 2);
  test.equal(x.get(['d', 1]), 42);
  test.equal(x.get(['d', 2, 'e']), 13);

  test.equal(x.get('a'), 1);
  test.equal(x.get('b.c'), 2);
  test.equal(x.get('d.1'), 42);
  test.equal(x.get('d.2.e'), 13);
});

Tinytest.add('Replace root node', function (test) {
  var obj = {a: 1};
  var x = new ReactiveObj(obj);
  x.set([], {b: 1});
  test.equal(x.get().b, 1);
  x.set({c: 1});
  test.equal(x.get().c, 1);
});

Tinytest.add('Replace nested nodes', function (test) {
  var obj = {a: 1, b: {c: 2}, d: [0, 42, {e: 13}]};
  var x = new ReactiveObj(obj);

  x.set('a', {aa: 1});
  x.set(['aa'], 11);
  x.set(['b', 'c'], 20);
  x.set(['d', 1], 'forty-two');
  x.set(['d', 2, 'e'], {f: 'thirteen'});
  x.set(['x', 'y', 'z'], 0);
  test.equal(x.get(['a', 'aa']), 1);
  test.equal(x.get('aa'), 11);
  test.equal(x.get(['b', 'c']), 20);
  test.equal(x.get(['d', 1]), 'forty-two');
  test.equal(x.get(['d', 2, 'e', 'f']), 'thirteen');
  test.equal(x.get(['x', 'y', 'z']), 0);
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
  var count1 = 0;
  var x = new ReactiveObj({a: 1});

  x.update('b', 2, function (v) {
    test.equal(v, 2);
    count1 += 1;
  });
  test.equal(count1, 1);

  x.update('b', function (v) {
    test.equal(v, undefined);
    count1 += 1;
    return 2;
  });
  test.equal(count1, 2);
  test.equal(x.get('b'), 2);
});

Tinytest.add('Update existing value', function (test) {
  var x = new ReactiveObj({a: 1});

  x.update('a', function (v) { return v + 10; });
  test.equal(x.get('a'), 11);

  x.update('a', 13, function (v) { return v + 10; });
  test.equal(x.get('a'), 21);
});

Tinytest.add('setDefault method', function (test) {
  var x = new ReactiveObj({a: 1});

  x.setDefault('a', 0);
  test.equal(x.get('a'), 1);

  x.setDefault('b', 2);
  test.equal(x.get('b'), 2);
});

Tinytest.add('Get value if not set', function (test) {
  var x = new ReactiveObj({a: 1, c: null, d: undefined});

  test.equal(x.get('a', 0), 1);
  test.equal(x.get('a.x', 0), 0);
  test.equal(x.get('b', 2), 2);
  test.equal(x.get('b.x', 2), 2);
  test.equal(x.get('c', 3), null);
  test.equal(x.get('c.x', 3), 3);
  test.equal(x.get('d', 4), undefined);
  test.equal(x.get('d.x', 4), 4);
});

Tinytest.add('Equals method', function (test) {
  var obj = {a: 1, b: {c: 2}};
  var x = new ReactiveObj(obj);

  test.isTrue(x.equals(obj));
  test.isFalse(x.equals(undefined));

  test.isTrue(x.equals('a', 1));
  test.isFalse(x.equals('a', 2));

  test.isTrue(x.equals(['b', 'c'], 2));
  test.isFalse(x.equals(['b', 'c'], 1));

  test.isTrue(x.equals('x', undefined));
});

Tinytest.add('Invalidation of equals method calls', function (test) {
  var count1 = 0;
  var count2 = 0;
  var b = {b: 1};
  var a = {a: b, c: 2};
  var x = new ReactiveObj(a);
  var c1 = Tracker.autorun(function () {
    x.equals(['a', 'b'], 1);
    count1 += 1;
  });
  var c2 = Tracker.autorun(function () {
    x.equals('c', 2);
    count2 += 1;
  });

  Tracker.flush();
  test.equal(count1, 1);
  test.equal(count2, 1);

  x.set('c', 3);
  Tracker.flush();
  test.equal(count1, 1);
  test.equal(count2, 2);

  x.set(['a', 'b'], 0);
  Tracker.flush();
  test.equal(count1, 2);
  test.equal(count2, 2);

  x.set([], a);
  Tracker.flush();
  test.equal(count1, 3);
  test.equal(count2, 3);

  c1.stop();
  c2.stop();
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
  test.equal(count0, 3);
  test.equal(count1, 3);
  test.equal(count2, 2);
  test.equal(count3, 2);

  x.forceInvalidate(['a', 'b'], {allTypes: true});
  Tracker.flush();
  test.equal(count0, 4);
  test.equal(count1, 4);
  test.equal(count2, 3);
  test.equal(count3, 2);

  c0.stop();
  c1.stop();
  c2.stop();
  c3.stop();
});

Tinytest.add('Force invalidate without children', function (test) {
  var count0 = 0;
  var count1 = 0;
  var count2 = 0;
  var c = {c: 1}
  var b = {b: c};
  var a = {a: b};
  var x = new ReactiveObj(a);
  var c0 = Tracker.autorun(function () {
    test.equal(x.get(), a);
    count0 += 1;
  });
  var c1 = Tracker.autorun(function () {
    test.equal(x.get('a'), b);
    count1 += 1;
  });
  var c2 = Tracker.autorun(function () {
    test.equal(x.get(['a', 'b']), c);
    count2 += 1;
  });

  x.forceInvalidate([], {noChildren: true});
  Tracker.flush();
  test.equal(count0, 2);
  test.equal(count1, 1);
  test.equal(count2, 1);

  x.forceInvalidate('a', {noChildren: true});
  Tracker.flush();
  test.equal(count0, 3);
  test.equal(count1, 2);
  test.equal(count2, 1);

  c0.stop();
  c1.stop();
  c2.stop();
});

Tinytest.add('Array methods', function (test) {
  var count0 = 0;
  var count1 = 0;
  var count2 = 0;
  var count3 = 0;
  var v = 42;
  var c = [v];
  var b = {b: c};
  var a = {a: b};
  var x = new ReactiveObj(a);
  var c0 = Tracker.autorun(function () {
    test.equal(x.get(), a);
    count0 += 1;
  });
  var c1 = Tracker.autorun(function () {
    test.equal(x.get('a'), b);
    count1 += 1;
  });
  var c2 = Tracker.autorun(function () {
    test.equal(x.get(['a', 'b']), c);
    count2 += 1;
  });
  var c3 = Tracker.autorun(function () {
    test.equal(x.get(['a', 'b', '0']), v);
    count3 += 1;
  });

  test.equal(x.push(['a', 'b'], 10), 2);
  Tracker.flush();
  test.equal(count0, 2);
  test.equal(count1, 2);
  test.equal(count2, 2);
  test.equal(count3, 1);

  test.equal(x.pop(['a', 'b']), 10);
  Tracker.flush();
  test.equal(count0, 3);
  test.equal(count1, 3);
  test.equal(count2, 3);
  test.equal(count3, 1);

  v = undefined;
  test.equal(x.shift(['a', 'b']), 42);
  Tracker.flush();
  test.equal(count0, 4);
  test.equal(count1, 4);
  test.equal(count2, 4);
  test.equal(count3, 2);

  c0.stop();
  c1.stop();
  c2.stop();
  c3.stop();
});

Tinytest.add('Cursor methods', function (test) {
  var count1 = 0;
  var count2 = 0;
  var count3 = 0;
  var count4 = 0;
  var count5 = 0;
  var val = 1;
  var c = {c: 1}
  var b = {b: c};
  var a = {a: b};
  var x = new ReactiveObj(a);
  var xc = x.select(['a', 'b', 'c']);
  test.equal(x.select('a').get(), b);
  test.equal(x.select(['a', 'b']).get(), c);

  var c1 = Tracker.autorun(function () {
    test.equal(xc.get(), val);
    count1 += 1;
  });
  var c2 = Tracker.autorun(function () {
    test.equal(x.select('a').select(['b', 'c']).get(), val);
    count2 += 1;
  });
  var c3 = Tracker.autorun(function () {
    x.select('a').get('b');
    count3 += 1;
  });
  var c4 = Tracker.autorun(function () {
    x.select('a').get();
    count4 += 1;
  });
  var c5 = Tracker.autorun(function () {
    x.select([]).get();
    count5 += 1;
  });

  val = [];
  xc.set(val);
  Tracker.flush();
  test.equal(count1, 2);
  test.equal(count2, 2);
  test.equal(count3, 2);
  test.equal(count4, 2);
  test.equal(count5, 2);

  xc.push([], 1);
  Tracker.flush();
  test.equal(count1, 3);
  test.equal(count2, 3);
  test.equal(count3, 3);
  test.equal(count4, 3);
  test.equal(count5, 3);

  x.select(['a', 'd']).set(20);
  Tracker.flush();
  test.equal(count1, 3);
  test.equal(count2, 3);
  test.equal(count3, 3);
  test.equal(count4, 4);
  test.equal(count5, 4);

  c1.stop();
  c2.stop();
  c3.stop();
  c4.stop();
  c5.stop();
});
