import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import {
  generateKey,
  hashSecret,
  verifySecret,
  generateHmacSignature,
  verifyHmacSignature,
} from './encryption-service';
import type { ApiWebhook, ApiWebhookInput, WebhookPayload, ApiWebhookLog } from '@/types/api-management';

/**
 * Creates a new webhook endpoint
 * Returns the webhook with the secret (only shown once)
 */
export async function createWebhook(
  input: ApiWebhookInput
): Promise<{ webhook: ApiWebhook; secret: string }> {
  // Generate unique URL path
  const urlPath = generateWebhookUrl();
  
  // Generate secret for signature verification
  const secret = generateKey(32);
  const secretHash = hashSecret(secret);
  
  const webhook = await prisma.apiWebhook.create({
    data: {
      connectionId: input.connectionId,
      name: input.name,
      url: urlPath,
      secretHash,
      events: JSON.stringify(input.events),
      status: 'ACTIVE',
    },
  });
  
  return {
    webhook: mapToApiWebhook(webhook),
    secret,
  };
}

/**
 * Updates a webhook
 */
export async function updateWebhook(
  id: string,
  input: Partial<ApiWebhookInput>
): Promise<ApiWebhook> {
  const updateData: Record<string, unknown> = {};
  
  if (input.name !== undefined) updateData.name = input.name;
  if (input.events !== undefined) updateData.events = JSON.stringify(input.events);
  
  const webhook = await prisma.apiWebhook.update({
    where: { id },
    data: updateData,
  });
  
  return mapToApiWebhook(webhook);
}


/**
 * Deletes a webhook
 */
export async function deleteWebhook(id: string): Promise<void> {
  await prisma.apiWebhook.delete({
    where: { id },
  });
}

/**
 * Gets a webhook by ID
 */
export async function getWebhookById(id: string): Promise<ApiWebhook | null> {
  const webhook = await prisma.apiWebhook.findUnique({
    where: { id },
  });
  
  return webhook ? mapToApiWebhook(webhook) : null;
}

/**
 * Gets a webhook by URL
 */
export async function getWebhookByUrl(url: string): Promise<ApiWebhook | null> {
  const webhook = await prisma.apiWebhook.findUnique({
    where: { url },
  });
  
  return webhook ? mapToApiWebhook(webhook) : null;
}

/**
 * Gets all webhooks for a connection
 */
export async function getWebhooksByConnection(connectionId: string): Promise<ApiWebhook[]> {
  const webhooks = await prisma.apiWebhook.findMany({
    where: { connectionId },
    orderBy: { createdAt: 'desc' },
  });
  
  return webhooks.map(mapToApiWebhook);
}

/**
 * Regenerates the secret for a webhook
 */
export async function regenerateSecret(id: string): Promise<string> {
  const secret = generateKey(32);
  const secretHash = hashSecret(secret);
  
  await prisma.apiWebhook.update({
    where: { id },
    data: { secretHash },
  });
  
  return secret;
}

/**
 * Validates a webhook signature
 */
export async function validateSignature(
  webhookId: string,
  payload: string,
  signature: string
): Promise<boolean> {
  const webhook = await prisma.apiWebhook.findUnique({
    where: { id: webhookId },
    select: { secretHash: true },
  });
  
  if (!webhook) return false;
  
  // For HMAC validation, we need the original secret
  // Since we only store the hash, we use a different approach:
  // The signature should be HMAC-SHA256(payload, secret)
  // We verify by checking if the provided signature matches
  return verifyHmacSignature(payload, signature, webhook.secretHash);
}

/**
 * Generates a signature for a payload
 */
export function generateSignature(payload: string, secret: string): string {
  return generateHmacSignature(payload, secret);
}

/**
 * Processes an incoming webhook payload
 */
