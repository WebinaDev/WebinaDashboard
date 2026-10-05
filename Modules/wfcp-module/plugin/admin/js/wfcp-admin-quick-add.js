/**
 * Quick Add Products JavaScript
 *
 * @package    WFCP
 * @subpackage WFCP/admin
 */

(function($) {
	'use strict';

	// Toast notification function - must be defined before use
	function showToast(message, type) {
		type = type || 'info';
		
		// Check if toast styles exist, if not create basic styles
		if ($('#wfcp-toast-styles').length === 0) {
			$('head').append('<style id="wfcp-toast-styles">.wfcp-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 15px 25px; border-radius: 8px; z-index: 999999; opacity: 0; transition: opacity 0.3s ease; font-family: YekanBakh, Tahoma, sans-serif; }.wfcp-toast.show { opacity: 1; }.wfcp-toast.success { background: #10b981; }.wfcp-toast.error { background: #ef4444; }.wfcp-toast.info { background: #3b82f6; }</style>');
		}
		
		var $toast = $('<div class="wfcp-toast wfcp-toast-' + type + '">' + message + '</div>');
		$('body').append($toast);
		
		setTimeout(function() {
			$toast.addClass('show');
		}, 10);
		
		setTimeout(function() {
			$toast.removeClass('show');
			setTimeout(function() {
				$toast.remove();
			}, 300);
		}, 3000);
	}

	// Wait for DOM and wp.media to be ready
	jQuery(document).ready(function($) {
		console.log('WFCP Quick Add: Script loaded');
		
		// Check if wp.media is fully available
		var checkWpMedia = function() {
			if (typeof wp !== 'undefined' && 
				typeof wp.media !== 'undefined' && 
				typeof wp.media.view !== 'undefined' &&
				typeof wp.media.controller !== 'undefined') {
				console.log('WFCP Quick Add: wp.media is fully available');
				return true;
			}
			return false;
		};

		// Retry checking wp.media if not immediately available
		var retryCount = 0;
		var maxRetries = 20; // Increased retries
		var wpMediaReady = false;
		var checkInterval = setInterval(function() {
			if (checkWpMedia()) {
				wpMediaReady = true;
				clearInterval(checkInterval);
				console.log('WFCP Quick Add: wp.media is ready');
			} else if (retryCount >= maxRetries) {
				clearInterval(checkInterval);
				if (!wpMediaReady) {
					console.error('WFCP Quick Add: wp.media is not available after retries');
					showToast('مدیا آپلودر وردپرس در دسترس نیست. لطفاً صفحه را رفرش کنید.', 'error');
				}
			}
			retryCount++;
		}, 100);

		// Store media frame instances per row
		var mediaFrames = {};

		// Function to wait for wp.media to be ready
		function waitForWpMedia(callback, maxAttempts) {
			maxAttempts = maxAttempts || 50;
			var attempts = 0;
			
			function check() {
				attempts++;
				if (typeof wp !== 'undefined' && 
					typeof wp.media !== 'undefined' && 
					typeof wp.media.view !== 'undefined') {
					console.log('WFCP Quick Add: wp.media is ready after', attempts, 'attempts');
					callback(true);
				} else if (attempts >= maxAttempts) {
					console.error('WFCP Quick Add: wp.media not available after', maxAttempts, 'attempts');
					callback(false);
				} else {
					setTimeout(check, 100);
				}
			}
			check();
		}

		// Handle image upload box click - open WordPress Media Uploader
		$(document).on('click', '.wfcp-image-upload-box', function(e) {
			e.preventDefault();
			e.stopPropagation();
			
			console.log('WFCP Quick Add: Image upload box clicked');
			
			var $box = $(this);
			var row = $box.data('row');
			var $preview = $('.wfcp-image-preview[data-row="' + row + '"]');
			var $input = $('.wfcp-image-id[data-row="' + row + '"]');
			var $removeBtn = $('.wfcp-remove-image[data-row="' + row + '"]');

			// Function to create and open media frame
			var openMediaFrame = function() {
				// Check if wp.media is fully available
				if (typeof wp === 'undefined' || typeof wp.media === 'undefined') {
					console.error('WFCP Quick Add: wp.media is not available');
					return false;
				}

				console.log('WFCP Quick Add: Creating media frame for row', row);

				try {
					// Reuse existing frame or create new one
					if (!mediaFrames[row]) {
						// Create media frame with proper configuration
						mediaFrames[row] = wp.media({
							title: 'انتخاب عکس محصول',
							button: {
								text: 'استفاده از این عکس'
							},
							multiple: false,
							library: {
								type: 'image'
							}
						});

						// When image is selected
						mediaFrames[row].on('select', function() {
							var attachment = mediaFrames[row].state().get('selection').first().toJSON();
							console.log('WFCP Quick Add: Image selected', attachment);
							
							if (attachment && attachment.url) {
								// Update preview
								$preview.html('<img src="' + attachment.url + '" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">');
								
								// Update hidden input
								$input.val(attachment.id);
								
								// Show remove button
								$removeBtn.show();
								
								console.log('WFCP Quick Add: Image preview updated, ID:', attachment.id);
							}
						});

						// Handle frame close
						mediaFrames[row].on('close', function() {
							console.log('WFCP Quick Add: Media frame closed for row', row);
						});
					}

					// Open media frame
					mediaFrames[row].open();
					return true;
				} catch (error) {
					console.error('WFCP Quick Add: Error creating media frame', error);
					showToast('خطا در باز کردن مدیا آپلودر: ' + (error.message || 'خطای نامشخص'), 'error');
					return false;
				}
			};

			// Wait for wp.media to be ready, then open
			waitForWpMedia(function(isReady) {
				if (isReady) {
					if (!openMediaFrame()) {
						showToast('خطا در باز کردن مدیا آپلودر. لطفاً دوباره تلاش کنید.', 'error');
					}
				} else {
					showToast('مدیا آپلودر وردپرس در دسترس نیست. لطفاً صفحه را رفرش کنید.', 'error');
				}
			});
			
			return false;
		});

		// Handle remove image button
		$(document).on('click', '.wfcp-remove-image', function(e) {
			e.stopPropagation();
			var row = $(this).data('row');
			var $preview = $('.wfcp-image-preview[data-row="' + row + '"]');
			var $input = $('.wfcp-image-id[data-row="' + row + '"]');
			var $removeBtn = $('.wfcp-remove-image[data-row="' + row + '"]');

			$preview.html('<span class="wfcp-image-placeholder"><span class="dashicons dashicons-camera-alt"></span><span>افزودن عکس</span></span>');
			$input.val('');
			$removeBtn.hide();
		});

		// Handle character count for product name
		$(document).on('input', '.wfcp-product-name', function() {
			var $input = $(this);
			var row = $input.data('row');
			var length = $input.val().length;
			var $charCount = $('.wfcp-char-count[data-row="' + row + '"] .wfcp-char-current');
			
			$charCount.text(length);
			
			if (length > 5040) {
				$charCount.css('color', '#ef4444');
			} else {
				$charCount.css('color', '#6b7280');
			}
		});

		// Handle save button click
		$(document).on('click', '.wfcp-save-row', function() {
			var $btn = $(this);
			var row = $btn.data('row');
			var $row = $('tr[data-row="' + row + '"]');

			console.log('WFCP Quick Add: Save button clicked for row', row);

			// Check if wfcpAdmin is available
			if (typeof wfcpAdmin === 'undefined') {
				showToast('خطا: تنظیمات AJAX در دسترس نیست. لطفاً صفحه را رفرش کنید.', 'error');
				console.error('WFCP Quick Add: wfcpAdmin is not defined');
				return;
			}

			// Get values - ensure they're strings before calling trim
			var productName = ($row.find('.wfcp-product-name').val() || '').toString().trim();
			var purchasePrice = ($row.find('.wfcp-purchase-price').val() || '').toString().trim();
			var imageId = $row.find('.wfcp-image-id').val() || '';

			console.log('WFCP Quick Add: Form data', {
				productName: productName,
				purchasePrice: purchasePrice,
				imageId: imageId
			});

			// Validation
			if (!productName) {
				showToast('لطفاً نام محصول را وارد کنید', 'error');
				$row.find('.wfcp-product-name').focus();
				return;
			}

			if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
				showToast('لطفاً قیمت خرید را وارد کنید', 'error');
				$row.find('.wfcp-purchase-price').focus();
				return;
			}

			// Disable button
			var originalText = $btn.html();
			$btn.prop('disabled', true).html('<span class="dashicons dashicons-update" style="animation: spin 1s linear infinite; margin-left: 5px;"></span>در حال ذخیره...');

			// Send AJAX request
			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_quick_add_product',
					nonce: wfcpAdmin.nonce,
					product_name: productName,
					purchase_price: purchasePrice,
					image_id: imageId
				},
				success: function(response) {
					console.log('WFCP Quick Add: AJAX response', response);
					
					if (response && response.success) {
						showToast(response.data.message || 'محصول با موفقیت ایجاد شد', 'success');
						
						// Clear row after successful save
						setTimeout(function() {
							var row = $btn.data('row');
							$row.find('.wfcp-product-name').val('');
							$row.find('.wfcp-purchase-price').val('');
							$row.find('.wfcp-image-id').val('');
							$row.find('.wfcp-image-preview').html('<span class="wfcp-image-placeholder"><span class="dashicons dashicons-camera-alt"></span><span>افزودن عکس</span></span>');
							$row.find('.wfcp-remove-image').hide();
							$row.find('.wfcp-char-count .wfcp-char-current').text('0').css('color', '#6b7280');
							$btn.prop('disabled', false).html(originalText);
						}, 1000);
					} else {
						var errorMsg = (response && response.data && response.data.message) ? response.data.message : 'خطا در ذخیره محصول';
						showToast(errorMsg, 'error');
						$btn.prop('disabled', false).html(originalText);
					}
				},
				error: function(xhr, status, error) {
					console.error('WFCP Quick Add: AJAX Error', {
						xhr: xhr,
						status: status,
						error: error,
						responseText: xhr.responseText
					});
					
					var errorMsg = 'خطا در ارتباط با سرور';
					if (xhr.responseText) {
						try {
							var response = JSON.parse(xhr.responseText);
							if (response.data && response.data.message) {
								errorMsg = response.data.message;
							}
						} catch(e) {
							// Not JSON, use default
						}
					}
					
					showToast(errorMsg, 'error');
					$btn.prop('disabled', false).html(originalText);
				}
			});
		});

		// Handle Enter key in input fields
		$(document).on('keypress', '.wfcp-product-name, .wfcp-purchase-price', function(e) {
			if (e.which === 13) { // Enter key
				var row = $(this).data('row');
				$('.wfcp-save-row[data-row="' + row + '"]').click();
			}
		});

		// Auto-focus next row after save
		$(document).on('focus', '.wfcp-product-name', function() {
			var row = parseInt($(this).data('row'));
			if (row < 50) {
				// Scroll to next row if needed
				var $nextRow = $('tr[data-row="' + (row + 1) + '"]');
				if ($nextRow.length) {
					$('html, body').animate({
						scrollTop: $nextRow.offset().top - 100
					}, 300);
				}
			}
		});

		console.log('WFCP Quick Add: All event handlers attached');
	});

})(jQuery);

