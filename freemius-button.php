<?php

namespace EverPress\FreemiusButton;

/**
 * Plugin Name:       Freemius Button
 * Description:       Freemius Button
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Version:           0.1.4
 * Author:            Xaver
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


require_once __DIR__ . '/vendor/autoload.php';


// Initialize the updater
class_exists( 'EverPress\WPUpdater' ) && \EverPress\WPUpdater::add(
	'freemius-button/freemius-button.php',
	array(
		'repository' => 'evrpress/freemius-button',
	)
);


\add_action( 'enqueue_block_assets', __NAMESPACE__ . '\block_script_styles', 1 );
function block_script_styles() {

	if ( ! is_admin() ) {
		return;
	}

	$plugin_dir = \plugin_dir_path( __FILE__ );
	$plugin_url = \plugin_dir_url( __FILE__ );

	// load from assets.php
	$dependecied = include $plugin_dir . 'build/editor.asset.php';

	\wp_enqueue_script( 'freemius-button', $plugin_url . 'build/editor.js', $dependecied['dependencies'], $dependecied['version'], true );
	\wp_enqueue_style( 'freemius-button', $plugin_url . 'build/editor.css', array(), $dependecied['version'] );

	// @TODO: load this via API in the editor.js
	\wp_add_inline_script( 'freemius-button', 'const freemius_button_schema = ' . json_encode( get_schema() ) . '', true );
}



\add_filter( 'render_block_core/button', __NAMESPACE__ . '\render_button', 10, 3 );
function render_button( $block_content, $block, $instance ) {

	if ( ! isset( $block['attrs'] ) ) {
		return $block_content;
	}
	if ( ! isset( $block['attrs']['freemius'] ) ) {
		return $block_content;
	}
	if ( ! $block['attrs']['freemius_enabled'] ) {
		return $block_content;
	}

	// merge the data from the site, the page and the block
	$site_data   = \get_option( 'freemius_button', array() );
	$page_data   = \get_post_meta( get_the_ID(), 'freemius_button', true );
	$blugin_data = $block['attrs']['freemius'];

	$data = array_merge( $site_data, $page_data, $blugin_data );

	/**
	 * Filter the data that will be passed to the Freemius checkout.
	 *
	 * @param array $data The data that will be passed to the Freemius checkout.
	 */
	$data = \apply_filters( 'freemius_button_data', $data );

	$extra = '';
	// $extra  .= '<pre type="application/json">' . json_encode( $data ) . '</pre>';
	$extra .= '<script type="application/json" class="freemius-button-data">' . json_encode( $data ) . '</script>';

	$plugin_dir = \plugin_dir_path( __FILE__ );
	$plugin_url = \plugin_dir_url( __FILE__ );

	\wp_enqueue_script( 'freemius-button-checkout', 'https://checkout.freemius.com/js/v1/', array(), '0.1.0', true );

	// load from assets.php
	$dependecied = include $plugin_dir . 'build/view.asset.php';
	\wp_enqueue_script( 'freemius-button-frontend', $plugin_url . 'build/view.js', $dependecied['dependencies'], $dependecied['version'], true );
	\wp_enqueue_style( 'freemius-button-frontend', $plugin_url . 'build/view.css', array(), $dependecied['version'] );

	return $extra . $block_content;
}


// register custom post meta to store the button data
\add_action( 'init', __NAMESPACE__ . '\register_post_meta' );
function register_post_meta() {

	\register_post_meta(
		'', // regisert for all post types
		'freemius_button',
		array(
			'single'            => true,
			'type'              => 'object',
			'sanitize_callback' => __NAMESPACE__ . '\sanitize_schema',
			'default'           => array(),
			'show_in_rest'      => array(
				'schema' => array(
					'type'                 => 'object',
					'properties'           => get_schema(),
					'additionalProperties' => false,

				),

			),
		)
	);
}

// register a setting to store the button data
\add_action( 'init', __NAMESPACE__ . '\register_my_setting' );
\add_action( 'rest_api_init', __NAMESPACE__ . '\register_my_setting' );


function register_my_setting() {

	\register_setting(
		'options',
		'freemius_button',
		array(
			'single'            => true,
			'label'             => 'Freemius Button',
			'type'              => 'object',
			'sanitize_callback' => __NAMESPACE__ . '\sanitize_schema',
			'show_in_rest'      => array(
				'schema' => array(
					'type'                 => 'object',
					'properties'           => get_schema(),
					'additionalProperties' => false,

				),

			),
		)
	);
}

function sanitize_schema( $settings ) {

	foreach ( $settings as $key => $value ) {
		if ( $settings[ $key ] === '' ) {
			unset( $settings[ $key ] );
		}
	}

	return $settings;
}

function get_schema() {

	$plugin_dir = \plugin_dir_path( __FILE__ );
	$schema     = include $plugin_dir . 'includes/schema.php';

	return $schema;
}
