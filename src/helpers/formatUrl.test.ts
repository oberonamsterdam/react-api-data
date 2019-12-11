import {formatUrl} from './formatUrl';

describe('formatUrl', () => {
    it('should inject params when specified in URL and add remaining params to querystring', () => {
        expect(formatUrl('https://test.com/:category/:id', {})).toBe('https://test.com//');
        expect(formatUrl('https://test.com/:category/:id', {category: 1, id: 2})).toBe('https://test.com/1/2');
        expect(formatUrl('https://test.com/:category/:id', {category: 1, id: 2, filter: 'abc'})).toBe('https://test.com/1/2?filter=abc');
        expect(formatUrl('https://test.com/?fixed=x', {q: 'abc'})).toBe('https://test.com/?fixed=x&q=abc');
        expect(formatUrl('https://test.com/', {q: 'abc'})).toBe('https://test.com/?q=abc');
    });

    it('should encode special chars in params', () => {
        expect(formatUrl('https://www.test.com/?:keyword', {keyword: 'search keyword'})).toBe('https://www.test.com/?search%20keyword');
        expect(formatUrl('https://www.test.com/', {keyword: 'search keyword'})).toBe('https://www.test.com/?keyword=search%20keyword');
    });

});
