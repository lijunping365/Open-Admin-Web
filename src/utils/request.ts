import type { RequestInterceptor, ResponseInterceptor } from 'umi-request';
import { history } from 'umi';
import { getAccessToken, getRefreshToken } from '@/utils/cache';
import { onRefreshToken } from '@/utils/token';
import { notification } from 'antd';
import { HTTP_URL } from '../../config/env.config';

export const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

export const requestInterceptor: RequestInterceptor = (url, options) => {
  const o: any = options;
  o.headers = {
    ...options.headers,
    Authorization: `Bearer ${getAccessToken()}`
  };

  // 当返回 data 的值为 null 时会走 errorHandle
  o.skipErrorHandler = true;
  console.log("当前发出的请求是", `${HTTP_URL}${url}`)
  return {
    url: `${HTTP_URL}${url}`,
    options: o,
  };
};

export const responseInterceptor: ResponseInterceptor = async (response, options) => {
  if (response && response.status) {
    if (response.status === 200) {
      // 处理图片验证码
      if (response.url.includes('image')) {
        return response.clone().arrayBuffer();
      }

      const result: any = await response.clone().json();
      if (result && result.code === 200) {
        return result.data;
      }
      if (result && result.code === 403) {
        history.push('/exception/403');
      }
      if (result && result.code === 404) {
        history.push('/exception/404');
      }
      if (result && result.code === 500) {
        history.push('/exception/500');
      }
      return result;
    }
    if (response.status === 401) {
      // access_token 过期 和 refresh_token 过期都会抛出 401 异常，url 包含 oauth/token 说明就是 refresh_token 过期了。
      // 如果是 access_token 过期，则刷新 token
      if (getRefreshToken() && response.url.indexOf('oauth/token') === -1) {
        return onRefreshToken(response, options);
      }
      // 否则可能就是未登录或 refresh_token 过期抛出 401， 所以要重新登录
      history.push('/user/login');
    } else {
      const errorText = codeMessage[response.status] || response.statusText;
      const { status, url } = response;
      notification.error({
        message: `请求错误 ${status}: ${url}`,
        description: errorText,
      });
    }
  } else {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return response;
};
