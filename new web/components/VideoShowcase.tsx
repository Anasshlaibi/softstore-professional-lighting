import React from 'react';

interface VideoShowcaseProps {
  siteConfig: {
    video1?: string;
    video2?: string;
  };
}

const getYoutubeEmbedUrl = (urlOrId?: string) => {
  if (!urlOrId) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId))
    return `https://www.youtube.com/embed/${urlOrId}`;
  const regExp = /(?:v=|\/embed\/|\.be\/|youtu\.be\/|\/v\/)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  return match && match[1].length === 11
    ? `https://www.youtube.com/embed/${match[1]}`
    : null;
};

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ siteConfig }) => {
  const video1Url = getYoutubeEmbedUrl(siteConfig.video1);
  const video2Url = getYoutubeEmbedUrl(siteConfig.video2);

  return (
    <section id="videos" className="py-16 md:py-24 bg-[#f5f5f7]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
            Performance Réelle.
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Nos produits testés en conditions extrêmes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="aspect-video bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {video1Url ? (
              <iframe
                src={video1Url}
                title="Promotional Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                Vidéo 1 Indisponible
              </div>
            )}
          </div>
          <div className="aspect-video bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
            {video2Url ? (
              <iframe
                src={video2Url}
                title="Review Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                Vidéo 2 Indisponible
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
