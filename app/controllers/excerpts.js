'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { respond, respondOrRedirect } = require('../utils');
const Excerpt = mongoose.model('Excerpt');
const assign = Object.assign;

/**
 * Load
 */

exports.load = async(function* (req, res, next, id) {
  try {
    req.excerpt = yield Excerpt.load(id);
    if (!req.excerpt) return next(new Error('Excerpt not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * List
 */

exports.index = async(function* (req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = 30;
  const options = {
    limit: limit,
    page: page
  };

  if (_id) options.criteria = { _id };

  const excerpts = yield Excerpt.list(options);
  const count = yield Excerpt.count();

  respond(res, 'excerpts/index', {
    title: 'Excerpts',
    excerpts: excerpts,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});

/**
 * New excerpt
 */

exports.new = function (req, res){
  res.render('excerpts/new', {
    title: 'New Excerpt',
    excerpt: new Excerpt()
  });
};

/**
 * Create an excerpt
 * Upload an image
 */

exports.create = async(function* (req, res) {
  const excerpt = new Excerpt(only(req.body, 'title author body tags'));
  excerpt.user = req.user;
  try {
    yield excerpt.uploadAndSave(req.file);
    respondOrRedirect({ req, res }, `/excerpts/${excerpt._id}`, excerpt, {
      type: 'success',
      text: 'Successfully created excerpt!'
    });
  } catch (err) {
    respond(res, 'excerpts/new', {
      title: excerpt.title || 'New Excerpt',
      errors: [err.toString()],
      excerpt
    }, 422);
  }
});

/**
 * Edit an excerpt
 */

exports.edit = function (req, res) {
  res.render('excerpts/edit', {
    title: 'Edit ' + req.excerpt.title,
    excerpt: req.excerpt
  });
};

/**
 * Update excerpt
 */

exports.update = async(function* (req, res){
  const excerpt = req.excerpt;
  assign(excerpt, only(req.body, 'title body tags'));
  try {
    yield excerpt.uploadAndSave(req.file);
    respondOrRedirect({ res }, `/excerpts/${excerpt._id}`, excerpt);
  } catch (err) {
    respond(res, 'excerpts/edit', {
      title: 'Edit ' + excerpt.title,
      errors: [err.toString()],
      excerpt
    }, 422);
  }
});

/**
 * Show
 */

exports.show = function (req, res){
  respond(res, 'excerpts/show', {
    title: req.excerpt.title,
    excerpt: req.excerpt
  });
};

/**
 * Delete an excerpt
 */

exports.destroy = async(function* (req, res) {
  yield req.excerpt.remove();
  respondOrRedirect({ req, res }, '/excerpts', {}, {
    type: 'info',
    text: 'Deleted successfully'
  });
});
