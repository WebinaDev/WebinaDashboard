<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WC_Gateway_Digipay_CPG extends WC_Gateway_Digipay_UPG {
	public function __construct() {
		$this->id           = 'digipay_cpg';
		$this->digipay_key  = 'cpg';
		$this->method_title = __( 'DigiPay CPG', 'webino-dashboard' );
		$this->setup_gateway();
	}
}
