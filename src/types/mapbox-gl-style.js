//@flow
import type {GeoJSONObject} from 'geojson-flow';

export type GLSource = {
  type: 'vector' | 'raster' | 'geojson' | 'image' | 'video' | 'canvas',
  url?: string,
  tiles?: Array<string>,
  minzoom?: number,
  maxzoom?: number,
   metadata?: Object, //not actually part of the spec
  //type: raster 
  tileSize?: number, 
  //type: geojson
  data?: GeoJSONObject,
  buffer?: number,
  tolerance?: number,
  cluster?: boolean,
  clusterRadius?: number,
  clusterMaxZoom?: number,
  //types: image, video, canvas
  coordinates?: Array<number>,
  //types: video
  urls?: Array<string>,
  //type: canvas
  animate?: boolean,
  canvas?: string
}

export type GLFilter = Array<any>

export type GLLayerLayout = {
  visibility?: 'visible' | 'none'
}

export type GLLayerPaint = {

}

declare class GLSources { 
  [source: string]: GLSource 
}

export type GLLayer = {
 id: string,
 type: 'fill' | 'line' | 'symbol' | 'circle' | 'fill-extrusion' | 'raster' | 'background',
 metadata?: Object,
 ref?: string,
 source?: string,
 minzoom?: number,
 maxzoom?: number,
 filter?: GLFilter,
 layout?: GLLayerLayout,
 paint?: GLLayerPaint
}

export type GLLight = {
  anchor?: 'map' | 'viewport',
  position?: Array<number>,
  color?: string,
  intensity?: number
}

export type GLTransition = {
  duration?: number,
  delay?: number
}

export type GLStyle = {
  version: number,
  name?: string,
  metadata?: Object,
  center?: Array<number>,
  zoom?: number,
  bearing?: number,
  pitch?: number,
  light?: GLLight,
  sources: GLSources,
  sprite?: string,
  glyphs?: string,
  transition?: GLTransition,
  layers: Array<GLLayer>
}