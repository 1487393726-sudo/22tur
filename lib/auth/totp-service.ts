// lib/auth/totp-service.ts
// TOTP 双因素认证服务

import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/api-management/encryption-service';
import type {
  TwoFactorSetupResult,
  TwoFactorEnableResult,
  TwoFactorMethod,
  BackupCode,
} from '@/types/auth';
import crypto from 'crypto';

// Configure TOTP settings
authenticator.options = {
  digits: 6,
  step: 30, // 30 seconds
  window: 1, // Allow 1 step before/after for clock drift
};

/**
 * TOTP Service - Handles two-factor authentication
 */
export class TOTPService {
  private static readonly APP_NAME = '企业管理系统';
  private static readonly BACKUP_CODE_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;

  /**
   * Generate a new TOTP secret for a user
   */
  static async generateSecret(userId: string): Promise<TwoFactorSetupResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate a new secret
    const secret = authenticator.generateSecret(20); // 20 bytes = 160 bits

    // Generate otpauth URL
    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.APP_NAME,
      secret
    );

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Store the secret (encrypted) but not enabled yet
    await prisma.twoFactorSecret.upsert({
      where: { userId },
      create: {
        userId,
        secret: encrypt(secret),
        enabled: false,
        method: 'TOTP',
      },
      update: {
        secret: encrypt(secret),
        enabled: false,
        method: 'TOTP',
      },
    });

    return {
      secret,
      qrCode,
      otpauthUrl,
    };
  }

  /**
   * Verify a TOTP code
   */
  static async verifyCode(userId: string, code: string): Promise<boolean> {
    const twoFactor = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.enabled) {
      return false;
    }

    const secret = decrypt(twoFactor.secret);
    return authenticator.verify({ token: code, secret });
  }

  /**
   * Enable TOTP after verifying the first code
   */
  static async enable(userId: string, code: string): Promise<TwoFactorEnableResult> {
    const twoFactor = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactor) {
      throw new Error('2FA not set up. Please generate a secret first.');
    }

    if (twoFactor.enabled) {
      throw new Error('2FA is already enabled');
    }

    // Verify the code
    const secret = decrypt(twoFactor.secret);
    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    const backupCodesJson = JSON.stringify(
      backupCodes.map((code) => ({ code, used: false }))
    );

    // Enable 2FA and store backup codes
    await prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        enabled: true,
        backupCodes: encrypt(backupCodesJson),
      },
    });

    return {
      enabled: true,
      backupCodes,
    };
  }

  /**
   * Disable TOTP (requires password verification)
   */
  static async disable(userId: string): Promise<void> {
    await prisma.twoFactorSecret.delete({
      where: { userId },
    });
  }

  /**
   * Generate backup codes
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars

    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      let code = '';
      for (let j = 0; j < this.BACKUP_CODE_LENGTH; j++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        code += chars[randomIndex];
      }
      codes.push(code);
    }

    // Ensure all codes are unique
    const uniqueCodes = [...new Set(codes)];
    while (uniqueCodes.length < this.BACKUP_CODE_COUNT) {
      let code = '';
      for (let j = 0; j < this.BACKUP_CODE_LENGTH; j++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        code += chars[randomIndex];
      }
      if (!uniqueCodes.includes(code)) {
        uniqueCodes.push(code);
      }
    }

    return uniqueCodes;
  }

  /**
   * Verify a backup code
   */
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const twoFactor = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.enabled || !twoFactor.backupCodes) {
      return false;
    }

    const backupCodesJson = decrypt(twoFactor.backupCodes);
    const backupCodes: BackupCode[] = JSON.parse(backupCodesJson);

    // Find the code (case-insensitive)
    const normalizedCode = code.toUpperCase().replace(/\s/g, '');
    const codeIndex = backupCodes.findIndex(
      (bc) => !bc.used && bc.code === normalizedCode
    );

    if (codeIndex === -1) {
      return false;
    }

    // Mark the code as used
    backupCodes[codeIndex].used = true;
    backupCodes[codeIndex].usedAt = new Date();

    await prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        backupCodes: encrypt(JSON.stringify(backupCodes)),
      },
    });

    return true;
  }

  /**
   * Regenerate backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const twoFactor = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.enabled) {
      throw new Error('2FA is not enabled');
    }

    const backupCodes = this.generateBackupCodes();
    const backupCodesJson = JSON.stringify(
      backupCodes.map((code) => ({ code, used: false }))
    );

    await prisma.twoFactorSecret.update({
      where: { userId },
      data: {
        backupCodes: encrypt(backupCodesJson),
      },
    });

    return backupCodes;
  }

  /**
   * Get remaining backup codes count
   */
  static async getRemainingBackupCodesCount(userId: string): Promise<number> {
    const twoFactor = await prisma.twoFactorSecret.findUnique({
      where: { userId },
    });

    if (!twoFactor || !twoFactor.backupCodes) {
      return 0;
    }

    const backupCodesJson = decrypt(twoFactor.backupCodes);
    const backupCodes: BackupCode[] = JSON.parse(backupCodesJson);

    return backupCodes.filter((bc) => !bc.used).length;
  }

  /**
   * Check if 2FA is enabled for a user
   */
  static async isEnabled(userId: string): Promise<boolean> {
    const twoFactor = await prisma.twoFactorSecret.findUnique({
      where: { userId },
      select: { enabled: true },
    });

    return twoFactor?.enabled ?? false;
  }

  /**
   * Get 2FA method for a user
   */
  static async getMethod(userId: string): Promise<TwoFactorMethod | null> {
    const twoFactor = await prisma.twoFactorSecret.findUnique({
      where: { userId },
      select: { method: true, enabled: true },
    });

    if (!twoFactor || !twoFactor.enabled) {
      return null;
    }

    return twoFactor.method as TwoFactorMethod;
  }

  /**
   * Verify either TOTP code or backup code
   */
  static async verify(
    userId: string,
    code: string,
    useBackupCode: boolean = false
  ): Promise<boolean> {
    if (useBackupCode) {
      return this.verifyBackupCode(userId, code);
    }
    return this.verifyCode(userId, code);
  }

  /**
   * Generate a TOTP code for testing (should only be used in development)
   */
  static generateCodeForTesting(secret: string): string {
    return authenticator.generate(secret);
  }
}

export default TOTPService;
