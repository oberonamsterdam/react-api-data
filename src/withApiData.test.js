import { shouldPerformApiRequest } from './withApiData';
import { getRequestKey } from './reducer';
// import { performApiRequest } from './reducer';
// const apiState =
// {
//         globalConfig: {},
//         endpointConfig: {
//             'getData':
//             {
//                 url: 'getData/',
//                     method: 'GET'
//             }},
//         requests: {
//             'getData': {
//                 networkStatus: 'success'
//             },
//             'oberon/one=one&two=two': {
//                 networkStatus: 'failed'
//             }
//         },
//         entities: {}
// }

// const oldState = {
//     globalConfig: {},
//     endpointConfig: {},
//     requests: {
//         [getRequestKey('getData', {})]: {
//             networkStatus: 'success'
//         },
//         [getRequestKey('getData', {one: 'one'})]: {
//             networkStatus: 'failed'
//         }
//     },
//     entities: {}
// };

const getState = (binding, params, networkStatus) => (
    {
        globalConfig: {},
        endpointConfig: {},
        requests: {
            [getRequestKey(binding, params)]: {
                networkStatus: networkStatus
            }
        },
        entities: {}
    }
)

const getProps = (binding, params, networkStatus) => (
    {
        apiData: getState(binding, params, networkStatus),
        params: params
    }
)

const bindings = {
    getData: 'getData'
}

test('the request have been changed', () => {
    const oldPropsOne = {
        apiData: getState('getData', {}, 'success'),
        params: {}
    }

    const newPropsOne = {
        apiData: getState('getData', {}, 'ready'),
        params: {}
    }

    // getProps(endpoint, {}, 'success'), getProps(endpoint, {}, 'ready')
    const endpoint = 'getData'
    const testOne = shouldPerformApiRequest(newPropsOne, oldPropsOne, bindings, 'getData');
        expect(testOne).toBe(true);
    const testTwo = shouldPerformApiRequest(getProps(endpoint, {}, 'ready'), getProps(endpoint, {}, 'success'), bindings, 'getData');
        expect(testTwo).toBe(true);
    const testTree = shouldPerformApiRequest(getProps(endpoint, () => ({getData: {one: 'one'}}), 'ready'), getProps(endpoint, () => ({getData: {two: 'two'}}), 'success'), bindings, 'getData');
        expect(testTree).toBe(true);
    const testFour = shouldPerformApiRequest(getProps(endpoint, () => ({getData: {one: 'one'}}), 'ready'), getProps(endpoint, () => ({getData: {one: 'one'}}), 'success'), bindings, 'getData');
        expect(testFour).toBe(true);
    //     const spy = jest.spyOn(withApiData.prototype, 'performApiRequest');
    //     withApiDataHoc(bindings);
    //     expect(spy).toHaveBeenCalled();
    //
    // });
});