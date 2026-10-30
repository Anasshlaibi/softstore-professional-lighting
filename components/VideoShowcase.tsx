import React, { useState } from 'react';

interface VideoShowcaseProps {
  siteConfig: {
    video1?: string;
    video2?: string;
  };
}

const getYoutubeEmbedUrl = (urlOrId?: string) => {
  if (!urlOrId) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId))
    return `https://www.youtube.com/embed/${urlOrId}?rel=0`;
  const regExp = /(?:v=|\/embed\/|\.be\/|youtu\.be\/|\/v\/)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  return match && match[1].length === 11
    ? `https://www.youtube.com/embed/${match[1]}?rel=0`
    : null;
};

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ siteConfig }) => {
  const video1Url = getYoutubeEmbedUrl(siteConfig.video1 || 'LcdLz8-JmI0');
  const video2Url = getYoutubeEmbedUrl(siteConfig.video2 || 't_leEVDR9Kc');
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  const VideoFrame = ({ url, title, index }: { url: string | null; title: string; index: number }) => {
    if (!url) {
      return <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-900">Vidéo indisponible</div>;
    }

    if (activeVideo !== index) {
      return (
        <button
          type="button"
          onClick={() => setActiveVideo(index)}
          className="group w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400"
          aria-label={`Lire ${title}`}
        >
          <span className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 transition flex items-center justify-center shadow-xl">
            <i className="fa-solid fa-play ml-1" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold">Cliquez pour lire la démonstration</span>
        </button>
      );
    }

    return (
      <iframe
        src={`${url}&autoplay=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    );
  };

  return (
    <section id="videos" className="py-12 md:py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider mb-2 border border-red-200 dark:border-red-900/50">
            <i className="fa-solid fa-play text-[10px]" />
            DÉMO &amp; ÉCLAIRAGE EN ACTION
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Performance &amp; Matériel en Conditions Réelles
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-1 font-medium">
            Découvrez nos objectifs photo/cinéma et éclairages professionnels testés sur le terrain.
          </p>
        </div>

        {/* 2 Videos Side by Side (1 Left, 1 Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Video 1: Left */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-gray-700">
            <div className="aspect-video w-full bg-black relative">
              <VideoFrame url={video1Url} title="Objectifs 7Artisans Démo" index={1} />
            </div>
            <div className="p-4 bg-white dark:bg-gray-800">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-camera text-red-600" />
                Objectifs 7Artisans &amp; Cinéma
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Test du piqué, autofocus et rendu cinématique T2.0.
              </p>
            </div>
          </div>

          {/* Video 2: Right */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-gray-700">
            <div className="aspect-video w-full bg-black relative">
              <VideoFrame url={video2Url} title="Éclairage Professionnel Démo" index={2} />
            </div>
            <div className="p-4 bg-white dark:bg-gray-800">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-lightbulb text-amber-500" />
                Éclairage &amp; Softstore Professional
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Installation et démonstration des kits d'éclairage studio pro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
