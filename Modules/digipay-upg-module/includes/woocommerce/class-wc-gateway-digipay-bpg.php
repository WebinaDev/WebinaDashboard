<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WC_Gateway_Digipay_BPG extends WC_Gateway_Digipay_UPG {
	public function __construct() {
		$this->id           = 'digipay_bpg';
		$this->digipay_key  = 'bpg';
		$this->method_title = __( 'DigiPay BPG', 'webino-dashboard' );
		$this->setup_gateway();
	}
}
