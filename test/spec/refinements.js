'use strict';

var test = require('tape');
var _ = require('lodash');
var algoliasearchHelper = require('../../index');

var emptyClient = {};

test('Adding refinments should add an entry to the refinments attribute', function(t) {
  var facetName = 'facet1';
  var facetValue = '42';

  var helper = algoliasearchHelper(emptyClient, 'index', {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'should be empty at first');
  helper.addFacetRefinement(facetName, facetValue);
  t.ok(_.size(helper.state.facetsRefinements) === 1, 'when adding a refinment, should have one');
  t.deepEqual(helper.state.facetsRefinements.facet1, [facetValue]);
  helper.addFacetRefinement(facetName, facetValue);
  t.ok(_.size(helper.state.facetsRefinements) === 1, 'when adding the same, should still be one');
  helper.removeFacetRefinement(facetName, facetValue);
  t.ok(_.size(helper.state.facetsRefinements) === 0, 'Then empty ');
  t.end();
});

test('Adding several refinements for a single attribute should be handled', function(t) {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'empty');
  helper.addFacetRefinement(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 1, 'Adding one refinement, should have one');
  helper.addFacetRefinement(facetName, 'value2');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding another refinement, should have two');
  helper.addFacetRefinement(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding same refinement as the first, should have two');

  t.end();
});

test('Toggling several refinements for a single attribute should be handled', function(t) {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'empty');
  helper.toggleFacetRefinement(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 1, 'Adding one refinement, should have one');
  helper.toggleFacetRefinement(facetName, 'value2');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding another refinement, should have two');
  helper.toggleFacetRefinement(facetName, 'value1');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 1, 'Adding same refinement as the first, should have two');
  t.deepEqual(helper.state.facetsRefinements[facetName], ['value2'], 'should contain value2');

  t.end();
});

test('Using toggleFacetRefinement on a non specified facet should throw an exception', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {});

  t.throws(_.partial(helper.toggleFacetRefinement, 'unknown', 'value'));

  t.end();
});

test('Removing several refinements for a single attribute should be handled', function(t) {
  var facetName = 'facet';

  var helper = algoliasearchHelper(emptyClient, null, {
    facets: [facetName]
  });

  t.ok(_.isEmpty(helper.state.facetsRefinements), 'empty');
  helper.addFacetRefinement(facetName, 'value1');
  helper.addFacetRefinement(facetName, 'value2');
  helper.addFacetRefinement(facetName, 'value3');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 3, 'Adding another refinement, should have two');
  helper.removeFacetRefinement(facetName, 'value2');
  t.ok(_.size(helper.state.facetsRefinements[facetName]) === 2, 'Adding same refinement as the first, should have two');
  t.deepEqual(helper.state.facetsRefinements[facetName], ['value1', 'value3'], 'should contain value1 and value3');

  t.end();
});

test('IsRefined should return true if the (facet, value ) is refined.', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1']
  });

  helper.addFacetRefinement('facet1', 'boom');

  t.equal(helper.hasRefinements('facet1', 'boom'), true, 'the facet + value is refined >> true');

  t.equal(helper.hasRefinements('facet1', 'booohh'), false, 'value not refined but is a facet');
  t.throws(_.bind(helper.hasRefinements, helper, 'notAFacet', 'maoooh'), 'should throw as it is not a facet');
  t.throws(_.bind(helper.hasRefinements, helper, null, null), 'not valid values');

  t.end();
});

test('isRefined(facet)/hasRefinements should return true if the facet is refined.', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1']
  });

  t.equal(helper.hasRefinements('facet1'), false, 'the facet is not refined yet >> false');
  t.equal(helper.hasRefinements('facet1'), false, 'the facet is not refined yet >> false');

  helper.addFacetRefinement('facet1', 'boom');

  t.equal(helper.hasRefinements('facet1'), true, 'the facet is refined >> true');
  t.equal(helper.hasRefinements('facet1'), true, 'the facet is refined >> true');

  t.throws(_.bind(helper.hasRefinements, helper, 'notAFacet'), 'not a facet');
  // in complete honesty we should be able to detect numeric facets but we can't
  // t.throws(helper.hasRefinements.bind(helper, 'notAFacet'), 'not a facet');
  t.throws(_.bind(helper.hasRefinements, null), 'not even valid values');
  t.throws(_.bind(helper.hasRefinements, null), 'not even valid values');

  t.end();
});

