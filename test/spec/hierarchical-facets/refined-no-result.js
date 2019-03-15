'use strict';

var test = require('tape');

test('hierarchical facets: simple usage', function(t) {
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

  helper.toggleFacetRefinement('categories', 'beers > IPA > Flying dog');

  var algoliaResponse = {
    'results': [{
      'query': 'badquery',
      'index': indexName,
      'hits': [],
      'nbHits': 0,
      'page': 0,
      'nbPages': 0,
      'hitsPerPage': 6,
      'facets': {}
    }, {
      'query': 'badquery',
      'index': indexName,
      'hits': [],
      'nbHits': 0,
      'page': 0,
      'nbPages': 0,
      'hitsPerPage': 1,
      'facets': {
        'categories.lvl0': {'beers': 20, 'fruits': 5, 'sales': 20}
      }
    }, {
      'query': 'badquery',
      'index': indexName,
      'hits': [],
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

  helper.setQuery('badquery').search();

  helper.once('result', function(content) {
    t.deepEqual(content.hierarchicalFacets, [{name: 'categories', count: null, isRefined: true, path: null, data: null}], 'Good facets values');
    t.end();
  });
});
