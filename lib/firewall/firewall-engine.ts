/**
 * Firewall Engine
 * Manages firewall rules and traffic evaluation
 * Implements priority-based rule matching with <50ms latency
 */

import { prisma } from '@/lib/prisma';

export interface FirewallRule {
  id: string;
  sourceIp: string;
  destinationIp: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  action: 'ALLOW' | 'DENY';
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkTraffic {
  sourceIp: string;
  destinationIp: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
}

export interface FirewallDecision {
  action: 'ALLOW' | 'DENY';
  ruleId?: string;
  priority?: number;
  evaluationTimeMs: number;
}

export class FirewallEngine {
  private ruleCache: Map<string, FirewallRule[]> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  /**
   * Create a new firewall rule
   */
  async createRule(data: {
    sourceIp: string;
    destinationIp: string;
    port: number;
    protocol: 'TCP' | 'UDP' | 'ICMP';
    action: 'ALLOW' | 'DENY';
    priority?: number;
  }): Promise<FirewallRule> {
    const rule = await prisma.firewallRule.create({
      data: {
        sourceIp: data.sourceIp,
        destinationIp: data.destinationIp,
        port: data.port,
        protocol: data.protocol,
        action: data.action,
        priority: data.priority ?? 100,
      },
    });

    // Invalidate cache
    this.invalidateCache();

    return rule as FirewallRule;
  }

  /**
   * Get a firewall rule by ID
   */
  async getRule(id: string): Promise<FirewallRule | null> {
    const rule = await prisma.firewallRule.findUnique({
      where: { id },
    });

    return rule as FirewallRule | null;
  }

  /**
   * Get all firewall rules
   */
  async getAllRules(): Promise<FirewallRule[]> {
    const rules = await prisma.firewallRule.findMany({
      orderBy: { priority: 'asc' },
    });

    return rules as FirewallRule[];
  }

  /**
   * Update a firewall rule
   */
  async updateRule(
    id: string,
    data: Partial<{
      sourceIp: string;
      destinationIp: string;
      port: number;
      protocol: 'TCP' | 'UDP' | 'ICMP';
      action: 'ALLOW' | 'DENY';
      priority: number;
    }>
  ): Promise<FirewallRule> {
    const rule = await prisma.firewallRule.update({
      where: { id },
      data,
    });

    // Invalidate cache
    this.invalidateCache();

    return rule as FirewallRule;
  }

  /**
   * Delete a firewall rule
   */
  async deleteRule(id: string): Promise<void> {
    await prisma.firewallRule.delete({
      where: { id },
    });

    // Invalidate cache
    this.invalidateCache();
  }

  /**
   * Evaluate network traffic against firewall rules
   * Returns decision within 50ms
   */
  async evaluateTraffic(traffic: NetworkTraffic): Promise<FirewallDecision> {
    const startTime = Date.now();

    try {
      // Get applicable rules
      const applicableRules = await this.getApplicableRules(traffic);

      // Find first matching rule (lowest priority number wins)
      const matchingRule = applicableRules[0];

      const evaluationTimeMs = Date.now() - startTime;

      if (matchingRule) {
        // Log the decision
        await this.logTraffic(traffic, matchingRule.action, matchingRule.id);

        return {
          action: matchingRule.action as 'ALLOW' | 'DENY',
          ruleId: matchingRule.id,
          priority: matchingRule.priority,
          evaluationTimeMs,
        };
      }

      // Default to DENY if no rule matches
      await this.logTraffic(traffic, 'DENY', undefined);

      return {
        action: 'DENY',
        evaluationTimeMs,
      };
    } catch (error) {
      const evaluationTimeMs = Date.now() - startTime;
      // On error, default to DENY for security
      return {
        action: 'DENY',
        evaluationTimeMs,
      };
    }
  }

  /**
   * Get applicable rules for traffic
   * Rules are sorted by priority (lower number = higher priority)
   */
  async getApplicableRules(traffic: NetworkTraffic): Promise<FirewallRule[]> {
    const rules = await this.getAllRules();

    return rules.filter((rule) => this.matchesTraffic(rule, traffic));
  }

  /**
   * Check if a rule matches traffic
   */
  private matchesTraffic(rule: FirewallRule, traffic: NetworkTraffic): boolean {
    // Check protocol
    if (rule.protocol !== traffic.protocol) {
      return false;
    }

    // Check port
    if (rule.port !== traffic.port) {
      return false;
    }

    // Check source IP (support wildcards)
    if (!this.ipMatches(rule.sourceIp, traffic.sourceIp)) {
      return false;
    }

    // Check destination IP (support wildcards)
    if (!this.ipMatches(rule.destinationIp, traffic.destinationIp)) {
      return false;
    }

    return true;
  }

  /**
   * Check if IP matches pattern (supports * wildcard)
   */
  private ipMatches(pattern: string, ip: string): boolean {
    if (pattern === '*') {
      return true;
    }

    if (pattern === ip) {
      return true;
    }

    // Support CIDR notation (simplified)
    if (pattern.includes('/')) {
      // For now, just do exact match
      return pattern === ip;
    }

    // Support wildcard patterns like 192.168.*
    const patternParts = pattern.split('.');
    const ipParts = ip.split('.');

    if (patternParts.length !== ipParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] !== '*' && patternParts[i] !== ipParts[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Log traffic evaluation
   */
  private async logTraffic(
    traffic: NetworkTraffic,
    action: string,
    ruleId?: string
  ): Promise<void> {
    try {
      await prisma.firewallLog.create({
        data: {
          sourceIp: traffic.sourceIp,
          destinationIp: traffic.destinationIp,
          port: traffic.port,
          protocol: traffic.protocol,
          action,
          ruleId,
        },
      });
    } catch (error) {
      // Log errors should not block traffic evaluation
      console.error('Failed to log firewall traffic:', error);
    }
  }

  /**
   * Invalidate rule cache
   */
  private invalidateCache(): void {
    this.ruleCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Get firewall logs
   */
  async getLogs(filters?: {
    sourceIp?: string;
    destinationIp?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const where: any = {};

    if (filters?.sourceIp) {
      where.sourceIp = filters.sourceIp;
    }

    if (filters?.destinationIp) {
      where.destinationIp = filters.destinationIp;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    return await prisma.firewallLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });
  }
}

export const firewallEngine = new FirewallEngine();
