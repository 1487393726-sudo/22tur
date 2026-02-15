// lib/auth/wechat-provider.ts
// 微信 OAuth 提供商 - Custom WeChat Provider for NextAuth.js

import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface WeChatProfile {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

export interface WeChatProviderConfig extends OAuthUserConfig<WeChatProfile> {
  appId: string;
  appSecret: string;
}

/**
 * WeChat OAuth Provider for NextAuth.js
 * 
 * Documentation: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
 */
export default function WeChatProvider(
  options: WeChatProviderConfig
): OAuthConfig<WeChatProfile> {
  return {
    id: "wechat",
    name: "WeChat",
    type: "oauth",
    authorization: {
      url: "https://open.weixin.qq.com/connect/qrconnect",
      params: {
        appid: options.appId,
        redirect_uri: options.callbackUrl,
        response_type: "code",
        scope: "snsapi_login",
        state: "STATE",
      },
    },
    token: {
      url: "https://api.weixin.qq.com/sns/oauth2/access_token",
      async request({ client, params, checks, provider }) {
        const response = await fetch(
          `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${options.appId}&secret=${options.appSecret}&code=${params.code}&grant_type=authorization_code`
        );
        const tokens = await response.json();
        
        if (tokens.errcode) {
          throw new Error(`WeChat token error: ${tokens.errmsg}`);
        }
        
        return {
          tokens: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
            token_type: "Bearer",
            id_token: tokens.openid, // Store openid as id_token
          },
        };
      },
    },
    userinfo: {
      url: "https://api.weixin.qq.com/sns/userinfo",
      async request({ tokens, provider }) {
        const response = await fetch(
          `https://api.weixin.qq.com/sns/userinfo?access_token=${tokens.access_token}&openid=${tokens.id_token}&lang=zh_CN`
        );
        const profile = await response.json();
        
        if (profile.errcode) {
          throw new Error(`WeChat userinfo error: ${profile.errmsg}`);
        }
        
        return profile;
      },
    },
    profile(profile) {
      return {
        id: profile.unionid || profile.openid,
        name: profile.nickname,
        email: null, // WeChat doesn't provide email
        image: profile.headimgurl,
      };
    },
    style: {
      logo: "https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico",
      logoDark: "https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico",
      bg: "#07C160",
      text: "#fff",
      bgDark: "#07C160",
      textDark: "#fff",
    },
    options,
  };
}

/**
 * Generate WeChat OAuth authorization URL
 */
export function generateWeChatAuthUrl(
  appId: string,
  redirectUri: string,
  state: string = "STATE"
): string {
  const params = new URLSearchParams({
    appid: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "snsapi_login",
    state: state,
  });
  
  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
}

/**
 * Exchange WeChat authorization code for access token
 */
export async function exchangeWeChatCode(
  appId: string,
  appSecret: string,
  code: string
): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
}> {
  const response = await fetch(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  );
  
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(`WeChat token exchange failed: ${data.errmsg}`);
  }
  
  return data;
}

/**
 * Get WeChat user profile
 */
export async function getWeChatUserProfile(
  accessToken: string,
  openid: string
): Promise<WeChatProfile> {
  const response = await fetch(
    `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`
  );
  
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(`WeChat userinfo failed: ${data.errmsg}`);
  }
  
  return data;
}
