Package.describe({
  name: 'xamfoo:reactive-obj',
  version: '0.4.3',
  summary: 'Reactivity for nested objects',
  git: 'https://github.com/xamfoo/reactive-obj',
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
