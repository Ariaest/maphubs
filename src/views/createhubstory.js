var React = require('react');
var HubNav = require('../components/Hub/HubNav');
var HubBanner = require('../components/Hub/HubBanner');
var StoryEditor = require('../components/Story/StoryEditor');
var Notification = require('../components/Notification');
var Message = require('../components/message');
var Confirmation = require('../components/confirmation');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../stores/HubStore');
var HubActions = require('../actions/HubActions');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var CreateHubStory = React.createClass({

  mixins:[StateMixin.connect(HubStore, {initWithProps: ['hub']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hub: React.PropTypes.object.isRequired,
    myMaps: React.PropTypes.array,
    popularMaps: React.PropTypes.array,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      hub: {}
    };
  },

  getInitialState() {
    HubActions.loadHub(this.props.hub);
    return {

    };
  },

  render() {
    return (
      <div>
        <HubNav hubid={this.props.hub.hub_id}/>
        <main>
          <div className="row no-margin">
            <HubBanner editing={false} subPage={true} hubid={this.props.hub.hub_id}/>
          </div>
          <div className="row no-margin">
            <StoryEditor storyType="hub"
              myMaps={this.props.myMaps}
              popularMaps={this.props.popularMaps}
              hubid={this.props.hub.hub_id}/>
          </div>
        </main>
        <Notification />
        <Message />
        <Confirmation />
      </div>
    );
  }
});

module.exports = CreateHubStory;