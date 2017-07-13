//@flow
var Layer = require('../../models/layer');
var login = require('connect-ensure-login');
var Group = require('../../models/group');

var apiError = require('../../services/error-response').apiError;
var nextError = require('../../services/error-response').nextError;
var apiDataError = require('../../services/error-response').apiDataError;
var notAllowedError = require('../../services/error-response').notAllowedError;

var request = require('superagent-bluebird-promise');

module.exports = function(app: any) {


  app.get('/createremotelayer', login.ensureLoggedIn(), (req, res, next) => {

    var user_id = req.session.user.maphubsUser.id;

    Group.getGroupsForUser(user_id)
    .then((result) => {
      return res.render('createremotelayer', {title: req.__('Remote Layer') + ' - ' + MAPHUBS_CONFIG.productName, props: {groups: result}, req});
    }).catch(nextError(next));

  });

  app.post('/api/layer/create/remote', (req, res) => {

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.maphubsUser.id;
    if(req.body.group_id && req.body.layer && req.body.host){
      Group.allowedToModify(req.body.group_id, user_id)
      .then((allowed) => {
        if(allowed){
          return Layer.createRemoteLayer(req.body.group_id, req.body.layer, req.body.host, user_id)
          .then((result) => {
            if(result){
              return res.send({success:true, layer_id: result[0]});
            }else {
              return res.send({success:false, error: "Failed to Create Layer"});
            }
          });
        }else{
          return notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    }else{
      apiDataError(res);
    }

  });

  app.post('/api/layer/refresh/remote', (req, res) => {

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }

    var user_id = req.session.user.maphubsUser.id;
    if(req.body.layer_id){
      Layer.allowedToModify(req.body.layer_id, user_id)
      .then((allowed) => {
        if(allowed){
          return Layer.getLayerByID(req.body.layer_id)
          .then((layer) => {
            if(layer.remote){
              var url;
              if(layer.remote_host === 'localhost'){
               url = 'http://';
             }else{
                url = 'https://';
             }
               url = url + layer.remote_host + '/api/layer/metadata/' + layer.remote_layer_id;
              return request.get(url)
              .then((response) => {
                return Layer.updateRemoteLayer(layer.layer_id, layer.owned_by_group_id, response.body.layer, layer.remote_host, user_id)
                .then((result) => {
                  if(result){
                    return res.send({success:true});
                  }else {
                    return res.send({success:false, error: "Failed to Update Layer"});
                  }
                });
              }).catch(apiError(res, 500));
            }else{
              return res.send({success:false, error: "Failed to Update Layer"});
            }
        });
        }else{
          return notAllowedError(res, 'layer');
        }
      }).catch(apiError(res, 500));
    }else{
      apiDataError(res);
    }

  });


};
