Package.describe({
  name: 'xamfoo:reactive-obj',
  version: '0.1.0',
  // Brief, one-line summary of the package.
  summary: 'Provides reactivity for nested objects',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/xamfoo/reactive-obj',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.4.1');
  api.use(['underscore', 'tracker']);
  api.addFiles('reactive-obj.js');
  api.export('ReactiveObj');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('xamfoo:reactive-obj');
  api.addFiles('reactive-obj-tests.js');
});
