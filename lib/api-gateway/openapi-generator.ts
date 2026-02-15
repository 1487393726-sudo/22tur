// OpenAPI 文档生成器
import { RouteRule, ApiVersionConfig } from './types';

export interface OpenAPIInfo {
  title: string;
  description: string;
  version: string;
  contact?: {
    name: string;
    email: string;
    url: string;
  };
  license?: {
    name: string;
    url: string;
  };
}

export interface OpenAPIServer {
  url: string;
  description: string;
}

export interface OpenAPIDocument {
  openapi: string;
  info: OpenAPIInfo;
  servers: OpenAPIServer[];
  paths: Record<string, any>;
  components: {
    securitySchemes: Record<string, any>;
    schemas: Record<string, any>;
  };
  security: Array<Record<string, string[]>>;
  tags: Array<{ name: string; description: string }>;
}

// 默认 API 信息
const DEFAULT_INFO: OpenAPIInfo = {
  title: '创意之旅 API',
  description: '创意之旅企业管理系统 API 文档',
  version: '1.0.0',
  contact: {
    name: 'API Support',
    email: 'api@creative-journey.com',
    url: 'https://creative-journey.com/support',
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
  },
};

// 默认服务器
const DEFAULT_SERVERS: OpenAPIServer[] = [
  { url: 'https://api.creative-journey.com', description: '生产环境' },
  { url: 'https://staging-api.creative-journey.com', description: '测试环境' },
  { url: 'http://localhost:3000', description: '本地开发' },
];

// API 端点定义
interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description?: string;
  tags: string[];
  parameters?: any[];
  requestBody?: any;
  responses: Record<string, any>;
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
}

// 预定义的 API 端点
const API_ENDPOINTS: ApiEndpoint[] = [
  // 认证
  {
    path: '/api/auth/login',
    method: 'post',
    summary: '用户登录',
    tags: ['认证'],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 6 },
            },
            required: ['email', 'password'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: '登录成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
      '401': { description: '认证失败' },
    },
  },
  // 用户
  {
    path: '/api/user/profile',
    method: 'get',
    summary: '获取用户资料',
    tags: ['用户'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
      '401': { description: '未授权' },
    },
  },
  {
    path: '/api/user/profile',
    method: 'put',
    summary: '更新用户资料',
    tags: ['用户'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UserUpdate' },
        },
      },
    },
    responses: {
      '200': { description: '更新成功' },
      '400': { description: '参数错误' },
      '401': { description: '未授权' },
    },
  },
  // 投资
  {
    path: '/api/investments',
    method: 'get',
    summary: '获取投资列表',
    tags: ['投资'],
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
      { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'PENDING'] } },
    ],
    responses: {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/Investment' } },
                total: { type: 'integer' },
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
  {
    path: '/api/investments/{id}',
    method: 'get',
    summary: '获取投资详情',
    tags: ['投资'],
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    ],
    responses: {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Investment' },
          },
        },
      },
      '404': { description: '投资不存在' },
    },
  },
  // 支付
  {
    path: '/api/payment/create',
    method: 'post',
    summary: '创建支付订单',
    tags: ['支付'],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              amount: { type: 'number', minimum: 0.01 },
              provider: { type: 'string', enum: ['alipay', 'wechat'] },
              investmentId: { type: 'string' },
            },
            required: ['amount', 'provider'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: '创建成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                orderId: { type: 'string' },
                qrCode: { type: 'string' },
                redirectUrl: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  // 文档
  {
    path: '/api/documents',
    method: 'get',
    summary: '获取文档列表',
    tags: ['文档'],
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'type', in: 'query', schema: { type: 'string' } },
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    ],
    responses: {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/Document' } },
                total: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
  // 通知
  {
    path: '/api/notifications',
    method: 'get',
    summary: '获取通知列表',
    tags: ['通知'],
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'unreadOnly', in: 'query', schema: { type: 'boolean' } },
    ],
    responses: {
      '200': {
        description: '成功',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                unreadCount: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
];

// 预定义的数据模型
const SCHEMAS: Record<string, any> = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      phone: { type: 'string' },
      avatar: { type: 'string' },
      role: { type: 'string', enum: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  UserUpdate: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      phone: { type: 'string' },
      avatar: { type: 'string' },
    },
  },
  Investment: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      projectId: { type: 'string' },
      userId: { type: 'string' },
      amount: { type: 'number' },
      status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'COMPLETED'] },
      profit: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
      project: { $ref: '#/components/schemas/Project' },
    },
  },
  Project: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      targetAmount: { type: 'number' },
      currentAmount: { type: 'number' },
      status: { type: 'string' },
      coverImage: { type: 'string' },
    },
  },
  Document: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      type: { type: 'string' },
      url: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Notification: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      type: { type: 'string' },
      title: { type: 'string' },
      content: { type: 'string' },
      isRead: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Error: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      code: { type: 'string' },
      details: { type: 'object' },
    },
  },
};

// 生成 OpenAPI 文档
export function generateOpenAPIDocument(
  info?: Partial<OpenAPIInfo>,
  servers?: OpenAPIServer[]
): OpenAPIDocument {
  const paths: Record<string, any> = {};

  // 构建路径
  for (const endpoint of API_ENDPOINTS) {
    if (!paths[endpoint.path]) {
      paths[endpoint.path] = {};
    }

    paths[endpoint.path][endpoint.method] = {
      summary: endpoint.summary,
      description: endpoint.description,
      tags: endpoint.tags,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses,
      security: endpoint.security,
      deprecated: endpoint.deprecated,
    };
  }

  return {
    openapi: '3.0.3',
    info: { ...DEFAULT_INFO, ...info },
    servers: servers || DEFAULT_SERVERS,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: SCHEMAS,
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: '认证', description: '用户认证相关接口' },
      { name: '用户', description: '用户管理相关接口' },
      { name: '投资', description: '投资管理相关接口' },
      { name: '支付', description: '支付相关接口' },
      { name: '文档', description: '文档管理相关接口' },
      { name: '通知', description: '通知相关接口' },
    ],
  };
}

// 导出 JSON 格式
export function exportOpenAPIJSON(doc: OpenAPIDocument): string {
  return JSON.stringify(doc, null, 2);
}

// 导出 YAML 格式（简化版）
export function exportOpenAPIYAML(doc: OpenAPIDocument): string {
  // 简化的 YAML 转换
  const toYAML = (obj: any, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    let result = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        result += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            result += `${spaces}- ${toYAML(item, indent + 1).trim()}\n`;
          } else {
            result += `${spaces}- ${item}\n`;
          }
        }
      } else if (typeof value === 'object') {
        result += `${spaces}${key}:\n${toYAML(value, indent + 1)}`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }

    return result;
  };

  return toYAML(doc);
}

export default {
  generateOpenAPIDocument,
  exportOpenAPIJSON,
  exportOpenAPIYAML,
};
