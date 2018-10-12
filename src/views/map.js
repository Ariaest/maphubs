// @flow
import React from 'react'
import Header from '../components/header'
import MapMaker from '../components/MapMaker/MapMaker'
import slugify from 'slugify'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import '../services/locales'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import type {Layer} from '../types/layer'
import type {Group} from '../stores/GroupStore'

type Props = {
  popularLayers: Array<Layer>,
  myLayers: Array<Layer>,
  groups: Array<Group>,
  editLayer: Object,
  headerConfig: Object,
  mapConfig: Object,
  locale: string,
  _csrf: string,
  user: Object
}

type DefaultProps = {
  popularLayers: Array<Object>,
  myLayers: Array<Object>
}

export default class Map extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps: DefaultProps = {
    popularLayers: [],
    myLayers: []
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      this.BaseMapState = new BaseMapContainer({baseMapOptions: props.mapConfig.baseMapOptions})
    }
  }

  mapCreated = (mapId: number, title: LocalizedString) => {
    window.location = '/map/view/' + mapId + '/' + slugify(this._o_(title))
  }

  render () {
    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <Header activePage='map' {...this.props.headerConfig} />
          <main style={{height: 'calc(100% - 52px)', overflow: 'hidden'}}>
            <MapMaker
              mapConfig={this.props.mapConfig}
              onCreate={this.mapCreated}
              popularLayers={this.props.popularLayers}
              myLayers={this.props.myLayers}
              editLayer={this.props.editLayer}
              groups={this.props.groups}
            />
          </main>
        </Provider>
      </ErrorBoundary>
    )
  }
}
