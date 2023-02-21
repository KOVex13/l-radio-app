import { app as settings } from '../../settings';
import { REST, RESTError } from './rest';

export default class extends REST {
    static get settings() {
        return settings;
    }
    /*
    static doLogin(params) {
        return this._post('handler', {}, { handler: 'Login', ...params }).then((data) => {
            return data;
        }).catch((error) => {
            console.log(error);
            throw new RESTError(error, 'Не удалось авторизоваться');
        });
    }

    static getUser(params) {
        return this._post(`get_user`, {}, params).then((data) => {
            return data;
        }).catch((error) => {
            throw new RESTError(error, 'Не удалось получить пользователя');
        });
    }

    static getTopics(params) {
        return this._post(`get_topics`, {}, params).then((data) => {
            return data;
        }).catch((error) => {
            throw new RESTError(error, 'Не удалось получить список тем');
        });
    }

    static getTopic(params) {
        return this._post(`get_topic`, {}, params).then((data) => {
            return data;
        }).catch((error) => {
            throw new RESTError(error, 'Не удалось получить тему');
        });
    }*/
}
