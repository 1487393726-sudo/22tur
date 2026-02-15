/**
 * Tencent Cloud SMS Adapter
 * 腾讯云短信适配器
 */

import crypto from 'crypto';
import {
  TencentSMSConfig,
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
 * 腾讯云短信适配器
 */
export class TencentSMSAdapter implements ISMSAdapter {
  private config: TencentSMSConfig;
  private endpoint: string;
  private host: string;
  private service: string;

  constructor(config: TencentSMSConfig) {
    this.config = config;
    this.host = 'sms.tencentcloudapi.com';
    this.endpoint = `https://${this.host}`;
    this.service = 'sms';
  }

  /**
   * 发送短信
   */
  async send(params: SendSMSParams): Promise<SendResult> {
    try {
      const phoneNumber = this.formatPhoneNumber(params.phoneNumber);
      const signName = params.signName || this.config.signName;

      // 构建请求参数
      const requestBody = {
        PhoneNumberSet: [phoneNumber],
        SmsSdkAppId: this.config.sdkAppId,
        SignName: signName,
        TemplateId: params.templateCode,
        TemplateParamSet: Object.values(params.templateParams),
      };

      const response = await this.request('SendSms', requestBody);

      if (response.Response?.SendStatusSet?.[0]) {
        const status = response.Response.SendStatusSet[0];
        
        if (status.Code === 'Ok') {
          return {
            success: true,
            messageId: status.SerialNo,
            requestId: response.Response.RequestId,
            code: status.Code,
            message: status.Message,
          };
        }

        return {
          success: false,
          requestId: response.Response.RequestId,
          code: status.Code,
          message: status.Message,
        };
      }

      return {
        success: false,
        requestId: response.Response?.RequestId,
        code: response.Response?.Error?.Code || 'UNKNOWN_ERROR',
        message: response.Response?.Error?.Message || 'Unknown error',
      };
    } catch (error) {
      console.error('Tencent SMS send error:', error);
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

      // 腾讯云批量发送：所有号码使用相同模板参数
      // 如果需要不同参数，需要分批发送
      const requestBody = {
        PhoneNumberSet: phoneNumbers,
        SmsSdkAppId: this.config.sdkAppId,
        SignName: signName,
        TemplateId: params.templateCode,
        TemplateParamSet: Object.values(params.templateParams[0] || {}),
      };

      const response = await this.request('SendSms', requestBody);

      if (response.Response?.SendStatusSet) {
        const results: SendResult[] = response.Response.SendStatusSet.map((status: any) => ({
          success: status.Code === 'Ok',
          messageId: status.SerialNo,
          requestId: response.Response.RequestId,
          code: status.Code,
          message: status.Message,
        }));

        const successCount = results.filter(r => r.success).length;

        return {
          success: successCount > 0,
          results,
          successCount,
          failedCount: results.length - successCount,
        };
      }

      return {
        success: false,
        results: phoneNumbers.map(() => ({
          success: false,
          code: response.Response?.Error?.Code || 'UNKNOWN_ERROR',
          message: response.Response?.Error?.Message || 'Unknown error',
        })),
        successCount: 0,
        failedCount: phoneNumbers.length,
      };
    } catch (error) {
      console.error('Tencent SMS batch send error:', error);
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
      // 腾讯云需要通过回调或拉取状态报告来获取投递状态
      // 这里使用 PullSmsSendStatus API
      const requestBody = {
        SmsSdkAppId: this.config.sdkAppId,
        Limit: 10,
      };

      const response = await this.request('PullSmsSendStatus', requestBody);

      if (response.Response?.PullSmsSendStatusSet) {
        const status = response.Response.PullSmsSendStatusSet.find(
          (s: any) => s.SerialNo === messageId
        );

        if (status) {
          return {
            messageId,
            phoneNumber: status.PhoneNumber,
            status: this.mapDeliveryStatus(status.ReportStatus),
            sendTime: status.UserReceiveTime ? new Date(status.UserReceiveTime * 1000) : undefined,
            errorCode: status.ErrmsgCode,
            errorMessage: status.Description,
          };
        }
      }

      return {
        messageId,
        phoneNumber: '',
        status: 'UNKNOWN',
      };
    } catch (error) {
      console.error('Tencent SMS query status error:', error);
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
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      const requestBody = {
        SmsSdkAppId: this.config.sdkAppId,
        PhoneNumber: formattedPhone,
        BeginTime: Math.floor(startDate.getTime() / 1000),
        EndTime: Math.floor(endDate.getTime() / 1000),
        Offset: 0,
        Limit: 100,
      };

      const response = await this.request('PullSmsSendStatusByPhoneNumber', requestBody);

      if (response.Response?.PullSmsSendStatusSet) {
        return response.Response.PullSmsSendStatusSet.map((status: any) => ({
          messageId: status.SerialNo || '',
          phoneNumber: status.PhoneNumber,
          status: this.mapDeliveryStatus(status.ReportStatus),
          sendTime: status.UserReceiveTime ? new Date(status.UserReceiveTime * 1000) : undefined,
          errorCode: status.ErrmsgCode,
          errorMessage: status.Description,
        }));
      }

      return [];
    } catch (error) {
      console.error('Tencent SMS query history error:', error);
      return [];
    }
  }

  /**
   * 发送 API 请求（TC3-HMAC-SHA256 签名）
   */
  private async request(action: string, body: Record<string, any>): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000);
    const date = this.getDate(timestamp);
    const payload = JSON.stringify(body);

    // 构建规范请求
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const contentType = 'application/json; charset=utf-8';
    const canonicalHeaders = `content-type:${contentType}\nhost:${this.host}\nx-tc-action:${action.toLowerCase()}\n`;
    const signedHeaders = 'content-type;host;x-tc-action';
    const hashedRequestPayload = this.sha256(payload);
    const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

    // 构建待签名字符串
    const algorithm = 'TC3-HMAC-SHA256';
    const credentialScope = `${date}/${this.service}/tc3_request`;
    const hashedCanonicalRequest = this.sha256(canonicalRequest);
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

    // 计算签名
    const secretDate = this.hmacSha256(`TC3${this.config.accessKeySecret}`, date);
    const secretService = this.hmacSha256(secretDate, this.service);
    const secretSigning = this.hmacSha256(secretService, 'tc3_request');
    const signature = this.hmacSha256Hex(secretSigning, stringToSign);

    // 构建 Authorization
    const authorization = `${algorithm} Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // 发送请求
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Host': this.host,
        'X-TC-Action': action,
        'X-TC-Version': '2021-01-11',
        'X-TC-Timestamp': timestamp.toString(),
        'X-TC-Region': this.config.region || 'ap-guangzhou',
        'Authorization': authorization,
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * SHA256 哈希
   */
  private sha256(message: string): string {
    return crypto.createHash('sha256').update(message).digest('hex');
  }

  /**
   * HMAC-SHA256
   */
  private hmacSha256(key: string | Buffer, message: string): Buffer {
    return crypto.createHmac('sha256', key).update(message).digest();
  }

  /**
   * HMAC-SHA256 (返回十六进制字符串)
   */
  private hmacSha256Hex(key: Buffer, message: string): string {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }

  /**
   * 获取日期字符串 (YYYY-MM-DD)
   */
  private getDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0];
  }

  /**
   * 格式化手机号
   */
  private formatPhoneNumber(phone: string): string {
    const parsed = parsePhoneNumber(phone);
    // 腾讯云需要带国家代码，格式：+[国家代码][手机号]
    return parsed.e164Format;
  }

  /**
   * 映射投递状态
   */
  private mapDeliveryStatus(status: string): DeliveryStatus {
    switch (status) {
      case 'SUCCESS':
        return 'DELIVERED';
      case 'FAIL':
        return 'FAILED';
      default:
        return 'UNKNOWN';
    }
  }
}

/**
 * 创建腾讯云短信适配器
 */
export function createTencentSMSAdapter(config: TencentSMSConfig): TencentSMSAdapter {
  return new TencentSMSAdapter(config);
}
