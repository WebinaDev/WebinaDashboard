<?php
/**
 * Ordered migrate-from-Hesabfa wizard.
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Import pipeline: contacts → categories → items → stock → cash → invoices → … .
 */
final class Accounting_Hesabfa_Migrate {

	/**
	 * Ordered steps.
	 *
	 * @return array<int,string>
	 */
	public static function steps() {
		return array(
			'business',
			'accounts',
			'categories',
			'contacts',
			'items',
			'warehouses',
			'cash_accounts',
			'opening_qty',
			'invoices_sale',
			'invoices_purchase',
			'invoices_return',
			'receipts',
			'warehouse_docs',
			'bank_transfers',
			'journals',
			'projects',
			'register_hook',
		);
	}

	/**
	 * Start full migration as background jobs.
	 *
	 * @param array<string,mixed> $options Options.
	 * @return array{queued:int,steps:array<int,string>}
	 */
	public static function start( array $options = array() ) {
		$steps = self::steps();
		$queued = 0;
		$delay  = 0;
		foreach ( $steps as $step ) {
			$payload = array_merge(
				$options,
				array(
					'step' => $step,
				)
			);
			$id = Accounting_Db::insert(
				'hesabfa_jobs',
				array(
					'action'      => 'migrate_step',
					'entity_type' => 'migrate',
					'status'      => 'pending',
					'attempts'    => 0,
					'payload'     => wp_json_encode( $payload ),
					'run_after'   => gmdate( 'Y-m-d H:i:s', time() + $delay ),
				)
			);
			if ( ! is_wp_error( $id ) ) {
				++$queued;
			}
			$delay += 5;
		}
		return array(
			'queued' => $queued,
			'steps'  => $steps,
		);
	}

