# API
  ## Table of Contents
- [HOC](#hoc)
  - [`withApiData()`](#withapidata)
- [Config](#config)
  - [`configureApiData()`](#configureapidata)
  - [`useRequestHandler()`](#userequesthandler)
- [Actions](#actions)
  - [`performApiRequest()`](#performapirequest)
  - [`invalidateApiDataRequest()`](#invalidateapidatarequest)
  - [`afterRehydrate()`](#afterrehydrate)
- [Selectors](#selectors)
  - [`getApiDataRequest()`](#getapidatarequest)
  - [`getResultData()`](#getresultdata)
  - [`getEntity()`](#getentity)
- [Types and interfaces](#types-and-interfaces)
  - [`NetworkStatus`](#networkstatus)
  - [`ApiDataBinding`](#apidatabinding)
  - [`ApiDataRequest`](#apidatarequest)
  - [`EndpointParams`](#endpointparams)
  - [`ApiDataEndpointConfig`](#apidataendpointconfig)
  - [`ApiDataGlobalConfig`](#apidataglobalconfig)
  - [`ApiDataConfigBeforeProps`](#apidataconfigbeforeprops)
  - [`ApiDataConfigAfterProps`](#apidataconfigafterprops)
  - [`ApiDataState`](#apidatastate)
  - [`RequestHandler`](#requesthandler)
  - [`HandledResponse`](#handledresponse)

## HOC

### `withApiData()`

Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped
component will get an [ApiDataBinding](#apidatabinding) or [ApiDataBinding](#apidatabinding)[] added to each property key of the bindings param.

**Parameters**

- `bindings` **{ [propName in TPropNames]: string }** maps prop names to endpoint keys
- `getParams` **(ownProps: any, state: any) => { [propName in TPropName]?: EndpointParams | EndpointParams[] }** optionally provide the URL parameters. Providing an `EndpointParams[]` for a binding results in an `ApiDataBinding[]` added to the property key.

**Returns**

**Function** Function to wrap your component

**Examples**
 ```javascript
withApiData({
    article: 'getArticle',
    users: 'getUser',
    editArticle: 'editArticle' // an endpoint with autoTrigger false
}, (ownProps, state) => ({
    article: {
        id: ownProps.articleId,
    },
    // sometimes you need to call one endpoint multiple times (simultaneously) with different parameter values:
    users: state.users.map(user => ({
        userId: user.id
    })),
    editArticle: {}
}));
// props.article will be an ApiDataBinding
// props.users will be an array of ApiDataBinding
// props.editArticle will be an ApiDataBinding

// perform can be used to trigger calls with autoTrigger: false
props.editArticle.perform({
    id: props.articleId
}, {
    title: 'New Title',
    content: 'New article content'
});
```


## Config

### `configureApiData()`

Register your global and endpoint configurations. Make sure you do this before you mount any components using
withApiData.

**Parameters**

- `globalConfig` **[ApiDataGlobalConfig](#apidataglobalconfig)** - `endpointConfig` **[ApiDataEndpointConfig](#apidataendpointconfig)**

**Returns**

 **Object** Redux action

---

### `useRequestHandler()`

Use your own request function that calls the api and reads the responseBody response. Make sure it implements the
[RequestHandler](#requesthandler) interface.

**Parameters**

- `requestHandler` **RequestHandler**


## Actions

### `performApiRequest()`

Manually trigger an request to an endpoint. Primarily used for any non-GET requests. For get requests it is preferred
to use [withApiData](#withapidata).

**Parameters**

- `endpointKey` **string**
- `params` **[EndpointParams](#endpointparams)**
- `body` **any**
- `instanceId?` **string**

**Returns**

**Object** Redux action to dispatch. Dispatching this returns: **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[ApiDataBinding](#apidatabinding)>** Rejects when endpointKey is unkown. Otherwise resolves with ApiDataBinding after call has completed. Use request networkStatus to see if call was succeeded or not.

---

### `invalidateApiDataRequest()`

Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate
a GET list request, which might need to include the newly created entity.

**Parameters**

- `endpointKey` **string**
- `params` **[EndpointParams](#endpointparams)**
- `instanceId?` **string**

**Returns**

**Object** Redux action to dispatch

---

### `afterRehydrate()`

Call this after you've re-hydrated the store when using redux-persist or any other method of persisting and restoring
the entire apiData state. This is needed to reset loading statuses.

**Returns**

**Object** Redux action to dispatch


## Selectors

### getApiDataRequest()

Selector to manually get a [ApiDataRequest](#apidatarequest). This value is automatically bind when using [withApiData](#withapidata).
This selector can be useful for tracking request status when a request is triggered manually, like a POST after a
button click.

**Parameters**

- `apiDataState` **[ApiDataState](#apidatastate)**
- `endpointKey` **string**
- `params` **[EndpointParams](#endpointparams)**
- `instanceId?` **string**

**Returns**

**[ApiDataRequest](#apidatarequest) | void**

---

### getResultData()

Get the de-normalized result data of an endpoint, or undefined if not (yet) available. This value is automatically
bound when using [withApiData](#withapidata). This selector can be useful for getting response responseBody values when a request is
triggered manually, like a POST after a button click.

**Parameters**

- `apiDataState` **[ApiDataState](#apidatastate)**
- `endpointKey` **string**
- `params` **[EndpointParams](#endpointparams)**
- `instanceId?` **string**

**Returns**

**any**

---

### getEntity()

Selector for getting a single entity from normalized data.

**Parameters**

- `apiDataState` **[ApiDataState](#apidatastate)**
- `schema` **Object**
- `id` **string | number**

**Returns**

**Object | void**


## Types and interfaces

These can be used for documentation purposes, but are also available as TypeScript and Flow types and can be imported
straight from the react-api-data package.

### `NetworkStatus`

Type: **String enum** 

**Possible values**

- `"ready"`
- `"loading"`
- `"failed"`
- `"success"`

---

### `ApiDataBinding`

 The value that withApiData binds to the property of your component.

**Properties**

- `data` **any** The result data of your request, or undefined if your request has not completed or has no response body.
- `request` **[ApiDataRequest](#apidatarequest)** 
- `perform` **(params: [EndpointParams](#endpointparams), body: Object | string | FormData) => [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[ApiDataBinding](#apidatabinding)>**
  Manually trigger a call to the endpoint. The params parameter is merged with the params parameter of the binding. Returns a promise that resolves with an ApiDataBinding after call has completed. Use request networkStatus to see if call was succeeded or not. Both the original ApiDataBinding and the resolved promise contain the result of the performed request.
- `invalidateCache` **() => Promise&lt;void>** Manually trigger a cache invalidation of the endpoint with the current parameters.
- `getInstance` **(instanceId: string) => [ApiDataBinding](#apidatabinding)** get an independent instance of this binding. This enables you to make multiple (possibly paralel) calls to the same endpoint while maintaining access to all of them.

**Examples**

 ```javascript
type Props = {
  users: ApiDataBinding<Array<User>>
}
```

---

### `ApiDataRequest`

Information about a request made to an endpoint.

**Properties**

- `result?` **any** 
- `networkStatus` **[NetworkStatus](#networkstatus)** 
- `lastCall` **number** 
- `duration` **number** 
- `response?` **[Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)** 
- `errorBody?` **any** 
- `endpointKey` **string** 
- `params?` **[EndpointParams](#endpointparams)** 
- `url` **string** 

---

### `EndpointParams`

Map of parameter names to values.

---

### `ApiDataEndpointConfig`

 Specification and configuration of an endpoint.

**Properties**

- `url` **string** 
- `method` **`"GET"` | `"POST"` | `"PUT"` | `"PATCH"` | `"DELETE"`** 
- `cacheDuration?` **number**
- `responseSchema?` **Object | Array&lt;Object>**
- `transformResponseBody?` **function (responseBody: Object): NormalizedData** 
- `beforeSuccess?` **function (handledResponse: {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), body: any}, beforeProps: [ApiDataConfigBeforeProps](#apidataconfigbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}**
  Callback function that allows you to alter a response before it gets processed and stored. Can also be used to validate a response and turn it into a failed request by setting the `ok` property of the response to false.
- `beforeFailed?` **function (handledResponse: {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}, beforeProps: [ApiDataConfigBeforeProps](#apidataconfigbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}**
 Callback function that allows you to alter a response before it gets processed and stored. Can also be used to turn it into a successful request by setting the `ok` property of the response to true.
- `afterSuccess` **function (afterProps: [ApiDataConfigAfterProps](#apidataconfigafterprops)): boolean | void**
 Callback for executing side-effects when a call to this endpoint results in a "success" networkStatus. Called directly after the state is updated. If set, afterSuccess in globalConfig gets called after this, unless `false` is returned.
- `afterFailed` **function (afterProps: [ApiDataConfigAfterProps](#apidataconfigafterprops)): boolean | void**
 Callback for executing side-effects when a call to this endpoint results in a "failed" networkStatus. Called directly after the state is updated. If set, afterFailed in globalConfig gets called after this, unless `false` is returned.
- `setHeaders?` **function (defaultHeaders: Object, state: Object): Object** 
- `setRequestProperties?` **function (defaultProperties: Object, state: Object): Object** 
- `timeout?` **number** 
- `autoTrigger?` **boolean**
  Trigger calls automatically if needed. Defaults to `true` for GET requests and `false` for all other requests.

---

### `ApiDataGlobalConfig`

 Global configuration for all endpoints.

**Properties**
 
 - `setHeaders?` **function (defaultHeaders: Object, state: Object): Object** 
 - `setRequestProperties` **function (defaultProperties: Object, state: Object): Object** 
 - `beforeSuccess?` **function ({response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), body: any}, beforeProps: [ApiDataConfigBeforeProps](#apidataconfigbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}** 
 - `beforeFailed?` **function ({response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}, beforeProps: [ApiDataConfigBeforeProps](#apidataconfigbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}** 
 - `afterSuccess?` **function (afterProps: [ApiDataConfigAfterProps](#apidataconfigafterprops)): void** 
 - `afterFailed?` **function (afterProps: [ApiDataConfigAfterProps](#apidataconfigafterprops)): void** 
 - `timeout?` **number** 

---

### `ApiDataConfigBeforeProps`

- `endpointKey` **string** 
- `request` **[ApiDataRequest](#apidatarequest)** 
- `requestBody?` **any** 
 
 ---
 
 ### `ApiDataConfigAfterProps`
 
 **Properties**
 
- `endpointKey` **string** 
- `request` **[ApiDataRequest](#apidatarequest)** 
- `requestBody?` **any** 
- `resultData` **any** 
- `dispatch` **Function**
 Redux' dispatch function. Useful for state related side effects.
- `getState` **Function**
 Get access to your redux state.

---

### `ApiDataState`

Type of the Api-data state

---

### `RequestHandler`

Type: **Function**

**Parameters**

- `url` **string**
- `requestProperties` **[RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)**
The `init` parameter for fetch.

**Returns**

**Promise&lt;[HandledResponse](#handledresponse)>**

---

### `HandledResponse`

**Properties**

- `response` **[Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)**
- `body` **any**
