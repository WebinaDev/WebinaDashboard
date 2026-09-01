<?php
/**
 * Optional SMTP configuration for wp_mail.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Applies dashboard SMTP settings to PHPMailer.
 */
final class Webino_Dashboard_Mailer {

	/**
	 * @return void
	 */
	public static function init() {
		add_action( 'phpmailer_init', array( __CLASS__, 'configure_phpmailer' ), 20 );
	}

	/**
	 * @return array<string,mixed>
	 */
	public static function smtp_settings() {
		if ( ! class_exists( 'Webino_Dashboard_Notify', false ) ) {
			return array();
		}
		$s = Webino_Dashboard_Notify::get_settings();
		return isset( $s['email']['smtp'] ) && is_array( $s['email']['smtp'] ) ? $s['email']['smtp'] : array();
	}

	/**
	 * @param PHPMailer\PHPMailer\PHPMailer $phpmailer Mailer.
	 * @return void
	 */
	public static function configure_phpmailer( $phpmailer ) {
		$smtp = self::smtp_settings();
		if ( empty( $smtp['enabled'] ) ) {
			return;
		}
		$host = trim( (string) ( $smtp['host'] ?? '' ) );
		if ( '' === $host ) {
			return;
		}

		$phpmailer->isSMTP();
		$phpmailer->Host       = $host;
		$phpmailer->Port       = max( 1, (int) ( $smtp['port'] ?? 587 ) );
		$phpmailer->SMTPAuth   = true;
		$phpmailer->Username   = (string) ( $smtp['username'] ?? '' );
		$phpmailer->Password   = (string) ( $smtp['password'] ?? '' );

		$enc = sanitize_key( (string) ( $smtp['encryption'] ?? 'tls' ) );
		if ( 'ssl' === $enc ) {
			$phpmailer->SMTPSecure = 'ssl';
		} elseif ( 'tls' === $enc ) {
			$phpmailer->SMTPSecure = 'tls';
		} else {
			$phpmailer->SMTPSecure = '';
			$phpmailer->SMTPAutoTLS = false;
		}

		$from_email = sanitize_email( (string) ( $smtp['from_email'] ?? '' ) );
		$from_name  = sanitize_text_field( (string) ( $smtp['from_name'] ?? '' ) );
		if ( $from_email ) {
			try {
				$phpmailer->setFrom( $from_email, $from_name !== '' ? $from_name : $from_email, false );
			} catch ( Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
				// Keep WP default From on failure.
			}
		}
	}

	/**
	 * Send a test message to a given address (or admin email).
	 *
	 * @param string $to Target email.
	 * @return true|WP_Error
	 */
	public static function send_test( $to = '' ) {
		$to = sanitize_email( (string) $to );
		if ( '' === $to ) {
			$to = sanitize_email( (string) get_option( 'admin_email' ) );
		}
		if ( '' === $to ) {
			return new WP_Error( 'no_email', __( 'No recipient email.', 'webino-dashboard' ), array( 'status' => 400 ) );
		}
		$subject = sprintf(
			/* translators: %s: site name */
			__( '[%s] SMTP test', 'webino-dashboard' ),
			wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES )
		);
		$body = '<p>' . esc_html__( 'Webino Dashboard SMTP test message.', 'webino-dashboard' ) . '</p>';
		$ok   = class_exists( 'Webino_Dashboard_Notify', false )
			? Webino_Dashboard_Notify::send_mail( $to, $subject, $body )
			: wp_mail( $to, $subject, $body, array( 'Content-Type: text/html; charset=UTF-8' ) );
		if ( ! $ok ) {
			return new WP_Error( 'mail_failed', __( 'Could not send test email.', 'webino-dashboard' ), array( 'status' => 502 ) );
		}
		return true;
	}
}
