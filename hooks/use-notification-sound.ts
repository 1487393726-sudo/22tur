import { useEffect, useRef, useState } from 'react';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // 创建音频元素
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;

    // 从 localStorage 读取设置
    const savedEnabled = localStorage.getItem('notification-sound-enabled');
    if (savedEnabled !== null) {
      setIsEnabled(savedEnabled === 'true');
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = () => {
    if (isEnabled && !isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('播放通知音效失败:', error);
      });
    }
  };

  const toggleEnabled = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    localStorage.setItem('notification-sound-enabled', String(newValue));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return {
    play,
    isEnabled,
    isMuted,
    toggleEnabled,
    toggleMute,
  };
}
