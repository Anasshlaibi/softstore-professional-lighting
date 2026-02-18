<?php
/**
 * Template part for Why Us section
 */
global $site_config;
?>
<section id="whyus" class="py-16 md:py-24 bg-white">
    <div class="container mx-auto px-4 md:px-6">
        <div class="bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
            <div class="md:w-1/2 flex items-center justify-center p-8 h-80 md:h-auto">
                <img
                    src="<?php echo esc_url($site_config['whyImg']); ?>"
                    loading="lazy"
                    alt="SoftStore product in action"
                    class="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-700"
                />
            </div>
            <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h3 class="text-2xl md:text-3xl font-bold mb-4">
                    <?php echo esc_html($site_config['whyTitle']); ?>
                </h3>
                <p class="text-gray-500 mb-8 leading-relaxed">
                    <?php echo esc_html($site_config['whyText']); ?>
                </p>
                <div class="grid grid-cols-2 gap-6">
                    <div class="border-l-2 border-black pl-4">
                        <span class="block text-2xl font-bold text-black">
                            2019
                        </span>
                        <span class="text-xs text-gray-400 uppercase tracking-wider">
                            Fondation
                        </span>
                    </div>
                    <div class="border-l-2 border-black pl-4">
                        <span class="block text-2xl font-bold text-black">50+</span>
                        <span class="text-xs text-gray-400 uppercase tracking-wider">
                            Pays
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
