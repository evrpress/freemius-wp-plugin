<?php

namespace EverPress\FreemiusButton;

/**
 * Plugin Name:       Freemius Button
 * Description:       Freemius Button
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Version:           0.1.0
 * Author:            Xaver
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


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

	/**
	 * Filter the data that will be passed to the Freemius checkout.
	 *
	 * @param array $data The data that will be passed to the Freemius checkout.
	 */
	$data = \apply_filters( 'freemius_button_data', $block['attrs']['freemius'] );

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
