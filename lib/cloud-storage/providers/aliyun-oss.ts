/**
 * Aliyun OSS Adapter
 * 阿里云对象存储服务适配器
 */

import crypto from 'crypto';
import type {
  CloudStorageConfig,
  ICloudStorageAdapter,
  UploadOptions,
  UploadResult,
  MultipartUploadOptions,
  SignedUrlOptions,
  FileMetadata,
  ListOptions,
  ListResult,
} from '../types';
import { 
  generateObjectKey, 
  getEndpoint, 
  DEFAULT_CONFIG,
  shouldUseCdn,
} from '../config';

export class AliyunOSSAdapter implements ICloudStorageAdapter {
  private config: CloudStorageConfig;
  private endpoint: string;

  constructor(config: CloudStorageConfig) {
    if (config.provider !== 'aliyun-oss') {
      throw new Error('Invalid provider for AliyunOSSAdapter');
    }
    this.config = config;
    this.endpoint = getEndpoint(config);
  }

  getConfig(): CloudStorageConfig {
    return this.config;
  }

  /**
   * 测试连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.list({ maxKeys: 1 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 上传文件
   */
  async upload(
    file: Buffer,
    filename: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const objectKey = generateObjectKey(options.category, filename);
    const contentType = options.contentType || 'application/octet-stream';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': String(file.length),
      'x-oss-storage-class': 'Standard',
    };

    // 添加自定义元数据
    if (options.metadata) {
      for (const [key, value] of Object.entries(options.metadata)) {
        headers[`x-oss-meta-${key}`] = value;
      }
    }

    // 设置 ACL
    if (options.isPublic) {
      headers['x-oss-object-acl'] = 'public-read';
    }

    const date = new Date().toUTCString();
    headers['Date'] = date;

    const signature = this.sign('PUT', objectKey, headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${objectKey}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: new Uint8Array(file),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const etag = response.headers.get('ETag')?.replace(/"/g, '') || '';

    return {
      objectKey,
      url: this.getPublicUrl(objectKey),
      cdnUrl: this.getCdnUrl(objectKey) || undefined,
      size: file.length,
      etag,
      contentType,
    };
  }

  /**
   * 分片上传
   */
  async uploadMultipart(
    file: Buffer,
    filename: string,
    options: MultipartUploadOptions
  ): Promise<UploadResult> {
    const objectKey = generateObjectKey(options.category, filename);
    const contentType = options.contentType || 'application/octet-stream';
    const partSize = options.partSize || DEFAULT_CONFIG.multipartPartSize;
    const parallel = options.parallel || DEFAULT_CONFIG.multipartParallel;

    // 1. 初始化分片上传
    const uploadId = await this.initMultipartUpload(objectKey, contentType, options);

    // 2. 计算分片
    const totalParts = Math.ceil(file.length / partSize);
    const parts: Array<{ partNumber: number; etag: string }> = [];

    // 3. 并行上传分片
    const uploadPart = async (partNumber: number): Promise<void> => {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.length);
      const partData = file.slice(start, end);

      const etag = await this.uploadPartData(objectKey, uploadId, partNumber, partData);
      parts.push({ partNumber, etag });

      if (options.onProgress) {
        const progress = (parts.length / totalParts) * 100;
        options.onProgress(progress);
      }
    };

    // 并行控制
    const queue: Promise<void>[] = [];
    for (let i = 1; i <= totalParts; i++) {
      const promise = uploadPart(i);
      queue.push(promise);

      if (queue.length >= parallel) {
        await Promise.race(queue);
        // 移除已完成的 promise
        for (let j = queue.length - 1; j >= 0; j--) {
          const status = await Promise.race([
            queue[j].then(() => 'fulfilled'),
            Promise.resolve('pending'),
          ]);
          if (status === 'fulfilled') {
            queue.splice(j, 1);
          }
        }
      }
    }
    await Promise.all(queue);

    // 4. 完成分片上传
    parts.sort((a, b) => a.partNumber - b.partNumber);
    const etag = await this.completeMultipartUpload(objectKey, uploadId, parts);

    return {
      objectKey,
      url: this.getPublicUrl(objectKey),
      cdnUrl: this.getCdnUrl(objectKey) || undefined,
      size: file.length,
      etag,
      contentType,
    };
  }

  /**
   * 初始化分片上传
   */
  private async initMultipartUpload(
    objectKey: string,
    contentType: string,
    options: MultipartUploadOptions
  ): Promise<string> {
    const date = new Date().toUTCString();
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Date': date,
    };

    if (options.metadata) {
      for (const [key, value] of Object.entries(options.metadata)) {
        headers[`x-oss-meta-${key}`] = value;
      }
    }

