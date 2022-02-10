const unicodes = (s: string, prefix: string = '') => s.replace(/(^|-)/g, `$1\\u${prefix}`).replace(/,/g, `\\u${prefix}`);

const symbols = unicodes('20-26,28-2F,3A-40,5B-60,7B-7E,A0-BF,D7,F7', '00');
const lowers = `a-z${unicodes('DF-F6,F8-FF', '00')}`;
const uppers = `A-Z${unicodes('C0-D6,D8-DE', '00')}`;
const impropers = 'A|An|And|As|At|But|By|En|For|If|In|Of|On|Or|The|To|Vs?\\.?|Via';

const regexps = {
    capitalize: new RegExp(`(^|[${symbols}])([${lowers}])`, 'g'),
    pascal: new RegExp(`(^|[${symbols}])+([${lowers}${uppers}])`, 'g'),
    fill: new RegExp(`[${symbols}]+(.|$)`, 'g'),
    sentence: new RegExp(`(^\\s*|[\\?\\!\\.]+"?\\s+"?|,\\s+")([${lowers}])`, 'g'),
    improper: new RegExp(`\\b(${impropers})\\b`, 'g'),
    relax: new RegExp(`([^${uppers}])([${uppers}]*)([${uppers}])(?=[^${uppers}]|$)`, 'g'),
    upper: new RegExp(`^[^${lowers}]+$`),
    hole: /[^\s]\s[^\s]/,
    apostrophe: /'/g,
    room: new RegExp(`[${symbols}]`),
};

const deapostrophe = (s: string) => s.replace(regexps.apostrophe, '');

const up = String.prototype.toUpperCase;
const low = String.prototype.toLowerCase;

const fill = (sinput: string, fillWith?: string, isDeapostrophe = false) => {
    let s = sinput;
    if (fillWith != null) {
        s = s.replace(regexps.fill, (m, next) => (next ? fillWith + next : ''));
    }
    if (isDeapostrophe) {
        s = deapostrophe(s);
    }
    return s;
};

const decap = (s: string) => low.call(s.charAt(0)) + s.slice(1);

const relax = (m: string, before: string, acronym: string | undefined, caps: string) => `${before} ${acronym ? `${acronym} ` : ''}${caps}`;

const prep = (sinput: string, isFill = false, isPascal = false, isUpper = false) => {
    let s = sinput == null ? '' : `${sinput}`; // force to string
    if (!isUpper && regexps.upper.test(s)) {
        s = low.call(s);
    }
    if (!isFill && !regexps.hole.test(s)) {
        const holey = fill(s, ' ');
        if (regexps.hole.test(holey)) {
            s = holey;
        }
    }
    if (!isPascal && !regexps.room.test(s)) {
        s = s.replace(regexps.relax, relax);
    }
    return s;
};

export const pascal = (s: string) =>
    fill(
        prep(s, false, true).replace(regexps.pascal, (m: string, border: string, letter: string) => up.call(letter)),
        '',
        true
    );

export const camel = (s: string) => decap(pascal(s));