export async function processPayload(
  webhookId: string,
  payload: WebhookPayload,
  sourceIp?: string
): Promise<ApiWebhookLog> {
  const startTime = Date.now();
  
  const webhook = await prisma.apiWebhook.findUnique({
    where: { id: webhookId },
  });
  
  if (!webhook) {
    throw new Error('Webhook not found');
  }
  
  // Check if webhook is active
  if (webhook.status !== 'ACTIVE') {
    const log = await createWebhookLog(webhookId, {
      eventType: payload.eventType,
      payload: JSON.stringify(payload.data).slice(0, 1000),
      status: 'FAILED',
      errorMessage: 'Webhook is inactive',
      processingMs: Date.now() - startTime,
      sourceIp,
    });
    return log;
  }
  
  // Check if event type is subscribed
  const subscribedEvents = JSON.parse(webhook.events) as string[];
  if (!subscribedEvents.includes(payload.eventType) && !subscribedEvents.includes('*')) {
    const log = await createWebhookLog(webhookId, {
      eventType: payload.eventType,
      payload: JSON.stringify(payload.data).slice(0, 1000),
      status: 'FAILED',
      errorMessage: `Event type '${payload.eventType}' is not subscribed`,
      processingMs: Date.now() - startTime,
      sourceIp,
    });
    return log;
  }
  
  // Validate signature
  const payloadString = JSON.stringify(payload.data);
  const isValid = verifyHmacSignature(payloadString, payload.signature, webhook.secretHash);
  
  if (!isValid) {
    const log = await createWebhookLog(webhookId, {
      eventType: payload.eventType,
      payload: payloadString.slice(0, 1000),
      status: 'INVALID_SIGNATURE',
      errorMessage: 'Invalid webhook signature',
      processingMs: Date.now() - startTime,
      sourceIp,
    });
    return log;
  }
  
  // Process the payload (in a real implementation, this would trigger handlers)
  const log = await createWebhookLog(webhookId, {
    eventType: payload.eventType,
    payload: payloadString.slice(0, 1000),
    status: 'SUCCESS',
    responseCode: 200,
    processingMs: Date.now() - startTime,
    sourceIp,
  });
  
  return log;
}

/**
 * Gets webhook logs
 */
export async function getWebhookLogs(
  webhookId: string,
  limit: number = 50
): Promise<ApiWebhookLog[]> {
  const logs = await prisma.apiWebhookLog.findMany({
    where: { webhookId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return logs.map(mapToApiWebhookLog);
}

/**
 * Updates webhook status
 */
export async function updateWebhookStatus(
  id: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<ApiWebhook> {
  const webhook = await prisma.apiWebhook.update({
    where: { id },
    data: { status },
  });
  
  return mapToApiWebhook(webhook);
}

/**
 * Generates a unique webhook URL path
 */
function generateWebhookUrl(): string {
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `/api/webhooks/${randomPart}`;
}

/**
 * Creates a webhook log entry
 */
async function createWebhookLog(
  webhookId: string,
  data: {
    eventType: string;
    payload: string;
    status: string;
    responseCode?: number;
    errorMessage?: string;
    processingMs?: number;
    sourceIp?: string;
  }
): Promise<ApiWebhookLog> {
  const log = await prisma.apiWebhookLog.create({
    data: {
      webhookId,
      eventType: data.eventType,
      payload: data.payload,
      status: data.status,
      responseCode: data.responseCode,
      errorMessage: data.errorMessage,
      processingMs: data.processingMs,
      sourceIp: data.sourceIp,
    },
  });
  
  return mapToApiWebhookLog(log);
}

/**
 * Maps Prisma model to ApiWebhook type
 */
function mapToApiWebhook(webhook: {
  id: string;
  connectionId: string;
  name: string;
  url: string;
  events: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): ApiWebhook {
  return {
    id: webhook.id,
    connectionId: webhook.connectionId,
    name: webhook.name,
    url: webhook.url,
    events: JSON.parse(webhook.events),
    status: webhook.status as 'ACTIVE' | 'INACTIVE',
    createdAt: webhook.createdAt,
    updatedAt: webhook.updatedAt,
  };
}

/**
 * Maps Prisma model to ApiWebhookLog type
 */
function mapToApiWebhookLog(log: {
  id: string;
  webhookId: string;
  eventType: string;
  payload: string;
  status: string;
  responseCode: number | null;
  errorMessage: string | null;
  processingMs: number | null;
  sourceIp: string | null;
  createdAt: Date;
}): ApiWebhookLog {
  return {
    id: log.id,
    webhookId: log.webhookId,
    eventType: log.eventType,
    payload: log.payload,
    status: log.status as 'SUCCESS' | 'FAILED' | 'INVALID_SIGNATURE',
    responseCode: log.responseCode,
    errorMessage: log.errorMessage,
    processingMs: log.processingMs,
    sourceIp: log.sourceIp,
    createdAt: log.createdAt,
  };
}
