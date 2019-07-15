import { getRequestKey } from './getRequestKey';

describe('getRequestKey', () => {
    test('endpoint with no params', () => {
        expect(getRequestKey('api', { })).toBe('api/');
    });
    test('endpoint with some params', () => {
        expect(getRequestKey('api', { id: 1, title: 'new title' })).toBe('api/id=1&title=new title');
    });
    test('endpoint with some params with instance', () => {
        expect(getRequestKey('api', { id: 1, title: 'new title' }, 'newInstance')).toBe('api/id=1&title=new title#newInstance');
    });
});