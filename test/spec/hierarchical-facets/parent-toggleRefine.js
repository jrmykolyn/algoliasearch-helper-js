'use strict';

var test = require('tape');

test('hierarchical facets: toggleFacetRefinement behavior', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleFacetRefinement-appId';
  var apiKey = 'hierarchical-toggleFacetRefinement-apiKey';
  var indexName = 'hierarchical-toggleFacetRefinement-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  client.search = sinon.stub().returns(new Promise(function() {}));

  // select `Flying dog`
  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');

  // unselect `beers`
  helper.toggleFacetRefinement('categories', 'beers');

  // select `beers`
  helper.toggleFacetRefinement('categories', 'beers');
  // we should be on `beers`

  helper.setQuery('a').search();

  var call = client.search.getCall(0);
  var queries = call.args[0];
  var hitsQuery = queries[0];

  t.deepEqual(
    hitsQuery.params.facets,
    ['categories.lvl0', 'categories.lvl1'],
    'first query (hits) has `categories.lvl0, categories.lvl1` as facets'
  );
  t.deepEqual(
    hitsQuery.params.facetFilters,
    [['categories.lvl0:beers']],
    'first query (hits) has our `categories.lvl0` refinement facet filter'
  );
  t.end();
});

test('hierarchical facets: toggleFacetRefinement behavior when root level', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleFacetRefinement-appId';
  var apiKey = 'hierarchical-toggleFacetRefinement-apiKey';
  var indexName = 'hierarchical-toggleFacetRefinement-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  client.search = sinon.stub().returns(new Promise(function() {}));

  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');
  helper.toggleFacetRefinement('categories', 'beers');
  // we should be on ``

  helper.setQuery('a').search();

  var call = client.search.getCall(0);
  var queries = call.args[0];
  var hitsQuery = queries[0];

  t.deepEqual(
    hitsQuery.params.facets,
    ['categories.lvl0'],
    'first query (hits) has `categories.lvl0, categories.lvl1` as facets'
  );
  t.equal(
    hitsQuery.params.facetFilters,
    undefined,
    'first query (hits) has our `categories.lvl0` refinement facet filter'
  );
  t.end();
});

test('hierarchical facets: toggleFacetRefinement behavior when different root level', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');

  var algoliasearchHelper = require('../../../');

  var appId = 'hierarchical-toggleFacetRefinement-appId';
  var apiKey = 'hierarchical-toggleFacetRefinement-apiKey';
  var indexName = 'hierarchical-toggleFacetRefinement-indexName';

  var client = algoliasearch(appId, apiKey);
  var helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [{
      name: 'categories',
      attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2', 'categories.lvl3']
    }]
  });

  client.search = sinon.stub().returns(new Promise(function() {}));

  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');
  helper.toggleFacetRefinement('categories', 'fruits');
  // we should be on `fruits`

  helper.setQuery('a').search();

  var call = client.search.getCall(0);
  var queries = call.args[0];
  var hitsQuery = queries[0];

  t.deepEqual(
    hitsQuery.params.facets,
    ['categories.lvl0', 'categories.lvl1'],
    'first query (hits) has `categories.lvl0, categories.lvl1` as facets'
  );
  t.deepEqual(
    hitsQuery.params.facetFilters,
    [['categories.lvl0:fruits']],
    'first query (hits) has our `categories.lvl0` refinement facet filter'
  );
  t.end();
});
