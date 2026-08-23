<?php
/**
 * Product edit / quick edit / list column UI.
 *
 * @package WNC
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Product marketplace mapping UI.
 */
class WNC_Product_UI {

	/**
	 * Meta box.
	 */
	public function add_meta_box() {
		add_meta_box(
			'wnc_marketplace_map',
			__( 'اتصال بازارگاه‌ها (WebinaConnector)', 'webinaconnector' ),
			array( $this, 'render_meta_box' ),
			'product',
			'normal',
			'default'
		);
	}

	/**
	 * Render meta box.
	 *
	 * @param WP_Post $post Post.
	 */
	public function render_meta_box( $post ) {
		$product_id = (int) $post->ID;
		wp_nonce_field( 'wnc_product_meta', 'wnc_product_meta_nonce' );
		$platforms = WNC_Platform_Registry::all();
		?>
		<div class="wnc-metabox">
			<?php foreach ( $platforms as $platform => $adapter ) : ?>
				<?php
				$map     = WNC_Mapper::get( $product_id, 0, $platform );
				$price   = WNC_Pricing::get_price( $product_id, $platform );
				$locked  = get_post_meta( $product_id, '_wfcp_' . $platform . '_lock', true );
				$manual  = get_post_meta( $product_id, '_wfcp_' . $platform . '_price', true );
				?>
				<div class="wnc-platform-card" data-platform="<?php echo esc_attr( $platform ); ?>">
					<h4>
						<?php echo esc_html( $adapter->label() ); ?>
						<?php if ( ! $adapter->is_live() ) : ?>
							<span class="wnc-badge wnc-badge-warn"><?php esc_html_e( 'منتظر مستندات', 'webinaconnector' ); ?></span>
						<?php else : ?>
							<span class="wnc-badge wnc-badge-ok"><?php esc_html_e( 'زنده', 'webinaconnector' ); ?></span>
						<?php endif; ?>
					</h4>
					<p>
						<label>
							<input type="checkbox" name="wnc_map[<?php echo esc_attr( $platform ); ?>][sync_enabled]" value="1" <?php checked( ! $map || ! empty( $map['sync_enabled'] ) ); ?> />
							<?php esc_html_e( 'همگام‌سازی فعال', 'webinaconnector' ); ?>
						</label>
					</p>
					<p>
						<label><?php esc_html_e( 'شناسه محصول ریموت', 'webinaconnector' ); ?></label>
						<input type="text" class="widefat" name="wnc_map[<?php echo esc_attr( $platform ); ?>][remote_product_id]" value="<?php echo esc_attr( $map['remote_product_id'] ?? '' ); ?>" />
					</p>
					<p>
						<label><?php esc_html_e( 'شناسه تنوع ریموت', 'webinaconnector' ); ?></label>
						<input type="text" class="widefat" name="wnc_map[<?php echo esc_attr( $platform ); ?>][remote_variant_id]" value="<?php echo esc_attr( $map['remote_variant_id'] ?? '' ); ?>" />
					</p>
					<p>
						<label><?php esc_html_e( 'لینک محصول در پلتفرم', 'webinaconnector' ); ?></label>
						<input type="url" class="widefat" name="wnc_map[<?php echo esc_attr( $platform ); ?>][remote_url]" value="<?php echo esc_attr( $map['remote_url'] ?? '' ); ?>" placeholder="https://" />
					</p>
					<p>
						<strong><?php esc_html_e( 'قیمت محاسبه‌شده:', 'webinaconnector' ); ?></strong>
						<?php echo esc_html( number_format_i18n( $price, 0 ) ); ?>
					</p>
					<p>
						<label>
							<input type="checkbox" name="wnc_map[<?php echo esc_attr( $platform ); ?>][price_lock]" value="1" <?php checked( '1', (string) $locked ); ?> />
							<?php esc_html_e( 'قفل قیمت دستی', 'webinaconnector' ); ?>
						</label>
						<input type="number" step="1" min="0" name="wnc_map[<?php echo esc_attr( $platform ); ?>][price_manual]" value="<?php echo esc_attr( $manual ); ?>" placeholder="<?php esc_attr_e( 'قیمت دستی', 'webinaconnector' ); ?>" />
					</p>
					<?php if ( $map && ! empty( $map['last_sync_at'] ) ) : ?>
						<p><small><?php echo esc_html( sprintf( __( 'آخرین سینک: %s', 'webinaconnector' ), $map['last_sync_at'] ) ); ?></small></p>
					<?php endif; ?>
					<?php if ( $map && ! empty( $map['last_error'] ) ) : ?>
						<p class="wnc-error"><small><?php echo esc_html( $map['last_error'] ); ?></small></p>
					<?php endif; ?>
					<p>
						<button type="button" class="button wnc-sync-now" data-platform="<?php echo esc_attr( $platform ); ?>" data-product="<?php echo esc_attr( $product_id ); ?>">
							<?php esc_html_e( 'پوش قیمت و موجودی', 'webinaconnector' ); ?>
						</button>
					</p>
				</div>
			<?php endforeach; ?>
		</div>
		<?php
	}

