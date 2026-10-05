<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WC_Gateway_Digipay_Wallet extends WC_Gateway_Digipay_UPG {
	public function __construct() {
		$this->id           = 'digipay_wallet';
		$this->digipay_key  = 'wallet';
		$this->method_title = __( 'DigiPay Wallet', 'webino-dashboard' );
		$this->setup_gateway();
	}
}
