// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../components/CardCarousel/CardCollection'
import CardSearch from '../components/CardCarousel/CardSearch'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingAddButton from '../components/FloatingAddButton'
import cardUtil from '../services/card-util'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const { Title } = Typography

type Props = {
  featuredMaps: Array<Object>,
  recentMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean
}

export default class Maps extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const {t} = this
    const featuredCards = this.props.featuredMaps.map(cardUtil.getMapCard)
    const recentCards = this.props.recentMaps.map(cardUtil.getMapCard)
    const popularCards = this.props.popularMaps.map(cardUtil.getMapCard)

    return (
      <ErrorBoundary>
        <Header activePage='maps' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row>
              <Title level={2}>{t('Maps')}</Title>
            </Row>
          </div>
          <CardSearch cardType='map' t={t} />
          {(!MAPHUBS_CONFIG.mapHubsPro && featuredCards && featuredCards.length > 0) &&
            <CardCollection title={t('Featured')} cards={featuredCards} viewAllLink='/maps/all' />}
          <CardCollection title={t('Popular')} cards={popularCards} viewAllLink='/maps/all' />
          <CardCollection title={t('Recent')} cards={recentCards} viewAllLink='/maps/all' />
          <FloatingAddButton
            onClick={() => {
              window.location = '/map/new'
            }}
            tooltip={t('Create New Map')}
          />
          <Row justify='center' style={{textAlign: 'center'}}>
            <Button type='primary' href='/maps/all'>{t('View All Maps')}</Button>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
