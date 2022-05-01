import React from 'react';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import io from 'socket.io-client';
import { currentUser as queryCurrentUser } from './services/open-admin/api';
import {requestInterceptor, responseInterceptor} from "@/utils/request";

const loginPath = '/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  socket?: any;
}> {
  const fetchUserInfo = async () => {
    try {
      const currentUser = await queryCurrentUser();
      return currentUser;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  // 如果是登录页面，不执行(页面刷新时执行)
  if (history.location.pathname !== loginPath) {
    const currentUser: any = await fetchUserInfo();
    if(currentUser){
      const socket = io('http://localhost:8442',{
      transports: ["websocket"],
      query: { userId: currentUser.id},
      });
      return {
        fetchUserInfo,
        currentUser,
        socket,
        settings: {},
      };
    }
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

export const request: RequestConfig = {
  requestInterceptors: [requestInterceptor],
  responseInterceptors: [responseInterceptor],
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: '权限管理系统',

    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};