test('getRefinements should return all the refinements for a given facet', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2', 'sales']
  });

  helper.addFacetRefinement('facet1', 'val1')
    .addFacetRefinement('facet1', 'val2')
    .addFacetExclusion('facet1', 'val-1')
    .toggleFacetRefinement('facet1', 'val3');

  helper.addDisjunctiveFacetRefinement('facet2', 'val4')
    .addDisjunctiveFacetRefinement('facet2', 'val5')
    .toggleFacetRefinement('facet2', 'val6');

  helper.addNumericRefinement('sales', '>', '3')
    .addNumericRefinement('sales', '<', '9');

  t.deepEqual(helper.getRefinements('facet1'),
    [
      {value: 'val1', type: 'conjunctive'},
      {value: 'val2', type: 'conjunctive'},
      {value: 'val3', type: 'conjunctive'},
      {value: 'val-1', type: 'exclude'}
    ],
    '');

  t.deepEqual(helper.getRefinements('facet2'),
    [
      {value: 'val4', type: 'disjunctive'},
      {value: 'val5', type: 'disjunctive'},
      {value: 'val6', type: 'disjunctive'}
    ],
    '');

  t.deepEqual(helper.getRefinements('sales'),
    [
      {value: [3], operator: '>', type: 'numeric'},
      {value: [9], operator: '<', type: 'numeric'}
    ],
    '');

  t.end();
});

test('getRefinements should return an empty array if the facet has no refinement', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  t.deepEqual(helper.getRefinements('facet1'), [], '');
  t.deepEqual(helper.getRefinements('facet2'), [], '');

  t.end();
});

test('[Conjunctive] Facets should be resilient to user attempt to use numbers', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addFacetRefinement('facet1', 42);
  t.equal(helper.hasRefinements('facet1', 42), true, '[facet][number] should be refined');
  t.equal(helper.hasRefinements('facet1', '42'), true, '[facet][string] should be refined');

  var stateWithFacet1and42 = helper.state;

  helper.removeFacetRefinement('facet1', '42');
  t.equal(helper.hasRefinements('facet1', '42'), false, '[facet][string] should not be refined');

  helper.setState(stateWithFacet1and42);
  helper.removeFacetRefinement('facet1', 42);
  t.equal(helper.hasRefinements('facet1', 42), false, '[facet][number] should not be refined');

  t.end();
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addFacetExclusion('facet1', 42);
  t.equal(helper.isExcluded('facet1', 42), true, '[facet][number] should be refined');
  t.equal(helper.isExcluded('facet1', '42'), true, '[facet][string] should be refined');

  var stateWithFacet1Without42 = helper.state;

  helper.removeFacetExclusion('facet1', '42');
  t.equal(helper.isExcluded('facet1', '42'), false, '[facet][string] should not be refined');

  helper.setState(stateWithFacet1Without42);
  helper.removeFacetExclusion('facet1', 42);
  t.equal(helper.isExcluded('facet1', 42), false, '[facet][number] should not be refined');

  t.end();
});

test('[Disjunctive] Facets should be resilient to user attempt to use numbers', function(t) {
  var helper = algoliasearchHelper(emptyClient, null, {
    facets: ['facet1'],
    disjunctiveFacets: ['facet2']
  });

  helper.addDisjunctiveFacetRefinement('facet2', 42);
  t.equal(helper.hasRefinements('facet2', 42), true, '[facet][number] should be refined');
  t.equal(helper.hasRefinements('facet2', '42'), true, '[facet][string] should be refined');

  var stateWithFacet2and42 = helper.state;

  helper.removeDisjunctiveFacetRefinement('facet2', '42');
  t.equal(helper.hasRefinements('facet2', '42'), false, '[facet][string] should not be refined');
  helper.setState(stateWithFacet2and42);

  helper.removeDisjunctiveFacetRefinement('facet2', 42);
  t.equal(helper.hasRefinements('facet2', 42), false, '[facet][number] should not be refined');

  t.end();
});
