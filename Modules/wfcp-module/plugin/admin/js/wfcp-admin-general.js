/**
 * Admin General JavaScript
 *
 * @package    WFCP
 * @subpackage WFCP/admin/js
 */

(function($) {
	'use strict';

	$(document).ready(function() {
		// Tab switching
		$('.wfcp-tab-nav-item').on('click', function() {
			var tabId = $(this).data('tab');
			
			if (!tabId) return;
			
			// Update nav
			$('.wfcp-tab-nav-item').removeClass('active');
			$(this).addClass('active');
			
			// Update content
			$('.wfcp-tab-content').removeClass('active');
			$('#' + tabId).addClass('active');
			
			// Scroll to top of content
			$('.wfcp-tab-content-wrapper').scrollTop(0);
		});

		// Save settings on form submit
		$('.wfcp-settings-form').on('submit', function(e) {
			e.preventDefault();
			
			var $form = $(this);
			var section = $form.data('section');
			var formData = {};
			
			// Collect form data
			$form.find('input, select, textarea').each(function() {
				var $field = $(this);
				var name = $field.attr('name');
				var type = $field.attr('type');
				var value;
				
				if (!name) return;
				// Skip gateway checkboxes here — collected explicitly below as ID list.
				if (name === 'gateways[]' || name === 'gateways') return;
				
				if (type === 'checkbox') {
					value = $field.is(':checked');
				} else if (type === 'radio') {
					value = $form.find('input[name="' + name + '"]:checked').val();
				} else {
					value = $field.val();
				}
				
				// Handle nested keys (e.g., texts[title], config[id][name])
				if (name.indexOf('[') !== -1) {
					var parts = name.replace(/\]/g, '').split('[');
					var obj = formData;
					for (var i = 0; i < parts.length - 1; i++) {
						if (!obj[parts[i]]) {
							obj[parts[i]] = {};
						}
						obj = obj[parts[i]];
					}
					obj[parts[parts.length - 1]] = value;
				} else {
					formData[name] = value;
				}
			});

			// Fix: collect gateway checkboxes explicitly for retail/credit/installment/wholesale
			if (section === 'retail' || section === 'credit' || section === 'installment' || section === 'wholesale') {
				formData.gateways = $form.find('input[name="gateways[]"]:checked').map(function() {
					return $(this).val();
				}).get() || [];
			}

			// Gateways config: attach stable gateway id (avoids dotted PHP keys)
			if (section === 'gateways' && formData.config && typeof formData.config === 'object') {
				$form.find('[data-gateway-id]').each(function() {
					var gid = $(this).data('gateway-id');
					if (gid && formData.config[gid]) {
						formData.config[gid].id = String(gid);
					}
				});
			}
			
			// Handle special cases (arrays, etc.)
			if (section === 'installment') {
				formData.plans = collectInstallmentPlans();
			}
			
			// Send AJAX request
			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_save_settings',
					nonce: wfcpAdmin.nonce,
					section: section,
					data: formData
				},
				beforeSend: function() {
					showToast('در حال ذخیره...', 'info');
				},
				success: function(response) {
					if (!response || typeof response !== 'object') {
						showToast('پاسخ نامعتبر از سرور', 'error');
						return;
					}
					if (response.success) {
						var msg = (response.data && response.data.message) ? response.data.message : 'تنظیمات با موفقیت ذخیره شد';
						showToast(msg, 'success');
					} else {
						var err = (response.data && response.data.message) ? response.data.message : 'خطا در ذخیره تنظیمات';
						showToast(err, 'error');
					}
				},
				error: function(xhr, status, error) {
					console.error('AJAX Error:', xhr, status, error);
					console.error('Response:', xhr.responseText);
					var errorMsg = 'خطا در ارتباط با سرور';
					if (xhr.responseText) {
						try {
							var response = JSON.parse(xhr.responseText);
							if (response.data && response.data.message) {
								errorMsg = response.data.message;
							}
						} catch(e) {
							// Not JSON, use default message
						}
					}
					showToast(errorMsg, 'error');
				}
			});
		});

		// Gateways are now displayed as toggle switches, no Select2 needed

		// Style preview update
		$('#box_background, #box_border_color, #button_background, #button_text_color, #price_color, #border_radius').on('input change', function() {
			updateStylePreview();
		});
		
		// Initial preview update
		if ($('#wfcp-tab-style').hasClass('active')) {
			updateStylePreview();
		}

		// API Test button - Use event delegation for dynamic content
		$(document).on('click', '#wfcp-test-api', function() {
			var $btn = $(this);
			var apiKey = $('#api_key').val();
			var apiSymbol = $('#api_symbol').val();
			
			if (!apiKey) {
				showToast('لطفاً API Key را وارد کنید', 'error');
				return;
			}
			
			var originalText = $btn.html();
			$btn.prop('disabled', true).html('در حال تست...');
			
			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_test_api',
					nonce: wfcpAdmin.nonce,
					api_key: apiKey,
					api_symbol: apiSymbol
				},
				success: function(response) {
					$btn.prop('disabled', false).html(originalText);
					
					if (response.success) {
						showToast(response.data.message, 'success');
						$('#exchange_rate').val(response.data.price);
					} else {
						showToast(response.data.message || 'خطا در اتصال به API', 'error');
					}
				},
				error: function(xhr, status, error) {
					$btn.prop('disabled', false).html(originalText);
					console.error('AJAX Error:', error);
					showToast('خطا در ارتباط با سرور: ' + error, 'error');
				}
			});
		});

		// Update Exchange Rate button (in form) - Use event delegation
		$(document).on('click', '#wfcp-update-now', function() {
			updateExchangeRate($(this));
		});

		// Update Exchange Rate button (in card) - Use event delegation
		$(document).on('click', '#wfcp-update-now-card', function() {
			updateExchangeRate($(this));
		});

		// Function to update exchange rate
		function updateExchangeRate($btn) {
			if (!confirm('آیا می‌خواهید نرخ ارز را از API دریافت کنید؟')) {
				return;
			}
			
			var originalText = $btn.html();
			$btn.prop('disabled', true).html('<span class="dashicons dashicons-update" style="margin-left: 5px; vertical-align: middle; animation: spin 1s linear infinite;"></span>در حال به‌روزرسانی...');
			
			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_update_exchange_rate',
					nonce: wfcpAdmin.nonce
				},
				success: function(response) {
					$btn.prop('disabled', false).html(originalText);
					
					if (response.success) {
						showToast(response.data.message, 'success');
						$('#exchange_rate').val(response.data.price);
						setTimeout(function() {
							location.reload(); // Reload to show updated time and rate
						}, 1000);
					} else {
						showToast(response.data.message || 'خطا در به‌روزرسانی', 'error');
					}
				},
				error: function(xhr, status, error) {
					$btn.prop('disabled', false).html(originalText);
					console.error('AJAX Error:', error);
					showToast('خطا در ارتباط با سرور: ' + error, 'error');
				}
			});
		}

		// Sync all WooCommerce prices to WFCP retail (exchange tab + bulk price list).
		$(document).on('click', '.wfcp-sync-all-wc-prices', function() {
			var $btn = $(this);

			if (!confirm('آیا می‌خواهید قیمت تمام محصولات را به‌روزرسانی کنید؟ این عملیات ممکن است زمان‌بر باشد.')) {
				return;
			}

			var defaultLabel = $btn.attr('data-wfcp-sync-label');
			if (!defaultLabel) {
				defaultLabel = $.trim($btn.text());
				$btn.attr('data-wfcp-sync-label', defaultLabel);
			}

			$btn.prop('disabled', true).text('در حال به‌روزرسانی...');

			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_update_all_prices',
					nonce: wfcpAdmin.nonce
				},
				success: function(response) {
					$btn.prop('disabled', false).text(defaultLabel);

					if (response.success) {
						showToast(response.data.message, 'success');
						if ($btn.closest('.wfcp-bulk-editor').length) {
							window.location.reload();
						}
					} else {
						showToast(response.data.message || 'خطا در به‌روزرسانی', 'error');
					}
				},
				error: function() {
					$btn.prop('disabled', false).text(defaultLabel);
					showToast('خطا در ارتباط با سرور', 'error');
				}
			});
		});

		// Toggle API fields visibility
		$('input[name="api_enabled"]').on('change', function() {
			var isEnabled = $(this).is(':checked');
			$('input[name="auto_update_enabled"]').closest('.wfcp-form-group').toggle(isEnabled);
			$('#auto_update_hour').closest('.wfcp-form-group').toggle(isEnabled);
			$('#exchange_rate').prop('readonly', isEnabled);
		}).trigger('change');

		// Auto update hour is always enabled, no need to disable it

		// Style preview update
		$('#box_background, #box_border_color, #button_background, #button_text_color, #price_color, #border_radius').on('input change', function() {
			updateStylePreview();
		});

		// Installment plan management
		$('.wfcp-add-plan').on('click', function() {
			var planHtml = getInstallmentPlanHtml();
			$('.wfcp-installment-plans').append(planHtml);
		});

		$(document).on('click', '.wfcp-remove-plan', function() {
			$(this).closest('.wfcp-installment-plan').remove();
		});

		// Recalculate all
		$('.wfcp-recalculate-all').on('click', function() {
			var dryRun = $('#wfcp-dry-run').is(':checked');
			
			if (!confirm('آیا از محاسبه مجدد تمام قیمت‌ها اطمینان دارید؟')) {
				return;
			}
			
			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_recalculate_all',
					nonce: wfcpAdmin.nonce,
					dry_run: dryRun ? 'true' : 'false'
				},
				beforeSend: function() {
					showToast('در حال محاسبه...', 'info');
				},
				success: function(response) {
					if (response.success) {
						var message = 'محاسبه با موفقیت انجام شد. ';
						message += 'موفق: ' + response.data.success + '، ';
						message += 'ناموفق: ' + response.data.failed;
						showToast(message, 'success');
						
						if (dryRun && response.data.log) {
							console.log('Log:', response.data.log);
						}
					} else {
						showToast(response.data.message || 'خطا در محاسبه', 'error');
					}
				},
				error: function() {
					showToast('خطا در ارتباط با سرور', 'error');
				}
			});
		});

		// Delete transients
		$('.wfcp-delete-transients').on('click', function() {
			if (!confirm('آیا از حذف تمام کش‌ها اطمینان دارید؟')) {
				return;
			}
			
			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_delete_transients',
					nonce: wfcpAdmin.nonce
				},
				success: function(response) {
					if (response.success) {
						showToast(response.data.message || 'کش‌ها با موفقیت حذف شدند', 'success');
					} else {
						showToast(response.data.message || 'خطا در حذف کش', 'error');
					}
				},
				error: function() {
					showToast('خطا در ارتباط با سرور', 'error');
				}
			});
		});

		// Export settings
		$('.wfcp-export-settings').on('click', function() {
			$.ajax({
				url: wfcpAdmin.ajaxUrl,
				type: 'POST',
				data: {
					action: 'wfcp_export_settings',
					nonce: wfcpAdmin.nonce
				},
				success: function(response) {
					if (response.success) {
						// Create download link
						var blob = new Blob([response.data.json], {type: 'application/json'});
						var url = URL.createObjectURL(blob);
						var a = document.createElement('a');
						a.href = url;
						a.download = 'wfcp-settings-' + new Date().getTime() + '.json';
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(url);
						
						showToast('تنظیمات با موفقیت دانلود شد', 'success');
					} else {
						showToast(response.data.message || 'خطا در خروجی', 'error');
					}
				},
				error: function() {
					showToast('خطا در ارتباط با سرور', 'error');
				}
			});
		});

		// Import settings
		$('.wfcp-import-settings').on('click', function() {
			var input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json';
			
			input.onchange = function(e) {
				var file = e.target.files[0];
				if (!file) return;
				
				var reader = new FileReader();
				reader.onload = function(e) {
					var json = e.target.result;
					
					$.ajax({
						url: wfcpAdmin.ajaxUrl,
						type: 'POST',
						data: {
							action: 'wfcp_import_settings',
							nonce: wfcpAdmin.nonce,
							json: json
						},
						success: function(response) {
							if (response.success) {
								showToast(response.data.message || 'تنظیمات با موفقیت وارد شد', 'success');
								setTimeout(function() {
									location.reload();
								}, 1500);
							} else {
								showToast(response.data.message || 'خطا در وارد کردن', 'error');
							}
						},
						error: function() {
							showToast('خطا در ارتباط با سرور', 'error');
						}
					});
				};
				reader.readAsText(file);
			};
			
			input.click();
		});

		// Wholesale category rules
		$('#wfcp-wholesale-strategy').on('change', function() {
			var strategy = $(this).val();
			if (strategy === 'category') {
				loadCategoryRules();
			} else {
				$('.wfcp-category-rules').hide();
			}
		});

		// Initialize category rules if strategy is category
		if ($('#wfcp-wholesale-strategy').val() === 'category') {
			loadCategoryRules();
		}

		// === Gateway Icon Media Uploader (WordPress Media Library) ===
		// Initialize previews for existing icons on load
		$('.wfcp-gateway-config-table .wfcp-icon-url').each(function() {
			var $input = $(this);
			var url = $input.val();
			if (url) {
				var $preview = $input.siblings('.wfcp-icon-preview');
				if ($preview.length === 0) {
					$preview = $('<img class="wfcp-icon-preview" style="max-height:32px; max-width:48px; vertical-align:middle; margin-left:6px; border:1px solid #ddd; border-radius:3px;" />');
					$input.after($preview);
				}
				$preview.attr('src', url).show();
			}
		});

		// Open WP Media frame for icon upload
		$(document).on('click', '.wfcp-upload-icon-btn', function(e) {
			e.preventDefault();

			var $btn = $(this);
			var $td = $btn.closest('td');
			var $input = $td.find('.wfcp-icon-url');
			var $preview = $td.find('.wfcp-icon-preview');

			// Create media frame (one time per click is fine)
			var frame = wp.media({
				title: 'انتخاب تصویر درگاه پرداخت',
				button: {
					text: 'استفاده از این تصویر'
				},
				multiple: false,
				library: { type: 'image' }
			});

			frame.on('select', function() {
				var attachment = frame.state().get('selection').first().toJSON();
				var url = attachment.url || attachment.sizes && attachment.sizes.thumbnail && attachment.sizes.thumbnail.url || attachment.url;

				$input.val(url);

				if ($preview.length === 0) {
					$preview = $('<img class="wfcp-icon-preview" style="max-height:32px; max-width:48px; vertical-align:middle; margin-left:6px; border:1px solid #ddd; border-radius:3px;" />');
					$input.after($preview);
				}
				$preview.attr('src', url).show();
			});

			frame.open();
		});

		// Remove icon
		$(document).on('click', '.wfcp-remove-icon-btn', function(e) {
			e.preventDefault();
			var $td = $(this).closest('td');
			$td.find('.wfcp-icon-url').val('');
			$td.find('.wfcp-icon-preview').remove();
		});

		// Live preview when user manually types/pastes a URL
		$(document).on('input change', '.wfcp-icon-url', function() {
			var $input = $(this);
			var $td = $input.closest('td');
			var url = $input.val().trim();
			var $preview = $td.find('.wfcp-icon-preview');
			if (url) {
				if ($preview.length === 0) {
					$preview = $('<img class="wfcp-icon-preview" style="max-height:32px; max-width:48px; vertical-align:middle; margin-left:6px; border:1px solid #ddd; border-radius:3px;" />');
					$input.after($preview);
				}
				$preview.attr('src', url).show();
			} else if ($preview.length) {
				$preview.remove();
			}
		});
	});

	function collectInstallmentPlans() {
		var plans = [];
		$('.wfcp-installment-plan').each(function() {
			var $plan = $(this);
			var months = parseInt($plan.find('.wfcp-plan-months').val()) || 0;
			var interest = parseFloat($plan.find('.wfcp-plan-interest').val()) || 0;
			if (months > 0) {
				plans.push({
					months: months,
					interest: interest
				});
			}
		});
		return plans;
	}

	function getInstallmentPlanHtml() {
		return '<div class="wfcp-installment-plan">' +
			'<div class="wfcp-installment-plan-header">' +
			'<span class="wfcp-installment-plan-title">پلن جدید</span>' +
			'<button type="button" class="wfcp-btn wfcp-btn-danger wfcp-remove-plan">حذف</button>' +
			'</div>' +
			'<div class="wfcp-form-group">' +
			'<label class="wfcp-form-label">تعداد ماه</label>' +
			'<input type="number" name="plan_months" class="wfcp-form-control wfcp-plan-months" min="1" value="3">' +
			'</div>' +
			'<div class="wfcp-form-group">' +
			'<label class="wfcp-form-label">درصد سود</label>' +
			'<input type="number" name="plan_interest" class="wfcp-form-control wfcp-plan-interest" min="0" step="0.1" value="5">' +
			'</div>' +
			'</div>';
	}

	function loadCategoryRules() {
		// This would load categories via AJAX
		// For now, we'll assume categories are loaded in PHP
		$('.wfcp-category-rules').show();
	}

	function updateStylePreview() {
		var boxBg = $('#box_background').val() || '#ffffff';
		var boxBorder = $('#box_border_color').val() || '#e0e0e0';
		var btnBg = $('#button_background').val() || '#2271b1';
		var btnText = $('#button_text_color').val() || '#ffffff';
		var priceColor = $('#price_color').val() || '#2271b1';
		var borderRadius = $('#border_radius').val() || 8;

		var $preview = $('.wfcp-preview-box');
		if ($preview.length) {
			$preview.css({
				'background': boxBg,
				'border-color': boxBorder,
				'border-radius': borderRadius + 'px'
			});

			$preview.find('div[style*="color"]').css('color', priceColor);
			$preview.find('button').css({
				'background': btnBg,
				'color': btnText
			});
		}
	}

	function showToast(message, type) {
		type = type || 'info';
		var $toast = $('<div class="wfcp-toast ' + type + '" role="alert">' +
			'<span class="wfcp-toast-text">' + message + '</span>' +
			'<button type="button" class="wfcp-toast-close" aria-label="بستن">&times;</button>' +
			'</div>');
		$('body').append($toast);

		function dismiss() {
			var t = $toast.data('dismissTimer');
			if (t) clearTimeout(t);
			$toast.off('click').find('.wfcp-toast-close').off('click');
			$toast.fadeOut(200, function() {
				$(this).remove();
			});
		}

		$toast.find('.wfcp-toast-close').on('click', function(e) { e.preventDefault(); e.stopPropagation(); dismiss(); });
		$toast.on('click', function(e) {
			if ($(e.target).hasClass('wfcp-toast-close')) return;
			dismiss();
		});

		var duration = (type === 'error') ? 8000 : 3000;
		$toast.data('dismissTimer', setTimeout(dismiss, duration));
	}

})(jQuery);

