const ajax = {
    timeout: 45000,
    responseType: 'json',
    responseEncoding: 'utf8',
    withCredentials: true
};

const serviceUrl = {
    url: 'https://support.flexites.org',
    localPath: 'https://support.flexites.org',
    port: '80',
    api: '/hub',
    onLocal: false
}

let urlPath = `${serviceUrl.url}${serviceUrl.api}`;

const app = {
    url: `${urlPath}`,
};

const cache = {
    storage: 'sessionStorage'
};

export {
    ajax,
    app,
};