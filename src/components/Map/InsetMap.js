//@flow
import React from 'react';
var debug = require('../../services/debug')('map');
var $ = require('jquery');
import _centroid from '@turf/centroid';
import MapToolButton from './MapToolButton'; 

var mapboxgl = {};

if (typeof window !== 'undefined') {
    mapboxgl = require("mapbox-gl/dist/mapbox-gl.js");
}

type Props = {
  id: string,
  bottom:  string,
  attributionControl: boolean,
  collapsed: boolean
}

type State = {
  collapsed: boolean,
  insetGeoJSONData: Object,
  insetGeoJSONCentroidData: Object
}


export default class InsetMap extends React.Component<void, Props, State> {


  insetMap: Object
  insetMapActive: boolean

  props: Props

  static defaultProps = {
    id: 'map',
    bottom: '30px',
    attributionControl: false,
    collapsed: false
  }

  state: State = {
    collapsed: false,
    insetGeoJSONData: null,
    insetGeoJSONCentroidData: null
  }

  constructor(props: Object){
    super(props);
    this.state = {
      collapsed: props.collapsed
    };
  }

  componentDidMount() {   
    if(this.refs.insetMap){
      $(this.refs.insetMap).show();
    }
  }

  componentDidUpdate(){
    if(this.insetMap){
      if(!this.state.collapsed){
        $(this.refs.insetMapArrow).show();
      }
      if(!this.insetMapActive){
         $(this.refs.insetMap).addClass('z-depth-1');
         // border: '0.5px solid rgba(222,222,222,50)'
         $(this.refs.insetMap).css('border', '0.5px solid rgba(222,222,222,50)');
         this.insetMapActive = true;
      }
    }
  }

  createInsetMap = (center: any, bounds: Object, baseMap: string) => {
      var _this = this;
      var insetMap =  new mapboxgl.Map({
        container: this.props.id  + '_inset',
        style: baseMap,
        zoom: 0,
        maxZoom: 1.8,
        interactive: false,
        center,
        attributionControl: this.props.attributionControl
      });

      insetMap.on('style.load', () => {

        //create geojson from bounds
        var geoJSON = _this.getGeoJSONFromBounds(bounds);
        geoJSON.features[0].properties = {'v': 1};
        var geoJSONCentroid = _centroid(geoJSON);
        geoJSONCentroid.properties = {'v': 1};
        insetMap.addSource("inset-bounds", {"type": "geojson", data:geoJSON});
        insetMap.addSource("inset-centroid", {"type": "geojson", data:geoJSONCentroid});
        insetMap.addLayer({
            'id': 'bounds',
            'type': 'line',
            'source': 'inset-bounds',
            'paint': {
                'line-color': 'rgb(244, 118, 144)',
                'line-opacity': 0.75,
                'line-width': 5
            }
        });

        insetMap.addLayer({
            'id': 'center',
            'type': 'circle',
            'source': 'inset-centroid',
            'paint': {
                'circle-color': 'rgb(244, 118, 144)',
                'circle-opacity': 0.75
            }
        });

        if(_this.showInsetAsPoint()){
          insetMap.setFilter('center', ['==', 'v', 1]);
          insetMap.setFilter('bounds', ['==', 'v', 2]);
        } else {
          insetMap.setFilter('center', ['==', 'v', 2]);
          insetMap.setFilter('bounds', ['==', 'v', 1]);
        }

      });
      _this.insetMap = insetMap;
      return insetMap;
  }

  reloadInset = (baseMapUrl: string) => {
    if(this.insetMap){
      this.insetMap.setStyle(baseMapUrl);
    } 
  }

  sync = (map: Object) => {
    if(this.insetMap){
      this.updateInsetGeomFromBounds(map);
    }
  }

  toggleCollapsed = () => {
    if(this.state.collapsed){
      this.setState({collapsed: false});
    }else{
      this.setState({collapsed: true});
      $(this.refs.insetMap).show();
    }
  }

  getInsetMap = () => {
    return this.insetMap;
  }

