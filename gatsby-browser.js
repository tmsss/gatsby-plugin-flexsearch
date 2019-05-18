// set flexsearch object as a global variable to make it available to language files
global.FlexSearch = require("flexsearch")

exports.onClientEntry = function(args, _ref) {
  var languages = _ref.languages

  // load json data into window variable
  fetch(__PATH_PREFIX__ + "/flexsearch_index.json")
    .then(function(response) {
      return response.json()
    })
    .then(function(index) {
      Object.keys(index).forEach(lng => {
        Object.keys(index[lng].index).forEach(idx => {
          var index_ = index[lng].index[idx]

          // load language files if needed by stemmer or filter
          if (
            index_.attrs.stemmer !== undefined ||
            index_.attrs.filter !== undefined
          ) {
            try {
              require("./lang/" + lng)
            } catch (e) {
              console.log(e)
            }
          }
          // rebuild the index
          indexObj = new FlexSearch(index_.attrs)
          indexObj.import(index_.values)
          index_.values = indexObj
        })
      })
      // load index into window variable
      window.__FLEXSEARCH__ = index;
    })
    .catch(function(e) {
      return console.log('Failed fetch search index');
    })
}
