var _forEachRight = require('lodash.foreachright')
var rebuildMapStyle = function (layerStyles) {
  var mapStyle = {
    version: 8,
    sources: {},
    layers: []
  }

  // reverse the order for the styles, since the map draws them in the order recieved
  _forEachRight(layerStyles, (style) => {
    if (style && style.sources && style.layers) {
      // add source
      mapStyle.sources = Object.assign(mapStyle.sources, style.sources)
      // add layers
      mapStyle.layers = mapStyle.layers.concat(style.layers)
    }
  })
  return mapStyle
}

exports.up = function (knex) {
  return knex.raw(`select omh.map_layers.map_id, omh.map_layers.layer_id, 
  omh.map_layers.style as map_layer_style,
  omh.layers.style as orig_layer_style
  from omh.map_layers 
  left join omh.layers on omh.map_layers.layer_id = omh.layers.layer_id
  order by position`)
    .then((result) => {
      const updatedMapStyles = {}
      const updateCommands = []
      result.rows.forEach((mapLayer) => {
        const mapLayerStyle = mapLayer.map_layer_style
        const origLayerStyle = mapLayer.orig_layer_style
        if (origLayerStyle) {
        // update root metadata
          if (origLayerStyle.metadata) {
            mapLayerStyle.metadata = origLayerStyle.metadata
          }
          // update source metadata
          Object.keys(origLayerStyle.sources).forEach((sourceID) => {
            var origSource = origLayerStyle.sources[sourceID]
            var mapSource = mapLayerStyle.sources[sourceID]
            if (origSource.metadata && mapSource) {
              mapSource.metadata = origSource.metadata
            }
          })
          if (!updatedMapStyles[mapLayer.map_id]) {
            updatedMapStyles[mapLayer.map_id] = []
          }

          updatedMapStyles[mapLayer.map_id].push(mapLayerStyle)

          updateCommands.push(
            knex('omh.map_layers')
              .update({style: mapLayerStyle})
              .where({map_id: mapLayer.map_id, layer_id: mapLayer.layer_id})
          )
        }
      })

      // loop through map_ids, build updated styles, and update
      Object.keys(updatedMapStyles).forEach((map_id) => {
        const updatedMapStyle = rebuildMapStyle(updatedMapStyles[map_id])
        updateCommands.push(
          knex('omh.maps').update({style: updatedMapStyle}).where({map_id: map_id})
        )
      })

      return Promise.all(updateCommands)
    })
}

exports.down = function () {
  return Promise.resolve()
}