    getGeoJSONFromBounds = (bounds: Object) => {
    var v1 = bounds.getNorthWest().toArray();
    var v2 = bounds.getNorthEast().toArray();
    var v3 = bounds.getSouthEast().toArray();
    var v4 = bounds.getSouthWest().toArray();
    var v5 = v1;
    return {
      type: 'FeatureCollection',
      features: [{
          type: 'Feature',
          properties: {name: 'bounds'},
          geometry: {
              type: "Polygon",
              coordinates: [
                [ v1,v2,v3,v4,v5 ]
              ]
            }
      }]
    };
  }

  showInsetAsPoint = (zoom: any) => {
    if(zoom && zoom > 9){
      return true;
    }
    return false;
  }

   updateInsetGeomFromBounds = (map: Object) => {
     var bounds = map.getBounds();
     var zoom = map.getZoom();
     var center = map.getCenter();
     if(this.insetMap){
      var insetGeoJSONData = this.insetMap.getSource("inset-bounds");
      var insetGeoJSONCentroidData = this.insetMap.getSource("inset-centroid");
      if(insetGeoJSONData || insetGeoJSONCentroidData){
        try{
          var geoJSONBounds = this.getGeoJSONFromBounds(bounds);
          geoJSONBounds.features[0].properties = {'v': 1};
          insetGeoJSONData.setData(geoJSONBounds);
          var geoJSONCentroid = _centroid(geoJSONBounds);
          geoJSONCentroid.properties = {'v': 1};
          insetGeoJSONCentroidData.setData(geoJSONCentroid);
          this.setState({insetGeoJSONData, insetGeoJSONCentroidData});
          
          if(zoom < 2.3){
            this.insetMap.setFilter('center', ['==', 'v', 2]);
            this.insetMap.setFilter('bounds', ['==', 'v', 2]);       
            this.insetMap.jumpTo({center}, {maxZoom: 1.5, padding: 10, animate: false});
          }else if(this.showInsetAsPoint(zoom)){
            this.insetMap.setFilter('center', ['==', 'v', 1]);
            this.insetMap.setFilter('bounds', ['==', 'v', 2]);
            this.insetMap.fitBounds([[bounds.getWest(), bounds.getSouth()],[ bounds.getEast(), bounds.getNorth()]], {maxZoom: 1.5, padding: 10, animate: false});
          } else {
            this.insetMap.setFilter('center', ['==', 'v', 2]);
            this.insetMap.setFilter('bounds', ['==', 'v', 1]);
            this.insetMap.fitBounds([[bounds.getWest(), bounds.getSouth()],[ bounds.getEast(), bounds.getNorth()]], {maxZoom: 1.5, padding: 10, animate: false});
          }
     
        }catch(err){
            debug(err);
        }
      }
   }
  }

  render(){
    if(this.state.collapsed){
      return (
         <div style={{
            position: 'absolute', bottom: this.props.bottom, left: '5px',
            minHeight: '100px', maxHeight: '145px', minWidth: '100px', maxWidth: '145px',
            height: '25vw', width: '25vw'
            }}>
            
            <div id={this.props.id + '_inset'} ref="insetMap"
              style={{             
                display: 'none'
              }}>
              <MapToolButton onClick={this.toggleCollapsed} 
              color="#212121"
              top="auto" right="auto" bottom="5px" left="5px" icon="near_me"  />
              </div>
          </div>
      );
    }else{
     
      return (
        <div style={{
            position: 'absolute', bottom: this.props.bottom, left: '5px',
            minHeight: '100px', maxHeight: '145px', minWidth: '100px', maxWidth: '145px',
            height: '25vw', width: '25vw'
            }}>
            <div id={this.props.id + '_inset'} ref="insetMap" className="map"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'none',
               zIndex: 1
              }}></div>
               <i  className="material-icons"
               ref="insetMapArrow"
               onClick={this.toggleCollapsed}
            style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    height:'30px',
                    display: 'none',
                    lineHeight: '30px',
                    width: '30px',
                    color: '#717171',                  
                    cursor: 'pointer',
                    textAlign: 'center',
                    zIndex: 2,
                    transform: 'rotate(45deg)', 
                    fontSize:'18px'}}          
            >arrow_downward</i>
          </div>
      );
    }
  }
}