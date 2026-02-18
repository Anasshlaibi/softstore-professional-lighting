<?php
/**
 * Template part for Products Grid
 */
global $products, $site_config;
?>
<section id="collection" class="py-12 md:py-20 bg-white">
    <div class="container mx-auto px-4 md:px-6">
        <!-- Header -->
        <div class="text-center mb-8 md:mb-12">
            <h2 class="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">
                Notre Collection.
            </h2>
            <p class="text-gray-500 text-sm md:text-base">
                Des solutions d'éclairage pour chaque projet.
            </p>
        </div>

        <!-- Search & Filters -->
        <div id="products-controls" class="mb-8 block">
            <!-- SearchBar -->
            <div class="relative w-full max-w-xl mx-auto mb-6">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fa-solid fa-search text-gray-400 text-sm"></i>
                    </div>
                    <input
                        type="text"
                        id="product-search-input"
                        placeholder="Rechercher un produit..."
                        class="w-full pl-11 pr-10 py-2.5 text-sm text-gray-900 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm hover:shadow-md placeholder-gray-400"
                    />
                    <button
                        id="search-clear-btn"
                        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors hidden"
                        aria-label="Effacer"
                    >
                        <i class="fa-solid fa-times text-sm"></i>
                    </button>
                </div>
            </div>

            <!-- ProductFilters -->
            <div class="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6">
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <!-- Category Filter -->
                    <div class="flex-1">
                        <label class="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                            Catégorie
                        </label>
                        <div class="flex flex-wrap gap-2" id="category-filters">
                            <button
                                data-category="all"
                                class="category-btn px-4 py-2 rounded-full text-sm font-medium transition-all bg-black text-white shadow-md"
                            >
                                Tous
                            </button>
                            <?php
// Extract unique categories from products
$categories = array_unique(array_column($products, 'category'));
foreach ($categories as $cat):
?>
                                <button
                                    data-category="<?php echo esc_attr($cat); ?>"
                                    class="category-btn px-4 py-2 rounded-full text-sm font-medium transition-all bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
                                >
                                    <?php echo ucfirst($cat); ?>
                                </button>
                            <?php
endforeach; ?>
                        </div>
                    </div>

                    <!-- Sort Dropdown -->
                    <div class="w-full lg:w-56">
                        <label class="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                            Trier par
                        </label>
                        <select
                            id="sort-select"
                            class="w-full px-4 py-2 pr-8 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm font-medium"
                        >
                            <option value="name-asc">Nom (A → Z)</option>
                            <option value="name-desc">Nom (Z → A)</option>
                            <option value="price-asc">Prix (Bas → Élevé)</option>
                            <option value="price-desc">Prix (Élevé → Bas)</option>
                        </select>
                    </div>

                    <!-- Stock Filter -->
                    <div class="flex items-center gap-3">
                        <label class="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="stock-filter"
                                class="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2 cursor-pointer"
                            />
                            <span class="ml-2 text-sm font-medium text-gray-900">En stock uniquement</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Results Count -->
             <div class="mb-6 text-sm text-gray-600" id="results-count">
                <?php echo count($products); ?> produits trouvés
            </div>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
            <?php foreach ($products as $product):
    $discount = ($product['oldPrice'] && $product['oldPrice'] > $product['price'])
        ? round((($product['oldPrice'] - $product['price']) / $product['oldPrice']) * 100)
        : 0;
