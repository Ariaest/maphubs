//@flow
import React from 'react';
import {Modal, ModalContent} from '../Modal/Modal.js';
import MapHubsComponent from '../MapHubsComponent';
import Toggle from '../forms/toggle';
var urlUtil = require('../../services/url-util');
var clipboard;
if(process.env.APP_ENV === 'browser'){
 clipboard = require('clipboard-js');
}
import Formsy from 'formsy-react';
import type {LocaleStoreState} from '../../stores/LocaleStore';


type Props = {|
  share_id: string,
  onChange: Function
|}

type State = {
  sharing: boolean
} & LocaleStoreState

export default class EditAttributesModal extends MapHubsComponent<void, Props, State> {

  constructor(props: Props){
    super(props);

    this.state = {
      sharing: this.props.share_id ? true : false
    };
    
  }

  componentWillReceiveProps(nextProps: Props){
    if(!this.props.share_id && nextProps.share_id){
      this.setState({sharing: true});
    }
  }

  /**
   * Show the Modal
   */
  show = () => {
    this.refs.modal.show();
  }

   close = () => {
    this.refs.modal.close();
  }

  onChange = (model: Object) => {
     this.props.onChange(model.public);
  }

  
  render(){
    let shareLink = '', shareMessage = '';
    if(this.props.share_id && this.state.sharing){
       let shareUrl = urlUtil.getBaseUrl() + `/map/share/${this.props.share_id}`;
      shareLink = (
        <div>
        <p style={{fontSize: '16px'}}><b>{this.__('Share Link: ')}</b>
          &nbsp;-&nbsp;
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a>
          <i className="material-icons layer-info-tooltip omh-accent-text" style={{cursor: 'pointer'}} data-delay="50" onClick={function(){clipboard.copy(shareUrl);}} data-position="left" data-tooltip={this.__('Copy to Clipboard')}>launch</i>
        </p>
        <p>{this.__('Warning: disabling sharing will invalidate the current link. Sharing again will generate a new unique link.')}</p>
        </div>
      );

      shareMessage = (
        <p style={{fontSize: '16px'}}><b>{this.__('Sharing')}</b>&nbsp;-&nbsp;<span>{this.__('Anyone can use this link to view the map.')}</span></p>
      );
    }else{
      shareMessage = (
        <p style={{fontSize: '16px'}}><b>{this.__('Protected')}</b>&nbsp;-&nbsp;<span>{this.__('Only authorized users can see this map.')}</span></p>
      );
    }
   
    return (
      <Modal ref="modal" dismissible={false} fixedFooter={true}>
        <ModalContent style={{padding: '10px', margin: 0, height: 'calc(100% - 60px)', overflow: 'hidden'}}>
          <div className="row no-margin" style={{height: '35px'}}>
            <a className="omh-color" style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.close}>
              <i className="material-icons selected-feature-close" style={{fontSize: '35px'}}>close</i>
            </a>
          </div>
          <div className="row no-margin" style={{height: 'calc(100% - 35px)', overflow: 'auto', padding: '10px'}}>
            
            <div className="row">
              {shareMessage}
            </div>
            <div className="row">
              <Formsy.Form ref="form" onChange={this.onChange}>
                <Toggle name="public" labelOff={this.__('Off')} labelOn={this.__('Share')} checked={this.state.sharing} className="col s12"/>
              </Formsy.Form>
            </div>
            <div className="row">
              {shareLink}
            </div>
          </div>
        </ModalContent>
      </Modal>
    );
  }

}