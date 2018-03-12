// @flow
import React from 'react'
import Formsy from 'formsy-react'
import FormField from './FormField'
import MapHubsComponent from '../MapHubsComponent'
const Locales = require('../../services/locales')

type Props = {|
  presets: Array<Object>,
  values?: Object,
  showSubmit: boolean,
  onSubmit?: Function,
  onValid?: Function,
  onInValid?: Function,
  onChange?: Function,
  submitText?: string,
  style?: Object
|}

type DefaultProps = {
  showSubmit: boolean
}

type State = {
  canSubmit: boolean,
  submitText: string
}

export default class DataCollectionForm extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    showSubmit: true
  }

  state: State

  constructor (props: Props) {
    super(props)
    let submitText = ''
    if (this.props.submitText) {
      submitText = this.props.submitText
    } else if (this.state && this.state.locale) {
      submitText = Locales.getLocaleString(this.state.locale, 'Submit')
    } else {
      submitText = 'Submit'
    }
    this.state = {
      canSubmit: false,
      submitText
    }
  }

  onSubmit = (model: Object) => {
    if (this.props.onSubmit) this.props.onSubmit(model)
  }

  onValid = () => {
    this.setState({canSubmit: true})
    if (this.props.onValid) this.props.onValid()
  }

  onInValid = () => {
    this.setState({canSubmit: false})
    if (this.props.onInValid) this.props.onInValid()
  }

  onChange = (model: Object) => {
    if (this.props.onChange) this.props.onChange(model)
  }

  render () {
    const {style, showSubmit, presets, values} = this.props
    let submit = ''
    if (showSubmit) {
      submit = (
        <div className='right'>
          <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{this.state.submitText}</button>
        </div>
      )
    }

    return (
      <div style={style}>
        <Formsy
          onValidSubmit={this.onSubmit}
          onChange={this.onChange}
          onValid={this.onValid} onInvalid={this.onInValid}>
          {
            presets.map((preset) => {
              let value
              if (values && values[preset.tag]) {
                value = values[preset.tag]
              }
              if (preset.tag !== 'photo_url') {
                return (
                  <FormField key={preset.tag} preset={preset} value={value} />
                )
              }
            })
          }
          {submit}
        </Formsy>
      </div>
    )
  }
}
