<?php

namespace EverPress;

if ( class_exists( 'Updater' ) ) {
	return;
}

class Updater {
	private static $instance = null;
	private $username;
	private $repository;
	private $current_version;
	private $plugin_slug;

	private function __construct( $args ) {
		$this->username        = $args['username'];
		$this->repository      = $args['repository'];
		$this->current_version = $args['current_version'];
		$this->plugin_slug     = $args['plugin_slug'];

		add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'check_for_update' ) );
		add_filter( 'plugins_api', array( $this, 'plugin_info' ), 10, 3 );
		add_filter( 'upgrader_source_selection', array( $this, 'rename_github_zip' ), 10, 3 );
	}

	public static function get_instance( $args ) {
		if ( self::$instance === null ) {
			self::$instance = new self( $args );
		}
		return self::$instance;
	}

	public function check_for_update( $transient ) {
		if ( empty( $transient->checked[ $this->plugin_slug ] ) ) {
			return $transient;
		}

		$remote_info = $this->get_remote_info();
		if ( $remote_info && version_compare( $this->current_version, $remote_info->tag_name, '<' ) ) {
			$plugin_data                               = array(
				'slug'        => $this->plugin_slug,
				'new_version' => $remote_info->tag_name,
				'url'         => $remote_info->html_url,
				'package'     => $remote_info->zipball_url,
			);
			$transient->response[ $this->plugin_slug ] = (object) $plugin_data;
		}

		return $transient;
	}

	public function plugin_info( $result, $action, $args ) {
		if ( $action !== 'plugin_information' || $args->slug !== $this->plugin_slug ) {
			return $result;
		}

		$remote_info = $this->get_remote_info();
		if ( ! $remote_info ) {
			return $result;
		}

		return (object) array(
			'name'          => $this->repository,
			'slug'          => $this->plugin_slug,
			'version'       => $remote_info->tag_name,
			'author'        => 'Your Name',
			'homepage'      => $remote_info->html_url,
			'download_link' => $remote_info->zipball_url,
		);
	}

	private function get_remote_info() {
		$response = wp_remote_get( "https://api.github.com/repos/{$this->username}/{$this->repository}/releases/latest" );

		if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
			return false;
		}

		return json_decode( wp_remote_retrieve_body( $response ) );
	}

	public function rename_github_zip( $source, $remote_source, $upgrader ) {
		if ( strpos( $source, strtolower( $this->username . '-' . $this->repository ) ) !== false ) {
			return trailingslashit( $upgrader->skin->plugin_info['slug'] );
		}
		return $source;
	}
}
