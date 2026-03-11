<?php
/**
 * The main template file
 */

get_header();

?>

<main id="site-content" class="bg-gray-50 flex-grow">

    <?php get_template_part('template-parts/hero'); ?>

    <?php get_template_part('template-parts/video-showcase'); ?>

    <?php get_template_part('template-parts/why-us'); ?>

    <?php get_template_part('template-parts/products'); ?>

    <?php get_template_part('template-parts/testimonials'); ?>

    <?php get_template_part('template-parts/faq'); ?>

</main>

<?php get_footer(); ?>