	/**
	 * Save product meta maps.
	 *
	 * @param int $product_id Product ID.
	 */
	public function save_meta( $product_id ) {
		if ( ! isset( $_POST['wnc_product_meta_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wnc_product_meta_nonce'] ) ), 'wnc_product_meta' ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_product', $product_id ) ) {
			return;
		}
		$maps = isset( $_POST['wnc_map'] ) && is_array( $_POST['wnc_map'] ) ? wp_unslash( $_POST['wnc_map'] ) : array();
		foreach ( $maps as $platform => $row ) {
			$platform = sanitize_key( $platform );
			if ( ! is_array( $row ) ) {
				continue;
			}
			$remote_product = sanitize_text_field( (string) ( $row['remote_product_id'] ?? '' ) );
			$remote_variant = sanitize_text_field( (string) ( $row['remote_variant_id'] ?? '' ) );
			$remote_url     = isset( $row['remote_url'] ) ? esc_url_raw( (string) $row['remote_url'] ) : '';
			if ( '' === $remote_product && '' === $remote_variant && '' === $remote_url ) {
				WNC_Mapper::delete( $product_id, 0, $platform );
			} else {
				WNC_Mapper::upsert(
					array(
						'wc_product_id'     => $product_id,
						'wc_variation_id'   => 0,
						'platform'          => $platform,
						'remote_product_id' => $remote_product,
						'remote_variant_id' => $remote_variant,
						'remote_url'        => $remote_url,
						'sync_enabled'      => ! empty( $row['sync_enabled'] ),
					)
				);
			}
			update_post_meta( $product_id, '_wfcp_' . $platform . '_lock', ! empty( $row['price_lock'] ) ? '1' : '0' );
			if ( isset( $row['price_manual'] ) && '' !== $row['price_manual'] ) {
				update_post_meta( $product_id, '_wfcp_' . $platform . '_price', floatval( $row['price_manual'] ) );
			}
		}
	}

	/**
	 * Variation marketplace IDs.
	 *
	 * @param int     $loop Loop.
	 * @param array   $variation_data Data.
	 * @param WP_Post $variation Variation post.
	 */
	public function render_variation_fields( $loop, $variation_data, $variation ) {
		$vid    = $variation->ID;
		$parent = wp_get_post_parent_id( $vid );
		?>
		<div class="wnc-var-map" style="margin:8px 0;padding:8px;background:#f8fafc;border-radius:6px;">
			<strong><?php esc_html_e( 'نقشه بازارگاه‌ها', 'webinaconnector' ); ?></strong>
			<?php foreach ( WNC_Platform_Registry::all() as $platform => $adapter ) :
				$map = WNC_Mapper::get( $parent, $vid, $platform );
				?>
				<p>
					<label><?php echo esc_html( $adapter->label() ); ?> —
						<input type="checkbox" name="wnc_var_map[<?php echo esc_attr( $loop ); ?>][<?php echo esc_attr( $platform ); ?>][sync_enabled]" value="1" <?php checked( ! $map || ! empty( $map['sync_enabled'] ) ); ?> />
						<?php esc_html_e( 'سینک', 'webinaconnector' ); ?>
					</label><br />
					<input type="text" placeholder="<?php esc_attr_e( 'Product ID', 'webinaconnector' ); ?>" name="wnc_var_map[<?php echo esc_attr( $loop ); ?>][<?php echo esc_attr( $platform ); ?>][remote_product_id]" value="<?php echo esc_attr( $map['remote_product_id'] ?? '' ); ?>" style="width:140px;" />
					<input type="text" placeholder="<?php esc_attr_e( 'Variant ID', 'webinaconnector' ); ?>" name="wnc_var_map[<?php echo esc_attr( $loop ); ?>][<?php echo esc_attr( $platform ); ?>][remote_variant_id]" value="<?php echo esc_attr( $map['remote_variant_id'] ?? '' ); ?>" style="width:140px;" />
				</p>
			<?php endforeach; ?>
		</div>
		<?php
	}

	/**
	 * Save variation mapping fields if posted.
	 *
	 * @param int $variation_id Variation ID.
	 * @param int $i Loop index.
	 */
	public function save_variation_meta( $variation_id, $i ) {
		if ( empty( $_POST['wnc_var_map'][ $i ] ) || ! is_array( $_POST['wnc_var_map'][ $i ] ) ) {
			return;
		}
		$variation = wc_get_product( $variation_id );
		if ( ! $variation ) {
			return;
		}
		$parent = $variation->get_parent_id();
		$rows   = wp_unslash( $_POST['wnc_var_map'][ $i ] );
		foreach ( $rows as $platform => $row ) {
			$platform = sanitize_key( $platform );
			if ( ! is_array( $row ) ) {
				continue;
			}
			$rp = sanitize_text_field( (string) ( $row['remote_product_id'] ?? '' ) );
			$rv = sanitize_text_field( (string) ( $row['remote_variant_id'] ?? '' ) );
			if ( '' === $rp && '' === $rv ) {
				WNC_Mapper::delete( $parent, $variation_id, $platform );
				continue;
			}
			WNC_Mapper::upsert(
				array(
					'wc_product_id'     => $parent,
					'wc_variation_id'   => $variation_id,
					'platform'          => $platform,
					'remote_product_id' => $rp,
					'remote_variant_id' => $rv,
					'sync_enabled'      => ! empty( $row['sync_enabled'] ),
				)
			);
		}
	}

	/**
	 * Add list column.
	 *
	 * @param array $columns Columns.
	 * @return array
	 */
	public function add_column( $columns ) {
		$columns['wnc_platforms'] = __( 'بازارگاه', 'webinaconnector' );
		return $columns;
	}

	/**
	 * Render list column.
	 *
	 * @param string $column Column.
	 * @param int    $post_id Post ID.
	 */
	public function render_column( $column, $post_id ) {
		if ( 'wnc_platforms' !== $column ) {
			return;
		}
		$maps = WNC_Mapper::get_for_product( $post_id );
		if ( empty( $maps ) ) {
			echo '—';
			return;
		}
		$badges = array();
		foreach ( $maps as $map ) {
			$adapter = WNC_Platform_Registry::get( $map['platform'] );
			$label   = $adapter ? $adapter->label() : $map['platform'];
			$badges[] = '<span class="wnc-col-badge" title="' . esc_attr( $map['remote_product_id'] . '/' . $map['remote_variant_id'] ) . '">' . esc_html( $label ) . '</span>';
		}
		echo wp_kses_post( implode( ' ', $badges ) );
	}

	/**
	 * Quick edit fields.
	 *
	 * @param string $column Column.
	 * @param string $post_type Post type.
	 */
	public function quick_edit( $column, $post_type ) {
		if ( 'product' !== $post_type || 'wnc_platforms' !== $column ) {
			return;
		}
		?>
		<fieldset class="inline-edit-col-left">
			<div class="inline-edit-col">
				<?php foreach ( WNC_Platform_Registry::all() as $id => $adapter ) : ?>
					<label>
						<span class="title"><?php echo esc_html( $adapter->label() ); ?> ID</span>
						<input type="text" name="wnc_qe_<?php echo esc_attr( $id ); ?>_product" class="wnc-qe-<?php echo esc_attr( $id ); ?>-product" value="" placeholder="<?php esc_attr_e( 'Product ID', 'webinaconnector' ); ?>" />
					</label>
					<label>
						<span class="title"><?php echo esc_html( $adapter->label() ); ?> Var</span>
						<input type="text" name="wnc_qe_<?php echo esc_attr( $id ); ?>_variant" class="wnc-qe-<?php echo esc_attr( $id ); ?>-variant" value="" placeholder="<?php esc_attr_e( 'Variant ID', 'webinaconnector' ); ?>" />
					</label>
				<?php endforeach; ?>
			</div>
		</fieldset>
		<?php
	}

	/**
	 * Quick edit populate JS.
	 */
	public function quick_edit_js() {
		$screen = get_current_screen();
		if ( ! $screen || 'edit-product' !== $screen->id ) {
			return;
		}
		?>
		<script>
		jQuery(function($){
			$('#the-list').on('click', '.editinline', function(){
				$('input[class*="wnc-qe-"]').val('');
			});
		});
		</script>
		<?php
	}

	/**
	 * Save quick edit.
	 *
	 * @param int $post_id Post ID.
	 */
	public function save_quick_edit( $post_id ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! current_user_can( 'edit_product', $post_id ) ) {
			return;
		}
		foreach ( array_keys( WNC_Platform_Registry::all() ) as $platform ) {
			$rp_key = 'wnc_qe_' . $platform . '_product';
			$rv_key = 'wnc_qe_' . $platform . '_variant';
			if ( ! isset( $_POST[ $rp_key ] ) && ! isset( $_POST[ $rv_key ] ) ) {
				continue;
			}
			$rp = sanitize_text_field( wp_unslash( $_POST[ $rp_key ] ?? '' ) );
			$rv = sanitize_text_field( wp_unslash( $_POST[ $rv_key ] ?? '' ) );
			if ( '' === $rp && '' === $rv ) {
				continue;
			}
			WNC_Mapper::upsert(
				array(
					'wc_product_id'     => $post_id,
					'wc_variation_id'   => 0,
					'platform'          => $platform,
					'remote_product_id' => $rp,
					'remote_variant_id' => $rv,
					'sync_enabled'      => true,
				)
			);
		}
	}
}
