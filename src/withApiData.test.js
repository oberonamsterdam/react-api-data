import { checkIfRequestChanged } from './withApiData';
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

const oldState = {
    globalConfig: {},
    endpointConfig: {},
    requests: {
        'getData': {
            networkStatus: 'success'
        },
        'oberon/one=one&two=two': {
            networkStatus: 'failed'
        }
    },
    entities: {}
};

const newState = {
    globalConfig: {},
    endpointConfig: {},
    requests: {
        'getData': {
            networkStatus: 'ready'
        },
        'oberon/one=one&two=two': {
            networkStatus: 'failed'
        }
    },
    entities: {}
};

// const newApiState =
//     {
//         globalConfig: {},
//         endpointConfig: {
//             'getData':
//                 {
//                     url: 'getData/',
//                     method: 'GET'
//                 }},
//         requests: {
//             'getData': {
//                 networkStatus: 'ready'
//             },
//             'oberon/one=one&two=two': {
//                 networkStatus: 'failed'
//             }
//         },
//         entities: {}
//     }

const bindings = {
    data: 'getData'
}

const oldProps = {
    apiData: oldState,
}

const newProps = {
    apiData: newState,
}

// jest.mock('./withApiData');
//
// const withApiDataHoc = withApiData;
// const testComponent = (props) => {
//     expect(props).toEqual(bindings);
// }
test('the params have been changed', () => {
    const testOne = checkIfRequestChanged(newProps, oldProps, bindings, 'getData');
        expect(testOne).toBe(true);
    //     const spy = jest.spyOn(withApiData.prototype, 'performApiRequest');
    //     withApiDataHoc(bindings);
    //     expect(spy).toHaveBeenCalled();
    //
    // });
});