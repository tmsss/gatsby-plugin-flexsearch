# Search Plugin for Gatsby

Gatsby plugin for full text search implementation based on [FlexSearch.js](https://github.com/nextapps-de/flexsearch) client-side index, heavily inspired in the [gatsby-plugin-lunr
](https://github.com/humanseelabs/gatsby-plugin-lunr).

## Getting Started

Install `gatsby-plugin-flexsearch`

```
    npm install --save gatsby-plugin-flexsearch
```

Add `gatsby-plugin-flexsearch` configuration to the `gatsby-config.js` as following:

```javascript
module.exports = {
    plugins: [
        {
      resolve: 'gatsby-plugin-flexsearch',
      options: {
        languages: ['en'],
        type: 'MarkdownRemark',
        fields: [
          {
            name: 'title',
            indexed: true,
            resolver: 'frontmatter.title',
            attributes: {
              encode: 'balance',
              tokenize: 'strict',
              threshold: 6,
              depth: 3,
            },
            store: true,
          },
          {
            name: 'description',
            indexed: true,
            resolver: 'frontmatter.description',
            attributes: {
              encode: 'balance',
              tokenize: 'strict',
              threshold: 6,
              depth: 3,
            },
            store: false,
          },
          {
            name: 'url',
            indexed: false,
            resolver: 'fields.slug',
            store: true,
          },
        ],
      },
    },
```

## Implementing Search in Your Web UI

The search data will be available on the client side via `window.__FLEXSEARCH__` that is an object with the following fields:

- `index` - a flexsearch index instance
- `store` - object where the key is a gatsby node ID and value is a collection of field values.

```javascript
import React, { Component } from 'react'

// Search component
class Search extends Component {
  state = {
    query: '',
    results: [],
  }

  render() {
    const ResultList = () => {
      if (this.state.results.length > 0) {
        return this.state.results.map((page, i) => (
          <div className="item-search" key={i}>
            <a href={page.url}>{page.title}<a/>
          </div>
        ))
      } else if (this.state.query.length > 2) {
        return 'No results for ' + this.state.query
      } else if (
        this.state.results.length === 0 &&
        this.state.query.length > 0
      ) {
        return 'Please insert at least 3 characters'
      } else {
        return ''
      }
    }

    return (
      <div className={this.props.classNames}>
        <input
          className="search__input"
          type="text"
          onChange={this.search}
          placeholder={'Search'}
        />
        <div className="search__list">
          <ResultList />
        </div>
      </div>
    )
  }

  getSearchResults(query) {
    var index = window.__FLEXSEARCH__.en.index
    var store = window.__FLEXSEARCH__.en.store
    if (!query || !index) {
      return []
    } else {
      var results = []
      Object.keys(index).forEach(idx => {
        results.push(...index[idx].values.search(query))
      })

      results = Array.from(new Set(results))

      var nodes = store
        .filter(node => (results.includes(node.id) ? node : null))
        .map(node => node.node)

      return nodes
    }
  }

  search = event => {
    const query = event.target.value
    if (this.state.query.length > 2) {
      const results = this.getSearchResults(query)
      this.setState({ results: results, query: query })
    } else {
      this.setState({ results: [], query: query })
    }
  }
}

export default Search
```
