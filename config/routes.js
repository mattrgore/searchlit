'use strict';

/*
 * Module dependencies.
 */

const users = require('../app/controllers/users');
const excerpts = require('../app/controllers/excerpts');
const comments = require('../app/controllers/comments');
const tags = require('../app/controllers/tags');
const auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

const excerptAuth = [auth.requiresLogin, auth.excerpt.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

const fail = {
  failureRedirect: '/login'
};

/**
 * Expose routes
 */

module.exports = function (app, passport) {
  const pauth = passport.authenticate.bind(passport);

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  app.post('/users/session',
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);
  app.get('/users/:userId', users.index);
  app.param('userId', users.load);

  // excerpt routes
  app.param('id', excerpts.load);
  app.get('/excerpts', excerpts.index);
  app.get('/excerpts/new', auth.requiresLogin, excerpts.new);
  app.post('/excerpts', auth.requiresLogin, excerpts.create);
  app.get('/excerpts/:id', excerpts.show);
  app.get('/excerpts/:id/edit', excerptAuth, excerpts.edit);
  app.put('/excerpts/:id', excerptAuth, excerpts.update);
  app.delete('/excerpts/:id', excerptAuth, excerpts.destroy);

  // home route
  app.get('/', excerpts.index);

  // comment routes
  app.param('commentId', comments.load);
  app.post('/excerpts/:id/comments', auth.requiresLogin, comments.create);
  app.get('/excerpts/:id/comments', auth.requiresLogin, comments.create);
  app.delete('/excerpts/:id/comments/:commentId', commentAuth, comments.destroy);

  // tag routes
  app.get('/tags/:tag', tags.index);


  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', { error: err.stack });
      return;
    }

    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).render('404', payload);
  });
};
