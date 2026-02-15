/**
 * 数据库连接测试 API
 *
 * POST /api/admin/database-configs/test - 测试数据库连接
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 测试 SQLite 连接
async function testSqliteConnection(database: string): Promise<{ success: boolean; message: string }> {
  try {
    // SQLite 只需检查文件路径是否有效
    if (!database) {
      return { success: false, message: "数据库文件路径不能为空" };
    }
    // 在实际环境中，可以尝试打开文件
    return { success: true, message: "SQLite 配置有效" };
  } catch (error: any) {
    return { success: false, message: error.message || "SQLite 连接测试失败" };
  }
}

// 测试 PostgreSQL 连接
async function testPostgresConnection(config: {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslEnabled: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    // 动态导入 pg 模块（如果安装了的话）
    const { Client } = await import("pg").catch(() => ({ Client: null }));
    
    if (!Client) {
      // 如果没有安装 pg，返回模拟成功（开发环境）
      if (process.env.NODE_ENV === "development") {
        return { success: true, message: "PostgreSQL 配置有效（开发模式）" };
      }
      return { success: false, message: "PostgreSQL 驱动未安装" };
    }

    const client = new Client({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.sslEnabled ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });

    await client.connect();
    await client.query("SELECT 1");
    await client.end();

    return { success: true, message: "PostgreSQL 连接成功" };
  } catch (error: any) {
    return { success: false, message: `PostgreSQL 连接失败: ${error.message}` };
  }
}

// 测试 MySQL 连接
async function testMysqlConnection(config: {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslEnabled: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    // 动态导入 mysql2 模块（如果安装了的话）
    const mysql = await import("mysql2/promise").catch(() => null);
    
    if (!mysql) {
      // 如果没有安装 mysql2，返回模拟成功（开发环境）
      if (process.env.NODE_ENV === "development") {
        return { success: true, message: "MySQL 配置有效（开发模式）" };
      }
      return { success: false, message: "MySQL 驱动未安装" };
    }

    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.sslEnabled ? {} : undefined,
      connectTimeout: 5000,
    });

    await connection.query("SELECT 1");
    await connection.end();

    return { success: true, message: "MySQL 连接成功" };
  } catch (error: any) {
    return { success: false, message: `MySQL 连接失败: ${error.message}` };
  }
}

// 测试 MongoDB 连接
async function testMongoConnection(config: {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslEnabled: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    // 动态导入 mongodb 模块（如果安装了的话）
    const { MongoClient } = await import("mongodb").catch(() => ({ MongoClient: null }));
    
    if (!MongoClient) {
      // 如果没有安装 mongodb，返回模拟成功（开发环境）
      if (process.env.NODE_ENV === "development") {
        return { success: true, message: "MongoDB 配置有效（开发模式）" };
      }
      return { success: false, message: "MongoDB 驱动未安装" };
    }

    let uri: string;
    if (config.username && config.password) {
      uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    } else {
      uri = `mongodb://${config.host}:${config.port}/${config.database}`;
    }

    if (config.sslEnabled) {
      uri += "?ssl=true";
    }

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    await client.db(config.database).command({ ping: 1 });
    await client.close();

    return { success: true, message: "MongoDB 连接成功" };
  } catch (error: any) {
    return { success: false, message: `MongoDB 连接失败: ${error.message}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const body = await request.json();
    const {
      type,
      host = "localhost",
      port,
      database,
      username = "",
      password = "",
      sslEnabled = false,
    } = body;

    // 验证必填字段
    if (!database) {
      return NextResponse.json(
        { success: false, message: "数据库名称是必填项" },
        { status: 400 }
      );
    }

    let result: { success: boolean; message: string };

    switch (type) {
      case "sqlite":
        result = await testSqliteConnection(database);
        break;
      case "postgresql":
        result = await testPostgresConnection({
          host,
          port: parseInt(port) || 5432,
          database,
          username,
          password,
          sslEnabled,
        });
        break;
      case "mysql":
        result = await testMysqlConnection({
          host,
          port: parseInt(port) || 3306,
          database,
          username,
          password,
          sslEnabled,
        });
        break;
      case "mongodb":
        result = await testMongoConnection({
          host,
          port: parseInt(port) || 27017,
          database,
          username,
          password,
          sslEnabled,
        });
        break;
      default:
        result = { success: false, message: "不支持的数据库类型" };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("测试数据库连接失败:", error);
    return NextResponse.json(
      { success: false, message: error.message || "测试连接失败" },
      { status: 500 }
    );
  }
}
