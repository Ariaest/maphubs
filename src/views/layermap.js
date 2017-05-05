//@flow
import React from 'react';
var $ = require('jquery');
import Header from '../components/header';
import Map from '../components/Map/Map';
import MiniLegend from '../components/Map/MiniLegend';
import _debounce from 'lodash.debounce';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import fireResizeEvent from '../services/fire-resize-event';

export default class LayerMap extends MapHubsComponent {

  props: {
    layer: Object,
    locale: string,
    _csrf: string,
    headerConfig: Object
  }

  state = {
    width: 1024,
    height: 600
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  componentWillMount(){
    super.componentWillMount();
    var _this = this;
    if (typeof window === 'undefined') return; //only run this on the client

    function getSize(){
      // Get the dimensions of the viewport
      var width = Math.floor($(window).width());
      var height = $(window).height();
      //var height = Math.floor(width * 0.75); //4:3 aspect ratio
      //var height = Math.floor((width * 9)/16); //16:9 aspect ratio
      return {width, height};
    }

    var size = getSize();
    this.setState({
      width: size.width,
      height: size.height
    });

    $(window).resize(function(){
      var debounced = _debounce(() => {
        var size = getSize();
        _this.setState({
          width: size.width,
          height: size.height
        });
      }, 2500).bind(this);
      debounced();
    });
  }

  componentDidUpdate(){
    fireResizeEvent();
  }

	render() {

    var legend = '', bottomLegend = '';
    if(this.state.width < 600){
      bottomLegend = (
        <MiniLegend style={{
            width: '100%'
          }}
          title={this.props.layer.name}
          hideInactive={false} showLayersButton={false}
            layers={[this.props.layer]}/>
        );
    } else {
      legend = (
        <MiniLegend style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            minWidth: '275px',
            width: '25%'
          }}
            title={this.props.layer.name}
            hideInactive={false} showLayersButton={false}
            layers={[this.props.layer]}/>
      );
    }

		return (
      <div>
      <Header {...this.props.headerConfig}/>
      <main style={{margin: 0}}>
        <nav className="white hide-on-med-and-up"  style={{height: '0px', position: 'relative'}}>
        <a href="#" ref="mapLayersPanel"
          data-activates="user-map-layers"
          style={{position: 'absolute',
            top: '10px',
            left: '10px',
            height:'30px',

            lineHeight: '30px',
            textAlign: 'center',
            width: '30px'}}
          className="button-collapse">
          <i className="material-icons z-depth-1"
            style={{height:'30px',
                    lineHeight: '30px',
                    width: '30px',
                    color: MAPHUBS_CONFIG.primaryColor,
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    fontSize:'25px'}}
            >info</i>
        </a>
        <div className="side-nav" id="user-map-layers">
          {bottomLegend}

        </div>

      </nav>
        <div className="row">
        <div className="col s12 no-padding">
          <Map className="map-absolute map-with-header width-full"
            navPosition="top-right"
            glStyle={this.props.layer.style}
            fitBounds={this.props.layer.preview_position.bbox}
            title={this.props.layer.name}>

            {legend}
            <div className="addthis_sharing_toolbox" style={{position: 'absolute', bottom: '0px', left: '155px', zIndex:'1'}}></div>
          </Map>
        </div>
       </div>
     </main>
      </div>

		);
	}
}