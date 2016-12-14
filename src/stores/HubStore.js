var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/HubActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;
var findIndex = require('lodash.findindex');
var forEachRight = require('lodash.foreachright');
var $ = require('jquery');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return  {
      hub: {},
      layers: [],
      logoImage: null,
      bannerImage: null,
      logoImageInfo: null,
      bannerImageInfo: null,
      hasLogoImage: false,
      hasBannerImage: false,
      unsavedChanges: false,
      saving: false
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners

 loadHub(hub){
   debug('load hub');
   this.setState({hub});
 },

 loadLayers(layers){
   debug('load layers');
   this.setState({layers});
 },

 createHub(hub_id, name, published, cb){
   debug('create hub');
   var _this = this;

   request.post('/api/hub/create')
   .type('json').accept('json')
   .send({
     hub_id,
     name,
     published
   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       var hub = {
         hub_id,
         name,
         published
       };
       _this.setState({hub});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 },
 saveHub(cb){
   debug('save hub');
   var _this = this;

   var baseUrl = '/hub/' + this.state.hub.hub_id;

   this.setState({saving: true});
   request.post(baseUrl + '/api/save')
   .type('json').accept('json')
   .send({
     hub_id: this.state.hub.hub_id,
     name: this.state.hub.name,
     description: this.state.hub.description,
     tagline: this.state.hub.tagline,
     resources: this.state.hub.resources,
     about: this.state.hub.about,
     published: this.state.hub.published,
     style: this.state.hub.map_style,
     basemap: this.state.hub.basemap,
     position: this.state.hub.map_position,
     layers:  this.state.layers,
     logoImage: this.state.logoImage,
     logoImageInfo: this.state.logoImageInfo,
     bannerImage: this.state.bannerImage,
    bannerImageInfo: this.state.bannerImageInfo

   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.setState({saving: false, unsavedChanges: false});
       cb(null);
     });
   });
 },
 deleteHub(cb){
   var _this = this;
   debug('delete hub');
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/delete')
   .type('json').accept('json')
   .send({hub_id: this.state.hub.hub_id})
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.setState({hub: {}});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 },

 setMap(layers, style, position, basemap){
   var hub = this.state.hub;
   hub.map_style = style;
   hub.map_position = position;
   hub.basemap = basemap;
   this.setState({hub, layers, unsavedChanges: true});
   this.trigger(this.state);
 },

 saveMap(cb){
   debug('save hub map');
   var _this = this;
   this.setState({saving: true});
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/savemap')
   .type('json').accept('json')
   .send({
     style: this.state.hub.map_style,
     basemap: this.state.hub.basemap,
     layers:  this.state.layers,
     position: this.state.hub.map_position
   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       var hub = _this.state.hub;
       _this.setState({hub, saving: false});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 },

 setHubLogoImage(data, info){
    var hub = this.state.hub;
    hub.hasLogoImage = true;
   this.setState({logoImage: data, logoImageInfo: info, unsavedChanges: true, hub});
 },

 saveHubLogoImage(cb){
   debug('save hub logo image');
   var _this = this;
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/setphoto')
   .type('json').accept('json')
   .send({hub_id: this.state.hub.hub_id, image: this.state.logoImage, info: this.state.logoImageInfo, type: 'logo'})
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       var hub = _this.state.hub;
       hub.hasLogoImage = true;
       _this.setState({hub});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 },

 setHubBannerImage(data, info){
   var hub = this.state.hub;
    hub.hasBannerImage = true;
   this.setState({bannerImage: data, bannerImageInfo: info, unsavedChanges: true, hub});
 },

 saveHubBannerImage(cb){
   debug('set hub banner image');
   var _this = this;
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/setphoto')
   .type('json').accept('json')
   .send({hub_id: this.state.hub.hub_id, image: this.state.bannerImage, info: this.state.bannerImageInfo, type: 'banner'})
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       var hub = _this.state.hub;
       hub.hasBannerImage = true;
       _this.setState({hub});
       _this.trigger(_this.state);
       cb(null);
     });
   });
 },

 setTitle(title){
   var hub = this.state.hub;
   hub.name = title;
   this.setState({hub, unsavedChanges: true});
 },

  publish(cb){
   var hub = this.state.hub;
   hub.published = true;
   this.setState({hub, unsavedChanges: true});
   this.trigger(this.state);
   this.saveHub(cb);
 },

 setTagline(tagline){
   var hub = this.state.hub;
   hub.tagline = tagline;
   this.setState({hub, unsavedChanges: true});
 },

 setDescription(description){
   var hub = this.state.hub;
   hub.description = description;
   this.setState({hub, unsavedChanges: true});
 },

 setResources(resources){
   var hub = this.state.hub;
   hub.resources = resources;
   this.setState({hub, unsavedChanges: true});
 },

 setAbout(about){
   var hub = this.state.hub;
   hub.about = about;
   this.setState({hub, unsavedChanges: true});

 },

 addLayer(layer_id, active, cb){
   debug('add layer');
   var _this = this;
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/addlayer')
   .type('json').accept('json')
   .send({hub_id: this.state.hub.hub_id, layer_id, active})
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.reloadLayers(cb);
     });
   });
 },
 removeLayer(layer_id, cb){
   debug('remove layer');
   var _this = this;
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.post(baseUrl + '/api/removelayer')
   .type('json').accept('json')
   .send({hub_id: this.state.hub.hub_id, layer_id})
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.reloadLayers(cb);
     });
   });
 },
 reloadLayers(cb){
   debug('reload layers');
   var _this = this;
   var baseUrl = '/hub/' + this.state.hub.hub_id;

   request.get(baseUrl + '/api/hub/' + this.state.hub.hub_id + '/layers')
   .type('json').accept('json')
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.loadLayers(res.body.layers);
       cb(null);
     });
   });
 },

 //map functions
 toggleVisibility(layer_id, cb){
   var layers = this.state.layers;
   var index = findIndex(layers, {layer_id});

   if(layers[index].active){
     layers[index].active = false;
   }else {
     layers[index].active = true;
   }

   this.updateMap(layers);
   cb();
 },

 moveUp(layer_id){
   var index = findIndex(this.state.layers, {layer_id});
   if(index === 0) return;
   var layers = this.move(this.state.layers, index, index-1);
   this.updateMap(layers);
 },

 moveDown(layer_id){
   var index = findIndex(this.state.layers, {layer_id});
   if(index === this.state.layers.length -1) return;
   var layers = this.move(this.state.layers, index, index+1);
   this.updateMap(layers);
 },

 move(array, fromIndex, toIndex) {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
    return array;
  },

 updateMap(layers){
   var style = this.buildMapStyle(layers);
  var hub = this.state.hub;
  hub.map_style = style;
   this.setState({layers, hub});
   this.trigger(this.state);
 },


 buildMapStyle(layers){
   var mapStyle = {
     sources: {},
     layers: []
   };

   //reverse the order for the styles, since the map draws them in the order recieved
   forEachRight(layers, function(layer){
     if(!layer.map_style) layer.map_style = layer.style;
     var style = layer.map_style;
     if(style && style.sources && style.layers){
       //check for active flag and update visibility in style
       if(layer.active != undefined && layer.active == false){
         //hide style layers for this layer
         style.layers.forEach(function(styleLayer){
           styleLayer['layout'] = {
             "visibility": "none"
           };
         });
       } else {
         //reset all the style layers to visible
         style.layers.forEach(function(styleLayer){
           styleLayer['layout'] = {
             "visibility": "visible"
           };
         });
       }
       //add source
       $.extend(mapStyle.sources, style.sources);
       //add layers
       mapStyle.layers = mapStyle.layers.concat(style.layers);
     } else {
       debug('Not added to map, incomplete style for layer: ' + layer.layer_id);
     }

   });
   return mapStyle;
 }

});
