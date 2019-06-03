# react-api-data

Automate calling external APIs and handling response data. Supports any API with JSON responses. Uses Fetch for
performing API requests, normalizr for handling response data and redux for storing data.

## Installation

`npm install react-api-data`

or

`yarn add react-api-data`

Make sure _fetch_ is available globally, polyfill it if needed to support older environments.

## API

[API specification](api.md)

## Quick usage

### Config

```js
import { schema } from 'normalizr';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { configureApiData, reducer } from 'react-api-data';
import thunk from 'redux-thunk';

// define normalizr response schemas

const authorSchema = new schema.Entity('Author');
const articleSchema = new schema.Entity('Article', {
    author: authorSchema
});

// define api endpoints

const endpointConfig = {
    getArticle: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId/:userId',
        method: 'GET',
        responseSchema: articleSchema
    },
    saveArticle: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId',
        method: 'POST',
        responseSchema: saveSchema,
        autoTrigger: false, // could be omitted as false is also the default value for endpoints with method: 'POST'
        afterSuccess: (request, dispatch) => {
            dispatch(invalidateApiDataRequest('getArticle')); // triggers reload of getComments
        }
    }
};

// Configure store and dispatch config before you render components

const store = createStore(combineReducers({apiData: reducer}), applyMiddleware(thunk));
store.dispatch(configureApiData({}, endpointConfig));
```

### Bind API data to your component

```js
import React from 'react';
import { withApiData } from 'react-api-data';

// bind api data to a component

const connectApiData = withApiData({
    // specify property name and endpoint
    article: 'getArticle',
    saveArticle: 'saveArticle'
}, (ownProps, state) => ({
    // provide URL parameters, can be empty objects for autoTrigger: false endpoints
    article: {articleId: ownProps.articleId, userId: state.userId || ''},
    saveArticle: {}
}));


class EditArticle extends React.Component {
    state = {
        body: ''
    }

    render() {
        switch(this.props.article.request.networkStatus) {
            case 'loading': return 'Loading...';
            case 'failed': return 'Something went wrong :(';
            case 'success': {
                const article = this.props.article.data;
                return (
                    <div>
                        <h1>{article.title}</h1>
                        <em>{article.author.name}</em><br />
                        <textarea onChange={event => this.setState({body: event.target.value})}>{article.body}</textarea>
                        {this.props.saveArticle.request.networkStatus !== 'failed' && (
                            <p>Error while saving article, please try again.</p>
                        )}
                        {this.props.saveArticle.request.networkStatus !== 'loading' ? (
                            <button onClick={() => this.props.saveArticle.perform({articleId: this.props.articleId}, {body: this.state.body})}>Submit</button>
                        ) : (
                            <p>Saving...</p>
                        )}
                    </div>
                );
            }
            default: return null;
        }
    }
};

export default connectApiData(Article);
```

# The gist

Calling external API endpoints and storing response data in your [redux](https://redux.js.org) state can create
bloat in your code when you have multiple endpoints, especially in [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)
applications. This package is the result of eliminating repetitive code around API calls and centralizing the concerns of
fetching and storing API data into one single package. It provides an easy to use interface that aims to minimize the
amount of code needed to use data from external APIs, while maintaining maximum flexibility to support any non-standard
API. The idea is that you can just bind data from a given API endpoint to your component, react-api-data takes care of
fetching the data if needed, and binding the data to your component.

# Examples

## Caching API responses

Responses from successful API calls will be kept in memory so the same call won't be re-triggered a second time. This is especially useful when using *withApiData* for the same endpoint on multiple components.
You can set a *cacheDuration* to specify how long the response is considered valid, or to disable the caching entirely.

```js
export default {
    getArticle: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId/:userId',
        method: 'GET',
        cacheDuration: 60000, // 1 minute
    },
    getComments: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId',
        method: 'GET',
        cacheDuration: 0, // no caching, use with caution. Preferably set to a low value to prevent multiple simultaneous calls.
    },
    getPosts: {
        url: 'http://www.mocky.io/v2/5a0c203e320000772de9664c?:articleId',
        method: 'GET'
        // Infinite caching
    },
}
```

## Manually clearing cache

```js
dispatch(invalidateApiDataRequest('getComments'));
```

## Removing api data from the store

```js
import { performApiRequest, purgeApiData } from 'react-api-data';

export const logout = () => (dispatch) => {
    dispatch(purgeApiData());
};
```

## Including Cookies in your Request

```js
export const globalConfig: ApiDataGlobalConfig = {
    setRequestProperties: (defaultProperties) => ({
        ...defaultProperties,
        credentials: 'include',
    })
};
```

## Make multiple requests to the same endpoint at once

```js
const connectApiData = withApiData({
    items: 'getItemsInList'
}, (ownProps, state) => ({
    items: [{listId: 1}, {listId: 2}, {listId: 3}]
}));

const ItemsList = (props) => {
    if (props.items.every(item => item.request.networkStatus === 'success')) {
        return (
            <ul>
                {props.items.map(item => (<li>{item.data.title}</li>))}
            </ul>
        );
    }
    return <p>Loading...</p>;
}

export default connectApiData(ItemsList);
```
