// @flow
var knex = require('../connection');
var debug = require('../services/debug')('models/user');
var Email = require('../services/email-util.js');
var uuid = require('uuid').v4;
var urlUtil = require('../services/url-util');
var local = require('../local');


module.exports = {

  async sendInviteEmail(email: string, __: Function){
    //create confirm link
    debug.log('sending email invite to: ' + email);
    var key = uuid();
    await knex('omh.account_invites').insert({email, key});

    var baseUrl = urlUtil.getBaseUrl();
    var url = baseUrl + '/signup/invite/' + key;

    var text =
      __('You have been invited to') + ' ' + MAPHUBS_CONFIG.productName + '!\n\n' +
      __('Please go to this link in your browser to sign up:')  + url + '\n\n' +

      __('This invite is only valid for the email address:') + '\n' + email  + '\n\n' +
      __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.');


    var html =
      '<br />' + __('You have been invited to') + ' ' + MAPHUBS_CONFIG.productName + '!' +
      '<br />' +
      '<br />' + __('Please go to this link in your browser to sign up:') + url +
      '<br />' +
      '<br />' +
      __('This invite is only valid for the email address:') +
      '<br />' + email  + '<br /><br />' +
      __('If you need to contact us you are welcome to reply to this email, or use the help button on the website.');

    return Email.send({
        from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
        to: email,
        subject: __('Account Invite') + ' - ' + MAPHUBS_CONFIG.productName,
        text,
        html
      });
  },

  async checkInviteKey(key: string){
    debug.log('checking invite key');
    const result = await knex('omh.account_invites').select('email').where({key, used:false});

    if(result && result.length === 1){
      return true;
    }
    return null;
  },

  /**
   * Check if the provide email has been invited and confirmed by the user
   * @param {*} email 
   */
  async checkInviteConfirmed(email: string){
    const results = await knex('omh.account_invites').where({email, used: true});

    if(results && Array.isArray(results) && results.length >= 1){
      return true;
    }else{
      return false;
    }
  },

  async useInvite(key: string){
    debug.log('using invite key');
    await knex('omh.account_invites').update({used:true}).where({key});

    const result = await knex('omh.account_invites').select('email').where({key});
    if(result && result.length === 1){
      return result[0].email;
    }else{
      return null;
    }
  },

  async checkAdmin(user_id: number, trx: any){
    let db = trx ? trx : knex;
    const result = await db('omh.admins').select('user_id').where({user_id});

    if(result && result.length === 1){
      return true;
    }
    return false;
  }
};