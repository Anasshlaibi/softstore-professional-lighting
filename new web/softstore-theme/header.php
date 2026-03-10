<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
    <meta name="description" content="Équipement d'éclairage professionnel ZSYB pour studios photo/vidéo. CRI 97+, livraison rapide au Maroc. Projecteurs, LED portables, accessoires. Conseils d'experts à Casablanca.">
    <meta name="keywords" content="éclairage studio, softbox, LED professionnel, ZSYB, Casablanca, Maroc, matériel cinéma, éclairage vidéo, projecteur LED">
    <meta name="author" content="SoftStore">

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '763866016437543');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=763866016437543&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->

	<?php wp_head(); ?>
</head>

<body <?php body_class('bg-amber-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased font-sans transition-colors duration-300'); ?>>
<?php wp_body_open(); ?>

<?php

// Global Site Config (Mock Data)
global $site_config;

?>

<header id="site-header" class="fixed w-full z-50 transition-all duration-300 bg-transparent">
    <div class="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        
        <!-- Logo / Brand -->
        <div class="flex items-center gap-2 cursor-pointer group" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })">
            <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-md">
                <i class="fa-solid fa-bolt text-sm"></i>
            </div>
            <span class="site-title text-lg md:text-xl font-bold tracking-tight text-white transition-colors duration-300">
                <?php echo esc_html($site_config['brandName'] ?? 'SoftStore'); ?>
            </span>
        </div>

        <!-- Navigation (Desktop) -->
        <nav class="hidden md:flex items-center space-x-10 text-sm font-medium">
            <?php
// We use static links for now to match the "One Page" design, 
// but wrapped in PHP to allow dynamic menu later if needed.
// wp_nav_menu would be used here for a multi-page site.
$menu_items = [
    '#collection' => 'Produits',
    '#videos' => 'Vidéos',
    '#whyus' => 'À Propos'
];
foreach ($menu_items as $link => $label): ?>
                <a href="<?php echo esc_url($link); ?>" 
                   class="nav-link relative text-gray-200 hover:text-white transition-colors after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-[-4px] after:left-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">
                    <?php echo esc_html($label); ?>
                </a>
            <?php
endforeach; ?>
        </nav>

        <!-- Sort/Cart/Mobile Actions -->
        <div class="flex items-center gap-3 md:gap-5">
            <button id="cart-trigger" class="relative group p-1" aria-label="Panier">
                <div class="cart-icon-container p-2 rounded-full transition-colors duration-300 bg-white/20 text-white hover:bg-white/30">
                    <i class="fa-solid fa-bag-shopping text-lg block"></i>
                </div>
                <!-- Cart Badge (Hidden by default, toggled via JS) -->
                <span id="cart-badge" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm hidden">
                    0
                </span>
            </button>
        </div>
    </div>
</header>

<main id="site-content">
