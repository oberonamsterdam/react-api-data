## Methods

### `<Const>` configureApiData

▸ **configureApiData**(globalConfig: *[ApiDataGlobalConfig](interfaces/apidataglobalconfig.md)*, endpointConfig: *`object`*): [ConfigureApiDataAction](interfaces/configureapidataaction.md)

###  withApiData

▸ **withApiData**<`TChildProps`,`TPropNames`>(bindings: *`object`*, getParams?: *[GetParams](#getparams)<`TPropNames`>*): `(Anonymous function)`

Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped component will get an ApiDataBinding added to each property key of the bindings param.

*__example__*: withApiData({ wishList: 'getWishLists', settings: 'getSettings' }, (ownProps, state) => ({ wishList: { projectSlug: ownProps.match.params.projectSlug, env: ownProps.match.params.env }, settings: { projectSlug: ownProps.match.params.projectSlug, env: ownProps.match.params.env } }))

### `<Const>` configureApiData

▸ **configureApiData**(globalConfig: *[ApiDataGlobalConfig](../interfaces/_index_.apidataglobalconfig.md)*, endpointConfig: *`object`*): [ConfigureApiDataAction](../interfaces/_actions_configureapidata_.configureapidataaction.md)

Register your global and endpoint configurations. Make sure you do this before you mount any components using withApiData.

**Parameters:**

| Name | Type |
| ------ | ------ |
| globalConfig | [ApiDataGlobalConfig](../interfaces/_index_.apidataglobalconfig.md) |
| endpointConfig | `object` |

**Returns:** [ConfigureApiDataAction](../interfaces/_actions_configureapidata_.configureapidataaction.md)

###  withApiData

▸ **withApiData**<`TChildProps`,`TPropNames`>(bindings: *`object`*, getParams?: *[GetParams](_withapidata_.md#getparams)<`TPropNames`>*): `(Anonymous function)`

*Defined in [withApiData.tsx:58](https://github.com/oberonamsterdam/react-api-data/blob/09029cc/src/withApiData.tsx#L58)*

Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped component will get an ApiDataBinding added to each property key of the bindings param.
*__example__*: withApiData({ wishList: 'getWishLists', settings: 'getSettings' }, (ownProps, state) => ({ wishList: { projectSlug: ownProps.match.params.projectSlug, env: ownProps.match.params.env }, settings: { projectSlug: ownProps.match.params.projectSlug, env: ownProps.match.params.env } }))

**Type parameters:**

#### TChildProps :  [WithApiDataChildProps](_withapidata_.md#withapidatachildprops)<`TPropNames`>
#### TPropNames :  `string`
**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| bindings | `object` |  maps prop names to endpoint keys |
| `Optional` getParams | [GetParams](_withapidata_.md#getparams)<`TPropNames`> |

**Returns:** `(Anonymous function)`
- Function to wrap your component


* [performApiRequest](#performapirequest)
* [invalidateApiDataRequest](#invalidateapidatarequest)
* [afterRehydrate](#afterrehydrate)
* [purgeApiData](#purgeapidata)
* [useRequestHandler](#userequesthandler)

## Selectors

## Types and Interfaces