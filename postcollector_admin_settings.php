<?php
// Register the settings page
function postcollector_settings_page()
{
    add_options_page('PostCollector Settings', 'PostCollector', 'manage_options', 'postcollector', 'postcollector_settings_page_content');
}

// Display the settings page content
function postcollector_settings_page_content()
{
    // Check user capabilities
    if (!current_user_can('manage_options')) {
        return;
    }

    // Get all post types
    $post_types = get_post_types();

    // Get the saved option
    $selected_post_types = get_option('postcollector_post_types', array('post', 'page'));

    echo '<div class="wrap">';
    echo '<h1>' . esc_html(get_admin_page_title()) . '</h1>';
    echo '<form method="post" action="options.php">';

    // Output nonce, action, and option_page fields for a settings page.
    settings_fields('postcollector');
    do_settings_sections('postcollector');

    // Display checkboxes for each post type
    foreach ($post_types as $post_type) {
        echo '<p><input type="checkbox" name="postcollector_post_types[]" value="' . esc_attr($post_type) . '"' . (in_array($post_type, $selected_post_types) ? ' checked' : '') . '> ' . esc_html($post_type) . '</p>';
    }

    // Submit button
    submit_button('Save Settings');

    echo '</form>';
    echo '</div>';
}

// Register the setting
function postcollector_register_settings()
{
    register_setting('postcollector', 'postcollector_post_types');
}

add_action('admin_menu', 'postcollector_settings_page');
add_action('admin_init', 'postcollector_register_settings');
