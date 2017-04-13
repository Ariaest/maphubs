// @flow
var React = require('react');
var Header = require('../components/header');
var Footer = require('../components/footer');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var StorySummary = require('../components/Story/StorySummary');

var PublicOnboardingLinks = require('../components/Home/PublicOnboardingLinks');
var InteractiveMap = require('../components/InteractiveMap');
var _shuffle = require('lodash.shuffle');
var cardUtil = require('../services/card-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

/**
 * Example of a customized home page configuration
 */
var HomePro = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text: string){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    trendingLayers: React.PropTypes.array.isRequired,
    trendingGroups: React.PropTypes.array.isRequired,
    trendingHubs: React.PropTypes.array.isRequired,
    trendingMaps: React.PropTypes.array.isRequired,
    trendingStories: React.PropTypes.array.isRequired,
    featuredStories:  React.PropTypes.array.isRequired,
    locale: React.PropTypes.string.isRequired,
    map: React.PropTypes.object,
    pageConfig: React.PropTypes.object.isRequired,
    layers: React.PropTypes.array,
    footerConfig: React.PropTypes.object
  },

  getInitialState(): Object{
    return {
      trendingStoryCards: _shuffle(this.props.trendingStories.map(cardUtil.getStoryCard)),
      trendingMapCards: _shuffle(this.props.trendingMaps.map(cardUtil.getMapCard)),
      trendingHubCards: _shuffle(this.props.trendingHubs.map(cardUtil.getHubCard)),
      trendingGroupCards: _shuffle(this.props.trendingGroups.map(cardUtil.getGroupCard)),
      trendingLayerCards: _shuffle(this.props.trendingLayers.map(cardUtil.getLayerCard))
    };
  },

  handleSearch(input: string){
    window.location = '/search?q=' + input;
  },

  renderHomePageMap(config: Object, key: string){
    var homepageMap= '';
    if(this.props.map){
      homepageMap = (
         <div key={key} className="row" style={{height: 'calc(100vh - 150px)'}}>
            <InteractiveMap height="100%" 
             {...this.props.map} categories={config.categories}     
             layers={this.props.layers} showTitle={false}/>
            <div className="divider" />
          </div>
       );
    }
    return homepageMap;   
  },

  renderLinks(config: Object, key: string){
    var links = '';
    var bgColor = config.bgColor ? config.bgColor : 'inherit';
    links = (
      <div key={key} className="row" style={{backgroundColor: bgColor}}>
        <PublicOnboardingLinks />
      </div>
    );
    return links;
  },

  renderCarousel(config: Object, key: string){
    var trendingCards = cardUtil.combineCards([this.state.trendingLayerCards,
    this.state.trendingGroupCards,
    this.state.trendingHubCards,
    this.state.trendingMapCards,
    this.state.trendingStoryCards]);

     var bgColor = config.bgColor ? config.bgColor : 'inherit';

    return (
      <div key={key} className="row" style={{marginBottom: '50px', backgroundColor: bgColor}}>
           <div className="row no-margin" style={{height: '50px'}}>
             <div>
                <h5 className="no-margin center-align" style={{lineHeight: '50px'}}>
                  {this.__('Trending')}
                  <i className="material-icons" style={{fontWeight: 'bold', color: MAPHUBS_CONFIG.primaryColor, fontSize:'40px', verticalAlign: '-25%', marginLeft: '5px'}}>trending_up</i>
                </h5>
             </div>
           </div>
           <div className="row">
             <div className="col s12">
               <CardCarousel cards={trendingCards} infinite={false}/>
             </div>
           </div>
        </div>
    );

  },

  renderStories(key: string){
    var featured = '';
     if(this.props.featuredStories && this.props.featuredStories.length > 0){
       featured = (
         <div key={key}>
           <div className="divider" />
           <div className="row">
             <h5 className="no-margin center-align" style={{lineHeight: '50px', color: '#212121'}}>
               {this.__('Featured Stories')}
             </h5>
               {this.props.featuredStories.map(story => {
                 return (
                   <div className="card" key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                     <div className="card-content">
                     <StorySummary story={story} />
                     </div>
                   </div>
                 );
               })}
           </div>
         </div>
       );
     }
     return featured;

  },

  renderText(config: Object, key: string){
    var text = config.text[this.state.locale];
    if(!text) text = config.text.en;
    return (
      <div key={key} className="row">
        <div className="flow-text center align-center">
          {text}
        </div>
      </div>
    );
  },

	render() {

    var _this = this;

		return (
      <div style={{margin: 0, height: '100%'}}>
      <Header />
      <main style={{margin: 0, height: '100%'}}>

       {this.props.pageConfig.components.map((component, i) => {
         var key = `homepro-component-${i}`;
          if(component.type === 'map'){
            return _this.renderHomePageMap(component, key);
          }else if(component.type === 'carousel'){
            return _this.renderCarousel(component, key);
          }else if(component.type === 'storyfeed'){
            return _this.renderStories(key);
          }else if(component.type === 'text'){
            return _this.renderText(component, key);
          }else if(component.type === 'links'){
            return _this.renderLinks(component, key);
          }else{
            return '';
          }
          
        })
       }
        <Footer {...this.props.footerConfig}/>
       </main>
			</div>
		);
	}
});

module.exports = HomePro;
