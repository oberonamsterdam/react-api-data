# react-api-data

Automate calling external APIs and handling response data. Supports any API with JSON responses. Uses Fetch for
performing API requests, normalizr for handling response data and redux for storing data.

## Installation

`npm install react-api-data`

or

`yarn add react-api-data`

Make sure _fetch_ is available globally, polyfill it if needed to support older environments.

## API

[API specification](api)

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
    article: 'getArticle'
}, (ownProps, state) => ({
    // provide URL parameters
    article: {articleId: ownProps.articleId, userId: state.userId || ''}
}));

const Article = (props) => {
    switch(props.article.request.networkStatus) {
        case 'loading': return 'Loading...';
        case 'failed': return 'Something went wrong :(';
        case 'success': {
            const article = props.article.data;
            return (
                <div>
                    <h1>{article.title}</h1>
                    <em>{article.author.name}</em><br />
                    {article.body}
                </div>
            );
        }
        default: return null;
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

## Posting data

```js
import React from 'react';
import { connect } from 'react-redux';
import { getApiDataRequest, performApiRequest } from 'react-api-data';

const mapStateToProps = state => ({
    request: getApiDataRequest(state.apiData, 'postComment')
});

const mapDispatchToProps = dispatch => ({
    onSubmit: comment => { dispatch(performApiRequest('postComment', {}, {comment})); }
});

class WriteComment extends React.Component {
    state = {
        comment: ''
    }

    render () {
        const status = this.props.request ? this.props.request.networkStatus : '';

        return (
            <div>
                <h1>Post a comment</h1>
                {status === '' && (
                    <div>
                        <textarea onChange={event => this.setState({comment: event.target.value})} />
                        <button onClick={() => this.props.onSubmit(this.state.comment)}>Submit</button>
                    </div>
                )}
                {status === 'loading' && (
                    <div>Submitting...</div>
                )}
                {status === 'failed' && (
                    <div>
                        Something went wrong.
                        <button onClick={() => this.props.onSubmit(this.state.comment)}>Try again</button>
                    </div>
                )}
                {status === 'success' && (
                    <div>Submitted!</div>
                )}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WriteComment);
```
