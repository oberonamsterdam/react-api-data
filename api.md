# API

## Table of Contents

- [Hooks](#hooks)
  - [`useApiData()`](#useapidata)
  - [`useActions()`](#useactions)
- [Config](#config)
  - [`configure()`](#configure)
  - [`setRequestHandler()`](#setrequesthandler)
- [Redux Actions](#redux-actions)
  - [`afterRehydrate()`](#afterrehydrate)
  - [`performRequest()` (Deprecated)](#performrequest-deprecated)
  - [`invalidateRequest()` (Deprecated)](#invalidaterequest-deprecated)
- [Selectors](#selectors)
  - [`getEntity()`](#getentity)
  - [`getRequest()` (Deprecated)](#getrequest-deprecated)
  - [`getResultData()` (Deprecated)](#getresultdata-deprecated)
- [HOC](#hoc)
  - [`withApiData()`](#withapidata)
- [SSR](#ssr)
  - [`getDataFromTree()`](#getdatafromtree)
- [Types and interfaces](#types-and-interfaces)
  - [`NetworkStatus`](#networkstatus)
  - [`Binding`](#binding)
  - [`Actions`](#actions)
  - [`DataRequest`](#datarequest)
  - [`EndpointParams`](#endpointparams)
  - [`EndpointConfig`](#endpointconfig)
  - [`GlobalConfig`](#globalconfig)
  - [`ConfigBeforeProps`](#configbeforeprops)
  - [`ConfigAfterProps`](#configafterprops)
  - [`State`](#state)
  - [`RequestHandler`](#requesthandler)
  - [`RequestConfig`](#requestconfig)
  - [`HandledResponse`](#handledresponse)
  - [`Options`](#options)

## Hooks

### `useApiData()`

Get an [Binding](#binding) for the given endpoint. It will make sure data gets (re-)loaded if needed. This behavior is
based on the `autoTrigger` and `cacheDuration` settings in [EndpointConfig](#endpointconfig) and will, by default, trigger
the call when the endpoint's method is `GET` and the call has not yet been triggered before. This makes it possible to use
this hook for the same call in multiple components, without needing to worry about which components needs to trigger the call
and how to share the data between the components. Just "use" the API data in multiple components and the fetching of data will be handled.
In any case it will return an `Binding` that reflects the current state of the _API call_, identified by the combination
of the _endpointKey_ and the _params_.

`useApiData` will invoke the request during rendering if `isSSR` is true.
If not passed, isSSR will be determined automatically.

**Parameters**

- `endpointKey` **string**
- `params?` **[EndpointParams](#endpointparams)**
- `options?` **[EndpointConfig](#endpointconfig) & [Options](#options)**

**Returns**

- `Binding` **[Binding](#binding)**

**Examples**

```javascript
import React from "react";
import { useApiData } from "react-api-data";

const Article = props => {
  const article = useApiData("getArticle",
        { id: props.articleId },
        { afterSuccess: () => alert(`Article with id ${props.articleId} received successfully`) },);
  return (
    <>
      {article.request.networkStatus === "success" && (
        <div>
          <h1>{article.data.title}</h1>
          <p>{article.data.body}</p>
        </div>
      )}
    </>
  );
};
```

### `useActions()`

**Parameters**

_none_

**Returns**

- `Actions` **[Actions](#actions)**

**Examples**

```javascript
const actions = useActions();
// Do a perform on any endpoint configured.
actions.perform(
  "postArticle",
  { id: article.id },
  { body: "The body of my article" }
);
// Invalidate the cache on any endpoint configured.
actions.invalidateCache("getArticles");
// purge the whole apiData store (invalidate all)
actions.purgeAll();
```

## Config

### `configure()`

Register your global and endpoint configurations. Make sure you do this before you mount any components using
withApiData.

**Parameters**

- `globalConfig` **[GlobalConfig](#globalconfig)** 
- `endpointConfig` **[EndpointConfig](#endpointconfig)**

**Returns**

**Object** Redux action

---

### `setRequestHandler()`

Use your own request function that calls the api and reads the responseBody response. Make sure it implements the
[RequestHandler](#requesthandler) interface.

**Parameters**

- `requestHandler` **RequestHandler**

## Redux Actions

### `afterRehydrate()`

Call this after you've re-hydrated the store when using redux-persist or any other method of persisting and restoring
the entire apiData state. This is needed to reset loading statuses.

**Returns**

**Object** Redux action to dispatch

---

### `performRequest()` (Deprecated)

Manually trigger an request to an endpoint. Primarily used for any non-GET requests. For GET requests it is preferred
to use [withApiData](#withapidata).

**Deprecated**

The performRequest Action has been deprecated. It is recommended to use the perform action in the [Binding](#binding) or the [Action](#action) perform, which is returned by the [HOC](#withapidata) in the actions prop, and in the [afterSuccess](#endpointconfig) and [afterFailed](#endpointconfig) events in the [endpoint configuration](#endpointconfig).

**Parameters**

- `endpointKey` **string**
- `params?` **[EndpointParams](#endpointparams)**
- `body?` **any**
- `instanceId?` **string**

**Returns**

**Object** Redux action to dispatch. Dispatching this returns: **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Binding](#binding)>** Rejects when endpointKey is unknown. Otherwise resolves with Binding after call has completed. Use request networkStatus to see if call was succeeded or not.

---

### `invalidateRequest()` (Deprecated)

Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate
a GET list request, which might need to include the newly created entity.

**Deprecated**

The invalidateRequest Action has been deprecated. It is recommended to use the invalidateCache action in the [Binding](#binding) or the [Action](#action) invalidateCache, which is returned by the [HOC](#withapidata) in the actions prop, and in the [afterSuccess](#endpointconfig) and [afterFailed](#endpointconfig) events in the [endpoint configuration](#endpointconfig).

**Parameters**

- `endpointKey` **string**
- `params?` **[EndpointParams](#endpointparams)**
- `instanceId?` **string**

**Returns**

**Object** Redux action to dispatch

## Selectors

### `getEntity()`

Selector for getting a single entity from normalized data.

**Parameters**

- `state` **[State](#state)**
- `schema` **Object**
- `id` **string | number**

**Returns**

**Object | void**

---

### `getRequest()` (Deprecated)

Selector to manually get a [Request](#request). This value is automatically bind when using [withApiData](#withapidata).
This selector can be useful for tracking request status when a request is triggered manually, like a POST after a
button click.

**Deprecated**

The getRequest selector has been deprecated. It is recommended to use the request property returned by the [Binding](#binding), which is returned by the [HOC](#withapidata).

**Parameters**

- `state` **[State](#state)**
- `endpointKey` **string**
- `params` **[EndpointParams](#endpointparams)**
- `instanceId?` **string**

**Returns**

**[Request](#request) | void**

---

### `getResultData()` (Deprecated)

Get the de-normalized result data of an endpoint, or undefined if not (yet) available. This value is automatically
bound when using [withApiData](#withapidata). This selector can be useful for getting response responseBody values when a request is
triggered manually, like a POST after a button click.

**Deprecated**

The getResultData selector has been deprecated. It is recommended to use the request property returned by the [Binding](#binding), which is returned by the [HOC](#withapidata).

**Parameters**

- `state` **[State](#state)**
- `endpointKey` **string**
- `params` **[EndpointParams](#endpointparams)**
- `instanceId?` **string**

**Returns**

**any**

## HOC

### `withApiData()`

**Examples**

```javascript
withApiData(
  {
    article: "getArticle",
    users: "getUser",
    editArticle: "editArticle" // an endpoint with autoTrigger false
  },
  (ownProps, state) => ({
    article: {
      id: ownProps.articleId
    },
    // sometimes you need to call one endpoint multiple times (simultaneously) with different parameter values:
    users: state.users.map(user => ({
      userId: user.id
    })),
    editArticle: {}
  })
,
    // if you want to override the configs for a certain endpoint, you can do so:
    {
        editArticle: {
            autoTrigger: false,
            afterSucces: ({ dispatch, request, requestBody }) => {
                dispatch(
                    invalidateApiDataRequest('getArticle', {
                        id: request.params.articleId
                    })
                );
            },
        }
    }
)(MyComponent);
// props.article will be an ApiDataBinding
// props.users will be an array of ApiDataBinding
// props.editArticle will be an ApiDataBinding
// props.apiDataActions will be an Actions object

// perform can be used to trigger calls with autoTrigger: false
props.editArticle.perform(
  {
    id: props.articleId
  },
  {
    title: "New Title",
    content: "New article content"
  }
);

// the apiDataAction property can be used to perform actions on any endpoint in the endpoint config, not only those which are in the current binding.
props.actions.invalidateCache("getArticles");
```

Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped
component will get an [Binding](#binding) or [Binding](#binding)[] added to each property key of the bindings param and a property `actions` of type [Action](#action).

**Parameters**

- `bindings` **{ [propName in TPropNames]: string }** maps prop names to endpoint keys
- `getParams` **(ownProps: any, state: any) => { [propName in TPropName]?: EndpointParams | EndpointParams[] }** optionally provide the URL parameters. Providing an `EndpointParams[]` for a binding results in an `Binding[]` added to the property key.

**Returns**

**Function** Function to wrap your component. This higher order component adds a property for each binding, as defined in the bindings param of the HOC, to the wrapped component and an additional actions property with type [Actions](#actions).

## SSR

### `getDataFromTree()`

**Examples**

While handling the request on the serverside:

```javascript
const store = initializeStore();
const app = (
  <Provider store={store}>
    <App />
  </Provider>
);

// prerender to determine what requests are being made
await getDataFromTree(app, store);

// Requests are now all done, render for real.
const content = ReactDOMServer.renderToString(app);

// And... continue normal request handling
res.status(200);
res.send(`<!doctype html>\n${content}`);
res.end();
```

Above sample is highly simplified, please check our [`with-next`](https://github.com/oberonamsterdam/react-api-data/tree/master/examples/with-next/) example for something a bit more concrete.

**Parameters**

- `tree` **ReactNode** Your app tree, containing components that call `useApiData`.
- `store` **Store<unknown>** Your store. Should be the same store that you have used to wrap your app tree with, otherwise we can't extract the results.

**Returns**

A promise, if complete, all requests in the tree have been completed.

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

### `Binding`

Represents an endpoint _call_.

**Properties**

- `data` **any** The result data of your request, or undefined if your request has not completed, has failed, or has no response body.
- `loading`**boolean** Returns a boolean whether the binding is currently loading or not.
- `dataFailed` **any** Generic type which returns the failed state returned by the API, undefined when the call is not completed or succeeded.
- `request` **[Request](#request)**
- `perform` **(params?: [EndpointParams](#endpointparams), body?: any) => [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Binding](#binding)>**
  Manually trigger a call to the endpoint. The params parameter is merged with the params parameter of the binding. Returns a promise that resolves with an Binding after call has completed. Use request networkStatus to see if call was succeeded or not. Both the original Binding and the resolved promise contain the result of the performed request.
- `invalidateCache` **() => Promise&lt;void>** Manually trigger a cache invalidation of the endpoint with the current parameters.
- `purge` **() => Promise&lt;void>** Clears the request and the retrieved data.
- `getInstance` **(instanceId: string) => [Binding](#binding)** get an independent instance of this binding. This enables you to make multiple (possibly parallel) calls to the same endpoint while maintaining access to all of them.

**Examples**

```javascript
type Props = {
  users: Binding<Array<User>>
};
```

---

### `Actions`

Perform actions on any configured endpoint. These actions do not need to be dispatched.

**Properties**

- `perform` **(`endpointKey` string, `params?` [EndpointParams](#endpointparams), `body?` any, `instanceId?` string) => [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Binding](#binding)>** Manually trigger an request to an endpoint. Primarily used for any non-GET requests. For GET requests it is preferred to use [withApiData](#withapidata).
- `invalidateCache` **(`endpointKey` string, `params?` [EndpointParams](#endpointparams), `instanceId?` string) => void** Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate
- `purgeRequest` **(`endpointKey` string, `params?` [EndpointParams](#endpointparams), `instanceId?` string) => Promise&lt;void>** Clears the request and the retrieved data.
- `purgeAll` **() => void** Clears the whole apiData redux store. Might be useful fore logout functions.
  a GET list request, which might need to include the newly created entity.

---

### `DataRequest`

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

### `EndpointConfig`

Specification and configuration of an endpoint.

**Properties**

- `url` **string**
- `method` **`"GET"` | `"POST"` | `"PUT"` | `"PATCH"` | `"DELETE"`**
- `cacheDuration?` **number**
- `responseSchema?` **Object | Array&lt;Object>**
- `transformResponseBody?` **function (responseBody: Object): NormalizedData**
- `beforeSuccess?` **function (handledResponse: {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), body: any}, beforeProps: [ConfigBeforeProps](#configbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}**
  Callback function that allows you to alter a response before it gets processed and stored. Can also be used to validate a response and turn it into a failed request by setting the `ok` property of the response to false.
- `beforeFailed?` **function (handledResponse: {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}, beforeProps: [ConfigBeforeProps](#configbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}**
  Callback function that allows you to alter a response before it gets processed and stored. Can also be used to turn it into a successful request by setting the `ok` property of the response to true.
- `afterSuccess` **function (afterProps: [ConfigAfterProps](#configafterprops)): boolean | void**
  Callback for executing side-effects when a call to this endpoint results in a "success" networkStatus. Called directly after the state is updated. If set, afterSuccess in globalConfig gets called after this, unless `false` is returned.
- `afterFailed` **function (afterProps: [ConfigAfterProps](#configafterprops)): boolean | void**
  Callback for executing side-effects when a call to this endpoint results in a "failed" networkStatus. Called directly after the state is updated. If set, afterFailed in globalConfig gets called after this, unless `false` is returned.
- `setHeaders?` **function (defaultHeaders: Object, state: Object): Object**
- `setRequestProperties?` **function (defaultProperties: Object, state: Object): Object**
- `timeout?` **number**
- `autoTrigger?` **boolean**
  Trigger calls automatically if needed. Defaults to `true` for GET requests and `false` for all other requests.
- `defaultParams?`: **Object**
  Provide default params for the params included in the url.
- `enableSuspense?`: **boolean**
  Enables [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html) for the endpoint.
- `parseMethod?`: **'json' | 'blob' | 'text' | 'arrayBuffer' | 'formData'**
  Parse responses automatically as json, text or any of the other options.
  Defaults to 'json'.

---

### `GlobalConfig`

Global configuration for all endpoints.

**Properties**

- `setHeaders?` **function (defaultHeaders: Object, state: Object): Object**
- `setRequestProperties` **function (defaultProperties: Object, state: Object): Object**
- `beforeSuccess?` **function ({response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), body: any}, beforeProps: [ConfigBeforeProps](#configbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}**
- `beforeFailed?` **function ({response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}, beforeProps: [ConfigBeforeProps](#configbeforeprops)): {response: [Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5), responseBody: any}**
- `afterSuccess?` **function (afterProps: [ConfigAfterProps](#configafterprops)): void**
- `afterFailed?` **function (afterProps: [ConfigAfterProps](#configafterprops)): void**
- `timeout?` **number**
- `enableSuspense?`: **boolean**
  Enables [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html) globally.
- `parseMethod?`: **'json' | 'blob' | 'text' | 'arrayBuffer' | 'formData'**
  Parse responses automatically as json, text or any of the other options.
  Defaults to 'json'.

---

### `ConfigBeforeProps`

- `endpointKey` **string**
- `request` **[Request](#request)**
- `requestBody?` **any**

  ***

### `ConfigAfterProps`

**Properties**

- `endpointKey` **string**
- `request` **[Request](#request)**
- `requestBody?` **any**
- `resultData` **any**
- `dispatch` **Function**
  Redux' dispatch function. Useful for state related side effects.
- `getState` **Function**
  Get access to your redux state.
- `actions` **[Actions](#actions)**
  Perform actions on any configured endpoint

---

### `State`

Type of the Api-data state

---

### `RequestHandler`

Type: **Function**

**Parameters**

- `url` **string**
- `requestProperties` **[RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)**
  The `init` parameter for fetch.
- `config?` **[RequestConfig](#requestconfig)**
  Extra config options for handling the fetch request

**Returns**

**Promise&lt;[HandledResponse](#handledresponse)>**

---

### `RequestConfig`

**Properties**

- `parseMethod?`: **'json' | 'blob' | 'text' | 'arrayBuffer' | 'formData'**
  Parse response automatically as json, text or any of the other options.

---

### `HandledResponse`

**Properties**

- `response` **[Response](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)**
- `body` **any**

---

### `Options`

**Properties**

- `isSSR` **boolean**
- `enableSuspense?`: **boolean**
  Enables [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html) for this hook.
  