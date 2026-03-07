<?php
/**
 * The template for displaying the footer
 */
global $site_config;
?>

<footer id="contact" class="bg-white py-16 text-xs border-t border-gray-100">
    <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-500">
            <div class="col-span-1 md:col-span-2">
                <h4 class="text-black font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-bolt"></i> <?php echo esc_html($site_config['brandName']); ?>
                </h4>
                <p class="max-w-md leading-relaxed mb-6">
                    L'excellence de l'éclairage. Casablanca, Maroc.
                </p>
            </div>

            <div>
                <h5 class="text-black font-bold mb-4 uppercase tracking-wider">
                    Contact
                </h5>
                <ul class="space-y-3">
                    <li>
                        <a href="tel:<?php echo esc_attr($site_config['phone']); ?>" class="hover:text-black transition font-medium text-black">
                            <?php echo esc_html($site_config['displayPhone']); ?>
                        </a>
                    </li>
                    <li>
                        <a href="mailto:<?php echo esc_attr($site_config['email']); ?>" class="hover:text-black transition">
                            <?php echo esc_html($site_config['email']); ?>
                        </a>
                    </li>
                    <li>Casablanca, Maroc</li>
                </ul>
            </div>

            <div>
                <h5 class="text-black font-bold mb-4 uppercase tracking-wider">
                    Suivez-nous
                </h5>
                <div class="flex gap-4 text-lg">
                    <a href="https://www.instagram.com/spidi8_8/" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-black transition transform hover:scale-110">
                        <i class="fa-brands fa-instagram"></i>
                    </a>
                    <a href="https://wa.me/212673011873" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-black transition transform hover:scale-110">
                        <i class="fa-brands fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </div>
        <div class="border-t border-gray-100 mt-16 pt-8 text-center text-gray-400">
            <p>
                &copy; <?php echo date('Y'); ?> SoftStore Inc. All rights reserved.
            </p>
        </div>
    </div>
</footer>

<!-- Generic Product Detail Modal -->
<?php

global $products;
?>
<script>
    window.productsData = <?php echo json_encode($products); ?>;
</script>
<?php get_template_part('template-parts/modal'); ?>

<!-- Cart Sidebar (Simulated) -->
<div id="cart-sidebar" class="fixed inset-0 z-[60] hidden" aria-hidden="true">
    <div class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onclick="toggleCart()"></div>
    <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 translate-x-full" id="cart-panel">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-md sticky top-0 z-10">
            <h2 class="text-xl font-bold flex items-center gap-2">
                <i class="fa-solid fa-bag-shopping"></i> Votre Panier
            </h2>
            <button onclick="toggleCart()" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition" aria-label="Fermer">
                <i class="fa-solid fa-xmark text-sm"></i>
            </button>
        </div>

        <div id="cart-items-container" class="flex-1 overflow-y-auto p-6 space-y-4">
            <!-- Items injected by JS -->
            <div class="flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
                <i class="fa-solid fa-basket-shopping text-4xl mb-4 opacity-20"></i>
                Votre panier est vide.
            </div>
        </div>

        <div id="cart-summary" class="p-6 bg-gray-50 border-t border-gray-100 hidden">
             <div class="space-y-3 mb-6">
                <div class="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span id="cart-subtotal"></span>
                </div>
                <div id="cart-discount-row" class="flex justify-between text-green-600 hidden">
                    <span>Remise</span>
                    <span id="cart-discount"></span>
                </div>
                <div class="flex justify-between text-xl font-bold text-black pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span id="cart-total"></span>
                </div>
            </div>
            
            <div class="flex gap-2 mb-4">
                <input type="text" id="promo-input" placeholder="Code Promo" class="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black uppercase">
                <button onclick="applyPromo()" class="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-lg text-sm font-medium transition">
                    Appliquer
                </button>
            </div>

            <button onclick="openCheckout()" class="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2">
                Commander <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    </div>
</div>

<!-- Checkout Modal -->
<div id="checkout-modal" class="fixed inset-0 bg-white/95 backdrop-blur-md z-[90] overflow-y-auto hidden" aria-hidden="true">
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-8 relative">
            <button onclick="closeCheckout()" class="absolute top-6 right-6 text-gray-400 hover:text-black transition">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                <i class="fa-solid fa-truck-fast"></i> Livraison
            </h2>

            <form id="checkout-form" class="space-y-4" onsubmit="handleCheckout(event)">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom Complet</label>
                    <input type="text" name="name" required class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition" placeholder="Votre nom">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Téléphone</label>
                    <input type="tel" name="phone" required class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition" placeholder="06...">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ville</label>
                    <select name="city" required class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition appearance-none" onchange="updateShipping(this.value)">
                        <option value="30">Casablanca (30 <?php echo esc_html($site_config['currency']); ?>)</option>
                        <option value="50">Autre ville (50 <?php echo esc_html($site_config['currency']); ?>)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Adresse</label>
                    <textarea name="address" required rows="2" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition" placeholder="Quartier, Rue..."></textarea>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                    <textarea name="message" rows="2" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-black focus:outline-none focus:border-black transition" placeholder="Instructions..."></textarea>
                </div>

                <div class="border-t border-dashed border-gray-200 pt-4 mt-6 space-y-2">
                    <div class="text-sm font-bold mb-2">Récapitulatif:</div>
                    <div id="checkout-recap" class="space-y-1"></div>
                    <div class="flex justify-between text-sm text-gray-500">
                        <span>Livraison</span>
                        <span id="checkout-shipping">30 <?php echo esc_html($site_config['currency']); ?></span>
                    </div>
                    <div class="flex justify-between text-xl font-bold text-black pt-2 border-t border-gray-100 mt-2">
                        <span>Total à Payer</span>
                        <span id="checkout-total"></span>
                    </div>
                </div>

                <button type="submit" id="checkout-submit-btn" class="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:opacity-90 transition shadow-lg flex justify-center items-center gap-2 mt-4 text-lg">
                    <i class="fa-brands fa-whatsapp text-2xl"></i> Confirmer
                </button>
            </form>
        </div>
    </div>
</div>

<!-- Floating WhatsApp -->
<div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
    <a
        href="https://wa.me/<?php echo str_replace('+', '', $site_config['phone']); ?>"
        target="_blank"
        rel="noopener noreferrer"
        class="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        aria-label="Contact WhatsApp"
    >
        <i class="fa-brands fa-whatsapp text-2xl"></i>
        <span class="absolute right-full mr-3 bg-white text-black px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Discutez avec nous
        </span>
    </a>
</div>

</main><!-- #site-content -->

<?php wp_footer(); ?>
</body>
</html>
