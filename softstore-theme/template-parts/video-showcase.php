<?php
/**
 * Template part for Video Showcase
 */
global $site_config;

// Helper to get YouTube Embed URL
function get_youtube_embed_url($url_or_id)
{
    if (!$url_or_id)
        return null;
    if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $url_or_id)) {
        return "https://www.youtube.com/embed/" . $url_or_id;
    }
    preg_match('/(?:v=|\/embed\/|\.be\/|youtu\.be\/|\/v\/)([^#\&\?]*).*/', $url_or_id, $matches);
    return (isset($matches[1]) && strlen($matches[1]) === 11) ? "https://www.youtube.com/embed/" . $matches[1] : null;
}

$video1Url = get_youtube_embed_url($site_config['video1']);
$video2Url = get_youtube_embed_url($site_config['video2']);
?>
<section id="videos" class="py-16 md:py-24 bg-[#f5f5f7]">
    <div class="container mx-auto px-4 md:px-6">
        <div class="text-center mb-10 md:mb-16">
            <h2 class="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                Performance Réelle.
            </h2>
            <p class="text-gray-500 text-sm md:text-base">
                Nos produits testés en conditions extrêmes.
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div class="aspect-video bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <?php if ($video1Url): ?>
                    <iframe
                        src="<?php echo esc_url($video1Url); ?>"
                        title="Promotional Video"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        class="w-full h-full"
                    ></iframe>
                <?php
else: ?>
                    <div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        Vidéo 1 Indisponible
                    </div>
                <?php
endif; ?>
            </div>
            <div class="aspect-video bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <?php if ($video2Url): ?>
                    <iframe
                        src="<?php echo esc_url($video2Url); ?>"
                        title="Review Video"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        class="w-full h-full"
                    ></iframe>
                <?php
else: ?>
                    <div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        Vidéo 2 Indisponible
                    </div>
                <?php
endif; ?>
            </div>
        </div>
    </div>
</section>
