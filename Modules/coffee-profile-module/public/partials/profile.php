<?php
/**
 * Storefront coffee profile markup.
 *
 * @var array<string,mixed> $profile
 * @var array<string,mixed> $settings
 * @var array<int,array<string,mixed>> $origins
 * @var array<string,bool> $blocks
 * @var string $css_vars
 *
 * @package WebinoDashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$fmt       = array( 'Webino_Dashboard_Coffee_Profile', 'format_display_number' );
$min       = (int) $settings['scale_min'];
$max       = (int) $settings['scale_max'];
$caff_max  = max( 1, (int) $settings['caffeine_max'] );
$levels    = isset( $settings['acidity_levels'] ) && is_array( $settings['acidity_levels'] ) ? $settings['acidity_levels'] : array();
$acidity   = isset( $profile['acidity'] ) && is_array( $profile['acidity'] ) ? $profile['acidity'] : array();
$robusta   = (int) $profile['blend_robusta'];
$arabica   = (int) $profile['blend_arabica'];
$blend_sum = max( 1, $robusta + $arabica );
?>
<section class="wcp-profile" style="<?php echo esc_attr( $css_vars ); ?>" dir="rtl">
	<?php if ( ! empty( $blocks['origin'] ) ) : ?>
		<div class="wcp-block wcp-block--origin">
			<h3 class="wcp-block-title"><?php echo esc_html__( 'خاستگاه', 'webino-dashboard' ); ?></h3>
			<ul class="wcp-origins-list">
				<?php foreach ( $origins as $origin ) : ?>
					<li class="wcp-origin">
						<?php if ( ! empty( $origin['flag_url'] ) ) : ?>
							<img class="wcp-origin-flag" src="<?php echo esc_url( (string) $origin['flag_url'] ); ?>" alt="" width="22" height="14" loading="lazy" />
						<?php elseif ( ! empty( $origin['flag_emoji'] ) ) : ?>
							<span class="wcp-origin-emoji" aria-hidden="true"><?php echo esc_html( (string) $origin['flag_emoji'] ); ?></span>
						<?php endif; ?>
						<span><?php echo esc_html( (string) $origin['name'] ); ?></span>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $blocks['blend'] ) ) : ?>
		<div class="wcp-block wcp-block--blend">
			<h3 class="wcp-block-title"><?php echo esc_html__( 'درصد ترکیب', 'webino-dashboard' ); ?></h3>
			<div class="wcp-blend-labels">
				<span><?php echo esc_html( (string) $settings['robusta_label'] ); ?> <span class="wcp-value"><?php echo esc_html( $fmt( $robusta ) ); ?>٪</span></span>
				<span><?php echo esc_html( (string) $settings['arabica_label'] ); ?> <span class="wcp-value"><?php echo esc_html( $fmt( $arabica ) ); ?>٪</span></span>
			</div>
			<div class="wcp-bar wcp-bar--blend" role="img" aria-label="<?php echo esc_attr( $settings['robusta_label'] . ' ' . $robusta . '% / ' . $settings['arabica_label'] . ' ' . $arabica . '%' ); ?>">
				<div class="wcp-bar-fill" style="width: <?php echo esc_attr( (string) round( 100 * $robusta / $blend_sum, 2 ) ); ?>%"></div>
			</div>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $blocks['acidity'] ) && $levels ) : ?>
		<div class="wcp-block wcp-block--acidity">
			<h3 class="wcp-block-title"><?php echo esc_html__( 'اسیدیته', 'webino-dashboard' ); ?></h3>
			<div class="wcp-acidity-track" style="--wcp-acidity-count: <?php echo esc_attr( (string) count( $levels ) ); ?>">
				<div class="wcp-acidity-line" aria-hidden="true"></div>
				<div class="wcp-acidity-points">
					<?php foreach ( $levels as $level ) : ?>
						<?php
						$lid = (string) $level['id'];
						$val = isset( $acidity[ $lid ] ) ? (int) $acidity[ $lid ] : $min;
						?>
						<div class="wcp-acidity-point">
							<span class="wcp-acidity-name"><?php echo esc_html( (string) $level['label'] ); ?></span>
							<span class="wcp-acidity-dot" aria-hidden="true"></span>
							<span class="wcp-acidity-val"><?php echo esc_html( $fmt( $val ) ); ?></span>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $blocks['caffeine'] ) ) : ?>
		<?php $mg = (int) $profile['caffeine_mg']; ?>
		<div class="wcp-block wcp-block--caffeine">
			<h3 class="wcp-block-title"><?php echo esc_html__( 'مقدار کافئین', 'webino-dashboard' ); ?></h3>
			<div class="wcp-caffeine-row">
				<span class="wcp-value"><?php echo esc_html( $fmt( $mg ) . ' ' . (string) $settings['caffeine_unit'] ); ?></span>
			</div>
			<div class="wcp-bar wcp-bar--caffeine">
				<div class="wcp-bar-fill" style="width: <?php echo esc_attr( (string) min( 100, round( 100 * $mg / $caff_max, 2 ) ) ); ?>%"></div>
			</div>
		</div>
	<?php endif; ?>

	<?php
	$scales = array(
		'bitterness' => __( 'تلخی', 'webino-dashboard' ),
		'sweetness'  => __( 'شیرینی', 'webino-dashboard' ),
		'body'       => __( 'بادی', 'webino-dashboard' ),
	);
	foreach ( $scales as $key => $title ) :
		if ( empty( $blocks[ $key ] ) ) {
			continue;
		}
		$val = (int) $profile[ $key ];
		$pct = Webino_Dashboard_Coffee_Storefront::pct( $val, $min, $max );
		?>
		<div class="wcp-block wcp-block--<?php echo esc_attr( $key ); ?>">
			<div class="wcp-scale-head">
				<h3 class="wcp-block-title" style="margin:0"><?php echo esc_html( $title ); ?></h3>
				<span class="wcp-value"><?php echo esc_html( $fmt( $val ) ); ?></span>
			</div>
			<div class="wcp-bar wcp-bar--knob wcp-bar--<?php echo esc_attr( $key ); ?>">
				<div class="wcp-bar-fill" style="width: <?php echo esc_attr( (string) $pct ); ?>%"></div>
				<span class="wcp-bar-knob" style="inset-inline-start: <?php echo esc_attr( (string) $pct ); ?>%"></span>
			</div>
		</div>
	<?php endforeach; ?>
</section>
