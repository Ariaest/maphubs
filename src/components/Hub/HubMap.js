// @flow
import React from 'react'
import InteractiveMap from '../Map/InteractiveMap'
import HubActions from '../../actions/HubActions'
import AddMapModal from '../Story/AddMapModal'
import MapHubsComponent from '../../components/MapHubsComponent'
import fireResizeEvent from '../../services/fire-resize-event'

type Props = {|
  hub: Object,
  editing: boolean,
  height: string,
  border: boolean,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  mapConfig: Object,
  map: Object,
  layers: Array<Object>
|}

export default class HubMap extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps = {
    editing: false,
    height: '300px',
    border: false,
    myMaps: [],
    popularMaps: []
  }

  componentDidUpdate () {
    fireResizeEvent()
  }

  onSetMap = (map: Object) => {
    HubActions.setMap(map)
  }

  showMapSelection = () => {
    this.refs.addmap.show()
  }

  onMapCancel = () => {
    this.refs.addmap.hide()
  }

  render () {
    const {t} = this
    // TODO: if map is set, show the map, otherwise show instruction to set a map

    let mapEditButton = ''
    let selectMap = ''
    if (this.props.editing) {
      selectMap = (
        <AddMapModal ref='addmap'
          onAdd={this.onSetMap} onClose={this.onMapCancel}
          myMaps={this.props.myMaps} popularMaps={this.props.popularMaps} />
      )
      if (this.props.map) {
        mapEditButton = (
          <a className='btn omh-color white-text' onClick={this.showMapSelection}
            style={{position: 'absolute', top: '5px', left: '45%'}}>
            {t('Change Map')}
          </a>
        )
      } else {
        mapEditButton = (
          <a className='btn omh-color white-text' onClick={this.showMapSelection}
            style={{position: 'absolute', top: '45%', left: '45%'}}>
            {t('Select a Map')}
          </a>
        )
      }
    }

    return (
      <div style={{width: '100%', height: this.props.height, overflow: 'hidden'}}>
        <div className='row no-margin' style={{height: '100%', position: 'relative'}}>

          <InteractiveMap {...this.props.map}
            mapConfig={this.props.mapConfig}
            height={this.props.height} showTitle={false}
            layers={this.props.layers} t={this.t}
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
          />

          {mapEditButton}

        </div>
        {selectMap}
      </div>
    )
  }
}