	/**
	 * Run one migration step.
	 *
	 * @param string              $step Step key.
	 * @param array<string,mixed> $options Options.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function run_step( $step, array $options = array() ) {
		Accounting_Hesabfa_Sync::set_syncing( true );
		try {
			switch ( $step ) {
				case 'business':
					$info = Accounting_Hesabfa_Client::setting_get_business_info();
					$cur  = Accounting_Hesabfa_Client::setting_get_currency();
					$fy   = Accounting_Hesabfa_Client::setting_get_fiscal_year();
					if ( is_array( $cur ) && ! empty( $cur['Code'] ) ) {
						$code = strtoupper( (string) $cur['Code'] );
						if ( in_array( $code, array( 'IRR', 'IRT', 'RLS' ), true ) ) {
							Accounting_Config::save(
								array(
									'hesabfa_currency' => ( 'RLS' === $code || 'IRR' === $code ) ? 'IRR' : 'IRT',
								)
							);
						}
					}
					if ( is_array( $fy ) && ! empty( $fy['Id'] ) ) {
						Accounting_Config::save( array( 'hesabfa_year_id' => (int) $fy['Id'] ) );
					}
					return array(
						'business' => is_wp_error( $info ) ? null : $info,
						'currency' => is_wp_error( $cur ) ? null : $cur,
						'fiscal'   => is_wp_error( $fy ) ? null : $fy,
					);

				case 'accounts':
					return Accounting_Hesabfa_Sync::import_accounts();

				case 'categories':
					return self::import_categories();

				case 'contacts':
					return self::import_list(
						'contact/getcontacts',
						function ( $row ) {
							return Accounting_Hesabfa_Sync::upsert_contact_from_remote( $row );
						},
						'contacts'
					);

				case 'items':
					return self::import_list(
						'item/getitems',
						function ( $row ) {
							return Accounting_Hesabfa_Sync::upsert_item_from_remote( $row );
						},
						'items'
					);

				case 'warehouses':
					return Accounting_Hesabfa_Sync::import_warehouses();

				case 'cash_accounts':
					return Accounting_Hesabfa_Sync::import_cash_accounts();

				case 'opening_qty':
					return self::import_opening_qty();

				case 'invoices_sale':
					return self::import_invoices( 0 );

				case 'invoices_purchase':
					return self::import_invoices( 1 );

				case 'invoices_return':
					$a = self::import_invoices( 2 );
					$b = self::import_invoices( 3 );
					if ( is_wp_error( $a ) ) {
						return $a;
					}
					if ( is_wp_error( $b ) ) {
						return $b;
					}
					return array(
						'imported' => (int) ( $a['imported'] ?? 0 ) + (int) ( $b['imported'] ?? 0 ),
					);

				case 'receipts':
					$a = self::import_receipts( 0 );
					$b = self::import_receipts( 1 );
					if ( is_wp_error( $a ) ) {
						return $a;
					}
					if ( is_wp_error( $b ) ) {
						return $b;
					}
					return array(
						'imported' => (int) ( $a['imported'] ?? 0 ) + (int) ( $b['imported'] ?? 0 ),
					);

				case 'warehouse_docs':
					return self::import_warehouse_docs();

				case 'bank_transfers':
					return self::import_bank_transfers();

				case 'journals':
					return self::import_journals();

				case 'projects':
					return self::import_projects();

				case 'register_hook':
					return Accounting_Hesabfa_Webhook::register_hook();

				default:
					return new WP_Error( 'hesabfa_step', __( 'Unknown migration step.', 'webino-dashboard' ) );
			}
		} finally {
			Accounting_Hesabfa_Sync::set_syncing( false );
		}
	}

	/**
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_categories() {
		$imported = 0;
		foreach (
			array(
				array( 'fn' => 'setting_get_contact_categories', 'table' => 'person_categories' ),
				array( 'fn' => 'setting_get_product_categories', 'table' => 'product_categories' ),
				array( 'fn' => 'setting_get_service_categories', 'table' => 'product_categories' ),
			) as $src
		) {
			$list = call_user_func( array( 'Accounting_Hesabfa_Client', $src['fn'] ) );
			if ( is_wp_error( $list ) ) {
				continue;
			}
			foreach ( (array) $list as $row ) {
				if ( ! is_array( $row ) ) {
					continue;
				}
				$name = (string) ( $row['Name'] ?? ( $row['Title'] ?? '' ) );
				if ( '' === $name ) {
					continue;
				}
				global $wpdb;
				$t = Accounting_Db::table( $src['table'] );
				$exists = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$t} WHERE name = %s LIMIT 1", $name ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				if ( $exists ) {
					continue;
				}
				$id = Accounting_Db::insert( $src['table'], array( 'name' => $name ) );
				if ( ! is_wp_error( $id ) ) {
					++$imported;
				}
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * Generic paginated import.
	 *
	 * @param string   $method List method.
	 * @param callable $upsert Upsert callback.
	 * @param string   $entity_flag Entity flag key.
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_list( $method, $upsert, $entity_flag ) {
		if ( ! Accounting_Hesabfa_Sync::entity_enabled( $entity_flag ) ) {
			return array( 'imported' => 0 );
		}
		$list = Accounting_Hesabfa_Client::list_all( $method );
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$imported = 0;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$res = call_user_func( $upsert, $row );
			if ( ! is_wp_error( $res ) ) {
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_opening_qty() {
		// Opening quantities come via item GetQuantity after items imported.
		$list = Accounting_Hesabfa_Client::list_all( 'item/getitems' );
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$wh_id = (int) ( Accounting_Config::get()['default_warehouse_id'] ?? 0 );
		if ( $wh_id <= 0 ) {
			global $wpdb;
			$wt    = Accounting_Db::table( 'warehouses' );
			$wh_id = (int) $wpdb->get_var( "SELECT id FROM {$wt} ORDER BY is_default DESC, id ASC LIMIT 1" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}
		$imported = 0;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$code = (string) ( $row['Code'] ?? '' );
			if ( '' === $code ) {
				continue;
			}
			$map = Accounting_Hesabfa_Sync::get_map_by_code( 'item', $code );
			if ( ! $map ) {
				continue;
			}
			$qty_res = Accounting_Hesabfa_Client::item_get_quantity( $code );
			$qty     = 0.0;
			if ( is_numeric( $qty_res ) ) {
				$qty = (float) $qty_res;
			} elseif ( is_array( $qty_res ) ) {
				$qty = (float) ( $qty_res['Quantity'] ?? ( $qty_res['Stock'] ?? 0 ) );
			}
			if ( $wh_id > 0 && $qty != 0.0 ) { // phpcs:ignore WordPress.PHP.StrictComparisons.LooseComparison
				global $wpdb;
				$st = Accounting_Db::table( 'warehouse_stock' );
				$existing = $wpdb->get_row(
					$wpdb->prepare(
						"SELECT * FROM {$st} WHERE warehouse_id = %d AND product_id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
						$wh_id,
						(int) $map['local_id']
					),
					ARRAY_A
				);
				if ( $existing ) {
					Accounting_Db::update( 'warehouse_stock', (int) $existing['id'], array( 'quantity' => $qty ) );
				} else {
					Accounting_Db::insert(
						'warehouse_stock',
						array(
							'warehouse_id' => $wh_id,
							'product_id'   => (int) $map['local_id'],
							'quantity'     => $qty,
						)
					);
				}
				if ( function_exists( 'do_action' ) ) {
					do_action( 'webino_acc_warehouse_stock_changed', $wh_id );
				}
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * @param int $type Invoice type.
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_invoices( $type ) {
		if ( ! Accounting_Hesabfa_Sync::entity_enabled( 'invoices' ) ) {
			return array( 'imported' => 0 );
		}
		$list = Accounting_Hesabfa_Client::list_all(
			'invoice/getinvoices',
			array( 'type' => (int) $type )
		);
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$imported = 0;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			// Fetch full invoice when list row is shallow.
			$full = $row;
			if ( empty( $row['InvoiceItems'] ) && ( isset( $row['Number'] ) || isset( $row['Id'] ) ) ) {
				if ( ! empty( $row['Id'] ) ) {
					$got = Accounting_Hesabfa_Client::invoice_get_by_id( (int) $row['Id'] );
				} else {
					$got = Accounting_Hesabfa_Client::invoice_get( $row['Number'], $type );
				}
				if ( is_array( $got ) ) {
					$full = $got;
				}
			}
			$full['InvoiceType'] = $full['InvoiceType'] ?? $type;
			$res = Accounting_Hesabfa_Sync::upsert_invoice_from_remote( $full );
			if ( ! is_wp_error( $res ) ) {
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * @param int $type Receipt type.
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_receipts( $type ) {
		if ( ! Accounting_Hesabfa_Sync::entity_enabled( 'receipts' ) ) {
			return array( 'imported' => 0 );
		}
		$list = Accounting_Hesabfa_Client::list_all(
			'receipt/getReceipts',
			array( 'type' => (int) $type )
		);
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$imported = 0;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$res = Accounting_Hesabfa_Sync::upsert_receipt_from_remote( $row );
			if ( ! is_wp_error( $res ) ) {
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_warehouse_docs() {
		if ( ! Accounting_Hesabfa_Sync::entity_enabled( 'warehouses' ) ) {
			return array( 'imported' => 0 );
		}
		$list = Accounting_Hesabfa_Client::list_all( 'warehouse/getReceipts' );
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$imported = 0;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$res = Accounting_Hesabfa_Sync::pull_warehouse_doc(
				array(
					'number'    => $row['Number'] ?? null,
					'remote_id' => $row['Id'] ?? null,
				)
			);
			if ( ! is_wp_error( $res ) ) {
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_bank_transfers() {
		if ( ! Accounting_Hesabfa_Sync::entity_enabled( 'bank_transfers' ) ) {
			return array( 'imported' => 0 );
		}
		$list = Accounting_Hesabfa_Client::list_all( 'bankTransfer/getTransfers' );
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$imported = 0;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$res = Accounting_Hesabfa_Sync::pull_bank_transfer(
				array(
					'number'    => $row['Number'] ?? null,
					'remote_id' => $row['Id'] ?? null,
				)
			);
			if ( ! is_wp_error( $res ) ) {
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_journals() {
		if ( ! Accounting_Hesabfa_Sync::entity_enabled( 'journals' ) ) {
			return array( 'imported' => 0 );
		}
		$list = Accounting_Hesabfa_Client::list_all( 'document/getDocuments' );
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$imported = 0;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$res = Accounting_Hesabfa_Sync::pull_journal(
				array(
					'number'    => $row['Number'] ?? null,
					'remote_id' => $row['Id'] ?? null,
				)
			);
			if ( ! is_wp_error( $res ) ) {
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}

	/**
	 * @return array{imported:int}|WP_Error
	 */
	private static function import_projects() {
		if ( ! Accounting_Hesabfa_Sync::entity_enabled( 'projects' ) ) {
			return array( 'imported' => 0 );
		}
		$list = Accounting_Hesabfa_Client::setting_get_projects();
		if ( is_wp_error( $list ) ) {
			return $list;
		}
		$imported = 0;
		foreach ( (array) $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$name = (string) ( $row['Name'] ?? ( $row['Title'] ?? '' ) );
			if ( '' === $name ) {
				continue;
			}
			global $wpdb;
			$t = Accounting_Db::table( 'projects' );
			$exists = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$t} WHERE name = %s LIMIT 1", $name ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			if ( $exists ) {
				Accounting_Hesabfa_Sync::upsert_map( 'project', $exists, $row, 'pull' );
				continue;
			}
			$id = Accounting_Db::insert(
				'projects',
				array(
					'name'   => $name,
					'status' => 'open',
				)
			);
			if ( ! is_wp_error( $id ) ) {
				Accounting_Hesabfa_Sync::upsert_map( 'project', (int) $id, $row, 'pull' );
				++$imported;
			}
		}
		return array( 'imported' => $imported );
	}
}
