<?php

/**
 * Plugin Name:       Git Grunt Test
 * Plugin URI:        http://mysite.com
 * Description:       Plugin descripton
 * Version:           1.0.0
 * Author:            PressApps
 * Author URI:        http://pressapps.co
 * Text Domain:       git-grunt-test
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-git-grunt-test-activator.php
 */
function activate_git_grunt_test() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-git-grunt-test-activator.php';
	Git_Grunt_Test_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-git-grunt-test-deactivator.php
 */
function deactivate_git_grunt_test() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-git-grunt-test-deactivator.php';
	Git_Grunt_Test_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_git_grunt_test' );
register_deactivation_hook( __FILE__, 'deactivate_git_grunt_test' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-git-grunt-test.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_git_grunt_test() {

	$plugin = new Git_Grunt_Test();
	$plugin->run();

}
run_git_grunt_test();
