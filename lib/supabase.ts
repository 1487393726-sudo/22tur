import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kcsbevqufatbggrzjxkc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 检查配置是否有效
const isValidConfig = supabaseUrl && supabaseAnonKey && supabaseAnonKey !== '';

/**
 * 创建Supabase客户端实例
 */
export const createSupabaseClient = () => {
  if (!isValidConfig) {
    console.warn('⚠️ Supabase配置不完整，请检查环境变量');
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
};

/**
 * 默认Supabase客户端实例
 */
export const supabase = createSupabaseClient();

/**
 * 检查Supabase环境配置
 */
export const checkSupabaseConfig = () => {
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL 未配置');
    return false;
  }
  
  if (!supabaseAnonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 未配置');
    return false;
  }
  
  if (supabaseAnonKey === 'your-anon-key') {
    console.error('❌ 请使用真实的Supabase Anonymous Key');
    return false;
  }
  
  return true;
};

/**
 * 获取当前用户会话
 */
export const getCurrentSession = async () => {
  if (!supabase) return null;
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('获取会话失败:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('获取会话异常:', error);
    return null;
  }
};

/**
 * 监听认证状态变化
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  if (!supabase) return { data: { subscription: null } };
  
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * 用户注册
 */
export const signUp = async (email: string, password: string, metadata?: any) => {
  if (!supabase) throw new Error('Supabase客户端未初始化');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('注册失败:', error);
    return { success: false, error };
  }
};

/**
 * 用户登录
 */
export const signIn = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase客户端未初始化');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('登录失败:', error);
    return { success: false, error };
  }
};

/**
 * 用户登出
 */
export const signOut = async () => {
  if (!supabase) throw new Error('Supabase客户端未初始化');
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('登出失败:', error);
    return { success: false, error };
  }
};

/**
 * 重置密码
 */
export const resetPassword = async (email: string) => {
  if (!supabase) throw new Error('Supabase客户端未初始化');
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('重置密码失败:', error);
    return { success: false, error };
  }
};

// 数据库操作辅助函数
export const db = {
  /**
   * 查询数据
   */
  select: async (table: string, columns: string = '*', filters: any = {}) => {
    if (!supabase) throw new Error('Supabase客户端未初始化');
    
    let query = supabase.from(table).select(columns);
    
    // 应用过滤器
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  
  /**
   * 插入数据
   */
  insert: async (table: string, data: any) => {
    if (!supabase) throw new Error('Supabase客户端未初始化');
    
    const { data: result, error } = await supabase.from(table).insert(data);
    if (error) throw error;
    return result;
  },
  
  /**
   * 更新数据
   */
  update: async (table: string, data: any, filters: any) => {
    if (!supabase) throw new Error('Supabase客户端未初始化');
    
    let query = supabase.from(table).update(data);
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data: result, error } = await query;
    if (error) throw error;
    return result;
  },
  
  /**
   * 删除数据
   */
  delete: async (table: string, filters: any) => {
    if (!supabase) throw new Error('Supabase客户端未初始化');
    
    let query = supabase.from(table).delete();
    
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

export default {
  supabase,
  createSupabaseClient,
  checkSupabaseConfig,
  getCurrentSession,
  onAuthStateChange,
  signUp,
  signIn,
  signOut,
  resetPassword,
  db
};