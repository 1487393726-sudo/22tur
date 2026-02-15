import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const apiTemplates = [
  // Payment Gateways
  {
    name: 'Stripe',
    provider: 'stripe',
    type: 'PAYMENT',
    category: 'payment',
    description: 'Stripe 支付网关，支持信用卡、借记卡等多种支付方式',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['apiKey', 'secretKey'],
      properties: {
        apiKey: { type: 'string', description: 'Publishable API Key' },
        secretKey: { type: 'string', description: 'Secret API Key' },
        webhookSecret: { type: 'string', description: 'Webhook Signing Secret' },
      },
    }),
    defaultConfig: JSON.stringify({
      apiKey: '',
      secretKey: '',
      webhookSecret: '',
    }),
    docsUrl: 'https://stripe.com/docs/api',
    logoUrl: '/images/providers/stripe.svg',
  },
  {
    name: 'Alipay',
    provider: 'alipay',
    type: 'PAYMENT',
    category: 'payment',
    description: '支付宝支付接口，支持扫码支付、APP支付等',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['appId', 'privateKey', 'alipayPublicKey'],
      properties: {
        appId: { type: 'string', description: '应用 ID' },
        privateKey: { type: 'string', description: '应用私钥' },
        alipayPublicKey: { type: 'string', description: '支付宝公钥' },
        signType: { type: 'string', enum: ['RSA2', 'RSA'], default: 'RSA2' },
      },
    }),
    defaultConfig: JSON.stringify({
      appId: '',
      privateKey: '',
      alipayPublicKey: '',
      signType: 'RSA2',
    }),
    docsUrl: 'https://opendocs.alipay.com/apis',
    logoUrl: '/images/providers/alipay.svg',
  },
  {
    name: 'WeChat Pay',
    provider: 'wechat',
    type: 'PAYMENT',
    category: 'payment',
    description: '微信支付接口，支持 JSAPI、Native、APP 等支付方式',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['appId', 'mchId', 'apiKey'],
      properties: {
        appId: { type: 'string', description: '公众号/小程序 AppID' },
        mchId: { type: 'string', description: '商户号' },
        apiKey: { type: 'string', description: 'API 密钥' },
        certPath: { type: 'string', description: '证书路径' },
      },
    }),
    defaultConfig: JSON.stringify({
      appId: '',
      mchId: '',
      apiKey: '',
      certPath: '',
    }),
    docsUrl: 'https://pay.weixin.qq.com/wiki/doc/api/index.html',
    logoUrl: '/images/providers/wechat.svg',
  },
  // Email Services
  {
    name: 'SendGrid',
    provider: 'sendgrid',
    type: 'EMAIL',
    category: 'email',
    description: 'SendGrid 邮件服务，支持事务邮件和营销邮件',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['apiKey'],
      properties: {
        apiKey: { type: 'string', description: 'API Key' },
        fromEmail: { type: 'string', description: '默认发件人邮箱' },
        fromName: { type: 'string', description: '默认发件人名称' },
      },
    }),
    defaultConfig: JSON.stringify({
      apiKey: '',
      fromEmail: '',
      fromName: '',
    }),
    docsUrl: 'https://docs.sendgrid.com/api-reference',
    logoUrl: '/images/providers/sendgrid.svg',
  },
  {
    name: 'Mailgun',
    provider: 'mailgun',
    type: 'EMAIL',
    category: 'email',
    description: 'Mailgun 邮件服务，提供强大的邮件发送和追踪功能',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['apiKey', 'domain'],
      properties: {
        apiKey: { type: 'string', description: 'API Key' },
        domain: { type: 'string', description: '发送域名' },
        region: { type: 'string', enum: ['us', 'eu'], default: 'us' },
      },
    }),
    defaultConfig: JSON.stringify({
      apiKey: '',
      domain: '',
      region: 'us',
    }),
    docsUrl: 'https://documentation.mailgun.com/en/latest/',
    logoUrl: '/images/providers/mailgun.svg',
  },
  // SMS Services
  {
    name: 'Twilio',
    provider: 'twilio',
    type: 'SMS',
    category: 'sms',
    description: 'Twilio 短信服务，支持全球短信发送',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['accountSid', 'authToken', 'fromNumber'],
      properties: {
        accountSid: { type: 'string', description: 'Account SID' },
        authToken: { type: 'string', description: 'Auth Token' },
        fromNumber: { type: 'string', description: '发送号码' },
      },
    }),
    defaultConfig: JSON.stringify({
      accountSid: '',
      authToken: '',
      fromNumber: '',
    }),
    docsUrl: 'https://www.twilio.com/docs/sms',
    logoUrl: '/images/providers/twilio.svg',
  },
  {
    name: 'Aliyun SMS',
    provider: 'aliyun-sms',
    type: 'SMS',
    category: 'sms',
    description: '阿里云短信服务，支持国内短信发送',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['accessKeyId', 'accessKeySecret', 'signName'],
      properties: {
        accessKeyId: { type: 'string', description: 'AccessKey ID' },
        accessKeySecret: { type: 'string', description: 'AccessKey Secret' },
        signName: { type: 'string', description: '短信签名' },
        templateCode: { type: 'string', description: '模板代码' },
      },
    }),
    defaultConfig: JSON.stringify({
      accessKeyId: '',
      accessKeySecret: '',
      signName: '',
      templateCode: '',
    }),
    docsUrl: 'https://help.aliyun.com/product/44282.html',
    logoUrl: '/images/providers/aliyun.svg',
  },
  // Storage Services
  {
    name: 'AWS S3',
    provider: 'aws-s3',
    type: 'STORAGE',
    category: 'storage',
    description: 'Amazon S3 对象存储服务',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['accessKeyId', 'secretAccessKey', 'bucket', 'region'],
      properties: {
        accessKeyId: { type: 'string', description: 'Access Key ID' },
        secretAccessKey: { type: 'string', description: 'Secret Access Key' },
        bucket: { type: 'string', description: '存储桶名称' },
        region: { type: 'string', description: '区域' },
      },
    }),
    defaultConfig: JSON.stringify({
      accessKeyId: '',
      secretAccessKey: '',
      bucket: '',
      region: 'us-east-1',
    }),
    docsUrl: 'https://docs.aws.amazon.com/s3/',
    logoUrl: '/images/providers/aws.svg',
  },
  {
    name: 'Tencent COS',
    provider: 'tencent-cos',
    type: 'STORAGE',
    category: 'storage',
    description: '腾讯云对象存储服务',
    configSchema: JSON.stringify({
      type: 'object',
      required: ['secretId', 'secretKey', 'bucket', 'region'],
      properties: {
        secretId: { type: 'string', description: 'SecretId' },
        secretKey: { type: 'string', description: 'SecretKey' },
        bucket: { type: 'string', description: '存储桶名称' },
        region: { type: 'string', description: '区域' },
      },
    }),
    defaultConfig: JSON.stringify({
      secretId: '',
      secretKey: '',
      bucket: '',
      region: 'ap-guangzhou',
    }),
    docsUrl: 'https://cloud.tencent.com/document/product/436',
    logoUrl: '/images/providers/tencent.svg',
  },
];

async function main() {
  console.log('Seeding API templates...');

  for (const template of apiTemplates) {
    await prisma.apiTemplate.upsert({
      where: {
        provider_type: {
          provider: template.provider,
          type: template.type,
        },
      },
      update: template,
      create: template,
    });
    console.log(`  ✓ ${template.name}`);
  }

  console.log('API templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
