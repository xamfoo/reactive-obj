# reactive-obj

Meteor reactivity for nested objects.

[![Build Status](https://travis-ci.org/xamfoo/reactive-obj.svg?branch=master)](https://travis-ci.org/xamfoo/reactive-obj)

## Install

    meteor add xamfoo:reactive-obj

### Dependencies

- `underscore`
- `tracker`

## Getting Started

```javascript
var state = new ReactiveObj({a: {b: {c: 1}}});
var print = Tracker.autorun(function () {
  console.log( state.get(['a', 'b']) ); // {c: 1}
});
state.set(['a', 'x'], 2); // Nothing printed
state.set(['a', 'b', 'c'], 42); // {c: 42}
state.get('a'); // {b: {c: 42}, x: 2}
```

### Demo

- [Simple example](http://reactiveobj.meteor.com) - Demonstrates reactivity on nested properties ([*source*](examples/simple/))

## Usage

### `new ReactiveObj([initialValue])`

Constructor for a single reactive object.

- `initialValue` *Object*
  - Initial value to set. If no value is provided, it defaults to an empty
  object.

----

### `reactiveObj.get([keyPath])`
or `reactiveObj.get(keyPath, [valueIfNotSet])`

Returns the object's property specified by the keypath, or `valueIfNotSet` if
the key does not exist. Establishes a reactive dependency on the property.

- `keyPath` *Array of String*
  - Pointer to a property of an object. If not specified, this returns the top
  level object. `['fruits', 'apple']` is a valid keypath, which is analogous to
  `somevar['fruits']['apple']`.
- `valueIfNotSet` *Any*
  - `valueIfNotSet` is not provided to guarantee the key was not found.

Beware of mutating the returned value as it changes the stored object without
triggering reactivity. A way to avoid this is to specify a `transform`
function that clones the object in the constructor options.

If this method returns `undefined` when ` valueIfNotSet` is not provided, that
does not guarantee the key does not exist because the key could be associated
with an `undefined` value.

Example:
```javascript
var x = new ReactiveObj({a: 1});
x.get('a'); // 1
x.get(['b', 'c']); // undefined
x.get('b', 2); // 2
```

----

### `reactiveObj.set(keyPath, value)`

Replaces the object's property specified by the keypath and returns the
`reactiveObj` that can be used for chaining. Properties that do not exist will
be created.

- `keyPath` *Array of String*
- `value` *Any*
  - Value to set

To replace the root node, use `[]` as the keypath.

Example:
```javascript
var x = new ReactiveObj;
x.set(['a', 'b'], 1);
x.get('a'); // {b: 1}
```

----

### `reactiveObj.update(keyPath, [valueIfNotSet], updater)`

Update the value at this keypath with the return value of calling `updater`
with the existing value or `valueIfNotSet` if the key was not set.

- `keyPath` *Array of String*
- `updater` *Function*

Beware of mutating the returned value as it changes the stored object without
triggering reactivity. A way to avoid this is to specify a `transform`
function that clones the object in the constructor options.

Example:
```javascript
var x = new ReactiveObj({a: 1});
var inc = function (v) { return v + 1; };

x.update('a', inc);
x.update('b', 0, inc);
x.get('a'); // 2
x.get('b'); // 0
```