    const signature = this.sign('POST', `${objectKey}?uploads`, headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${objectKey}?uploads`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Init multipart upload failed: ${response.status}`);
    }

    const xml = await response.text();
    const match = xml.match(/<UploadId>([^<]+)<\/UploadId>/);
    if (!match) {
      throw new Error('Failed to parse upload ID');
    }

    return match[1];
  }

  /**
   * 上传分片
   */
  private async uploadPartData(
    objectKey: string,
    uploadId: string,
    partNumber: number,
    data: Buffer
  ): Promise<string> {
    const date = new Date().toUTCString();
    const headers: Record<string, string> = {
      'Content-Length': String(data.length),
      'Date': date,
    };

    const resource = `${objectKey}?partNumber=${partNumber}&uploadId=${uploadId}`;
    const signature = this.sign('PUT', resource, headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${resource}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: new Uint8Array(data),
    });

    if (!response.ok) {
      throw new Error(`Upload part ${partNumber} failed: ${response.status}`);
    }

    return response.headers.get('ETag')?.replace(/"/g, '') || '';
  }

  /**
   * 完成分片上传
   */
  private async completeMultipartUpload(
    objectKey: string,
    uploadId: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<string> {
    const date = new Date().toUTCString();
    
    // 构建 XML
    const partsXml = parts
      .map(p => `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>"${p.etag}"</ETag></Part>`)
      .join('');
    const body = `<?xml version="1.0" encoding="UTF-8"?><CompleteMultipartUpload>${partsXml}</CompleteMultipartUpload>`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/xml',
      'Content-Length': String(Buffer.byteLength(body)),
      'Date': date,
    };

    const resource = `${objectKey}?uploadId=${uploadId}`;
    const signature = this.sign('POST', resource, headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${resource}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`Complete multipart upload failed: ${response.status}`);
    }

    return response.headers.get('ETag')?.replace(/"/g, '') || '';
  }

  /**
   * 删除文件
   */
  async delete(objectKey: string): Promise<void> {
    const date = new Date().toUTCString();
    const headers: Record<string, string> = {
      'Date': date,
    };

    const signature = this.sign('DELETE', objectKey, headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${objectKey}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Delete failed: ${response.status}`);
    }
  }

  /**
   * 批量删除文件
   */
  async deleteMultiple(objectKeys: string[]): Promise<void> {
    if (objectKeys.length === 0) return;

    const date = new Date().toUTCString();
    
    const objectsXml = objectKeys
      .map(key => `<Object><Key>${key}</Key></Object>`)
      .join('');
    const body = `<?xml version="1.0" encoding="UTF-8"?><Delete><Quiet>true</Quiet>${objectsXml}</Delete>`;
    
    const contentMd5 = crypto.createHash('md5').update(body).digest('base64');

    const headers: Record<string, string> = {
      'Content-Type': 'application/xml',
      'Content-Length': String(Buffer.byteLength(body)),
      'Content-MD5': contentMd5,
      'Date': date,
    };

    const signature = this.sign('POST', '?delete', headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/?delete`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`Delete multiple failed: ${response.status}`);
    }
  }

  /**
   * 获取签名 URL
   */
  async getSignedUrl(
    objectKey: string,
    options?: SignedUrlOptions
  ): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + (options?.expiresIn || DEFAULT_CONFIG.signedUrlExpiration);
    
    let resource = `/${this.config.bucket}/${objectKey}`;
    const queryParams: string[] = [];

    if (options?.responseContentType) {
      queryParams.push(`response-content-type=${encodeURIComponent(options.responseContentType)}`);
    }
    if (options?.responseContentDisposition) {
      queryParams.push(`response-content-disposition=${encodeURIComponent(options.responseContentDisposition)}`);
    }

    if (queryParams.length > 0) {
      resource += '?' + queryParams.join('&');
    }

    const stringToSign = `GET\n\n\n${expires}\n${resource}`;
    const signature = crypto
      .createHmac('sha1', this.config.accessKeySecret)
      .update(stringToSign)
      .digest('base64');

    let url = `${this.endpoint}/${objectKey}?OSSAccessKeyId=${encodeURIComponent(this.config.accessKeyId)}&Expires=${expires}&Signature=${encodeURIComponent(signature)}`;
    
    if (queryParams.length > 0) {
      url += '&' + queryParams.join('&');
    }

    return url;
  }

  /**
   * 获取公开 URL
   */
  getPublicUrl(objectKey: string): string {
    return `${this.endpoint}/${objectKey}`;
  }

  /**
   * 获取 CDN URL
   */
  getCdnUrl(objectKey: string): string | null {
    if (!this.config.cdnDomain) {
      return null;
    }
    return `https://${this.config.cdnDomain}/${objectKey}`;
  }

  /**
   * 检查文件是否存在
   */
  async exists(objectKey: string): Promise<boolean> {
    try {
      await this.getMetadata(objectKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件元数据
   */
  async getMetadata(objectKey: string): Promise<FileMetadata> {
    const date = new Date().toUTCString();
    const headers: Record<string, string> = {
      'Date': date,
    };

    const signature = this.sign('HEAD', objectKey, headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${objectKey}`;
    const response = await fetch(url, {
      method: 'HEAD',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Get metadata failed: ${response.status}`);
    }

    const metadata: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (key.startsWith('x-oss-meta-')) {
        metadata[key.replace('x-oss-meta-', '')] = value;
      }
    });

    return {
      objectKey,
      size: parseInt(response.headers.get('Content-Length') || '0', 10),
      contentType: response.headers.get('Content-Type') || 'application/octet-stream',
      etag: response.headers.get('ETag')?.replace(/"/g, '') || '',
      lastModified: new Date(response.headers.get('Last-Modified') || Date.now()),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
  }

  /**
   * 列出文件
   */
  async list(options?: ListOptions): Promise<ListResult> {
    const date = new Date().toUTCString();
    const headers: Record<string, string> = {
      'Date': date,
    };

    const queryParams: string[] = [];
    if (options?.prefix) queryParams.push(`prefix=${encodeURIComponent(options.prefix)}`);
    if (options?.delimiter) queryParams.push(`delimiter=${encodeURIComponent(options.delimiter)}`);
    if (options?.maxKeys) queryParams.push(`max-keys=${options.maxKeys}`);
    if (options?.marker) queryParams.push(`marker=${encodeURIComponent(options.marker)}`);

    const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const signature = this.sign('GET', query || '/', headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`List failed: ${response.status}`);
    }

    const xml = await response.text();
    return this.parseListResult(xml);
  }

  /**
   * 解析列表结果
   */
  private parseListResult(xml: string): ListResult {
    const objects: FileMetadata[] = [];
    const prefixes: string[] = [];

    // 解析 Contents
    const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
    let match;
    while ((match = contentsRegex.exec(xml)) !== null) {
      const content = match[1];
      const key = content.match(/<Key>([^<]*)<\/Key>/)?.[1] || '';
      const size = parseInt(content.match(/<Size>([^<]*)<\/Size>/)?.[1] || '0', 10);
      const etag = content.match(/<ETag>"?([^"<]*)"?<\/ETag>/)?.[1] || '';
      const lastModified = content.match(/<LastModified>([^<]*)<\/LastModified>/)?.[1] || '';

      objects.push({
        objectKey: key,
        size,
        contentType: 'application/octet-stream',
        etag,
        lastModified: new Date(lastModified),
      });
    }

    // 解析 CommonPrefixes
    const prefixRegex = /<CommonPrefixes><Prefix>([^<]*)<\/Prefix><\/CommonPrefixes>/g;
    while ((match = prefixRegex.exec(xml)) !== null) {
      prefixes.push(match[1]);
    }

    const isTruncated = xml.includes('<IsTruncated>true</IsTruncated>');
    const nextMarker = xml.match(/<NextMarker>([^<]*)<\/NextMarker>/)?.[1];

    return {
      objects,
      prefixes,
      isTruncated,
      nextMarker,
    };
  }

  /**
   * 复制文件
   */
  async copy(sourceKey: string, targetKey: string): Promise<void> {
    const date = new Date().toUTCString();
    const headers: Record<string, string> = {
      'Date': date,
      'x-oss-copy-source': `/${this.config.bucket}/${sourceKey}`,
    };

    const signature = this.sign('PUT', targetKey, headers, date);
    headers['Authorization'] = `OSS ${this.config.accessKeyId}:${signature}`;

    const url = `${this.endpoint}/${targetKey}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Copy failed: ${response.status}`);
    }
  }

  /**
   * 移动文件
   */
  async move(sourceKey: string, targetKey: string): Promise<void> {
    await this.copy(sourceKey, targetKey);
    await this.delete(sourceKey);
  }

  /**
   * 生成签名
   */
  private sign(
    method: string,
    resource: string,
    headers: Record<string, string>,
    date: string
  ): string {
    const contentMd5 = headers['Content-MD5'] || '';
    const contentType = headers['Content-Type'] || '';

    // 收集 OSS 头
    const ossHeaders: string[] = [];
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase().startsWith('x-oss-')) {
        ossHeaders.push(`${key.toLowerCase()}:${value}`);
      }
    }
    ossHeaders.sort();

    const canonicalizedOSSHeaders = ossHeaders.length > 0 
      ? ossHeaders.join('\n') + '\n' 
      : '';

    // 处理资源路径
    let canonicalizedResource = `/${this.config.bucket}`;
    if (resource.startsWith('?')) {
      canonicalizedResource += '/' + resource;
    } else if (resource === '/') {
      canonicalizedResource += '/';
    } else {
      canonicalizedResource += '/' + resource;
    }

    const stringToSign = [
      method,
      contentMd5,
      contentType,
      date,
      canonicalizedOSSHeaders + canonicalizedResource,
    ].join('\n');

    return crypto
      .createHmac('sha1', this.config.accessKeySecret)
      .update(stringToSign)
      .digest('base64');
  }
}

export default AliyunOSSAdapter;
