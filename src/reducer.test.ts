import { recoverNetworkStatuses } from './reducer';

test('recoverNetworkStatuses should return a new requests map with loading states reset to ready', () => {
    const input = {
        a: {
            networkStatus: 'ready'
        },
        b: {
            networkStatus: 'loading'
        },
        c: {
            networkStatus: 'success'
        },
        d: {
            networkStatus: 'failed'
        },
        e: {
            networkStatus: 'loading',
            lastCall: 123
        }

    } as any;

    const output = recoverNetworkStatuses(input);

    expect(output).not.toBe(input);
    expect(output).toEqual({
        a: {
            networkStatus: 'ready'
        },
        b: {
            networkStatus: 'ready'
        },
        c: {
            networkStatus: 'success'
        },
        d: {
            networkStatus: 'failed'
        },
        e: {
            networkStatus: 'ready',
            lastCall: 123
        }
    });
});
