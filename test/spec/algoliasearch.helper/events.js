'use strict';

var test = require('tape');
var sinon = require('sinon');
var algoliaSearchHelper = require('../../../index');

var fakeClient = {};

test('Change events should be emitted as soon as the state change, but search should be triggered (refactored)', function(t) {
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    disjunctiveFacets: ['city'],
    disjunctiveFacetsRefinements: {city: ['Paris']},
    facets: ['tower'],
    facetsRefinements: {tower: ['Empire State Building']},
    facetsExcludes: {tower: ['Empire State Building']},
    hierarchicalFacets: [],
    numericRefinements: {
      price: {'>': [300]}
    }
  });

  var changeEventCount = 0;

  helper.on('change', function() {
    changeEventCount++;
  });

  var stubbedSearch = sinon.stub(helper, '_search');

  helper.setQuery('a');
  t.equal(changeEventCount, 1, 'query - change');
  t.equal(stubbedSearch.callCount, 0, 'query - search');

  helper.clearRefinements();
  t.equal(changeEventCount, 2, 'clearRefinements - change');
  t.equal(stubbedSearch.callCount, 0, 'clearRefinements - search');

  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  t.equal(changeEventCount, 3, 'addDisjunctiveFacetRefinement - change');
  t.equal(stubbedSearch.callCount, 0, 'addDisjunctiveFacetRefinement - search');

  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  t.equal(changeEventCount, 4, 'removeDisjunctiveFacetRefinement - change');
  t.equal(stubbedSearch.callCount, 0, 'removeDisjunctiveFacetRefinement - search');

  helper.addFacetExclusion('tower', 'Empire State Building');
  t.equal(changeEventCount, 5, 'addFacetExclusion - change');
  t.equal(stubbedSearch.callCount, 0, 'addFacetExclusion - search');

  helper.removeFacetExclusion('tower', 'Empire State Building');
  t.equal(changeEventCount, 6, 'removeFacetExclusion - change');
  t.equal(stubbedSearch.callCount, 0, 'removeFacetExclusion - search');

  helper.addFacetRefinement('tower', 'Empire State Building');
  t.equal(changeEventCount, 7, 'addFacetRefinement - change');
  t.equal(stubbedSearch.callCount, 0, 'addFacetRefinement - search');

  helper.removeFacetRefinement('tower', 'Empire State Building');
  t.equal(changeEventCount, 8, 'removeFacetRefinement - change');
  t.equal(stubbedSearch.callCount, 0, 'removeFacetRefinement - search');

  helper.search();
  t.equal(changeEventCount, 8, "final search doesn't call the change");
  t.equal(stubbedSearch.callCount, 1, 'final search triggers the search');

  t.end();
});

test('Change events should only be emitted for meaningful changes', function(t) {
  var helper = algoliaSearchHelper(fakeClient, 'Index', {
    query: 'a',
    disjunctiveFacets: ['city'],
    disjunctiveFacetsRefinements: {city: ['Paris']},
    facets: ['tower'],
    facetsRefinements: {tower: ['Empire State Building']},
    facetsExcludes: {tower: ['Empire State Building']},
    hierarchicalFacets: [{
      name: 'hierarchicalFacet',
      attributes: ['lvl1', 'lvl2']
    }],
    numericRefinements: {
      price: {'>': [300]}
    }
  });

  var changeEventCount = 0;

  helper.on('change', function() {
    changeEventCount++;
  });

  var stubbedSearch = sinon.stub(helper, '_search');

  helper.setQuery('a');
  t.equal(changeEventCount, 0, 'search');
  t.equal(stubbedSearch.callCount, 0, 'search');

  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  t.equal(changeEventCount, 0, 'addDisjunctiveFacetRefinement');
  t.equal(stubbedSearch.callCount, 0, 'addDisjunctiveFacetRefinement');

  helper.addFacetExclusion('tower', 'Empire State Building');
  t.equal(changeEventCount, 0, 'addFacetExclusion');
  t.equal(stubbedSearch.callCount, 0, 'addFacetExclusion');

  helper.addFacetRefinement('tower', 'Empire State Building');
  t.equal(changeEventCount, 0, 'addFacetRefinement');
  t.equal(stubbedSearch.callCount, 0, 'addFacetRefinement');

  helper.addNumericRefinement('price', '>', 300);
  t.equal(changeEventCount, 0, 'addNumericRefinement');
  t.equal(stubbedSearch.callCount, 0, 'addNumericRefinement');

  // This is an actual change
  helper.clearRefinements();
  t.equal(changeEventCount, 1, 'clearRefinements');
  t.equal(stubbedSearch.callCount, 0, 'clearRefinements');

  helper.clearRefinements();
  t.equal(changeEventCount, 1, 'clearRefinements');
  t.equal(stubbedSearch.callCount, 0, 'clearRefinements');

  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  t.equal(changeEventCount, 1, 'removeDisjunctiveFacetRefinement');
  t.equal(stubbedSearch.callCount, 0, 'removeDisjunctiveFacetRefinement');

  helper.removeFacetExclusion('tower', 'Empire State Building');
  t.equal(changeEventCount, 1, 'removeFacetExclusion');
  t.equal(stubbedSearch.callCount, 0, 'removeFacetExclusion');

  helper.removeFacetRefinement('tower', 'Empire State Building');
  t.equal(changeEventCount, 1, 'removeFacetRefinement');
  t.equal(stubbedSearch.callCount, 0, 'removeFacetRefinement');

  helper.search();
  t.equal(changeEventCount, 1, "final search doesn't call the change");
  t.equal(stubbedSearch.callCount, 1, 'final search triggers the search');

  t.end();
});

