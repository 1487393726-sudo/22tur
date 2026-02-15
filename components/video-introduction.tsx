"use client";

import { useState, useMemo, useEffect } from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import type { VideoSection as VideoData } from "@/types/homepage";

interface Video {
  id: string;
  src: string;
  poster?: string;
  title: string;
  description?: string;
}

export function VideoIntroduction() {
  const { t, locale } = useLanguage();
  const [currentVideoId, setCurrentVideoId] = useState("1");
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  useEffect(() => {
    fetch("/api/homepage/video")
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data) {
          setVideoData(result.data);
        }
      })
      .catch(() => {
        // Fallback to static content on error
      });
  }, []);

  // Helper to get localized content
  const getContent = (zh: string | null | undefined, en: string | null | undefined, fallback: string) => {
    if (locale === "en") {
      return en || zh || fallback;
    }
    return zh || en || fallback;
  };
  
  const videos: Video[] = useMemo(() => {
    // If we have API data, use it as the first video
    const apiVideo: Video | null = videoData ? {
      id: "api",
      src: videoData.videoUrl,
      poster: videoData.thumbnail || undefined,
      title: getContent(videoData.title, videoData.titleEn, t.video.videos.intro.title),
      description: getContent(videoData.description, videoData.descriptionEn, t.video.videos.intro.description),
    } : null;

    const defaultVideos: Video[] = [
      {
        id: "1",
        src: "/videos/intro.mp4",
        poster: "/videos/intro-poster.jpg",
        title: t.video.videos.intro.title,
        description: t.video.videos.intro.description,
      },
      {
        id: "2",
        src: "/videos/services.mp4",
        poster: "/videos/services-poster.jpg",
        title: t.video.videos.services.title,
        description: t.video.videos.services.description,
      },
      {
        id: "3",
        src: "/videos/portfolio.mp4",
        poster: "/videos/portfolio-poster.jpg",
        title: t.video.videos.portfolio.title,
        description: t.video.videos.portfolio.description,
      },
      {
        id: "4",
        src: "/videos/intro.mp4",
        poster: "/videos/intro-poster.jpg",
        title: t.video.videos.branding.title,
        description: t.video.videos.branding.description,
      },
      {
        id: "5",
        src: "/videos/services.mp4",
        poster: "/videos/services-poster.jpg",
        title: t.video.videos.creative.title,
        description: t.video.videos.creative.description,
      },
      {
        id: "6",
        src: "/videos/portfolio.mp4",
        poster: "/videos/portfolio-poster.jpg",
        title: t.video.videos.aboutUs.title,
        description: t.video.videos.aboutUs.description,
      },
    ];

    // If API video exists, replace the first video or add it
    if (apiVideo) {
      return [apiVideo, ...defaultVideos.slice(1)];
    }
    return defaultVideos;
  }, [t, videoData, locale]);

  // Set initial video to API video if available
  useEffect(() => {
    if (videoData) {
      setCurrentVideoId("api");
    }
  }, [videoData]);

  const currentVideo = videos.find(v => v.id === currentVideoId) || videos[0];

  const handleSelectVideo = (video: Video) => {
    setCurrentVideoId(video.id);
  };

  return (
    <section className="py-12 bg-background text-foreground">
      <div className="container mx-auto px-4">
        {/* Main Player */}
        <div className="mb-8 max-w-5xl mx-auto">
          <VideoPlayer
            key={currentVideo.id} // Force re-render on video change
            src={currentVideo.src}
            poster={currentVideo.poster}
            title={currentVideo.title}
            autoPlay={false}
          />
        </div>

        {/* Thumbnails Playlist */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => handleSelectVideo(video)}
              className={cn(
                "relative rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background group",
                {
                  "ring-2 ring-primary ring-offset-2 ring-offset-background":
                    currentVideo.id === video.id,
                }
              )}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300"></div>
              <img
                src={video.poster}
                alt={video.title}
                className="w-full h-full object-cover aspect-video"
              />
              <div className="absolute bottom-0 left-0 p-2">
                <h3 className="text-foreground text-sm font-semibold truncate">
                  {video.title}
                </h3>
              </div>
              {currentVideo.id === video.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-foreground text-xs font-bold bg-primary px-2 py-1 rounded">
                    {t.video.playing}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
