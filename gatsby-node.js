const _ = require("lodash");
var fs = require("fs");
// set flexsearch object as a global variable to make it available to language files
global.FlexSearch = require("flexsearch");

exports.onPostBootstrap = function(_ref, options) {
  var getNodes = _ref.getNodes

  var type = options.type

  var _options$langua = options.languages,
    languages = _options$langua === undefined ? ['en'] : _options$langua

  var _options$fields = options.fields,
    fields = _options$fields === undefined ? [] : _options$fields

  var store = []
  var indexStore = []
  var fullIndex = {}

  languages.forEach(lng => {
    // collect fields to store
    var fieldsToStore = fields
      .filter(field => (field.store ? field.resolver : null))
      .map(field => ({ name: field.name, resolver: field.resolver }));
    var nid = []

    // add each field to index
    fields.forEach(index_ => {
      var index = {}
      index.name = index_.name

      if (index_.indexed) {
        var attrs = index_.attributes
        index.attrs = attrs

        if (attrs.stemmer !== undefined || attrs.filter !== undefined) {
          try {
            require("./lang/" + lng)
          } catch (e) {
            console.error("Error on loading language file")
            console.error(e)
          }
        }

        index.values = new FlexSearch(attrs)
      }

      getNodes()
        .filter(node => {
          if (node.internal.type === type) {
            return node
          }
        })
        .forEach((n, i) => {
          var id = i
          if (index_.indexed) {
            var content = _.get(n, index_.resolver)
            index.values.add(id, content)
          }
          var nodeContent = {}
          fieldsToStore.forEach(field => {
            nodeContent[field.name] = _.get(n, field.resolver)
          })
          if (!nid.includes(id)) {
            store.push({ id: id, node: nodeContent })
            nid.push(id)
          }
        })

      if (index_.indexed) {
        index.values = index.values.export()
        indexStore.push(index)
      }
    })

    fullIndex[lng] = {
      index: indexStore,
      store: store,
    }
  })

  fs.writeFileSync("public/flexsearch_index.json", JSON.stringify(fullIndex))
}