?>
                <div class="product-card rounded-2xl overflow-hidden group relative flex flex-col h-full bg-white cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300"
                     data-product-id="<?php echo esc_attr($product['id']); ?>">
                    
                    <?php if (!$product['inStock']): ?>
                        <div class="absolute top-2 left-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20">
                            Rupture
                        </div>
                    <?php
    endif; ?>
                    
                    <?php if (isset($product['rentPrice']) && $product['rentPrice'] > 0): ?>
                        <div class="absolute bottom-24 right-2 md:bottom-auto md:top-2 md:left-auto md:right-2 bg-gray-100 text-[#666666] text-xs font-bold px-2 py-1 rounded shadow-sm z-20">
                            <i class="fa-solid fa-calendar-check mr-1"></i> Location
                        </div>
                    <?php
    endif; ?>

                    <?php if (!empty($product['video'])): ?>
                        <div class="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-20">
                            <i class="fa-solid fa-play"></i>
                        </div>
                    <?php
    endif; ?>

                    <div class="h-auto aspect-[4/5] md:aspect-square bg-white flex items-center justify-center p-0 relative overflow-hidden group-hover:bg-gray-50 transition-colors duration-500">
                        <img
                            src="<?php echo esc_url($product['image']); ?>"
                            alt="<?php echo esc_attr($product['name']); ?>"
                            class="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-xl mix-blend-multiply <?php echo !$product['inStock'] ? 'grayscale opacity-80' : ''; ?>"
                            loading="lazy"
                            width="400"
                            height="400"
                        />
                    </div>

                    <div class="p-3 md:p-6 flex flex-col flex-grow">
                        <div class="flex items-center gap-1 mb-1 md:mb-2">
                             <?php for ($i = 0; $i < 5; $i++): ?>
                                <i class="fa-solid fa-star text-[10px] <?php echo $i < $product['stars'] ? 'text-[#ff3b30]' : 'text-gray-200'; ?>"></i>
                             <?php
    endfor; ?>
                        </div>
                        <h3 class="text-sm md:text-lg font-bold text-black mb-1 leading-tight line-clamp-2">
                            <?php echo esc_html($product['name']); ?>
                        </h3>
                        <p class="text-xs text-gray-500 mb-2 md:mb-4 uppercase">
                            <?php echo esc_html($product['category']); ?>
                        </p>
                        
                        <?php if ($product['inStock']): ?>
                            <div class="flex items-center gap-2 text-xs text-[#666666] mb-2">
                                <span class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Disponible immédiatement à Bouskoura
                            </div>
                        <?php
    endif; ?>

                        <div class="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                            <div class="flex flex-col">
                                <div class="flex items-center">
                                    <span class="text-[#2D5A27] font-bold text-sm md:text-lg">
                                        <?php echo esc_html($product['price']); ?> 
                                        <span class="text-xs"><?php echo esc_html($site_config['currency']); ?></span>
                                    </span>
                                    <?php if ($discount > 0): ?>
                                        <span class="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded ml-2">
                                            -<?php echo $discount; ?>%
                                        </span>
                                    <?php
    endif; ?>
                                </div>
                                <?php if ($product['oldPrice']): ?>
                                    <span class="text-xs text-gray-400 line-through font-medium">
                                        <?php echo esc_html($product['oldPrice']); ?> <?php echo esc_html($site_config['currency']); ?>
                                    </span>
                                <?php
    endif; ?>
                                <?php if (isset($product['rentPrice']) && $product['rentPrice'] > 0): ?>
                                    <span class="text-xs text-[#666666] font-medium mt-1">
                                        Loc: <?php echo esc_html($product['rentPrice']); ?> <?php echo esc_html($site_config['currency']); ?>/j
                                    </span>
                                <?php
    endif; ?>
                            </div>
                            
                            <button
                                class="add-to-cart-btn text-xs font-bold py-2 rounded-full transition shadow-lg flex items-center gap-2 transform active:scale-95 duration-200 <?php echo !$product['inStock'] ? 'bg-orange-500 text-white hover:bg-orange-600 px-3' : 'bg-black text-white hover:bg-gray-800 px-4'; ?>"
                                data-product-id="<?php echo esc_attr($product['id']); ?>"
                                data-stock="<?php echo $product['inStock'] ? 'true' : 'false'; ?>"
                                onclick="event.stopPropagation();" 
                            >
                                <?php if (!$product['inStock']): ?>
                                    <i class="fa-solid fa-clock"></i> Réserver
                                <?php
    else: ?>
                                    <i class="fa-solid fa-plus"></i>
                                <?php
    endif; ?>
                            </button>
                        </div>
                    </div>
                </div>
            <?php
endforeach; ?>
        </div>
    </div>
</section>
