import { isArray, isNumber, isString } from 'lodash';
import newGithubIssueUrl from 'new-github-issue-url';
import { errorToast, generateErrorWithLink, warningToast } from './toast';

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

  return fetch(
    `${process.env.NEXT_PUBLIC_REACT_APP_API_URL || ''}${url}`,
    config
  );
};

const displayErrorToast = (error: string, response: Response) => {
  const { status, url } = response;

  if (status >= 400 && status < 500) {
    warningToast(error);
  }

  if (status >= 500) {
    const issueUrl = newGithubIssueUrl({
      user: 'jeffersonmourak',
      repo: 'voting.poker',
      title: `Error 500 in production - ${error}`,
      labels: ['bug'],
      body: `
## SUMMARY
<!-- PLEASE DESCRIBE WHAT HAPPEND -->

## REQUEST DATA
- Url: ${url}
- User-Agent: ${window.navigator.userAgent}
## Error Message
\`\`\`
${error}
\`\`\``,
    });
    errorToast(
      generateErrorWithLink(
        'Something went wrong. Please try again later.',
        issueUrl
      )
    );
  }
};

// @ts-ignore
const parseResponseData = (data: Record<string | number, any>): any => {
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
    displayErrorToast(responseData.error, response);
    throw new Error(responseData.error);
  }
};

export const put = async <T>(url: string, data: T) => {
  const response = await request(url, 'PUT', data);

  const responseData = await response.json();

  if (response.status === 200) {
    return responseData;
  } else {
    displayErrorToast(responseData.error, response);
    throw new Error(responseData.error);
  }
};

export const get = async (url: string) => {
  const response = await request(url, 'GET');

  const responseData = await response.json();

  if (response.status === 200) {
    return parseResponseData(responseData);
  } else {
    displayErrorToast(responseData.error, response);
    throw new Error(responseData.error);
  }
};

export const remove = async (url: string) => {
  const response = await request(url, 'DELETE');

  const responseData = await response.json();

  if (response.status === 200) {
    return parseResponseData(responseData);
  } else {
    displayErrorToast(responseData.error, response);
    throw new Error(responseData.error);
  }
};

export default request;