test('search event should be emitted once when the search is triggered and before the request is sent', function(t) {
  var clientMock = {
    search: function() {
      return new Promise(function() {});
    }
  };
  var helper = algoliaSearchHelper(clientMock, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('search', function() {
    count++;
  });

  clientMock.search = function() {
    t.equal(
      count,
      1,
      'When the client search function is called the search' +
      ' event should have been sent exactly once.');

    return new Promise(function() {});
  };

  helper.setQuery('');
  t.equal(count, 0, 'search');

  helper.clearRefinements();
  t.equal(count, 0, 'clearRefinements');

  helper.addDisjunctiveFacetRefinement('city', 'Paris');
  t.equal(count, 0, 'addDisjunctiveFacetRefinement');

  helper.removeDisjunctiveFacetRefinement('city', 'Paris');
  t.equal(count, 0, 'removeDisjunctiveFacetRefinement');

  helper.addFacetExclusion('tower', 'Empire State Building');
  t.equal(count, 0, 'addFacetExclusion');

  helper.removeFacetExclusion('tower', 'Empire State Building');
  t.equal(count, 0, 'removeFacetExclusion');

  helper.addFacetRefinement('tower', 'Empire State Building');
  t.equal(count, 0, 'addFacetRefinement');

  helper.removeFacetRefinement('tower', 'Empire State Building');
  t.equal(count, 0, 'removeFacetRefinement');

  helper.search();
  t.equal(count, 1, 'final search does trigger the search event');

  t.end();
});

test('searchOnce event should be emitted once when the search is triggered using searchOnce and before the request is sent', function(t) {
  var clientMock = {};
  var helper = algoliaSearchHelper(clientMock, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('searchOnce', function() {
    count++;
  });

  clientMock.search = function() {
    t.equal(
      count,
      1,
      'When the client search function is called the searchOnce' +
      ' event should have been sent exactly once.');

    return new Promise(function() {});
  };

  t.equal(count, 0, 'before search');

  helper.searchOnce({}, function() {});
  t.equal(count, 1, 'final search does trigger the search event');

  t.end();
});

test('searchForFacetValues event should be emitted once when the search is triggered using' +
     ' searchForFacetValues and before the request is sent', function(t) {
  var clientMock = {};
  var helper = algoliaSearchHelper(clientMock, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower']
  });

  var count = 0;

  helper.on('searchForFacetValues', function() {
    count++;
  });

  clientMock.initIndex = function() {
    return {
      searchForFacetValues: function() {
        t.equal(
          count,
          1,
          'When the client search function is called the searchOnce' +
          ' event should have been sent exactly once.');

        return new Promise(function() {});
      }
    };
  };

  t.equal(count, 0, 'before search');

  helper.searchForFacetValues();
  t.equal(count, 1, 'final search does trigger the search event');

  t.end();
});
