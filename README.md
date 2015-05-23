# reactive-obj

Meteor reactivity for nested objects.

[![Build Status](https://travis-ci.org/xamfoo/reactive-obj.svg?branch=master)](https://travis-ci.org/xamfoo/reactive-obj)

## Install

    meteor add xamfoo:reactive-obj

### Dependencies

- `underscore`
- `tracker`

## Example

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

### `new ReactiveObj([initialValue], [options])`

Constructor for a single reactive object.

- `initialValue` *Object*
  - Initial value to set. If no value is provided, it defaults to an empty
  object.
- `options` *Object*
  - `transform` *Function*
    - Specify a transform function for all values returned via get. `transform`
    should take a single argument value and return the new value.

Example of a transform function:
```javascript
var state = new ReactiveObj({}, {
  transform: function (value) {
    return EJSON.clone(value); // cloning prevents changes to original value
  }
});
state.set('a', {x: 1});
state.get('a').x = 2;
state.get(['a', 'x']); // Returns 1
```

----

### `reactiveObj.get([keyPath])`

Returns the object's property specified by the keypath. Establishes a reactive
dependency on the property. Returns `undefined` if the property is not
specified. Beware of mutating the returned value as it affects the stored
object without triggering reactivity.

- `keyPath` *Array of object indices*
  - Pointer to a property of an object. If not specified, this returns the top
  level object. `['fruits', 'apple']` is a valid keypath, which is analogous to
  `somevar['fruits']['apple']`.

----

### `reactiveObj.set(keyPath, value)`

Replaces the object's property specified by the keypath. To replace the root
node, use `[]` as the keypath.

- `keyPath` *Array of object indices*
  - See `reactiveObj.get()`
- `value` *Object*
  - Value to set

