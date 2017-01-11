'use strict';

/**
 * Module dependencies.
 */

const { wrap: async } = require('co');
const { respondOrRedirect } = require('../utils');

/**
 * Load comment
 */

exports.load = function (req, res, next, id) {
  req.comment = req.excerpt.comments
    .find(comment => comment.id === id);
    
  if (!req.comment) return next(new Error('Comment not found'));
  next();
};

/**
 * Create comment
 */

exports.create = async(function* (req, res) {
  const excerpt = req.excerpt;
  yield excerpt.addComment(req.user, req.body);
  respondOrRedirect({ res }, `/excerpts/${excerpt._id}`, excerpt.comments[0]);
});

/**
 * Delete comment
 */

exports.destroy = async(function* (req, res) {
  yield req.excerpt.removeComment(req.params.commentId);
  req.flash('info', 'Removed comment');
  res.redirect('/excerpts/' + req.excerpt.id);
  respondOrRedirect({ req, res }, `/excerpts/${req.excerpt.id}`, {}, {
    type: 'info',
    text: 'Removed comment'
  });
});
