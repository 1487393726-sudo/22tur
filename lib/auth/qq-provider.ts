// lib/auth/qq-provider.ts
// QQ OAuth 提供商 - Custom QQ Provider for NextAuth.js

import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface QQProfile {
  ret: number;
  msg: string;
  is_lost: number;
  nickname: string;
  gender: string;
  gender_type: number;
  province: string;
  city: string;
  year: string;
  constellation: string;
  figureurl: string;
  figureurl_1: string;
  figureurl_2: string;
  figureurl_qq: string;
  figureurl_qq_1: string;
  figureurl_qq_2: string;
  is_yellow_vip: string;
  vip: string;
  yellow_vip_level: string;
  level: string;
  is_yellow_year_vip: string;
}

export interface QQProviderConfig extends OAuthUserConfig<QQProfile> {
  clientId: string;
  clientSecret: string;
}

/**
 * QQ OAuth Provider for NextAuth.js
 * 
 * Documentation: https://wiki.connect.qq.com/
 */
export default function QQProvider(
  options: QQProviderConfig
): OAuthConfig<QQProfile> {
  return {
    id: "qq",
    name: "QQ",
    type: "oauth",
    authorization: {
      url: "https://graph.qq.com/oauth2.0/authorize",
      params: {
        client_id: options.clientId,
        redirect_uri: options.callbackUrl,
        response_type: "code",
        scope: "get_user_info",
        state: "STATE",
      },
    },
    token: {
      url: "https://graph.qq.com/oauth2.0/token",
      async request({ client, params, checks, provider }) {
        // QQ returns data in a special format: access_token=xxx&expires_in=xxx&refresh_token=xxx
        const response = await fetch(
          `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${options.clientId}&client_secret=${options.clientSecret}&code=${params.code}&redirect_uri=${encodeURIComponent(options.callbackUrl || '')}&fmt=json`
        );
        const data = await response.json();
        
        if (data.error) {
          throw new Error(`QQ token error: ${data.error_description}`);
        }
        
        // Get OpenID
        const openIdResponse = await fetch(
          `https://graph.qq.com/oauth2.0/me?access_token=${data.access_token}&fmt=json`
        );
        const openIdData = await openIdResponse.json();
        
        if (openIdData.error) {
          throw new Error(`QQ openid error: ${openIdData.error_description}`);
        }
        
        return {
          tokens: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
            token_type: "Bearer",
            id_token: openIdData.openid, // Store openid as id_token
          },
        };
      },
    },
    userinfo: {
      url: "https://graph.qq.com/user/get_user_info",
      async request({ tokens, provider }) {
        const response = await fetch(
          `https://graph.qq.com/user/get_user_info?access_token=${tokens.access_token}&oauth_consumer_key=${options.clientId}&openid=${tokens.id_token}`
        );
        const profile = await response.json();
        
        if (profile.ret !== 0) {
          throw new Error(`QQ userinfo error: ${profile.msg}`);
        }
        
        // Attach openid to profile for later use
        (profile as any).openid = tokens.id_token;
        
        return profile;
      },
    },
    profile(profile) {
      return {
        id: (profile as any).openid,
        name: profile.nickname,
        email: null, // QQ doesn't provide email
        image: profile.figureurl_qq_2 || profile.figureurl_qq_1 || profile.figureurl_2,
      };
    },
    style: {
      logo: "https://connect.qq.com/favicon.ico",
      logoDark: "https://connect.qq.com/favicon.ico",
      bg: "#12B7F5",
      text: "#fff",
      bgDark: "#12B7F5",
      textDark: "#fff",
    },
    options,
  };
}

/**
 * Generate QQ OAuth authorization URL
 */
export function generateQQAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string = "STATE"
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "get_user_info",
    state: state,
  });
  
  return `https://graph.qq.com/oauth2.0/authorize?${params.toString()}`;
}

/**
 * Exchange QQ authorization code for access token
 */
export async function exchangeQQCode(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
}> {
  const response = await fetch(
    `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}&fmt=json`
  );
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`QQ token exchange failed: ${data.error_description}`);
  }
  
  return data;
}

/**
 * Get QQ OpenID from access token
 */
export async function getQQOpenId(
  accessToken: string
): Promise<{ client_id: string; openid: string }> {
  const response = await fetch(
    `https://graph.qq.com/oauth2.0/me?access_token=${accessToken}&fmt=json`
  );
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`QQ openid failed: ${data.error_description}`);
  }
  
  return data;
}

/**
 * Get QQ user profile
 */
export async function getQQUserProfile(
  accessToken: string,
  clientId: string,
  openid: string
): Promise<QQProfile> {
  const response = await fetch(
    `https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${clientId}&openid=${openid}`
  );
  
  const data = await response.json();
  
  if (data.ret !== 0) {
    throw new Error(`QQ userinfo failed: ${data.msg}`);
  }
  
  return data;
}
