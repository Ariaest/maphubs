const React  = require('react');
const ReactDOM = require('react-dom');

require('babel-polyfill');
require('jquery');
require("materialize-css");
require("materialize-css/dist/css/materialize.min.css");
var Home = require('../views/home');

require('../css/app.css');
require('../node_modules/mapbox-gl/dist/mapbox-gl.css');
require('../node_modules/slick-carousel/slick/slick.css');
require('../node_modules/slick-carousel/slick/slick-theme.css');


document.addEventListener('DOMContentLoaded', () => {
  let data = window.__appData;

  ReactDOM.render(
    <Home
      featuredLayers={data.featuredLayers} featuredGroups={data.featuredGroups} featuredHubs={data.featuredHubs} featuredMaps={data.featuredMaps} featuredStories={data.featuredStories}
      popularLayers={data.popularLayers} popularGroups={data.popularGroups} popularHubs={data.popularHubs} popularMaps={data.popularMaps} popularStories={data.popularStories}
      recentLayers={data.recentLayers} recentGroups={data.recentGroups} recentHubs={data.recentHubs} recentMaps={data.recentMaps} recentStories={data.recentStories} 
      locale={data.locale} version={data.version}/>,
    document.querySelector('#app')
  );
});
