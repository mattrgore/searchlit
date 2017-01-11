'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const { respond } = require('../utils');
const Excerpt = mongoose.model('Excerpt');

/**
 * List items tagged with a tag
 */

exports.index = async(function* (req, res) {
  const criteria = { tags: req.params.tag };
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const limit = 30;
  const options = {
    limit: limit,
    page: page,
    criteria: criteria
  };

  const excerpts = yield Excerpt.list(options);
  const count = yield Excerpt.count(criteria);

  respond(res, 'excerpts/index', {
    title: 'Excerpts tagged ' + req.params.tag,
    excerpts: excerpts,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});
