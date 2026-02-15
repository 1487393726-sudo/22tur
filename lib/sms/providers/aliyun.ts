/**
 * Aliyun SMS Adapter
 * 阿里云短信适配器
 */

import crypto from 'crypto';
import {
  AliyunSMSConfig,
  SendSMSParams,
  SendBatchSMSParams,
  SendResult,
  BatchSendResult,
  DeliveryStatusResult,
  DeliveryStatus,
  ISMSAdapter,
  parsePhoneNumber,
} from '../types';

/**
 * 阿里云短信适配器
 */
export class AliyunSMSAdapter implements ISMSAdapter {
  private config: AliyunSMSConfig;
  private endpoint: string;

  constructor(config: AliyunSMSConfig) {
    this.config = config;
    this.endpoint = config.endpoint || 'https://dysmsapi.aliyuncs.com';
  }

  /**
   * 发送短信
   */
  async send(params: SendSMSParams): Promise<SendResult> {
    try {
      const phoneNumber = this.formatPhoneNumber(params.phoneNumber);
      const signName = params.signName || this.config.signName;

      const requestParams = {
        PhoneNumbers: phoneNumber,
        SignName: signName,
        TemplateCode: params.templateCode,
        TemplateParam: JSON.stringify(params.templateParams),
      };

      const response = await this.request('SendSms', requestParams);

      if (response.Code === 'OK') {
        return {
          success: true,
          messageId: response.BizId,
          requestId: response.RequestId,
          bizId: response.BizId,
          code: response.Code,
          message: response.Message,
        };
      }

      return {
        success: false,
        requestId: response.RequestId,
        code: response.Code,
        message: response.Message,
      };
    } catch (error) {
      console.error('Aliyun SMS send error:', error);
      return {
        success: false,
        code: 'SEND_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 批量发送短信
   */
  async sendBatch(params: SendBatchSMSParams): Promise<BatchSendResult> {
    try {
      const phoneNumbers = params.phoneNumbers.map(p => this.formatPhoneNumber(p));
      const signName = params.signName || this.config.signName;

      // 阿里云批量发送需要签名数组和参数数组
      const signNames = phoneNumbers.map(() => signName);
      const templateParams = params.templateParams.map(p => JSON.stringify(p));

      const requestParams = {
        PhoneNumberJson: JSON.stringify(phoneNumbers),
        SignNameJson: JSON.stringify(signNames),
        TemplateCode: params.templateCode,
        TemplateParamJson: JSON.stringify(templateParams),
      };

      const response = await this.request('SendBatchSms', requestParams);

      if (response.Code === 'OK') {
        return {
          success: true,
          results: phoneNumbers.map((phone, index) => ({
            success: true,
            messageId: response.BizId,
            requestId: response.RequestId,
            bizId: response.BizId,
          })),
          successCount: phoneNumbers.length,
          failedCount: 0,
        };
      }

      return {
        success: false,
        results: phoneNumbers.map(() => ({
          success: false,
          code: response.Code,
          message: response.Message,
        })),
        successCount: 0,
        failedCount: phoneNumbers.length,
      };
    } catch (error) {
      console.error('Aliyun SMS batch send error:', error);
      return {
        success: false,
        results: params.phoneNumbers.map(() => ({
          success: false,
          code: 'SEND_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        })),
        successCount: 0,
        failedCount: params.phoneNumbers.length,
      };
    }
  }

  /**
   * 查询投递状态
   */
  async queryDeliveryStatus(messageId: string): Promise<DeliveryStatusResult> {
    try {
      const requestParams = {
        BizId: messageId,
        PhoneNumber: '', // 需要提供手机号
        SendDate: this.formatDate(new Date()),
        PageSize: '1',
        CurrentPage: '1',
      };

      const response = await this.request('QuerySendDetails', requestParams);

      if (response.Code === 'OK' && response.SmsSendDetailDTOs?.SmsSendDetailDTO?.length > 0) {
        const detail = response.SmsSendDetailDTOs.SmsSendDetailDTO[0];
        return {
          messageId,
          phoneNumber: detail.PhoneNum,
          status: this.mapDeliveryStatus(detail.SendStatus),
          sendTime: detail.SendDate ? new Date(detail.SendDate) : undefined,
          receiveTime: detail.ReceiveDate ? new Date(detail.ReceiveDate) : undefined,
          errorCode: detail.ErrCode,
        };
      }

      return {
        messageId,
        phoneNumber: '',
        status: 'UNKNOWN',
      };
    } catch (error) {
      console.error('Aliyun SMS query status error:', error);
      return {
        messageId,
        phoneNumber: '',
        status: 'UNKNOWN',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 查询发送记录
   */
  async querySendHistory(
    phoneNumber: string,
    startDate: Date,
    endDate: Date
  ): Promise<DeliveryStatusResult[]> {
    try {
      const results: DeliveryStatusResult[] = [];
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // 按天查询
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const requestParams = {
          PhoneNumber: formattedPhone,
          SendDate: this.formatDate(currentDate),
          PageSize: '50',
          CurrentPage: '1',
        };

        const response = await this.request('QuerySendDetails', requestParams);

        if (response.Code === 'OK' && response.SmsSendDetailDTOs?.SmsSendDetailDTO) {
          for (const detail of response.SmsSendDetailDTOs.SmsSendDetailDTO) {
            results.push({
              messageId: detail.OutId || '',
              phoneNumber: detail.PhoneNum,
              status: this.mapDeliveryStatus(detail.SendStatus),
              sendTime: detail.SendDate ? new Date(detail.SendDate) : undefined,
              receiveTime: detail.ReceiveDate ? new Date(detail.ReceiveDate) : undefined,
              errorCode: detail.ErrCode,
            });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return results;
    } catch (error) {
      console.error('Aliyun SMS query history error:', error);
      return [];
    }
  }

  /**
   * 发送 API 请求
   */
  private async request(action: string, params: Record<string, string>): Promise<any> {
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const nonce = this.generateNonce();

    // 公共参数
    const commonParams: Record<string, string> = {
      AccessKeyId: this.config.accessKeyId,
      Action: action,
      Format: 'JSON',
      RegionId: this.config.region || 'cn-hangzhou',
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: nonce,
      SignatureVersion: '1.0',
      Timestamp: timestamp,
      Version: '2017-05-25',
    };

    // 合并参数
    const allParams = { ...commonParams, ...params };

    // 生成签名
    const signature = this.generateSignature('GET', allParams);
    allParams['Signature'] = signature;

    // 构建 URL
    const queryString = Object.entries(allParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `${this.endpoint}?${queryString}`;

    // 发送请求
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 生成签名
   */
  private generateSignature(method: string, params: Record<string, string>): string {
    // 按参数名排序
    const sortedKeys = Object.keys(params).sort();
    
    // 构建规范化查询字符串
    const canonicalizedQueryString = sortedKeys
      .map(key => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join('&');

    // 构建待签名字符串
    const stringToSign = `${method}&${this.percentEncode('/')}&${this.percentEncode(canonicalizedQueryString)}`;

    // 使用 HMAC-SHA1 签名
    const hmac = crypto.createHmac('sha1', `${this.config.accessKeySecret}&`);
    hmac.update(stringToSign);
    
    return hmac.digest('base64');
  }

  /**
   * URL 编码（符合阿里云规范）
   */
  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/\+/g, '%20')
      .replace(/\*/g, '%2A')
      .replace(/%7E/g, '~');
  }

  /**
   * 生成随机数
   */
  private generateNonce(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * 格式化日期为 yyyyMMdd
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * 格式化手机号
   */
  private formatPhoneNumber(phone: string): string {
    const parsed = parsePhoneNumber(phone);
    
    // 阿里云国内短信只需要手机号，国际短信需要带国家代码
    if (parsed.countryCode === '+86') {
      return parsed.nationalNumber;
    }
    
    // 国际号码：去掉 + 号
    return parsed.e164Format.replace(/^\+/, '');
  }

  /**
   * 映射投递状态
   */
  private mapDeliveryStatus(status: number): DeliveryStatus {
    switch (status) {
      case 1:
        return 'PENDING';
      case 2:
        return 'FAILED';
      case 3:
        return 'DELIVERED';
      default:
        return 'UNKNOWN';
    }
  }
}

/**
 * 创建阿里云短信适配器
 */
export function createAliyunSMSAdapter(config: AliyunSMSConfig): AliyunSMSAdapter {
  return new AliyunSMSAdapter(config);
}
