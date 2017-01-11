'use strict';

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  if (req.method == 'GET') req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/users/' + req.profile.id);
    }
    next();
  }
};

/*
 *  Excerpt authorization routing middleware
 */

exports.excerpt = {
  hasAuthorization: function (req, res, next) {
    if (req.excerpt.user.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/excerpts/' + req.excerpt.id);
    }
    next();
  }
};

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function (req, res, next) {
    // if the current user is comment owner or excerpt owner
    // give them authority to delete
    if (req.user.id === req.comment.user.id || req.user.id === req.excerpt.user.id) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      res.redirect('/excerpts/' + req.excerpt.id);
    }
  }
};
