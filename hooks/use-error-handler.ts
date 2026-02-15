// 错误处理钩子
import { useState, useCallback } from 'react'
import { logger } from '@/lib/error-logger'
import { AppError } from '@/lib/errors'

interface ErrorState {
  error: Error | AppError | null
  hasError: boolean
  errorMessage: string
}

interface UseErrorHandlerOptions {
  onError?: (error: Error | AppError) => void
  showToast?: boolean
  autoClear?: boolean
  clearTimeout?: number
}

/**
 * 错误处理钩子
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    onError,
    showToast = true,
    autoClear = true,
    clearTimeout = 5000
  } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
    errorMessage: ''
  })

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false,
      errorMessage: ''
    })
  }, [])

  const handleError = useCallback(async (error: Error | AppError | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    
    // 记录错误
    await logger.error(errorObj)

    // 更新错误状态
    setErrorState({
      error: errorObj,
      hasError: true,
      errorMessage: errorObj.message
    })

    // 调用错误回调
    if (onError && errorObj instanceof Error) {
      onError(errorObj)
    }

    // 显示错误提示
    if (showToast && typeof window !== 'undefined') {
      // 这里可以集成toast通知系统
      console.error('错误:', errorObj.message)
    }

    // 自动清除错误
    if (autoClear) {
      setTimeout(clearError, clearTimeout)
    }
  }, [onError, showToast, autoClear, clearTimeout, clearError])

  const withErrorHandler = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        clearError()
        return await fn(...args)
      } catch (error) {
        await handleError(error as Error)
        return null
      }
    }
  }, [clearError, handleError])

  const executeWithErrorHandler = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      clearError()
      return await fn()
    } catch (error) {
      await handleError(error as Error)
      return null
    }
  }, [clearError, handleError])

  return {
    ...errorState,
    handleError,
    clearError,
    withErrorHandler,
    executeWithErrorHandler
  }
}

/**
 * API调用错误处理钩子
 */
export function useApiErrorHandler<T = any>(options: UseErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options)
  const [isLoading, setIsLoading] = useState(false)

  const executeApiCall = useCallback(async (
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    setIsLoading(true)
    errorHandler.clearError()

    try {
      const result = await apiCall()
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      await errorHandler.handleError(error as Error)
      
      if (onError) {
        onError(error as Error)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [errorHandler])

  return {
    ...errorHandler,
    isLoading,
    executeApiCall
  }
}

/**
 * 表单错误处理钩子
 */
export function useFormErrorHandler() {
  const errorHandler = useErrorHandler()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const setFieldError = useCallback((fieldName: string, errorMessage: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }))
  }, [])

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  const validateForm = useCallback((
    validationRules: Record<string, (value: any) => string | null>,
    formData: Record<string, any>
  ): boolean => {
    clearAllFieldErrors()
    
    let isValid = true
    const errors: Record<string, string> = {}

    Object.entries(validationRules).forEach(([fieldName, validateFn]) => {
      const value = formData[fieldName]
      const error = validateFn(value)
      
      if (error) {
        errors[fieldName] = error
        isValid = false
      }
    })

    setFieldErrors(errors)
    return isValid
  }, [clearAllFieldErrors])

  return {
    ...errorHandler,
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    validateForm
  }
}

/**
 * 网络请求错误处理钩子
 */
export function useNetworkErrorHandler() {
  const errorHandler = useErrorHandler()
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  // 监听网络状态变化
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => {
      setIsOnline(false)
      errorHandler.handleError('网络连接已断开')
    })
  }

  const handleNetworkRequest = useCallback(async <T>(
    request: () => Promise<T>,
    retryCount = 3
  ): Promise<T | null> => {
    if (!isOnline) {
      await errorHandler.handleError('网络连接不可用，请检查网络设置')
      return null
    }

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const result = await request()
        return result
      } catch (error) {
        if (attempt === retryCount) {
          await errorHandler.handleError(`网络请求失败: ${(error as Error).message}`)
          return null
        }
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }

    return null
  }, [isOnline, errorHandler])

  return {
    ...errorHandler,
    isOnline,
    handleNetworkRequest
  }
}