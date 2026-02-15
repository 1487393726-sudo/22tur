/**
 * 图片优化工具
 * 提供图片压缩、缩略图生成、格式转换等功能
 */

import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

/**
 * 图片优化配置
 */
export interface ImageOptimizeConfig {
  quality?: number; // 压缩质量 (1-100)
  maxWidth?: number; // 最大宽度
  maxHeight?: number; // 最大高度
  format?: "jpeg" | "png" | "webp" | "avif"; // 输出格式
  progressive?: boolean; // 渐进式加载
  withMetadata?: boolean; // 保留元数据
}

/**
 * 缩略图配置
 */
export interface ThumbnailConfig {
  width: number;
  height: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  position?: "top" | "right top" | "right" | "right bottom" | "bottom" | "left bottom" | "left" | "left top" | "center";
  background?: { r: number; g: number; b: number; alpha: number };
}

/**
 * 默认配置
 */
const DEFAULT_OPTIMIZE_CONFIG: ImageOptimizeConfig = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  format: "webp",
  progressive: true,
  withMetadata: false,
};

const DEFAULT_THUMBNAIL_CONFIG: ThumbnailConfig = {
  width: 400,
  height: 400,
  fit: "cover",
  position: "center",
};

/**
 * 图片优化器类
 */
export class ImageOptimizer {
  private config: ImageOptimizeConfig;

  constructor(config: Partial<ImageOptimizeConfig> = {}) {
    this.config = { ...DEFAULT_OPTIMIZE_CONFIG, ...config };
  }

  /**
   * 优化图片
   */
  async optimize(
    input: Buffer | string,
    outputPath?: string,
    config?: Partial<ImageOptimizeConfig>
  ): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
    const finalConfig = { ...this.config, ...config };
    let pipeline = sharp(input);

    // 获取图片信息
    const metadata = await pipeline.metadata();

    // 调整尺寸（如果超过最大限制）
    if (
      finalConfig.maxWidth &&
      finalConfig.maxHeight &&
      metadata.width &&
      metadata.height
    ) {
      if (
        metadata.width > finalConfig.maxWidth ||
        metadata.height > finalConfig.maxHeight
      ) {
        pipeline = pipeline.resize(finalConfig.maxWidth, finalConfig.maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
    }

    // 设置输出格式和质量
    switch (finalConfig.format) {
      case "jpeg":
        pipeline = pipeline.jpeg({
          quality: finalConfig.quality,
          progressive: finalConfig.progressive,
        });
        break;
      case "png":
        pipeline = pipeline.png({
          quality: finalConfig.quality,
          progressive: finalConfig.progressive,
        });
        break;
      case "webp":
        pipeline = pipeline.webp({
          quality: finalConfig.quality,
        });
        break;
      case "avif":
        pipeline = pipeline.avif({
          quality: finalConfig.quality,
        });
        break;
    }

    // 移除元数据（如果不需要保留）
    if (!finalConfig.withMetadata) {
      pipeline = pipeline.withMetadata({});
    }

    // 输出
    const buffer = await pipeline.toBuffer();
    const info = await sharp(buffer).metadata();

    // 保存到文件（如果指定了输出路径）
    if (outputPath) {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, buffer);
    }

    return {
      buffer,
      info: {
        format: info.format || finalConfig.format || "unknown",
        width: info.width || 0,
        height: info.height || 0,
        channels: info.channels || 0,
        premultiplied: info.premultiplied || false,
        size: buffer.length,
      },
    };
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(
    input: Buffer | string,
    outputPath?: string,
    config?: Partial<ThumbnailConfig>
  ): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
    const finalConfig = { ...DEFAULT_THUMBNAIL_CONFIG, ...config };

    let pipeline = sharp(input).resize(finalConfig.width, finalConfig.height, {
      fit: finalConfig.fit,
      position: finalConfig.position,
      background: finalConfig.background,
    });

    // 使用 WebP 格式以获得更好的压缩
    pipeline = pipeline.webp({ quality: 75 });

    const buffer = await pipeline.toBuffer();
    const info = await sharp(buffer).metadata();

    if (outputPath) {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, buffer);
    }

