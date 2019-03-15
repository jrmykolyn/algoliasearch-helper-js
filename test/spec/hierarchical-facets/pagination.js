'use strict';

var test = require('tape');

test('hierarchical facets: pagination', function(t) {
  var algoliasearch = require('algoliasearch');
  var sinon = require('sinon');
  var isArray = require('lodash/isArray');

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

  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');

  var algoliaResponse = {
    'results': [{
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 3,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 20,
      'facets': {
        'categories.lvl0': {'beers': 3, 'sales': 3},
        'categories.lvl1': {'beers > IPA': 3, 'sales > IPA': 3},
        'categories.lvl2': {'beers > IPA > Flying dog': 3, 'sales > IPA > Flying dog': 3}
      }
    }, {
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': {'beers': 9},
        'categories.lvl1': {'beers > IPA': 9},
        'categories.lvl2': {
          'beers > IPA > Flying dog': 3,
          'sales > IPA > Flying dog': 3,
          'beers > IPA > Brewdog punk IPA': 6
        }
      }
    }, {
      'query': 'a',
      'index': indexName,
      'hits': [{'objectID': 'one'}],
      'nbHits': 1,
      'page': 0,
      'nbPages': 1,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': {'beers': 20, 'fruits': 5, 'sales': 20}
      }
    }]
  };

  client.search = sinon
    .stub()
    .resolves(algoliaResponse);

  helper.setQuery('');
  helper.setPage(1);
  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');
  helper.search();

  helper.once('result', function() {
    var call = client.search.getCall(0);
    var queries = call.args[0];
    var hitsQuery = queries[0];

    t.equal(hitsQuery.params.page, 0, 'Page is reset to 0');

    // we do not yet support multiple values for hierarchicalFacetsRefinements
    // but at some point we may want to open multiple leafs of a hierarchical menu
    // So we set this as an array so that we do not have to bump major to handle it
    t.ok(
      isArray(helper.state.hierarchicalFacetsRefinements.categories),
      'state.hierarchicalFacetsRefinements is an array'
    );
    t.end();
  });
});
