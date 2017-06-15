//@flow
import React from 'react';
import Radio from '../forms/radio';
import Formsy from 'formsy-react';
import BaseMapStore from '../../stores/map/BaseMapStore';
import MapHubsComponent from '../MapHubsComponent';
import type {BaseMapOption, BaseMapStoreState} from '../../stores/map/BaseMapStore';

type Props = {
  onChange: Function
}

type State = BaseMapStoreState;

export default class BaseMapSelection extends MapHubsComponent<void, Props, State> {

  props: Props

  constructor(props: Props){
    super(props);
    this.stores.push(BaseMapStore);
  }

  onChange = (val: string) => {
    this.props.onChange(val);
  }

  render(){

    var radioOptions:Array<{value: string, label: string}> = [];
    if(this.state.baseMapOptions && Array.isArray(this.state.baseMapOptions)){ 
      this.state.baseMapOptions.forEach((baseMapOption: BaseMapOption) =>{
        radioOptions.push({value: baseMapOption.value, label: baseMapOption.label[this.state.locale]});
      }); 
    }

    return (
      <div style={{width: '100%', marginRight: '10px', backgroundColor: 'white', textAlign: 'left'}}>
          <Formsy.Form>
          <h6>{this.__('Choose a Base Map')}</h6>
          <Radio name="baseMap" label="" className="base-map-selection"
              defaultValue={this.state.baseMap}
              options={radioOptions} onChange={this.onChange}
            />
          </Formsy.Form>
        </div>
    ); 
  }
}