    return {
      buffer,
      info: {
        format: "webp",
        width: info.width || finalConfig.width,
        height: info.height || finalConfig.height,
        channels: info.channels || 0,
        premultiplied: info.premultiplied || false,
        size: buffer.length,
      },
    };
  }

  /**
   * 批量生成多种尺寸的缩略图
   */
  async generateResponsiveImages(
    input: Buffer | string,
    outputDir: string,
    baseName: string,
    sizes: number[] = [320, 640, 960, 1280, 1920]
  ): Promise<Array<{ size: number; path: string; info: sharp.OutputInfo }>> {
    const results: Array<{ size: number; path: string; info: sharp.OutputInfo }> = [];

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `${baseName}-${size}w.webp`);
      const { info } = await this.optimize(input, outputPath, {
        maxWidth: size,
        maxHeight: Math.round(size * 0.75), // 4:3 比例
        format: "webp",
        quality: 80,
      });

      results.push({ size, path: outputPath, info });
    }

    return results;
  }

  /**
   * 获取图片信息
   */
  async getImageInfo(input: Buffer | string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
    isAnimated: boolean;
  }> {
    const metadata = await sharp(input).metadata();
    const stats = typeof input === "string" ? await fs.stat(input) : null;

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
      size: stats?.size || (Buffer.isBuffer(input) ? input.length : 0),
      hasAlpha: metadata.hasAlpha || false,
      isAnimated: (metadata.pages || 1) > 1,
    };
  }

  /**
   * 转换图片格式
   */
  async convertFormat(
    input: Buffer | string,
    outputPath: string,
    format: "jpeg" | "png" | "webp" | "avif"
  ): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
    return this.optimize(input, outputPath, { format });
  }

  /**
   * 添加水印
   */
  async addWatermark(
    input: Buffer | string,
    watermark: Buffer | string,
    outputPath?: string,
    options: {
      position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
      opacity?: number;
      margin?: number;
    } = {}
  ): Promise<Buffer> {
    const { position = "bottom-right", opacity = 0.5, margin = 20 } = options;

    const mainImage = sharp(input);
    const mainMetadata = await mainImage.metadata();

    // 处理水印图片
    const watermarkBuffer = await sharp(watermark)
      .resize(Math.round((mainMetadata.width || 200) * 0.2)) // 水印宽度为主图的20%
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: "dest-in",
        },
      ])
      .toBuffer();

    // 计算水印位置
    const watermarkMetadata = await sharp(watermarkBuffer).metadata();
    let gravity: sharp.Gravity;
    switch (position) {
      case "top-left":
        gravity = "northwest";
        break;
      case "top-right":
        gravity = "northeast";
        break;
      case "bottom-left":
        gravity = "southwest";
        break;
      case "bottom-right":
        gravity = "southeast";
        break;
      case "center":
        gravity = "center";
        break;
      default:
        gravity = "southeast";
    }

    const result = await mainImage
      .composite([
        {
          input: watermarkBuffer,
          gravity,
          blend: "over",
        },
      ])
      .toBuffer();

    if (outputPath) {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, result);
    }

    return result;
  }

  /**
   * 裁剪图片
   */
  async crop(
    input: Buffer | string,
    region: { left: number; top: number; width: number; height: number },
    outputPath?: string
  ): Promise<Buffer> {
    const result = await sharp(input).extract(region).toBuffer();

    if (outputPath) {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, result);
    }

    return result;
  }

  /**
   * 旋转图片
   */
  async rotate(
    input: Buffer | string,
    angle: number,
    outputPath?: string
  ): Promise<Buffer> {
    const result = await sharp(input).rotate(angle).toBuffer();

    if (outputPath) {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, result);
    }

    return result;
  }
}

// 创建默认实例
export const imageOptimizer = new ImageOptimizer();

/**
 * 快捷函数：优化图片
 */
export async function optimizeImage(
  input: Buffer | string,
  outputPath?: string,
  config?: Partial<ImageOptimizeConfig>
): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
  return imageOptimizer.optimize(input, outputPath, config);
}

/**
 * 快捷函数：生成缩略图
 */
export async function generateThumbnail(
  input: Buffer | string,
  outputPath?: string,
  config?: Partial<ThumbnailConfig>
): Promise<{ buffer: Buffer; info: sharp.OutputInfo }> {
  return imageOptimizer.generateThumbnail(input, outputPath, config);
}

/**
 * 快捷函数：获取图片信息
 */
export async function getImageInfo(input: Buffer | string) {
  return imageOptimizer.getImageInfo(input);
}

export default ImageOptimizer;
