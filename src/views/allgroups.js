// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import SearchBox from '../components/SearchBox'
import CardCollection from '../components/CardCarousel/CardCollection'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import request from 'superagent'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import GroupList from '../components/Lists/GroupList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
import type {Group} from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/groups')
const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  groups: Array<Group>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  searchResults: Array<Object>,
  searchActive: boolean,
  showList: boolean
}

export default class AllGroups extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state = {
    searchResults: [],
    searchActive: false,
    showList: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  componentDidMount () {
    M.FloatingActionButton.init(this.refs.addButton, {})
  }

  handleSearch = (input: string) => {
    const {t} = this
    const _this = this
    debug.log('searching for: ' + input)
    request.get(urlUtil.getBaseUrl() + '/api/groups/search?q=' + input)
      .type('json').accept('json')
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          if (err) {
            MessageActions.showMessage({title: t('Error'), message: err})
          } else {
            if (res.body.groups && res.body.groups.length > 0) {
              _this.setState({searchActive: true, searchResults: res.body.groups})
              NotificationActions.showNotification({message: res.body.groups.length + ' ' + t('Results'), position: 'bottomleft'})
            } else {
            // show error message
              NotificationActions.showNotification({message: t('No Results Found'), dismissAfter: 5000, position: 'bottomleft'})
            }
          }
        },
        (cb) => {
          cb()
        }
        )
      })
  }

  resetSearch = () => {
    this.setState({searchActive: false, searchResults: []})
  }

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
    let searchResults = ''

    if (this.state.searchActive) {
      if (this.state.searchResults.length > 0) {
        const searchCards = this.state.searchResults.map(cardUtil.getGroupCard)
        searchResults = (
          <CardCollection title={t('Search Results')} cards={searchCards} t={t} />
        )
      } else {
        searchResults = (
          <div className='row'>
            <div className='col s12'>
              <h5>{t('Search Results')}</h5>
              <div className='divider' />
              <p><b>{t('No Results Found')}</b></p>
            </div>
          </div>
        )
      }
    }

    let groups = ''
    if (this.state.showList) {
      groups = (
        <div className='container'>
          <GroupList showTitle={false} groups={this.props.groups} t={t} />
        </div>
      )
    } else {
      const cards = this.props.groups.map(cardUtil.getGroupCard)
      groups = (
        <CardGrid cards={cards} t={t} />
      )
    }

    return (
      <ErrorBoundary>
        <Header activePage='groups' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className='row' style={{marginBottom: '0px'}}>
              <div className='col l8 m7 s12'>
                <h4 className='no-margin'>{t('Groups')}</h4>
                <p style={{fontSize: '16px', margin: 0}}>{t('Create a group for your organization or browse the content of existing groups.')}</p>
              </div>
              <div className='col l3 m4 s12 right' style={{paddingRight: '15px'}}>
                <SearchBox label={t('Search Groups')} suggestionUrl='/api/groups/search/suggestions' onSearch={this.handleSearch} onReset={this.resetSearch} />
              </div>
            </div>
          </div>
          <div>

            {searchResults}

            <div className='row'>
              <div className='left-align' style={{marginLeft: '15px', marginTop: '25px'}}>
                <Formsy>
                  <Toggle name='mode' onChange={this.onModeChange} labelOff={t('Grid')} labelOn={t('List')} checked={this.state.showList} />
                </Formsy>
              </div>
              <div className='row'>
                {groups}
              </div>
            </div>

            <div ref='addButton' className='fixed-action-btn action-button-bottom-right'>
              <FloatingButton
                href='/creategroup' icon='add'
                tooltip={t('Create New Group')} tooltipPosition='top' />
            </div>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
