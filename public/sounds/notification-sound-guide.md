# 通知音效文件说明

## 音效文件位置

将通知音效文件放置在：`public/sounds/notification.mp3`

## 音效要求

- **格式**: MP3 或 WAV
- **时长**: 0.5-2秒
- **音量**: 适中，不刺耳
- **文件大小**: < 100KB

## 推荐音效

可以从以下网站获取免费音效：
1. https://freesound.org/
2. https://mixkit.co/free-sound-effects/
3. https://www.zapsplat.com/

搜索关键词：
- notification
- alert
- ding
- chime
- bell

## 自定义音效

如果需要使用自定义音效，请确保：
1. 文件名为 `notification.mp3`
2. 放置在 `public/sounds/` 目录
3. 符合上述音效要求

## 禁用音效

用户可以在通知偏好设置中禁用音效，或者在代码中设置：
```typescript
localStorage.setItem('notification-sound-enabled', 'false');
```
