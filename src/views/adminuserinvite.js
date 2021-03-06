// @flow
import React from 'react'
import Formsy from 'formsy-react'
import TextInput from '../components/forms/textInput'
import Header from '../components/header'
import Footer from '../components/footer'
import { Modal, Tooltip, message, notification, Row, Col, Button, Typography, Table } from 'antd'
import { MailFilled } from '@ant-design/icons'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import WarningIcon from '@material-ui/icons/Warning'
import DoneIcon from '@material-ui/icons/Done'
import EmailIcon from '@material-ui/icons/Email'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import LinkIcon from '@material-ui/icons/Link'
import DeleteIcon from '@material-ui/icons/Delete'

import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
const { confirm } = Modal
const checkClientError = require('../services/client-error-response').checkClientError

const { Title } = Typography

type User = {
  email: string,
  key: string,
  used: boolean,
  invite_email: string,
  display_name?: string,
  id?: number,
  admin?: boolean
}

type Props = {
  locale: string,
  _csrf: string,
  members: Array<User>,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  canSubmit: boolean,
  members: Array<User>
} & LocaleStoreState

export default class AdminUserInvite extends MapHubsComponent<Props, State> {
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
    this.state = {
      members: props.members,
      canSubmit: false
    }
  }

  clipboard: any

  componentDidMount () {
    this.clipboard = require('clipboard-polyfill').default
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  onSubmit = (user: User) => {
    const {t} = this
    const _this = this
    confirm({
      title: t('Confirm Invite'),
      content: t(`Are you sure you want to invite ${user.email}?`),
      okText: t('Send Invite'),
      okType: 'primary',
      onOk () {
        _this.submitInvite(user)
      }
    })
  }

  copyInviteLink = (user: User) => {
    const baseUrl = urlUtil.getBaseUrl()
    const url = `${baseUrl}/signup/invite/${user.key}`
    this.clipboard.writeText(url)
    message.info(this.t('Copied'))
  }

  submitInvite = (user: User) => {
    const {t} = this
    const _this = this
    const email = user.email || user.invite_email
    const closeMessage = message.loading(t('Sending'), 0)
    request.post('/admin/invite/send')
      .type('json').accept('json')
      .send({email, _csrf: this.state._csrf})
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          const key = res.body.key
          closeMessage()
          if (err) {
            notification.error({
              message: t('Failed to Send Invite'),
              description: err,
              duration: 0
            })
          } else {
            message.info(t('Invite Sent'), 3, () => {
              _this.state.members.push({email: user.email, invite_email: user.email, key, used: false})
              _this.setState({members: _this.state.members})
            })
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  resendInvite = (user: User) => {
    const {t} = this
    const key = user.key
    const closeMessage = message.loading(t('Sending'), 0)
    request.post('/admin/invite/resend')
      .type('json').accept('json')
      .send({key, _csrf: this.state._csrf})
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          closeMessage()
          if (err) {
            notification.error({
              message: t('Failed to Resend Invite'),
              description: err,
              duration: 0
            })
          } else {
            message.info(t('Resent Invite'), 3)
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  handleResendInvite = (user: User) => {
    const {t} = this
    const {resendInvite} = this
    confirm({
      title: t('Confirm Resend Email'),
      content: t(`Are you sure you want to resend the invite email for ${user.invite_email}?`),
      okText: t('Send Invite'),
      okType: 'primary',
      onOk () {
        resendInvite(user)
      }
    })
  }

  handleDeauthorize = (user: User) => {
    const {t} = this
    const {submitDeauthorize} = this
    confirm({
      title: t('Confirm Deauthorize'),
      content: t(`Are you sure you want to deauthorize access for ${user.email}?`),
      okText: t('Deauthorize'),
      okType: 'danger',
      onOk () {
        submitDeauthorize(user)
      }
    })
  }

  submitDeauthorize = (user: User) => {
    const {t} = this
    const _this = this
    const closeMessage = message.loading(t('Sending'), 0)
    request.post('/admin/invite/deauthorize')
      .type('json').accept('json')
      .send({
        email: user.email,
        key: user.key,
        _csrf: this.state._csrf
      })
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          closeMessage()
          if (err) {
            notification.error({
              message: t('Failed to Deauthorize'),
              description: err,
              duration: 0
            })
          } else {
            message.info(t('User Removed'), 3)
            const members = []
            _this.state.members.forEach((member) => {
              if (member.key !== user.key) {
                members.push(member)
              }
            })
            _this.setState({members})
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  render () {
    const {t} = this
    const _this = this

    const columns = [
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          let status = 'Disabled'
          let icon = <WarningIcon style={{color: 'red'}} />
          if (record.key) {
            if (record.used) {
              status = 'Active'
              icon = <DoneIcon style={{color: 'green'}} />
            } else {
              status = 'Invite Sent'
              icon = <EmailIcon style={{color: 'orange'}} />
            }
          }

          if (record.admin) {
            status = 'Admin'
            icon = <SupervisorAccountIcon style={{color: 'purple'}} />
          }
          return (
            <span>
              <Tooltip title={status} placement='bottom'>
                {icon}
              </Tooltip>
            </span>
          )
        }
      },
      {
        title: 'Username',
        dataIndex: 'display_name',
        key: 'username'
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (text, record) => (
          <span>
            {record.email || record.invite_email}
          </span>
        )
      },
      {
        title: 'Invite Key',
        key: 'key',
        dataIndex: 'key'
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => {
          let status = 'Disabled'
          if (record.key) {
            if (record.used) {
              status = 'Active'
            } else {
              status = 'Invite Sent'
            }
          }
          if (record.admin) {
            status = 'Admin'
          }
          return (
            <span>
              {(status !== 'Disabled' && status !== 'Admin') &&
                <>
                  <Tooltip title={t('Resend Invite')} placement='bottom'>
                    <a onClick={() => {
                      _this.handleResendInvite(record)
                    }}
                    >
                      <EmailIcon style={{cursor: 'pointer'}} />
                    </a>
                  </Tooltip>
                  <Tooltip title={t('Copy Invite Link')} placement='bottom'>
                    <a onClick={() => {
                      _this.copyInviteLink(record)
                    }}
                    >
                      <LinkIcon style={{cursor: 'pointer'}} />
                    </a>
                  </Tooltip>
                  <Tooltip title={t('Remove User')} placement='bottom'>
                    <a onClick={() => {
                      _this.handleDeauthorize(record)
                    }}
                    >
                      <DeleteIcon style={{cursor: 'pointer'}} />
                    </a>
                  </Tooltip>
                </>}
            </span>
          )
        }
      }
    ]

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container'>
          <Title>{t('Manage Users')}</Title>
          <Row style={{marginBottom: '20px'}} justify='center' align='middle'>
            <Formsy
              onValidSubmit={this.onSubmit} onValid={this.enableButton} onInvalid={this.disableButton}
              style={{width: '100%', maxWidth: '800px'}}
            >
              <Row justify='center' align='top' style={{height: '80px'}}>
                <Col sm={24} md={16}>
                  <TextInput
                    name='email' label={t('Email to Invite')}
                    icon={<MailFilled />}
                    validations={{isEmail: true}} validationErrors={{
                      isEmail: t('Not a valid email address.')
                    }} length={50}
                    required
                    t={t}
                  />
                </Col>
                <Col sm={24} md={8} style={{padding: '0px 20px'}}>
                  <Button style={{marginTop: '20px'}} type='primary' htmlType='submit' disabled={!this.state.canSubmit}>{t('Send Invite')}</Button>
                </Col>
              </Row>
            </Formsy>
          </Row>
          <Row>
            <Table columns={columns} dataSource={this.state.members} />
          </Row>
          <Row>
            <p>
              {t('To delete a user please contact support@maphubs.com. Completely deleting a user may require deleting their content or reassigning their content to another user.')}
            </p>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
