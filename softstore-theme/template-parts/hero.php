<?php
/**
 * Template part for displaying the Hero section
 */
global $site_config;
?>
<section class="relative h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black reveal">
    <!-- Background Image -->
    <img
        id="hero-img"
        src="<?php echo esc_url($site_config['heroImg']); ?>"
        alt="Background"
        class="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
        width="1920"
        height="1080"
        fetchpriority="high"
    />

    <!-- Dark Overlay -->
    <div class="absolute inset-0 bg-black/40 z-0"></div>

    <!-- Content -->
    <div class="container mx-auto px-6 relative z-10 text-center text-white mt-16">
        <div class="max-w-4xl mx-auto animate-fade-in">
            <span class="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-xs font-bold mb-6 tracking-wide border border-white/20 backdrop-blur-sm">
                Nouvelle Collection 2026
            </span>

            <h1 class="text-5xl md:text-8xl font-bold text-white mb-6 tracking-tight leading-tight">
                <span id="hero-title-1"><?php echo esc_html($site_config['hero1']); ?></span>
                <span id="hero-title-2" class="text-gray-300">
                    <?php echo esc_html($site_config['hero2']); ?>
                </span>
            </h1>
            <p
                id="hero-desc"
                class="text-gray-200 text-lg md:text-2xl font-light leading-relaxed max-w-2xl mx-auto mb-10"
            >
                <?php echo esc_html($site_config['heroDesc']); ?>
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                    href="#collection"
                    id="hero-btn-primary"
                    class="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition text-base shadow-xl transform hover:-translate-y-1"
                >
                    Découvrir la Collection
                </a>
                <a
                    href="#videos"
                    id="hero-btn-secondary"
                    class="w-full sm:w-auto px-8 py-4 text-white bg-transparent border border-white rounded-full hover:bg-white/10 transition text-base font-medium flex justify-center items-center gap-2"
                >
                    <i class="fa-solid fa-play text-xs"></i> Regarder
                </a>
            </div>

            <!-- Trust Message -->
            <div class="mt-6 text-white/80 text-sm">
                Livraison gratuite • Garantie 1 an • Retour 14 jours
            </div>
        </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <i class="fa-solid fa-chevron-down text-2xl"></i>
    </div>

    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { 
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards; 
        }
    </style>
</section>
