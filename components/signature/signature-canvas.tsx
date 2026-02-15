'use client';

/**
 * Signature Canvas Component
 * 签名画布组件 - 支持手写、输入、上传三种签名方式
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Pen, Type, Upload, RotateCcw, Check } from 'lucide-react';
import type { SignatureType, SignatureData } from '@/lib/signature/types';

interface SignatureCanvasProps {
  onSignatureComplete: (data: SignatureData) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  disabled?: boolean;
}

export function SignatureCanvas({
  onSignatureComplete,
  onCancel,
  width = 500,
  height = 200,
  strokeColor = '#000000',
  strokeWidth = 2,
  disabled = false,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SignatureType>('DRAW');

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height, strokeColor, strokeWidth]);

  // 获取鼠标/触摸位置
  const getPosition = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  // 开始绘制
  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const { x, y } = getPosition(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    },
    [disabled, getPosition]
  );

  // 绘制中
  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const { x, y } = getPosition(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawn(true);
    },
    [isDrawing, disabled, getPosition]
  );

  // 结束绘制
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // 清除画布
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    setHasDrawn(false);
  }, [width, height]);

  // 处理文件上传
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // 生成文字签名图片
  const generateTypedSignature = useCallback((): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = strokeColor;
    ctx.font = 'italic 48px "Brush Script MT", cursive, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, width / 2, height / 2);

    return canvas.toDataURL('image/png');
  }, [typedName, width, height, strokeColor]);

  // 提交签名
  const handleSubmit = useCallback(() => {
    let signatureData: string = '';

    switch (activeTab) {
      case 'DRAW':
        if (!hasDrawn) {
          alert('请先签名');
          return;
        }
        signatureData = canvasRef.current?.toDataURL('image/png') || '';
        break;

      case 'TYPE':
        if (!typedName.trim()) {
          alert('请输入您的姓名');
          return;
        }
        signatureData = generateTypedSignature();
        break;

      case 'UPLOAD':
        if (!uploadedImage) {
          alert('请上传签名图片');
          return;
        }
        signatureData = uploadedImage;
        break;
    }

    onSignatureComplete({
      type: activeTab,
      data: signatureData,
      timestamp: new Date(),
      ipAddress: '', // 由服务端填充
      userAgent: navigator.userAgent,
    });
  }, [activeTab, hasDrawn, typedName, uploadedImage, generateTypedSignature, onSignatureComplete]);

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SignatureType)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="DRAW" disabled={disabled}>
              <Pen className="w-4 h-4 mr-2" />
              手写签名
            </TabsTrigger>
            <TabsTrigger value="TYPE" disabled={disabled}>
              <Type className="w-4 h-4 mr-2" />
              输入姓名
            </TabsTrigger>
            <TabsTrigger value="UPLOAD" disabled={disabled}>
              <Upload className="w-4 h-4 mr-2" />
              上传签名
            </TabsTrigger>
          </TabsList>

          <TabsContent value="DRAW" className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full touch-none cursor-crosshair"
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              请在上方区域使用鼠标或触摸屏签名
            </p>
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={clearCanvas} disabled={disabled}>
                <RotateCcw className="w-4 h-4 mr-2" />
                清除重签
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="TYPE" className="space-y-4">
            <Input
              placeholder="请输入您的姓名"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              disabled={disabled}
              className="text-lg"
            />
            {typedName && (
              <div className="border rounded-lg p-8 bg-white text-center">
                <span
                  className="text-4xl italic"
                  style={{ fontFamily: '"Brush Script MT", cursive, serif' }}
                >
                  {typedName}
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              输入您的姓名，系统将生成手写风格签名
            </p>
          </TabsContent>

          <TabsContent value="UPLOAD" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="上传的签名"
                    className="max-h-32 mx-auto"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadedImage(null)}
                    disabled={disabled}
                  >
                    重新上传
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={disabled}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      点击或拖拽上传签名图片
                    </p>
                  </div>
                </label>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={disabled}>
              取消
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={disabled}>
            <Check className="w-4 h-4 mr-2" />
            确认签名
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SignatureCanvas;
