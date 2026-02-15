"use client";

import { useState, useRef, useEffect, useId } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  FastForward,
  Rewind,
  PictureInPicture,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import * as Slider from "@radix-ui/react-slider";

// 定义视频播放器管理器的接口和单例
interface VideoPlayerInstance {
  id: string;
  pause: () => void;
}

class VideoPlayerManager {
  private players = new Map<string, VideoPlayerInstance>();
  private currentPlayingId: string | null = null;

  register(id: string, player: VideoPlayerInstance) {
    this.players.set(id, player);
  }

  unregister(id: string) {
    this.players.delete(id);
    if (this.currentPlayingId === id) {
      this.currentPlayingId = null;
    }
  }

  notifyPlay(id: string) {
    if (this.currentPlayingId && this.currentPlayingId !== id) {
      this.players.get(this.currentPlayingId)?.pause();
    }
    this.currentPlayingId = id;
  }
}

const videoPlayerManager = new VideoPlayerManager();


interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  loop = false,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerId = useId();

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(autoPlay); // Autoplay should be muted
  const [volume, setVolume] = useState(autoPlay ? 0 : 1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPip, setIsPip] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [pipEnabled, setPipEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // 检测 PiP 和全屏状态（仅在客户端）
  useEffect(() => {
    setPipEnabled(typeof document !== 'undefined' && !!document.pictureInPictureEnabled);
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 注册播放器
    const playerInstance = { id: playerId, pause: () => video.pause() };
    videoPlayerManager.register(playerId, playerInstance);

    // 状态更新
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const onDurationChange = () => setDuration(video.duration);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onEnterPip = () => setIsPip(true);
    const onLeavePip = () => setIsPip(false);
    
    // 事件监听
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("enterpictureinpicture", onEnterPip);
    video.addEventListener("leavepictureinpicture", onLeavePip);

    // 自动播放处理
    if(autoPlay) {
      video.muted = true;
      // Handle autoplay with proper error handling for video-only media
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .catch((error) => {
            // Autoplay was prevented - this is normal for video-only media
            // User will need to click play button
            if (error.name === 'NotAllowedError') {
              console.log('Autoplay prevented - user interaction required');
              setIsPlaying(false);
              setAutoplayFailed(true);
            } else if (error.name === 'AbortError') {
              console.log('Autoplay aborted - video-only media paused to save power');
              setIsPlaying(false);
              setAutoplayFailed(true);
            } else {
              console.error('Playback error:', error);
            }
          });
      }
    }
    
    // 清理
    return () => {
      videoPlayerManager.unregister(playerId);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("enterpictureinpicture", onEnterPip);
      video.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, [playerId, autoPlay]);
  
  // 键盘快捷键
  useEffect(() => {
    const container = containerRef.current;
    if(!container) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
      switch(e.key) {
        case 'k':
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'p':
          togglePip();
          break;
        case 'ArrowRight':
          seek(5);
          break;
        case 'ArrowLeft':
          seek(-5);
          break;
      }
    };
    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      videoPlayerManager.notifyPlay(playerId);
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    video.volume = newVolume;
    video.muted = newVolume === 0;
  };
  
  const seek = (offset: number) => {
    const video = videoRef.current;
    if(!video) return;
    video.currentTime += offset;
  };
  
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if(!video) return;
    video.currentTime = value[0];
  }

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  };
  
  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if(!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 控制栏显示逻辑
  let controlsTimeout: NodeJS.Timeout;
  const handlePointerMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    if(isPlaying) {
      controlsTimeout = setTimeout(() => setShowControls(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-card rounded-xl overflow-hidden group focus:outline-none ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { clearTimeout(controlsTimeout); if(isPlaying) setShowControls(false); }}
      tabIndex={0}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        onClick={togglePlay}
        className="w-full h-full object-contain"
      />
      
      {/* 覆盖层：标题和半透明背景 */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <h2 className="text-foreground text-lg font-semibold">{title}</h2>
        </div>
      </div>

      {/* 自动播放失败时显示播放按钮 */}
      {autoplayFailed && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer" onClick={togglePlay}>
          <div className="bg-primary/80 hover:bg-primary rounded-full p-4 transition-colors">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      )}


      {/* 控制栏 */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* 进度条 */}
        <Slider.Root
          className="video-slider-root relative flex items-center w-full h-5 cursor-pointer"
          value={[currentTime]}
          max={duration}
          onValueChange={handleSeek}
        >
          <Slider.Track className="video-slider-track">
            <Slider.Range className="video-slider-range" />
          </Slider.Track>
          <Slider.Thumb className="video-slider-thumb" />
        </Slider.Root>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between mt-2 text-foreground">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => seek(-10)}>
              <Rewind />
            </Button>
            <div className="flex items-center group">
              <Button variant="ghost" size="icon" onClick={toggleMute}>
                {isMuted ? <VolumeX /> : <Volume2 />}
              </Button>
              <Slider.Root
                className="w-24 h-5 relative items-center hidden group-hover:flex"
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
              >
                <Slider.Track className="volume-slider-track">
                  <Slider.Range className="volume-slider-range" />
                </Slider.Track>
                <Slider.Thumb className="volume-slider-thumb" />
              </Slider.Root>
            </div>
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <Button variant="ghost" size="icon">
                <FastForward />
              </Button>
              <div className="absolute bottom-full mb-2 right-0 bg-card/80 rounded-md p-1 hidden group-hover:block">
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button key={rate} type="button" onClick={() => changePlaybackRate(rate)} className={`block w-full text-left px-3 py-1 text-sm text-foreground hover:bg-primary/20 rounded ${playbackRate === rate ? 'font-bold' : ''}`}>
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
            {pipEnabled && (
              <Button variant="ghost" size="icon" onClick={togglePip}>
                {isPip ? <PictureInPicture /> : <PictureInPicture2 />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
