
#  react-api-data

## Index

### Interfaces

* [ApiDataAfterRehydrateAction](interfaces/apidataafterrehydrateaction.md)
* [ApiDataBinding](interfaces/apidatabinding.md)
* [ApiDataEndpointConfig](interfaces/apidataendpointconfig.md)
* [ApiDataFailAction](interfaces/apidatafailaction.md)
* [ApiDataGlobalConfig](interfaces/apidataglobalconfig.md)
* [ApiDataRequest](interfaces/apidatarequest.md)
* [ApiDataState](interfaces/apidatastate.md)
* [ApiDataSuccessAction](interfaces/apidatasuccessaction.md)
* [ClearApiData](interfaces/clearapidata.md)
* [ConfigureApiDataAction](interfaces/configureapidataaction.md)
* [EndpointParams](interfaces/endpointparams.md)
* [Entities](interfaces/entities.md)
* [FetchApiDataAction](interfaces/fetchapidataaction.md)
* [HandledResponse](interfaces/handledresponse.md)
* [InvalidateApiDataRequestAction](interfaces/invalidateapidatarequestaction.md)
* [NormalizedData](interfaces/normalizeddata.md)
* [PurgeApiDataAction](interfaces/purgeapidataaction.md)
* [WithApiDataParams](interfaces/withapidataparams.md)
* [WithApiDataProps](interfaces/withapidataprops.md)

### Type aliases

