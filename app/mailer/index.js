'use strict';

/**
 * Module dependencies.
 */

const Notifier = require('notifier');
const jade = require('jade');
const config = require('../../config');

/**
 * Process the templates using swig - refer to notifier#processTemplate method
 *
 * @param {String} tplPath
 * @param {Object} locals
 * @return {String}
 * @api public
 */

Notifier.prototype.processTemplate = function (tplPath, locals) {
  locals.filename = tplPath;
  return jade.renderFile(tplPath, locals);
};

/**
 * Expose
 */

module.exports = {

  /**
   * Comment notification
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

  comment: function (options, cb) {
    const excerpt = options.excerpt;
    const submitter = excerpt.user;
    const user = options.currentUser;
    const notifier = new Notifier(config.notifier);

    const obj = {
      to: submitter.email,
      from: 'your@product.com',
      subject: user.name + ' added a comment on your excerpt ' + excerpt.title,
      alert: user.name + ' says: "' + options.comment,
      locals: {
        to: submitter.name,
        from: user.name,
        body: options.comment,
        excerpt: excerpt.name
      }
    };

    // for apple push notifications
    /*notifier.use({
      APN: true
      parseChannels: ['USER_' + submitter._id.toString()]
    })*/

    try {
      notifier.send('comment', obj, cb);
    } catch (err) {
      console.log(err);
    }
  }
};
