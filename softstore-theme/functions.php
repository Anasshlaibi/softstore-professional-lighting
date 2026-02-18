<?php
/**
 * SoftStore Theme Functions
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function softstore_setup()
{
    // Add default posts and comments RSS feed links to head.
    add_theme_support('automatic-feed-links');

    // Let WordPress manage the document title.
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and pages.
    add_theme_support('post-thumbnails');

    // Register Navigation Menus
    register_nav_menus(
        array(
        'primary' => esc_html__('Primary Menu', 'softstore'),
        'footer' => esc_html__('Footer Menu', 'softstore'),
    )
    );
}
add_action('after_setup_theme', 'softstore_setup');

function softstore_scripts()
{
    // Enqueue Compiled Tailwind CSS
    wp_enqueue_style('softstore-style', get_stylesheet_uri()); // Main style.css
    // Note: style.css imports assets/css/app.css, but we can also enqueue it directly to be safe/faster
    // wp_enqueue_style( 'softstore-app', get_template_directory_uri() . '/assets/css/app.css', array(), '1.0.0' );

    // FontAwesome (from index.html)
    wp_enqueue_style('fontawesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', array(), '6.4.0');

    // Google Fonts (Inter)
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', array(), null);

    // Enqueue Compiled/Custom JS
    // We will place our custom logic in assets/js/custom.js (converted from React)
    // And if we have the bundled vendor code, we might enqueue that too, but likely we just need the custom logic

    // For now, let's enqueue the copied app.js (which might be the vite bundle) 
    // AND a new custom.js we will write for the logic migration.
    // Actually, the user asked to "Bundle/Extract JS logic into main.js". 
    // Since the original app.js is a React bundle, it might throw errors if there is no root element or if libraries are missing. 
    // We probably want to write a FRESH main.js with the Vanilla logic as requested.

    wp_enqueue_script('softstore-main', get_template_directory_uri() . '/assets/js/main.js', array(), '1.0.0', true);

// Localize script to pass PHP data if needed
// wp_localize_script( 'softstore-main', 'softstoreData', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
}
add_action('wp_enqueue_scripts', 'softstore_scripts');

// Include Data Simulation
require_once get_template_directory() . '/inc/data.php';

// Allow SVG uploads (optional, but likely needed for icons)
function softstore_mime_types($mimes)
{
    $mimes['svg'] = 'image/svg+xml';
    return $mimes;
}
add_filter('upload_mimes', 'softstore_mime_types');
