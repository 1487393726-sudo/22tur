# 视频文件目录

## 使用说明

将您的视频文件放在这个目录中,然后在组件中引用。

### 支持的视频格式

- MP4 (推荐)
- WebM
- OGG

### 推荐设置

- 分辨率: 1920x1080 (Full HD)
- 比特率: 5-10 Mbps
- 编码: H.264 (MP4)
- 文件大小: 建议小于 50MB

### 示例文件名

- `intro.mp4` - 公司介绍视频
- `services.mp4` - 服务展示视频
- `portfolio.mp4` - 作品集视频

### 视频封面图片

建议为每个视频创建对应的封面图片:
- `intro-poster.jpg`
- `services-poster.jpg`
- `portfolio-poster.jpg`

### 使用示例

```tsx
<VideoPlayer
  src="/videos/intro.mp4"
  poster="/videos/intro-poster.jpg"
  title="公司介绍"
  description="了解我们的品牌故事"
/>
```