* [Action](#action)
* [GetParams](#getparams)
* [NetworkStatus](#networkstatus)
* [NormalizeResult](#normalizeresult)
* [RequestHandler](#requesthandler)
* [WithApiDataChildProps](#withapidatachildprops)

### Variables

* [__DEV__](#__dev__)
* [defaultRequestHandler](#defaultrequesthandler)
* [requestFunction](#requestfunction)

### Functions

* [addEntities](#addentities)
* [afterRehydrate](#afterrehydrate)
* [apiDataFail](#apidatafail)
* [apiDataSuccess](#apidatasuccess)
* [cacheExpired](#cacheexpired)
* [composeConfigFn](#composeconfigfn)
* [configureApiData](#configureapidata)
* [formatUrl](#formaturl)
* [getApiDataRequest](#getapidatarequest)
* [getEntity](#getentity)
* [getHeaders](#getheaders)
* [getRequestKey](#getrequestkey)
* [getResultData](#getresultdata)
* [invalidateApiDataRequest](#invalidateapidatarequest)
* [performApiRequest](#performapirequest)
* [purgeApiData](#purgeapidata)
* [recoverNetworkStatus](#recovernetworkstatus)
* [recoverNetworkStatuses](#recovernetworkstatuses)
* [useRequestHandler](#userequesthandler)
* [withApiData](#withapidata)

### Object literals

* [defaultState](#defaultstate)

---

## Type aliases

<a id="action"></a>

###  Action

**Ƭ Action**: * [ConfigureApiDataAction](interfaces/configureapidataaction.md) &#124; [FetchApiDataAction](interfaces/fetchapidataaction.md) &#124; [ApiDataSuccessAction](interfaces/apidatasuccessaction.md) &#124; [ApiDataFailAction](interfaces/apidatafailaction.md) &#124; [InvalidateApiDataRequestAction](interfaces/invalidateapidatarequestaction.md) &#124; [ClearApiData](interfaces/clearapidata.md) &#124; [ApiDataAfterRehydrateAction](interfaces/apidataafterrehydrateaction.md) &#124; [PurgeApiDataAction](interfaces/purgeapidataaction.md)
*

*Defined in [reducer.ts:128](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L128)*

___
<a id="getparams"></a>

###  GetParams

**Ƭ GetParams**: *`function`*

*Defined in [withApiData.tsx:10](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/withApiData.tsx#L10)*

#### Type declaration
▸(ownProps: *`any`*, state: *`any`*): `object`

**Parameters:**

| Name | Type |
| ------ | ------ |
| ownProps | `any` |
| state | `any` |

**Returns:** `object`

___
<a id="networkstatus"></a>

###  NetworkStatus

**Ƭ NetworkStatus**: * "ready" &#124; "loading" &#124; "failed" &#124; "success"
*

*Defined in [index.ts:29](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/index.ts#L29)*

___
<a id="normalizeresult"></a>

###  NormalizeResult

**Ƭ NormalizeResult**: * `string` &#124; `number` &#124; `Array`< `string` &#124; `number`>
*

*Defined in [index.ts:31](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/index.ts#L31)*

___
<a id="requesthandler"></a>

###  RequestHandler

**Ƭ RequestHandler**: *`function`*

*Defined in [request.ts:8](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/request.ts#L8)*

#### Type declaration
▸(url: *`string`*, requestProperties?: *`RequestInit`*): `Promise`<[HandledResponse](interfaces/handledresponse.md)>

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |
| `Optional` requestProperties | `RequestInit` |

**Returns:** `Promise`<[HandledResponse](interfaces/handledresponse.md)>

___
<a id="withapidatachildprops"></a>

###  WithApiDataChildProps

**Ƭ WithApiDataChildProps**: *`object`*

*Defined in [withApiData.tsx:22](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/withApiData.tsx#L22)*

#### Type declaration

___

## Variables

<a id="__dev__"></a>

### `<Const>` __DEV__

**● __DEV__**: *`boolean`* =  process.env.NODE_ENV === 'development'

*Defined in [request.ts:1](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/request.ts#L1)*
*Defined in [reducer.ts:41](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L41)*

___
<a id="defaultrequesthandler"></a>

### `<Const>` defaultRequestHandler

**● defaultRequestHandler**: *[RequestHandler](#requesthandler)* =  ((url, requestProperties = {}) => {
    if (__DEV__) {
        console.log('Executing request: ' + url);
    }

    requestProperties.headers = getHeaders(requestProperties);

    if (typeof requestProperties.body !== 'string') {
        requestProperties.body = JSON.stringify(requestProperties.body);
    }
    return new Promise((resolve, reject) => {
        const onRequestSuccess = (response: Response) => {
            if (__DEV__) {
                console.log(`Request successful (${response.status}): ` + url);
            }

            if (response.status === 204 || response.headers.get('content-length') === '0') {
                // 204: no content
                resolve({
                    response,
                    body: {}
                });
            } else {
                response.json()
                    .then(
                        (body: any) => resolve({
                            response,
                            body
                        }),
                        (err) => {
                            if (__DEV__) {
                                console.warn(`Could not parse JSON response of ${url}`);
                            }
                            resolve({
                                response,
                                body: err
                            });
                        }
                    );
            }
        };

        const onRequestError = (error: any) => {
            if (__DEV__) {
                console.log(`Request failed: ${url}`);
                console.error(error);
            }

            reject(error);
        };

        fetch(url, requestProperties).then(onRequestSuccess, onRequestError);
    });
})

*Defined in [request.ts:43](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/request.ts#L43)*

___
<a id="requestfunction"></a>

### `<Let>` requestFunction

**● requestFunction**: *`function`* =  Request

*Defined in [reducer.ts:138](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L138)*

#### Type declaration
▸(url: *`string`*, requestProperties?: *`RequestInit`*): `Promise`<[HandledResponse](interfaces/handledresponse.md)>

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |
| `Optional` requestProperties | `RequestInit` |

**Returns:** `Promise`<[HandledResponse](interfaces/handledresponse.md)>

___

## Functions

<a id="addentities"></a>

### `<Const>` addEntities

▸ **addEntities**(entities: *[Entities](interfaces/entities.md)*, newEntities: *[Entities](interfaces/entities.md)*): [Entities](interfaces/entities.md)

*Defined in [reducer.ts:250](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L250)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| entities | [Entities](interfaces/entities.md) |
| newEntities | [Entities](interfaces/entities.md) |

**Returns:** [Entities](interfaces/entities.md)

___
<a id="afterrehydrate"></a>

### `<Const>` afterRehydrate

▸ **afterRehydrate**(): [ApiDataAfterRehydrateAction](interfaces/apidataafterrehydrateaction.md)

*Defined in [reducer.ts:468](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L468)*

Call this after you've re-hydrated the store when using redux-persist or any other method of persisting and restoring the entire apiData state. This is needed to reset loading statuses.

**Returns:** [ApiDataAfterRehydrateAction](interfaces/apidataafterrehydrateaction.md)

___
<a id="apidatafail"></a>

### `<Const>` apiDataFail

▸ **apiDataFail**(requestKey: *`string`*, errorBody: *`any`*, response?: *`Response`*): [ApiDataFailAction](interfaces/apidatafailaction.md)

*Defined in [reducer.ts:313](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L313)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| requestKey | `string` |
| errorBody | `any` |
| `Optional` response | `Response` |

**Returns:** [ApiDataFailAction](interfaces/apidatafailaction.md)

___
<a id="apidatasuccess"></a>

### `<Const>` apiDataSuccess

▸ **apiDataSuccess**(requestKey: *`string`*, endpointConfig: *[ApiDataEndpointConfig](interfaces/apidataendpointconfig.md)*, response: *`Response`*, body: *`any`*): [ApiDataSuccessAction](interfaces/apidatasuccessaction.md)

*Defined in [reducer.ts:299](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L299)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| requestKey | `string` |
| endpointConfig | [ApiDataEndpointConfig](interfaces/apidataendpointconfig.md) |
| response | `Response` |
| body | `any` |

**Returns:** [ApiDataSuccessAction](interfaces/apidatasuccessaction.md)

___
<a id="cacheexpired"></a>

### `<Const>` cacheExpired

▸ **cacheExpired**(endpointConfig: *[ApiDataEndpointConfig](interfaces/apidataendpointconfig.md)*, request: *[ApiDataRequest](interfaces/apidatarequest.md)*): `boolean`

*Defined in [reducer.ts:527](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L527)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| endpointConfig | [ApiDataEndpointConfig](interfaces/apidataendpointconfig.md) |
| request | [ApiDataRequest](interfaces/apidatarequest.md) |

**Returns:** `boolean`

___
<a id="composeconfigfn"></a>

### `<Const>` composeConfigFn

▸ **composeConfigFn**(endpointFn?: *`any`*, globalFunction?: *`any`*): `any`

*Defined in [reducer.ts:324](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L324)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` endpointFn | `any` |
| `Optional` globalFunction | `any` |

**Returns:** `any`

___
<a id="configureapidata"></a>

### `<Const>` configureApiData

▸ **configureApiData**(globalConfig: *[ApiDataGlobalConfig](interfaces/apidataglobalconfig.md)*, endpointConfig: *`object`*): [ConfigureApiDataAction](interfaces/configureapidataaction.md)

*Defined in [reducer.ts:291](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L291)*

Register your global and endpoint configurations. Make sure you do this before you mount any components using withApiData.

**Parameters:**

| Name | Type |
| ------ | ------ |
| globalConfig | [ApiDataGlobalConfig](interfaces/apidataglobalconfig.md) |
| endpointConfig | `object` |

**Returns:** [ConfigureApiDataAction](interfaces/configureapidataaction.md)

___
<a id="formaturl"></a>

### `<Const>` formatUrl

▸ **formatUrl**(url: *`string`*, params?: *[EndpointParams](interfaces/endpointparams.md)*): `string`

*Defined in [reducer.ts:261](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L261)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |
| `Optional` params | [EndpointParams](interfaces/endpointparams.md) |

**Returns:** `string`

___
<a id="getapidatarequest"></a>

### `<Const>` getApiDataRequest

▸ **getApiDataRequest**(apiDataState: *[ApiDataState](interfaces/apidatastate.md)*, endpointKey: *`string`*, params?: *[EndpointParams](interfaces/endpointparams.md)*): [ApiDataRequest](interfaces/apidatarequest.md)

*Defined in [reducer.ts:489](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L489)*

Selector to manually get a [ApiDataRequest](interfaces/apidatarequest.md). This value is automatically bind when using [withApiData](#withapidata). This selector can be useful for tracking request status when a request is triggered manually, like a POST after a button click.

**Parameters:**

| Name | Type |
| ------ | ------ |
| apiDataState | [ApiDataState](interfaces/apidatastate.md) |
| endpointKey | `string` |
| `Optional` params | [EndpointParams](interfaces/endpointparams.md) |

**Returns:** [ApiDataRequest](interfaces/apidatarequest.md)

___
<a id="getentity"></a>

### `<Const>` getEntity

▸ **getEntity**(apiDataState: *[ApiDataState](interfaces/apidatastate.md)*, schema: *`any`*, id: * `string` &#124; `number`*):  `any` &#124; `void`

*Defined in [reducer.ts:522](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L522)*

Selector for getting a single entity from normalized data.

**Parameters:**

| Name | Type |
| ------ | ------ |
| apiDataState | [ApiDataState](interfaces/apidatastate.md) |
| schema | `any` |
| id |  `string` &#124; `number`|

**Returns:**  `any` &#124; `void`

___
<a id="getheaders"></a>

### `<Const>` getHeaders

▸ **getHeaders**(requestProperties: *`RequestInit`*): `HeadersInit`

*Defined in [request.ts:18](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/request.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| requestProperties | `RequestInit` |

**Returns:** `HeadersInit`

___
<a id="getrequestkey"></a>

### `<Const>` getRequestKey

▸ **getRequestKey**(endpointKey: *`string`*, params?: *[EndpointParams](interfaces/endpointparams.md)*): `string`

*Defined in [reducer.ts:264](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L264)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| endpointKey | `string` | - |
| `Default value` params | [EndpointParams](interfaces/endpointparams.md) |  {} |

**Returns:** `string`

___
<a id="getresultdata"></a>

### `<Const>` getResultData

▸ **getResultData**(apiDataState: *[ApiDataState](interfaces/apidatastate.md)*, endpointKey: *`string`*, params?: *[EndpointParams](interfaces/endpointparams.md)*):  `any` &#124; `any`[] &#124; `void`

*Defined in [reducer.ts:497](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L497)*

Get the de-normalized result data of an endpoint, or undefined if not (yet) available. This value is automatically bind when using [withApiData](#withapidata). This selector can be useful for getting response responseBody values when a request is triggered manually, like a POST after a button click.

**Parameters:**

| Name | Type |
| ------ | ------ |
| apiDataState | [ApiDataState](interfaces/apidatastate.md) |
| endpointKey | `string` |
| `Optional` params | [EndpointParams](interfaces/endpointparams.md) |

**Returns:**  `any` &#124; `any`[] &#124; `void`

___
<a id="invalidateapidatarequest"></a>

### `<Const>` invalidateApiDataRequest

▸ **invalidateApiDataRequest**(endpointKey: *`string`*, params?: *[EndpointParams](interfaces/endpointparams.md)*): [InvalidateApiDataRequestAction](interfaces/invalidateapidatarequestaction.md)

*Defined in [reducer.ts:456](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L456)*

Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate a GET list request, which might need to include the newly created entity.

**Parameters:**

| Name | Type |
| ------ | ------ |
| endpointKey | `string` |
| `Optional` params | [EndpointParams](interfaces/endpointparams.md) |

**Returns:** [InvalidateApiDataRequestAction](interfaces/invalidateapidatarequestaction.md)

___
<a id="performapirequest"></a>

### `<Const>` performApiRequest

▸ **performApiRequest**(endpointKey: *`string`*, params?: *[EndpointParams](interfaces/endpointparams.md)*, body?: *`any`*): `(Anonymous function)`

*Defined in [reducer.ts:338](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L338)*

Manually trigger an request to an endpoint. Primarily used for any non-GET requests. For get requests it is preferred to use [withApiData](#withapidata).

**Parameters:**

| Name | Type |
| ------ | ------ |
| endpointKey | `string` |
| `Optional` params | [EndpointParams](interfaces/endpointparams.md) |
| `Optional` body | `any` |

**Returns:** `(Anonymous function)`
Always resolves, use request networkStatus to see if call was succeeded or not.

___
<a id="purgeapidata"></a>

### `<Const>` purgeApiData

▸ **purgeApiData**(): [PurgeApiDataAction](interfaces/purgeapidataaction.md)

*Defined in [reducer.ts:478](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L478)*

Remove all the requests and entities but keep the configurations. This can be usefull when creating a log out feature.

**Returns:** [PurgeApiDataAction](interfaces/purgeapidataaction.md)

___
<a id="recovernetworkstatus"></a>

### `<Const>` recoverNetworkStatus

▸ **recoverNetworkStatus**(networkStatus: *[NetworkStatus](#networkstatus)*): [NetworkStatus](#networkstatus)

*Defined in [reducer.ts:269](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L269)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| networkStatus | [NetworkStatus](#networkstatus) |

**Returns:** [NetworkStatus](#networkstatus)

___
<a id="recovernetworkstatuses"></a>

### `<Const>` recoverNetworkStatuses

▸ **recoverNetworkStatuses**(requests: *`object`*): `object`

*Defined in [reducer.ts:272](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L272)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| requests | `object` |

**Returns:** `object`

___
<a id="userequesthandler"></a>

### `<Const>` useRequestHandler

▸ **useRequestHandler**(requestHandler: *[RequestHandler](#requesthandler)*): `void`

*Defined in [reducer.ts:537](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L537)*

Use your own request function that calls the api and reads the responseBody response. Make sure it implements the [RequestHandler](#requesthandler) interface.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| requestHandler | [RequestHandler](#requesthandler) |   |

**Returns:** `void`

___
<a id="withapidata"></a>

###  withApiData

▸ **withApiData**<`TChildProps`,`TPropNames`>(bindings: *`object`*, getParams?: *[GetParams](#getparams)<`TPropNames`>*): `(Anonymous function)`

*Defined in [withApiData.tsx:50](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/withApiData.tsx#L50)*

Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped component will get an ApiDataBinding added to each property key of the bindings param.
*__example__*: withApiData({ wishList: 'getWishLists', settings: 'getSettings' }, (ownProps, state) => ({ wishList: { projectSlug: ownProps.match.params.projectSlug, env: ownProps.match.params.env }, settings: { projectSlug: ownProps.match.params.projectSlug, env: ownProps.match.params.env } }))

**Type parameters:**

#### TChildProps :  [WithApiDataChildProps](#withapidatachildprops)<`TPropNames`>
#### TPropNames :  `string`
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| bindings | `object` |  maps prop names to endpoint keys |
| `Optional` getParams | [GetParams](#getparams)<`TPropNames`> |

**Returns:** `(Anonymous function)`
- Function to wrap your component

___

## Object literals

<a id="defaultstate"></a>

### `<Const>` defaultState

**defaultState**: *`object`*

*Defined in [reducer.ts:62](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L62)*

<a id="defaultstate.endpointconfig"></a>

####  endpointConfig

**● endpointConfig**: *`object`*

*Defined in [reducer.ts:64](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L64)*

#### Type declaration

___
<a id="defaultstate.entities"></a>

####  entities

**● entities**: *`object`*

*Defined in [reducer.ts:66](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L66)*

#### Type declaration

___
<a id="defaultstate.globalconfig"></a>

####  globalConfig

**● globalConfig**: *`object`*

*Defined in [reducer.ts:63](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L63)*

#### Type declaration

___
<a id="defaultstate.requests"></a>

####  requests

**● requests**: *`object`*

*Defined in [reducer.ts:65](https://github.com/oberonamsterdam/react-api-data/blob/a5bda9f/src/reducer.ts#L65)*

#### Type declaration

___

___

