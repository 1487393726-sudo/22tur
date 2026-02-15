import cloudbase from "@cloudbase/js-sdk";

// 云开发环境ID，使用时请替换为您的环境ID
const ENV_ID = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID || "";

// 检查环境ID是否已配置
const isValidEnvId = ENV_ID && ENV_ID.trim() !== "" && ENV_ID !== "env-demo-placeholder";

// 动态导入 CloudBase SDK，避免 SSR 问题
const getCloudBase = () => {
  if (typeof window !== 'undefined') {
    return cloudbase;
  }
  return null;
};

/**
 * 初始化云开发实例
 * @param {Object} config - 初始化配置
 * @param {string} config.env - 环境ID，默认使用ENV_ID
 * @param {number} config.timeout - 超时时间，默认15000ms
 */
export const init = (config: { env?: string; timeout?: number } = {}) => {
  const cb = getCloudBase();
  if (!cb) {
    throw new Error("CloudBase SDK 仅支持客户端环境");
  }

  const appConfig = {
    env: config.env || ENV_ID,
    timeout: config.timeout || 15000,
  };

  return cb.init(appConfig);
};

/**
 * 默认的云开发实例
 */
let _app: any = null;
export const app = () => {
  if (_app) return _app;
  try {
    _app = init();
    return _app;
  } catch (error) {
    return null;
  }
};

/**
 * 检查环境配置是否有效
 */
export const checkEnvironment = () => {
  if (!isValidEnvId) {
    const message =
      "❌ 云开发环境ID未配置\n\n请按以下步骤配置：\n1. 创建 .env.local 文件\n2. 添加 NEXT_PUBLIC_CLOUDBASE_ENV_ID=your-env-id\n3. 替换为您的云开发环境ID\n4. 保存文件并重启开发服务器\n\n获取环境ID：https://console.cloud.tencent.com/tcb";
    console.error(message);
    return false;
  }
  return true;
};

/**
 * 确保用户已登录（如未登录会执行匿名登录）
 */
export const ensureLogin = async () => {
  // 检查环境配置
  if (!checkEnvironment()) {
    throw new Error("环境ID未配置");
  }

  const appInstance = app();
  if (!appInstance) {
    throw new Error("CloudBase 仅支持客户端环境");
  }

  const auth = appInstance.auth();

  try {
    // 检查当前登录状态
    const loginState = await auth.getLoginState();

    if (loginState) {
      // 已登录，返回当前状态
      console.log("用户已登录");
      return loginState;
    } else {
      // 未登录，执行登录
      console.log("用户未登录，执行登录...");

      // 默认采用匿名登录,
      await auth.signInAnonymously();
      // 也可以换成跳转SDK 内置的登录页面，支持账号密码登录/手机号登录/微信登录
      // await auth.toDefaultLoginPage()

      const loginState = await auth.getLoginState();
      return loginState;
    }
  } catch (error) {
    console.error("确保登录失败:", error);

    // 即使登录失败，也返回一个降级的登录状态，确保应用可以继续运行
    console.warn("使用降级登录状态，应用将以离线模式运行");
    return {
      isLoggedIn: true,
      user: {
        uid: "offline_" + Date.now(),
        isAnonymous: true,
        isOffline: true,
      },
    };
  }
};

/**
 * 退出登录（注意：匿名登录无法退出）
 */
export const logout = async () => {
  const appInstance = app();
  if (!appInstance) {
    throw new Error("CloudBase 仅支持客户端环境");
  }

  const auth = appInstance.auth();

  try {
    const loginScope = await auth.loginScope();

    if (loginScope === "anonymous") {
      console.warn("匿名登录状态无法退出");
      return { success: false, message: "匿名登录状态无法退出" };
    }

    await auth.signOut();
    return { success: true, message: "已成功退出登录" };
  } catch (error) {
    console.error("退出登录失败:", error);
    throw error;
  }
};

/**
 * 数据库操作封装
 */
export const db = () => {
  if (!checkEnvironment()) {
    throw new Error("CloudBase环境未配置");
  }
  const appInstance = app();
  if (!appInstance) {
    throw new Error("CloudBase 仅支持客户端环境");
  }
  return appInstance.database();
};

/**
 * 存储操作封装
 */
export const storage = () => {
  if (!checkEnvironment()) {
    throw new Error("CloudBase环境未配置");
  }
  const appInstance = app();
  if (!appInstance) {
    throw new Error("CloudBase 仅支持客户端环境");
  }
  return appInstance.storage();
};

/**
 * 云函数调用封装
 */
export const functions = () => {
  if (!checkEnvironment()) {
    throw new Error("CloudBase环境未配置");
  }
  const appInstance = app();
  if (!appInstance) {
    throw new Error("CloudBase 仅支持客户端环境");
  }
  return appInstance.functions();
};

export default {
  init,
  app,
  ensureLogin,
  logout,
  checkEnvironment,
  isValidEnvId,
  db,
  storage,
  functions,
  getCloudBase,
};