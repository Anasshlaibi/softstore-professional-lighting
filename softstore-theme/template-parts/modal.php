<?php
/**
 * Generic Product Modal Template
 */
global $site_config;
?>
<div id="product-modal" class="fixed inset-0 bg-white z-[80] overflow-y-auto hidden" aria-hidden="true">
    <button
        onclick="closeProductModal()"
        class="fixed top-4 right-4 z-50 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition shadow-sm"
        aria-label="Fermer"
    >
        <i class="fa-solid fa-xmark text-xl text-black"></i>
    </button>

    <div class="container mx-auto min-h-screen flex items-center justify-center p-0 md:p-6">
        <div class="bg-white w-full max-w-6xl mx-auto md:rounded-3xl md:shadow-2xl md:border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-0 relative pb-[120px] md:pb-0">

            <!-- Left: Gallery -->
            <div class="md:w-1/2 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center pt-20 md:pt-16">
                <div class="w-full aspect-square flex items-center justify-center mb-6 relative">
                    <img id="modal-img-main" src="" alt="" class="max-w-full max-h-full object-contain mix-blend-multiply transition-all duration-300 drop-shadow-lg" />
                </div>
                <!-- Thumbnails -->
                <div id="modal-thumbnails" class="flex gap-3 overflow-x-auto w-full justify-center py-2 px-4 no-scrollbar snap-x snap-mandatory">
                    <!-- JS Injected -->
                </div>
            </div>

            <!-- Right: Info -->
            <div class="md:w-1/2 p-6 md:p-14 flex flex-col bg-white">
                <span id="modal-category" class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 capitalize"></span>
                <h2 id="modal-title" class="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight"></h2>

                <div class="flex items-center gap-2 mb-6">
                    <div id="modal-stars" class="flex text-apple-red text-sm"></div>
                    <span class="text-xs text-gray-400">(Avis Clients)</span>
                    <span id="modal-stock-badge" class="ml-auto text-xs font-bold px-2 py-1 rounded"></span>
                </div>

                <!-- Price Section -->
                <div class="mb-8 pb-8 border-b border-gray-100">
                    <div class="flex items-baseline gap-3 mb-2">
                        <span class="text-xs text-gray-400 uppercase tracking-wider font-bold">Achat:</span>
                        <span id="modal-price" class="text-3xl font-bold text-[#2D5A27]"></span> 
                        <span class="text-xs font-bold text-[#2D5A27]"><?php echo esc_html($site_config['currency']); ?></span>
                        <span id="modal-old-price" class="text-lg text-gray-400 line-through hidden"></span>
                        <span id="modal-discount" class="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded hidden"></span>
                    </div>

                    <div id="modal-rent-section" class="flex items-baseline gap-3 mb-4 hidden">
                        <span class="text-xs text-[#666666] uppercase tracking-wider font-bold">Location:</span>
                        <span id="modal-rent-price" class="text-xl font-bold text-[#666666]"></span>
                        <span class="text-xs text-gray-500">/ jour</span>
                    </div>

                    <div class="flex gap-3 flex-wrap">
                        <button id="modal-btn-cart" class="flex-1 px-6 py-4 bg-gray-100 text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                             <i class="fa-solid fa-plus"></i> <span class="btn-text">Top Text</span>
                        </button>
                        <button id="modal-btn-action" class="flex-1 px-6 py-4 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 bg-black hover:bg-gray-800">
                             <span class="btn-text">Action</span> <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>
                        </button>
                    </div>
                     <button id="modal-btn-rent" class="w-full mt-3 px-6 py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2 hidden">
                        <i class="fa-regular fa-calendar-check"></i> Louer sur WhatsApp
                    </button>
                </div>

                <!-- Tabs -->
                <div class="flex gap-8 border-b border-gray-100 mb-6 sticky top-0 bg-white z-10 pt-2">
                    <button onclick="switchTab('desc')" id="tab-desc" class="pb-2 text-sm font-medium transition border-b-2 border-black text-black">Description</button>
                    <button onclick="switchTab('specs')" id="tab-specs" class="pb-2 text-sm font-medium transition text-gray-500">Spécifications</button>
                    <button onclick="switchTab('video')" id="tab-video" class="pb-2 text-sm font-medium transition text-gray-500 hidden">Vidéo</button>
                </div>

                <div id="tab-content-desc" class="tab-content text-gray-600 text-sm leading-relaxed pb-4 text-justify flex-grow overflow-y-auto whitespace-pre-line"></div>
                <div id="tab-content-specs" class="tab-content hidden w-full text-sm text-left border-collapse"></div>
                <div id="tab-content-video" class="tab-content hidden aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg"></div>
            </div>
        </div>
    </div>
</div>
