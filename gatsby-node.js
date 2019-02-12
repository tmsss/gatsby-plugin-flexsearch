var FlexSearch = require('flexsearch')
const _ = require('lodash')
var fs = require('fs')

exports.onPostBootstrap = function(_ref, options) {
    var getNodes = _ref.getNodes

    var type = options.type

    var _options$langua = options.languages,
        languages = _options$langua === undefined ? ['en'] : _options$langua

    var _options$fields = options.fields,
        fields = _options$fields === undefined ? [] : _options$fields

    var _options$filename = options.filename,
        filename =
            _options$filename === undefined
                ? 'flexsearch_index.json'
                : _options$filename

    var store = []
    var indexStore = []
    var fullIndex = {}

    languages.forEach(lng => {
        var fieldsToStore = fields
            .filter(field => (field.store ? field.resolver : null))
            .map(field => ({ name: field.name, resolver: field.resolver }))
        var nid = []

        fields.forEach(index_ => {
            var index = {}

            index.name = index_.name
            if (index_.indexed) {
                var attrs = index_.attributes
                index.attrs = attrs
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

    fs.writeFileSync('public/' + filename, JSON.stringify(fullIndex))
}
