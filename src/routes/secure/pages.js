var csrfProtection = require('csurf')({cookie: false});
var login = require('connect-ensure-login');
var Admin = require('../../models/admin');
var Page = require('../../models/page');
var nextError = require('../../services/error-response').nextError;
var apiError = require('../../services/error-response').apiError;
var apiDataError = require('../../services/error-response').apiDataError;

module.exports = function(app) {

  app.get('/page/edit/:id', csrfProtection, login.ensureLoggedIn(), function(req, res, next) {

    var user_id = req.session.user.id;
    var page_id = req.params.id.toLowerCase();

    Admin.checkAdmin(user_id).then(function(isAdmin){
      if(isAdmin){
        return Page.getPageConfig(page_id).then(function(pageConfig){
          res.render('pageedit', {
            title: req.__('Edit Page') + ' - ' + MAPHUBS_CONFIG.productName,
            props: {page_id, pageConfig}, req});
          });
        }else{
          res.redirect('/unauthorized');
        }
    }).catch(nextError(next));
  });

  app.post('/api/page/save', csrfProtection, function(req, res) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send("Unauthorized, user not logged in");
      return;
    }
    var user_id = req.session.user.id;
    var data = req.body;
    if (data && data.page_id && data.pageConfig) {
      Admin.checkAdmin(user_id).then(function(isAdmin){
        if(isAdmin){
          Page.savePageConfig(data.page_id, data.pageConfig)
            .then(function(result) {
              if (result && result == 1) {
                res.send({
                  success: true
                });
              } else {
                res.send({
                  success: false,
                  error: "Failed to Save Page"
                });
              }
            }).catch(apiError(res, 200));
        }else{
          res.status(401).send();
        }
      });
    } else {
      apiDataError(res);
    }
  });

};