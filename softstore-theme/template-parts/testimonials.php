<?php
/**
 * Template part for Testimonials
 */
$testimonials = [
    [
        'id' => 1,
        'name' => "Mohamed A.",
        'role' => "Photographe Professionnel",
        'rating' => 5,
        'text' => "Qualité exceptionnelle! Mon studio n'a jamais été aussi bien éclairé. Le rendu des couleurs est parfait.",
    ],
    [
        'id' => 2,
        'name' => "Fatima Z.",
        'role' => "Réalisatrice Vidéo",
        'rating' => 5,
        'text' => "Matériel professionnel, livraison rapide et excellent service client. Je recommande vivement!",
    ],
    [
        'id' => 3,
        'name' => "Youssef K.",
        'role' => "YouTuber",
        'rating' => 5,
        'text' => "Les LED portables sont parfaites pour mes tournages en extérieur. Légères et puissantes!",
    ],
    [
        'id' => 4,
        'name' => "Sanaa M.",
        'role' => "Photographe de Mariage",
        'rating' => 5,
        'text' => " Service impeccable et conseils d'experts. Mes photos de mariages n'ont jamais été aussi belles.",
    ]
];
?>
<section class="py-16 md:py-24 bg-gray-50">
    <div class="container mx-auto px-4 md:px-6">
        <div class="text-center mb-10 md:mb-16">
            <h2 class="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                Ce que disent nos clients.
            </h2>
            <p class="text-gray-500 text-sm md:text-base">
                Rejoignez des centaines de professionnels satisfaits.
            </p>
        </div>

        <!-- Testimonial Card Container -->
        <div class="max-w-4xl mx-auto" id="testimonials-container">
            <!-- Testimonials rendered here via JS or simple PHP init active class -->
             <?php foreach ($testimonials as $index => $t): ?>
                <div class="testimonial-slide bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 <?php echo $index === 0 ? '' : 'hidden'; ?>" data-index="<?php echo $index; ?>">
                    <div class="text-center">
                        <!-- Stars -->
                        <div class="flex justify-center gap-1 mb-6">
                             <?php for ($i = 0; $i < 5; $i++): ?>
                                <i class="fa-solid fa-star text-sm <?php echo $i < $t['rating'] ? 'text-yellow-400' : 'text-gray-200'; ?>"></i>
                             <?php
    endfor; ?>
                        </div>

                        <!-- Quote -->
                        <blockquote class="text-xl md:text-2xl font-light text-gray-800 leading-relaxed mb-8">
                            &ldquo;<?php echo esc_html($t['text']); ?>&rdquo;
                        </blockquote>

                        <!-- Author -->
                        <div>
                            <p class="text-lg font-bold text-black"><?php echo esc_html($t['name']); ?></p>
                            <p class="text-sm text-gray-500"><?php echo esc_html($t['role']); ?></p>
                        </div>
                    </div>
                </div>
            <?php
endforeach; ?>

            <!-- Dots Navigation -->
            <div class="flex justify-center gap-2 mt-8">
                <?php foreach ($testimonials as $index => $t): ?>
                    <button
                        onclick="switchTestimonial(<?php echo $index; ?>)"
                        class="testimonial-dot w-2 h-2 rounded-full transition-all duration-300 <?php echo $index === 0 ? 'bg-black w-8' : 'bg-gray-300 hover:bg-gray-400'; ?>"
                        aria-label="Témoignage <?php echo $index + 1; ?>"
                    ></button>
                <?php
endforeach; ?>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-6 mt-16 text-center">
                <div>
                    <div class="text-3xl md:text-4xl font-bold text-black mb-2">500+</div>
                    <div class="text-sm text-gray-500">Clients Satisfaits</div>
                </div>
                <div>
                    <div class="text-3xl md:text-4xl font-bold text-black mb-2">4.9</div>
                    <div class="text-sm text-gray-500">Note Moyenne</div>
                </div>
                <div>
                    <div class="text-3xl md:text-4xl font-bold text-black mb-2">98%</div>
                    <div class="text-sm text-gray-500">Taux de Satisfaction</div>
                </div>
            </div>
        </div>
    </div>
</section>
