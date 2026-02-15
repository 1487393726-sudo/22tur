/**
 * 速率限制器
 * 用于防止暴力破解和 DDoS 攻击
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// 清理过期的限制记录（每分钟清理一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

/**
 * 登录速率限制器
 * 限制: 每15分钟最多5次失败尝试
 */
export const loginRateLimiter = {
  async check(key: string) {
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    
    let entry = rateLimitMap.get(key);
    
    // 如果记录不存在或已过期，创建新记录
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + fifteenMinutes,
      };
      rateLimitMap.set(key, entry);
      return {
        success: true,
        remaining: 4,
        reset: entry.resetTime,
      };
    }
    
    // 增加计数
    entry.count++;
    
    // 检查是否超过限制
    const limit = 5;
    if (entry.count > limit) {
      return {
        success: false,
        remaining: 0,
        reset: entry.resetTime,
      };
    }
    
    return {
      success: true,
      remaining: limit - entry.count,
      reset: entry.resetTime,
    };
  },
  
  // 重置特定 key 的限制
  reset(key: string) {
    rateLimitMap.delete(key);
  },
  
  // 清空所有限制
  clear() {
    rateLimitMap.clear();
  },
};

/**
 * 通用速率限制器
 * 可用于其他需要速率限制的场景
 */
export function createRateLimiter(options: {
  maxAttempts: number;
  windowMs: number; // 时间窗口（毫秒）
}) {
  const limiterMap = new Map<string, RateLimitEntry>();
  
  // 清理过期记录
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of limiterMap.entries()) {
      if (now > entry.resetTime) {
        limiterMap.delete(key);
      }
    }
  }, options.windowMs);
  
  return {
    async check(key: string) {
      const now = Date.now();
      
      let entry = limiterMap.get(key);
      
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 1,
          resetTime: now + options.windowMs,
        };
        limiterMap.set(key, entry);
        return {
          success: true,
          remaining: options.maxAttempts - 1,
          reset: entry.resetTime,
        };
      }
      
      entry.count++;
      
      if (entry.count > options.maxAttempts) {
        return {
          success: false,
          remaining: 0,
          reset: entry.resetTime,
        };
      }
      
      return {
        success: true,
        remaining: options.maxAttempts - entry.count,
        reset: entry.resetTime,
      };
    },
    
    reset(key: string) {
      limiterMap.delete(key);
    },
    
    clear() {
      limiterMap.clear();
    },
  };
}
