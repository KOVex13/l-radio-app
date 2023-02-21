import _keys from 'lodash/keys';
import moment from 'moment';
import 'moment/locale/ru';

function getCacheKey(ns, type, data) {
    let key = ns + ':' + type;
    if (data) {
        key += ':' + JSON.stringify(data, _keys(data).sort());
    }
    return key;
}

const helpers = {
    parseDate: (value, template) => {
        return moment(value).format();
    },

    formatDate: (value, template) => {
        return moment(value).format(template);
    },

    fromNow: (value, template) => {
        return moment(value).fromNow();
    },

    stringForNumber: (value, strings) => {
        let idx = 2;
        let num = value;
        if (num > 100) {
            num = num % 100;
        }
        if ((num < 10) || (num > 19)) {
            let z = num % 10;
            if (z == 1) {
                idx = 0;
            } else if ((z > 1) && (z < 5)) {
                idx = 1;
            }
        }
        return value + ' ' + strings[idx];
    },

    toPrice: (value, params) => {
        if (!params) {
            params = {};
        }
        value = value + '';
        let text = '';
        let l = value.length;
        let i = 0;
        let k;
        while (i < l) {
            k = ((i === 0) && (l % 3 > 0)) ? l % 3 : 3;
            if (i + k < l) {
                text = text + value.substr(i, k) + ' ';
            } else {
                text = text + value.substr(i, k);
            }
            i = i + k;
        }
        if (params.sign) {
            text = text + ' ' + params.sign;
        }
        return text;
    }
}

export default helpers;
