var FlexSearch = require('flexsearch')

exports.onClientEntry = function(args, _ref) {
    var languages = _ref.languages,
        _ref$filename = _ref.filename,
        filename =
            _ref$filename === undefined
                ? 'flexsearch_index.json'
                : _ref$filename

   
    // require('flexsearch')

    // inserir ficheiros de linguagem
    // languages.forEach(lng => {
    //     try {
    //         require('flexsearch') // retirar para fora do loop
    //         require('flexsearch/lang/' + lng + '.min')
    //     } catch (e) {
    //         console.log(e)
    //     }
    // })

    // carregar ficheiro json
    fetch(__PATH_PREFIX__ + '/' + filename)
        .then(function(response) {
            return response.json()
        })
        .then(function(index) {
            Object.keys(index).forEach(lng => {
                Object.keys(index[lng].index).forEach(idx => {
                    var index_ = index[lng].index[idx]
                    indexObj = new FlexSearch(index_.attrs)
                    indexObj.import(index_.values)
                    index_.values = indexObj
                })
            })
            window.__FLEXSEARCH__ = index
        })
        .catch(function(e) {
            return console.log('Failed fetch search index')
        })
}
