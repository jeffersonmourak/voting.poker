import {isArray, isNumber, isString} from 'lodash';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
const request = <T>(url: string, method: Method, data?: T) => {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    // eslint-disable-next-line no-undef
    const config: RequestInit = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    return fetch(`${process.env.NEXT_PUBLIC_REACT_APP_API_URL}${url}`, config);
};

// @ts-ignore
const parseResponseData = (data: Record<string | number, any>) => {
    if (isArray(data)) {
        return data.map((item) => parseResponseData(item));
    }

    if (isString(data) || isNumber(data)) {
        return data;
    }

    const keys = Object.keys(data);

    const parsedReponse: Record<string, any> = {};

    keys.forEach((key) => {
        if (key.includes('_at') || key === 'date') {
            parsedReponse[key] = new Date(data[key]);
        } else if (key.includes('_id')) {
            if (data[key]) {
                parsedReponse[key] = data[key].toString();
            }
        } else if (data[key] === null || data[key] === undefined) {
            parsedReponse[key] = null;
        } else {
            parsedReponse[key] = parseResponseData(data[key]);
        }
    });

    return parsedReponse;
};

export const post = async <T>(url: string, data: T) => {
    const response = await request(url, 'POST', data);

    const responseData = await response.json();

    if (response.status === 200) {
        return responseData;
    } else {
        throw new Error(responseData.error);
    }
};

export const put = async <T>(url: string, data: T) => {
    const response = await request(url, 'PUT', data);

    const responseData = await response.json();

    if (response.status === 200) {
        return responseData;
    } else {
        throw new Error(responseData.error);
    }
};

export const get = async (url: string) => {
    const response = await request(url, 'GET');

    const responseData = await response.json();

    if (response.status === 200) {
        return parseResponseData(responseData);
    } else {
        throw new Error(responseData.error);
    }
};

export const remove = async (url: string) => {
    const response = await request(url, 'DELETE');

    const responseData = await response.json();

    if (response.status === 200) {
        return parseResponseData(responseData);
    } else {
        throw new Error(responseData.error);
    }
};

export default request;
