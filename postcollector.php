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
    wp_enqueue_script('postcollector_script', plugins_url('js/postcollector.js', __FILE__), array('jquery'), '1.0', true);
    $collection = postcollector_collect_post_data();
    wp_localize_script('postcollector_script', 'postCollector', array('collections' => array('postsAndPages' => $collection)));
}
add_action('wp_enqueue_scripts', 'postcollector_enqueue_scripts');
