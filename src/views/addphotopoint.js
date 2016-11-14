var React = require('react');

var Header = require('../components/header');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Map = require('../components/Map/Map');
var DataCollectionForm = require('../components/DataCollection/DataCollectionForm');
var ImageCrop = require('../components/ImageCrop');
var AddPhotoPointStore = require('../stores/AddPhotoPointStore');
var Actions = require('../actions/AddPhotoPointActions');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');
var ConfirmationActions = require('../actions/ConfirmationActions');

import Progress from '../components/Progress';


var AddPhotoPoint = React.createClass({

  mixins:[StateMixin.connect(AddPhotoPointStore, {initWithProps: ['layer']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		layer: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string.isRequired
  },

  getInitialState(){
    return {
      saving: false
    };
  },

  componentDidMount(){
    var _this = this;
    window.onbeforeunload = function(){
      if(!_this.state.submitted){
        return _this.__('You have not saved your data, your work will be lost.');
      }
    };
  },

  showImageCrop(){
    this.refs.imagecrop.show();
  },

  resetPhoto(){
    Actions.resetPhoto();
    this.showImageCrop();
  },

  onCrop(data, info){
    var _this = this;
    Actions.setImage(data, info, function(err){
      if(err){
        MessageActions.showMessage({
          title: _this.__('Failed to Save Photo'),
          message: this.__('An error occurred while processing this photo. Please confirm that the photo has valid GPS location information. Error Message: ') + err
        });
      }else{
        NotificationActions.showNotification({message: _this.__('Photo Added')});
      }
    });
  },

  onSubmit(model){
    var _this = this;
    this.setState({saving: true});
    Actions.submit(model, function(err){
      _this.setState({saving: false});
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        ConfirmationActions.showConfirmation({
          title: _this.__('Photo Saved'),
          message: _this.__('Do you want to add another photo?'),
          postitiveButtonText:_this.__('Yes'),
          negativeButtonText: _this.__('No'),
          onPositiveResponse(){
            location.reload();
          },
          onNegativeResponse(){

            var featureName = 'unknown';
            var nameFields = ['name', 'Name', 'NAME', 'nom', 'Nom', 'NOM', 'nombre', 'Nombre', 'NOMBRE'];
            nameFields.forEach(function(name){
              if(featureName == 'unknown' && _this.state.geoJSON.features[0].properties[name]){
                featureName = _this.state.geoJSON.features[0].properties[name];
              }
            });
            var featurePageUrl = '/feature/' + _this.state.layer.layer_id + '/' + _this.state.osm_id + '/' + featureName;
            window.location = featurePageUrl;
          }
        });
      }
    });
  },

  render(){

    var dataReview = '', dataForm = '', addPhotoButton = '';
    if(this.state.geoJSON){
      //if we have a point show the preview map and data fields
      dataReview = (

        <div className="row">
          <div className="col m6 s12">
            <img style={{width: '100%', height:'auto'}} src={this.state.image} alt="uploaded photo"/>
          </div>
          <div className="col m6 s12">
            <div style={{width: '400px'}}>
              <Map ref="map" style={{width: '100%', height: '400px'}} showFeatureInfoEditButtons={false} showLogo={false} data={this.state.geoJSON} />
            </div>
          </div>
          <div className="row no-margin">
            <button className="btn" style={{marginLeft: '10px'}}
              onClick={this.resetPhoto}>{this.__('Replace Photo')}</button>
          </div>
        </div>
      );



      dataForm = (
        <DataCollectionForm presets={this.props.layer.presets} onSubmit={this.onSubmit} />
      );
    }else{
      addPhotoButton = (
        <div className="row no-margin">
          <p>{this.__('Upload a Photo with Location Information')}</p>
          <button className="btn" style={{marginLeft: '10px'}}
            onClick={this.showImageCrop}>{this.__('Add Photo')}</button>
        </div>
      );
    }

    return (
      <div>
        <Header />
        <main style={{height: 'calc(100% - 50px)', marginTop: 0}}>
          <div className="container">
            <div className="row center-align">
              <h5>{this.__('Add data to:') + ' ' + this.props.layer.name}</h5>
              {addPhotoButton}
            </div>
            {dataReview}
            <div className="row">
              {dataForm}
            </div>
          </div>
          <ImageCrop ref="imagecrop" aspectRatio={1} lockAspect={true} resize_max_width={1000} resize_max_height={1000} onCrop={this.onCrop} />
          <Progress id="saving" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
        </main>
      </div>
    );
  }
});

module.exports = AddPhotoPoint;