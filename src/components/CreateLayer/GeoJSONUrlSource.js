// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import { Row, message, notification } from 'antd'
import TextInput from '../forms/textInput'
import LayerActions from '../../actions/LayerActions'
import Radio from '../forms/radio'
import LayerStore from '../../stores/layer-store'
import MapHubsComponent from '../MapHubsComponent'

import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'

type Props = {
  onSubmit: Function
}

type State = {
  canSubmit: boolean,
  selectedSource?: string
} & LocaleStoreState & LayerStoreState

export default class GeoJSONUrlSource extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    canSubmit: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
    addValidationRule('isHttps', (values, value) => {
      if (value) {
        return value.startsWith('https://')
      } else {
        return false
      }
    })
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

  submit = (model: Object) => {
    const {t} = this
    const _this = this

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'GeoJSON',
      external_layer_config: {
        type: 'geojson',
        id: model.id,
        data_type: model.data_type,
        data: model.geojsonUrl
      }
    }, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.success(t('Layer Saved'), 1, () => {
          // reset style to load correct source
          LayerActions.resetStyle()
          // tell the map that the data is initialized
          LayerActions.tileServiceInitialized()
          _this.props.onSubmit()
        })
      }
    })
  }

  sourceChange = (value: string) => {
    this.setState({selectedSource: value})
  }

  render () {
    const {t} = this
    const dataTypeOptions = [
      {value: 'point', label: t('Point')},
      {value: 'line', label: t('Line')},
      {value: 'polygon', label: t('Polygon')}
    ]

    return (
      <Row style={{marginBottom: '20px'}}>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>

          <div>
            <p>{t('GeoJSON URL')}</p>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='geojsonUrl' label={t('GeoJSON URL')}
                icon='info' validations='maxLength:500,isHttps'
                validationErrors={{
                  maxLength: t('Must be 500 characters or less.'),
                  isHttps: t('SSL required for external links, URLs must start with https://')
                }} length={500}
                dataPosition='top' dataTooltip={t('Vector Tile URL for example:') + 'http://myserver/tiles/{z}/{x}/{y}.pbf'}
                required
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <TextInput
                name='id' label={t('ID Property (Optional)')} icon='info'
                dataPosition='top' dataTooltip={t('Some features require idenify a unique identifier that can be used to select features')}
                required
              />
            </Row>
            <Row style={{marginBottom: '20px'}}>
              <Radio
                name='data_type' label=''
                defaultValue='point'
                options={dataTypeOptions}
                className='col s10'
              />
            </Row>
          </div>
          <div className='right'>
            <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
