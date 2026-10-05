<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WC_Gateway_Digipay_IPG extends WC_Gateway_Digipay_UPG {
	public function __construct() {
		$this->id           = 'digipay_ipg';
		$this->digipay_key  = 'ipg';
		$this->method_title = __( 'DigiPay IPG', 'webino-dashboard' );
		$this->setup_gateway();
	}
}
