# reactive-obj

Meteor reactivity for nested objects.

[![Build Status](https://travis-ci.org/xamfoo/reactive-obj.svg?branch=master)](https://travis-ci.org/xamfoo/reactive-obj)

## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
 

- [Install](#install)
  - [Dependencies](#dependencies)
- [Getting Started](#getting-started)
  - [Demo](#demo)
- [Usage](#usage)
  - [`new ReactiveObj([initialValue], [options])`](#new-reactiveobjinitialvalue-options)
  - [`reactiveObj.get([keyPath])`](#reactiveobjgetkeypath)
  - [`reactiveObj.equals(keyPath, value)`](#reactiveobjequalskeypath-value)
  - [`reactiveObj.set(keyPath, value)`](#reactiveobjsetkeypath-value)
  - [`reactiveObj.setDefault(keyPath, valueIfNotSet)`](#reactiveobjsetdefaultkeypath-valueifnotset)
  - [`reactiveObj.update(keyPath, [valueIfNotSet], updater)`](#reactiveobjupdatekeypath-valueifnotset-updater)
  - [`reactiveObj.forceInvalidate(keyPath, [options])`](#reactiveobjforceinvalidatekeypath-options)
- [Discussion](#discussion)
    - [Why use this instead of Session, ReactiveVar or ReactiveDict?](#why-use-this-instead-of-session-reactivevar-or-reactivedict)
    - [Why doesn't `get` and `update` return cloned objects by default?](#why-doesnt-get-and-update-return-cloned-objects-by-default)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

    meteor add xamfoo:reactive-obj

### Dependencies

- `underscore`
- `tracker`

## Getting Started

```javascript
var state = new ReactiveObj({a: {b: {c: 1}}});
var print = Tracker.autorun(function () {
  console.log( state.get(['a', 'b']) ); // Prints {c: 1}
});
state.set(['a', 'x'], 2); // Prints nothing
state.set(['a', 'b', 'c'], 42); // Prints {c: 42}
state.get('a'); // Returns {b: {c: 42}, x: 2}
```

### Demo

- [Simple example](http://reactiveobj.meteor.com) - Demonstrates reactivity on
nested properties ([*source*](examples/simple/))

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

<hr>

### `reactiveObj.get([keyPath])`
or `reactiveObj.get(keyPath, [valueIfNotSet])`

Returns the object's property specified by the keypath, or `valueIfNotSet` if
the key does not exist. Establishes a reactive dependency on the property.

- `keyPath` *String* or *Array of String*
  - Pointer to a property of an object. If not specified, this returns the top
  level object. `['fruits', 'apple']` and `'fruits.apple'` are equivalent and
  valid keypaths.
- `valueIfNotSet` *Any*

Beware of mutating the returned value as it changes the stored object without
triggering reactivity. A way to avoid this is to specify a `transform`
function that clones the object in the constructor options.

If this method returns `undefined` when ` valueIfNotSet` is not provided, that
does not guarantee the key does not exist because the key could be associated
with an `undefined` value.

Example:
```javascript
var x = new ReactiveObj({a: 1, b: [10, 20]});
x.get('a'); // Returns 1
x.get(['b', 'c']); // Returns undefined
x.get('b.1'); // Returns 20
x.get('c', 2); // Returns 2
```

<hr>

### `reactiveObj.equals(keyPath, value)`

Returns true if the object's property specified by the keypath is equals to
the `value` or false if otherwise. Establishes a reactive dependency which is
invalidated only when the property changes to and from the value.

- `keyPath` *String* or *Array of String*
- `value` *Any*

<hr>

### `reactiveObj.set(keyPath, value)`

Replaces the object's property specified by the keypath and returns the
`reactiveObj` that can be used for chaining. Properties that do not exist will
be created.

- `keyPath` *String* or *Array of String*
- `value` *Any*
  - Value to set

To replace the root node, use `[]` as the keypath.

Example:
```javascript
var x = new ReactiveObj;
x.set(['a', 'b'], 1);
x.get('a'); // Returns {b: 1}
```

<hr>

### `reactiveObj.setDefault(keyPath, valueIfNotSet)`

Sets the object's property specified by the keypath if it hasn't been set
before and returns the `reactiveObj` that can be used for chaining.  Keys in
the keypath that do not exist will be created.

- `keyPath` *String* or *Array of String*
- `valueIfNotSet` *Any*

<hr>

### `reactiveObj.update(keyPath, [valueIfNotSet], updater)`

Update the value at this keypath with the return value of calling `updater`
with the existing value or `valueIfNotSet` if the key was not set.

- `keyPath` *String* or *Array of String*
- `valueIfNotSet` *Any*
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
x.get('a'); // Returns 2
x.get('b'); // Returns 0
```

<hr>

### `reactiveObj.forceInvalidate(keyPath, [options])`

Invalidate reactive dependents on the value and its children specified by
the keypath. You will need to call this if you mutate values returned by `get`
or `update` directly. By default, this will only invalidate values which are
instances of `Object` like arrays, objects and functions. You can override
this behavior in `options`.

- `keyPath` *String* or *Array of String*
- `options` *Object*
  - `allTypes` *Boolean* (default=false)
    - Setting this `true` will invalidate reactive dependents for any type of
    values, effectively causing all dependents on the value and its children
    to re-run.
  - `noChildren` *Boolean* (default=false)
    - Set this to `true` to ignore children dependents, so that only dependents
    matching the keypath will be invalidated.

Normally one should avoid using `forceInvalidate` and treat values returned
from `get` and `update` as read-only. This makes the application simpler and
more efficient.

Example:
```javascript
var state = new ReactiveObj({a: 1}});
var print = Tracker.autorun(function () {
  console.log( state.get('a') ); // Prints 1
});
state.get().a = 2;
state.get('a'); // Prints 1
state.forceInvalidate(); // Prints 2
```

## Discussion

#### Why use this instead of Session, ReactiveVar or ReactiveDict?

It is quite common to maintain application state and namespaces in deep
structures. It is nice to be able to make those structures reactive as well.

While the mentioned packages are good for maintaining reactive keys and values,
they are currently not very efficient when dealing with nested structures.

For example if we declare the following `ReactiveVar`,
```javascript
new ReactiveVar({
  prop1: {
    prop11: {
      prop111: ..
    }
  },
  prop2: ..,
  prop3: {
    prop31: ..
  },
  ..
  propN: ..
}, equalsFunc);
```

Every time one of the property is changed,
- `equalsFunc` usually needs to check every property. This will take time if
there are a lot of nested properties.
- Every reactive dependent on the variable is invalidated. This will also
take time if there are many reactive dependents.

However `ReactiveObj` is created with nested objects in mind. So if a property
is changed,

- Only the changed property is checked.
- Only reactive dependents on the changed property is invalidated.
- In addition, all changes and invalidations are batched so that multiple
changes on on the same property will only result in a single check and
invalidation.

All things said, the Meteor scene changes quickly so let me know if there is a
better way.

#### Why doesn't `get` and `update` return cloned objects by default?

Not all structures can be deep cloned easily. It is tricky to clone custom
types, functions and structures containing circular references. But if your
structure is simple, specifying a function containing
`JSON.parse(JSON.stringify(value))` or `EJSON.clone` in the `transform` option
will do the job.

