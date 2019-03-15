'use strict';

var test = require('tape');
var algoliasearchHelper = require('../../../index');

var fakeClient = {};

test('setChange should change the current page', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  t.ok(helper.getPage() === 0, 'First page should be 0');
  helper.setPage(3);
  t.ok(helper.getPage() === 3, 'If page was changed to 3, getPage should return 3');
  t.end();
});

test('nextPage should increment the page by one', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  t.ok(helper.getPage() === 0, 'First page should be 0');
  helper.nextPage();
  helper.nextPage();
  helper.nextPage();
  t.ok(helper.getPage() === 3, 'If page was increment 3 times, getPage should return 3');
  t.end();
});

test('previousPage should decrement the current page by one', function(t) {
  var helper = algoliasearchHelper(fakeClient, null, null);

  t.ok(helper.getPage() === 0, 'First page should be 0');
  helper.setPage(3);
  t.ok(helper.getPage() === 3, 'If page was changed to 3, getPage should return 3');
  helper.previousPage();
  t.ok(helper.getPage() === 2, 'must be 2 now');
  t.end();
});

test('pages should be reset if the mutation might change the number of pages', function(t) {
  var bind = require('lodash/bind');

  var helper = algoliasearchHelper(fakeClient, '', {
    facets: ['facet1', 'f2'],
    disjunctiveFacets: ['f1']
  });

  function testMutation(tester, text, testFn) {
    helper.setPage(10);
    t.equal(helper.getPage(), 10, 'set the current page to 10' + text);
    testFn();
    t.equal(helper.getPage(), 0, 'page resetted' + text);
  }

  testMutation(t, ' clearRefinements', bind(helper.clearRefinements, helper));
  testMutation(t, ' setQuery', bind(helper.setQuery, helper, 'query'));
  testMutation(t, ' addNumericRefinement', bind(helper.addNumericRefinement, helper, 'facet', '>', '2'));
  testMutation(t, ' removeNumericRefinement', bind(helper.removeNumericRefinement, helper, 'facet', '>'));

  testMutation(t, ' addFacetExclusion', bind(helper.addFacetExclusion, helper, 'facet1', 'val2'));
  testMutation(t, ' removeFacetExclusion', bind(helper.removeFacetExclusion, helper, 'facet1', 'val2'));

  testMutation(t, ' addFacetRefinement', bind(helper.addFacetRefinement, helper, 'f2', 'val'));
  testMutation(t, ' removeFacetRefinement', bind(helper.removeFacetRefinement, helper, 'f2', 'val'));

  testMutation(t, ' addDisjunctiveFacetRefinement', bind(helper.addDisjunctiveFacetRefinement, helper, 'f1', 'val'));
  testMutation(t, ' removeDisjunctiveFacetRefinement', bind(helper.removeDisjunctiveFacetRefinement, helper, 'f1', 'val'));
  testMutation(t, ' toggleFacetRefinement', bind(helper.toggleFacetRefinement, helper, 'f1', 'v1'));

  t.end();
});
