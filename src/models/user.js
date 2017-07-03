// @flow
var knex = require('../connection');
var Promise = require('bluebird');
var log = require('../services/log');
var debug = require('../services/debug')('models/user');
var Email = require('../services/email-util.js');
var uuid = require('uuid').v4;
var urlUtil = require('../services/url-util');
var local = require('../local');

module.exports = {

  /**
   * Get data about the current user
   * @param id
   * @returns {Promise.<T>}
   */
  getUser(id: number, secure: boolean=false) {
    debug.log('getting for id: ' + id);
      var user = {};

      return Promise.all([
          knex('users').where('id', id),
          knex('user_roles').where('user_id', id),
          knex('messages').where('to_user_id', id),
          knex('user_blocks').where('user_id', id),
          knex('user_preferences').where('user_id', id)
        ])
        .then((resultArr) => {
          user = resultArr[0][0];
          user.roles = resultArr[1];
          user.messages = resultArr[2];
          user.blocks = resultArr[3];
          user.preferences = resultArr[4];

          if(!secure){
            //exclude sensitive info
            delete user.creation_ip;
            delete user.new_email;
            delete user.pass_crypt;
            delete user.pass_reset;
          }

          return user;
        });
    },

    getUserByName(display_name: string, secure: boolean=false) {

      debug.log('getting user with name: ' + display_name);

      display_name = display_name.toLowerCase();

      return knex('users')
      .where(knex.raw(`lower(display_name)`), '=', display_name)
      .then((result) => {
        if(result && result.length === 1){
          var user = result[0];

          if(!secure){
            //exclude sensitive info
            delete user.creation_ip;
            delete user.new_email;
            delete user.pass_crypt;
            delete user.pass_reset;
          }

          return user;
        }else {
          log.warn("user not found: "+ display_name);
          return null;
        }
      });
    },

    getUserByEmail(email: string, secure: boolean=false){

      debug.log('getting user with email: ' + email);

      email = email.toLowerCase();

      return knex('users')
      .where(knex.raw(`lower(email)`), '=', email)
      .then((result) => {
        if(result && result.length === 1){
          var user = result[0];

          if(!secure){
            //exclude sensitive info
            delete user.creation_ip;
            delete user.new_email;
            delete user.pass_crypt;
            delete user.pass_reset;
          }

          return user;
        }else if(result && result.length > 1) {
          let msg = "found multiple users with email: "+ email;
          log.error(msg);
          throw new Error(msg);
        } else {
          let msg = "email not found: "+ email;
          log.error(msg);
          return null;
        }
      });
    },

    getUserWithResetKey(key: string) {

      debug.log('getting user with password reset key');

      return knex('users').where({pass_reset: key})
      .then((result) => {
        if(result && result.length === 1){
          var user = result[0];

          //exclude sensitive info
          delete user.creation_ip;
          delete user.new_email;
          delete user.pass_crypt;

          return user;
        } else {
          return null;
        }
        });
    },

    getUserWithConfirmationKey(key: string) {

      debug.log('getting user with email confirmation key');

      return knex('users').where({new_email: key})
      .then((result) => {
        if(result && result.length === 1){
          var user = result[0];

          //exclude sensitive info
          delete user.creation_ip;
          delete user.pass_crypt;
          delete user.pass_reset;

          return user;
        } else {
          return null;
        }
        });
    },

    createUser(email: string, name: string, display_name: string, creation_ip: string){

      email = email.toLowerCase();
      display_name = display_name.toLowerCase();

      return knex('users').returning('id')
        .insert({
            email,
            display_name,
            name,
            pass_crypt: '1234', //note, this is immediately replaced, value here is just due to not null constraint
            creation_ip,
            creation_time: knex.raw('now()')
        }).then((user_id) => {
          return parseInt(user_id);
        });
    },

    sendNewUserAdminEmail(user_id: number){

      return this.getUser(user_id)
      .then((user) => {

        var text = 'New User: ' + user.display_name
        + ' \n Name: ' + user.name
        + ' \n Email: ' + user.email;
        var html = '<b>New User:</b> ' + user.display_name
        + '<br /> <b>Name:</b> ' + user.name
        + '<br /> <b>Email:</b> ' + user.email;

        return Email.send({
            from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
            to: MAPHUBS_CONFIG.productName + ' <' + local.adminEmail + '>',
            subject: '[NEW USER SIGNUP] ' + user.display_name,
            text,
            html
          });
        });
    },

    sendConfirmationEmail(user_id: number, __: Function){
      //create confirm link
      debug.log('sending email confirmation for id: ' + user_id);
      var _this = this;
      var new_email = uuid();
      return knex('users').update({new_email}).where({id: user_id})
      .then(() => {
        return _this.getUser(user_id)
          .then((user) => {
          var baseUrl = urlUtil.getBaseUrl();
          var url = baseUrl + '/user/emailconfirmation/' + new_email;

            var text =  user.name + ',\n' +
              __('Welcome to') + ' ' + MAPHUBS_CONFIG.productName + '!\n\n' +
              __('Please go to this link in your browser to confirm your email:')  + url + '\n\n' +
              __('Thank you for registering.') + '\n\n' +
              __('UserName: ') + user.display_name  + '\n' +
              __('Name: ') + user.name  + '\n' +
              __('Email: ') + user.email  + '\n\n' +
              __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.');


            var html = user.name + ',' +
              '<br />' + __('Welcome to') + ' ' + MAPHUBS_CONFIG.productName + '!' +
              '<br />' +
              '<br />' + __('Please go to this link in your browser to confirm your email:') + url +
              '<br />' +
              '<br />' +
              __('Thank you for registering.') +
              '<br />' +
              __('UserName: ') + user.display_name  + '<br />' +
              __('Name: ') + user.name  + '<br />' +
              __('Email: ') + user.email  + '<br /><br />' +
              __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.');

            return Email.send({
                from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
                to: user.email,
                subject: __('Email Confirmation') + ' - ' + MAPHUBS_CONFIG.productName,
                text,
                html
              });
            });
        });
    },

    checkEmailConfirmation(key: string){
      debug.log('checking email confirmation');
      return this.getUserWithConfirmationKey(key)
      .then((user) => {
        if(user === null) return false;
        //key matches
        log.info("Email Confirmed for user: " + user.display_name);
        return knex('users').update({new_email: '', email_valid: true}).where({id: user.id})
        .then(() => {
          return true;
        });
      });
    },

    checkUserNameAvailable(username: string) {
      return this.getUserByName(username)
        .then((result) => {
          if (result === null) return true;
          return false;
        }).catch(() => {
          //user not found, therefore name is avaliable
          return true;
        });
    },

    getSearchSuggestions(input: string) {
      input = input.toLowerCase();
      return knex.select('display_name', 'id').table('users')
      .where(knex.raw(`lower(display_name)`), 'like', '%' + input + '%');
    }

};
