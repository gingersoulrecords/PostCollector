<?php
/*
Plugin Name: PostCollector
Plugin URI: https://davebloom.co/postcollector
Description: Collect post and page data, then use it for searching, AJAX loading, or anything else you can think of.
Version: 1.0
Author: Dave Bloom
Author URI: https://davebloom.co
License: GPL2
*/

function postcollector_collect_post_data()
{
    $args = array(
        'post_type' => array('post', 'page'),
        'posts_per_page' => -1,
    );
    $query = new WP_Query($args);
    $posts = $query->get_posts();
    $collection = array();
    foreach ($posts as $post) {
        $collection[] = array(
            'id' => $post->ID,
            'title' => $post->post_title,
            'url' => get_permalink($post),
            'content' => $post->post_content,
            'post_type' => $post->post_type,

        );
    }
    return $collection;
}

function postcollector_enqueue_scripts()
{

        // Quickscore
        wp_enqueue_script('quickscore_script', plugins_url('js/quick-score.min.js', __FILE__), array('jquery'), time(), true);


    wp_enqueue_script('postcollector_script', plugins_url('js/postcollector.js', __FILE__), array('quickscore_script'), time(), true);
    $collection = postcollector_collect_post_data();
    wp_localize_script('postcollector_script', 'postCollector', array('collections' => array('postsAndPages' => $collection)));


    // Postcollector CSS
    wp_enqueue_style('postcollector_style', plugins_url('css/postcollector.css', __FILE__), array(), '1.0');
}
add_action('wp_enqueue_scripts', 'postcollector_enqueue_scripts');

// Create a shortcode for the search input

function postcollector_search_input($atts) {
    // Extract shortcode attributes
    $atts = shortcode_atts(array(
        'collections' => 'postsAndPages',
        'results' => '.pc-results-container',
    ), $atts, 'pc-search');

    // Initialize the results container HTML
    $results_container_html = '';

    // If the 'results' attribute is '.pc-results-container', generate a results container
    if ($atts['results'] === '.pc-results-container') {
        $results_container_html = '<div class="pc-results-container"></div>';
    }

    // Return HTML for the search input and, if applicable, the results container, wrapped in a div with the class 'pc-search'
    return '
        <div class="pc-search">
            <input type="text" class="pc-search-input" data-collections="' . esc_attr($atts['collections']) . '" data-results="' . esc_attr($atts['results']) . '" placeholder="Search...">
            ' . $results_container_html . '
        </div>
    ';
}
add_shortcode('pc-search', 'postcollector_search_input');
