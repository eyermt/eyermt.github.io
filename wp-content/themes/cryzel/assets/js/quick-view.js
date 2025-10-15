


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up comment form placeholders
    const authorField = document.getElementById('author');
    const emailField = document.getElementById('email');
    const commentField = document.getElementById('comment');

    if (authorField) authorField.placeholder = 'Your name';
    if (emailField) emailField.placeholder = 'Your email';
    if (commentField) commentField.placeholder = 'Write Your Review Here...';
});

// Breadcrumbs: URL color change 
  document.addEventListener("DOMContentLoaded", function () {
    const breadcrumb = document.querySelector(".woocommerce-breadcrumb");

    if (breadcrumb && breadcrumb.childNodes) {
      breadcrumb.childNodes.forEach(node => {
        if (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim().length > 0
        ) {
          const span = document.createElement("span");
          span.className = "current-product";
          span.textContent = node.textContent.trim();
          breadcrumb.replaceChild(span, node);
        }
      });
    }
  });



jQuery(document).ready(function($) {
    // Helper function to find matching variation
    function findMatchingVariation(variations, attributes) {
        if (!variations || !variations.length) {
            return null;
        }

        // Normalize attribute values for comparison (case-insensitive, trim whitespace)
        const normalizedAttributes = {};
        Object.entries(attributes).forEach(([key, value]) => {
            if (value) {
                normalizedAttributes[key.toLowerCase()] = value.toLowerCase().trim();
            }
        });

        const matchingVariation = variations.find(variation => {
            if (!variation || !variation.attributes) {
                return false;
            }
            
            // Convert variation attributes to lowercase and remove 'pa_' prefix
            const normalizedVariationAttrs = {};
            Object.entries(variation.attributes).forEach(([key, value]) => {
                const normalizedKey = key.replace('pa_', '').toLowerCase();
                normalizedVariationAttrs[normalizedKey] = (value || '').toLowerCase();
            });

            // Check if all selected attributes match the variation
            const matches = Object.entries(normalizedAttributes).every(([attribute, value]) => {
                const variationValue = normalizedVariationAttrs[attribute];
                
                // If variation doesn't specify this attribute or it's empty, it's a wildcard match
                if (!variationValue || variationValue === '') {
                    return true;
                }
                
                return variationValue === value;
            });

            return matches;
        });

        return matchingVariation;
    }

    // Function to update variation availability
    function updateVariationAvailability($form) {
        const selectedAttributes = {};
        $form.find('select.variation-select').each(function() {
            const $select = $(this);
            const name = $select.attr('name');
            const value = $select.val();
            console.log(`Processing select: ${name} = ${value}`);
            if (value) {
                selectedAttributes[name] = value;
            }
        });

        console.log('Selected attributes:', selectedAttributes);
        console.log('Available variations:', window.quickViewVariations);

        const $addToCartBtn = $form.find('.single_add_to_cart_button');
        const $variationNotAvailable = $form.find('.variation-availability');

        // If not all variations are selected
        const allSelected = areAllVariationsSelected($form);
        console.log('All variations selected:', allSelected);

        if (!allSelected) {
            $addToCartBtn.addClass('disabled').prop('disabled', true);
            $variationNotAvailable.html('Please select all options').show();
            return;
        }

        // Find matching variation
        const matchingVariation = findMatchingVariation(window.quickViewVariations.data, selectedAttributes);
        console.log('Matching variation result:', matchingVariation);

        if (!matchingVariation) {
            $addToCartBtn.addClass('disabled').prop('disabled', true);
            $variationNotAvailable.html('This variation is not available').show();
            return;
        }

        if (!matchingVariation.is_in_stock) {
            $addToCartBtn.addClass('disabled').prop('disabled', true);
            $variationNotAvailable.html('This variation is currently out of stock').show();
            return;
        }

        // Update price if available
        if (matchingVariation.price_html) {
            $form.closest('.quick-view-modal').find('.product-price').html(matchingVariation.price_html);
        }

        // Update image if available
        if (matchingVariation.image && matchingVariation.image.src) {
            var $modal = $form.closest('.quick-view-modal');
            
            console.log('Variation image update:', matchingVariation.image.src);
            console.log('Modal found:', $modal.length);
            console.log('Main image found:', $modal.find('.main-product-image').length);
            
            // Update the main image to show the variation
            $modal.find('.main-product-image').attr('src', matchingVariation.image.src);
            
            // Update the active thumbnail to match the variation image
            var $thumbnails = $modal.find('.flex-control-thumbs li');
            $thumbnails.removeClass('flex-active');
            
            // Find and activate the thumbnail that matches the variation image
            $thumbnails.each(function() {
                var $thumb = $(this);
                var thumbSrc = $thumb.find('img').attr('src');
                if (thumbSrc === matchingVariation.image.src) {
                    $thumb.addClass('flex-active');
                }
            });
            
            console.log('Variation image updated to:', matchingVariation.image.src);
        }

        // Enable add to cart button and store variation ID
        $addToCartBtn.removeClass('disabled').prop('disabled', false);
        $addToCartBtn.data('variation_id', matchingVariation.variation_id);
        $variationNotAvailable.hide();

        console.log('Button enabled with variation ID:', matchingVariation.variation_id);
    }

    // Function to check if all variations are selected
    function areAllVariationsSelected($form) {
        let allSelected = true;
        $form.find('select.variation-select').each(function() {
            const value = $(this).val();
            console.log(`Checking select value: ${$(this).attr('name')} = ${value}`);
            if (!value) {
                allSelected = false;
                return false;
            }
        });
        return allSelected;
    }

    // Add Quick View buttons to products
    function addQuickViewButtons() {
        // Don't add buttons on single product pages
        if ($('body').hasClass('single-product')) {
            return;
        }
        
        console.log('Adding quick view buttons');
        $('.product').each(function() {
            var $product = $(this);
            var $image = $product.find('a img');
            var $container = $image.length ? $image.parent() : $product;
            
            // Only add if there isn't already a quick-view-btn and we're not on a single product
            if (!$container.find('.quick-view-btn').length && !$('body').hasClass('single-product')) {
                $container.css('position', 'relative');
                
                // Get product URL from the first link in the product
                var productUrl = $product.find('a:first').attr('href') || '#';
                
                // Create button wrapper
                var $buttonWrapper = $('<div class="product-action-buttons"></div>');
                
                // Add Quick View button with improved styling
                $buttonWrapper.append('<button type="button" class="quick-view-btn">Quick View</button>');
                
                // Add buttons to container
                $container.append($buttonWrapper);
                
                // Ensure the container has proper positioning
                if ($container.css('position') === 'static') {
                    $container.css('position', 'relative');
                }
            }
        });
    }

    // Debounce function
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // Initialize buttons and set up event listeners
    function initQuickView() {
        addQuickViewButtons();

        // Handle pagination clicks
        $(document).on('click', '.woocommerce-pagination a', function() {
            setTimeout(addQuickViewButtons, 1000);
        });

        // Handle WooCommerce specific events
        $('body').on('updated_wc_div', addQuickViewButtons);
        $('body').on('wc_fragments_refreshed', addQuickViewButtons);
        $('body').on('wc_fragments_loaded', addQuickViewButtons);
        $('body').on('wc_update_page', addQuickViewButtons);
        
        // Handle scroll events with debounce
        $(window).on('scroll', debounce(function() {
            addQuickViewButtons();
        }, 250));
    }

    // Initialize on document ready
    initQuickView();

    // Handle AJAX completions
    $(document).ajaxComplete(function(event, xhr, settings) {
        setTimeout(addQuickViewButtons, 500);
    });

    // Watch for DOM changes in the products container
    function setupObserver() {
        var productsContainer = $('.products')[0];
        if (productsContainer) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        addQuickViewButtons();
                    }
                });
            });

            observer.observe(productsContainer, {
                childList: true,
                subtree: true
            });
        }
    }

    // Set up the observer
    setupObserver();

    // Handle Quick View button click
    $(document).on('click', '.quick-view-btn', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        console.log('Quick view button clicked', e);
        
        // Make sure the click didn't come from a child element
        if (e.target !== this) {
            return;
        }

        var $trigger = $(this);
        var $product = $trigger.closest('.product');
        
        console.log('Product container found:', $product.length > 0);

        // Get product details
        var title = $product.find('.wp-block-post-title, .woocommerce-loop-product__title').first().text().trim();
        if (!title) {
            title = $product.find('h2, h3').first().text().trim();
        }
        var price = $product.find('.price').html() || '';
        var mainImage = $product.find('img').first().attr('src');
        
        // Get all product images including variations
        var images = [];
        $product.find('img').each(function() {
            var imgSrc = $(this).attr('src');
            if (imgSrc && !images.includes(imgSrc)) {
                images.push(imgSrc);
            }
        });
        
        console.log('Images collected from DOM:', images);
        
        // Store images globally for variation updates
        window.quickViewImages = images;
        
        // Get product ID from data attribute (numeric ID)
        var productId = $product.data('wp-context')?.productId ||
                      $product.data('product_id') ||
                      $product.data('id') ||
                      $product.attr('id')?.replace('product-', '') ||
                      $product.find('[data-product_id]').first().data('product_id');

        // If we still don't have a numeric ID, try to extract it from the slug
        if (!productId || isNaN(productId)) {
            // Check if we have a slug and need to convert it to ID
            var slug = $product.attr('class')?.match(/post-(\d+)/);
            if (slug && slug[1]) {
                productId = slug[1];
            } else {
                // Try to get from the product link as a last resort
                var productLink = $product.find('a[href*="product/"]').attr('href') || 
                                 $product.find('a').filter(function() {
                                     return $(this).attr('href') && $(this).attr('href').includes('product/');
                                 }).attr('href');
                
                if (productLink) {
                    var matches = productLink.match(/product\/([^\/]+)/);
                    if (matches && matches[1]) {
                        var slug = matches[1];
                        // If we got a slug, we'll need to make an AJAX request to get the ID
                        // We'll handle this case in the AJAX call
                    }
                }
            }
        }

        console.log('Product ID:', productId);
        console.log('Product element:', $product[0]);

        if (!productId) {
            console.error('Could not find product ID. Please check the product element structure.');
            console.log('Available data attributes:', $product.data());
            return;
        }

        // Check if we have a numeric ID or a slug
        var isNumericId = !isNaN(productId);
        console.log('Product ID type:', isNumericId ? 'Numeric ID' : 'Slug', productId);

        // Make AJAX call to get full product details
        $.ajax({
            url: cryzel_quick_view_params.ajax_url,
            type: 'POST',
            data: {
                action: 'get_product_details',
                product_id: productId,
                is_slug: isNumericId ? 0 : 1, // Tell the server if we're using a slug
                security: cryzel_quick_view_params.ajax_nonce || ''
            },
            success: function(response) {
                if (response.success) {
                    console.log('AJAX Response:', response);
                    var data = response.data;
                    description = data.description;
                    sku = data.sku;
                    categories = data.categories;
                    rating = data.rating;
                    price = data.price || '';
                    
                    // Log review count data for debugging
                    console.log('Review count data:', {
                        review_count: data.review_count,
                        data_keys: Object.keys(data)
                    });
                    
                    // Store review count for use in the template
                    var reviewCount = data.review_count || 0;
                    
                    // Process variations data
                    var variations = data.variations || {};
                    console.log('Raw variations data:', variations);
                    
                    // Create variations HTML if product has variations
                    var variationsHtml = '';
                    if (variations.attributes && Object.keys(variations.attributes).length > 0) {
                        console.log('Processing variation attributes:', variations.attributes);
                        variationsHtml = '<div class="variations">';
                        Object.entries(variations.attributes).forEach(([attribute, options]) => {
                            console.log(`Processing attribute: ${attribute} with options:`, options);
                            if (options && options.length > 0) {
                                const attributeName = attribute.replace('pa_', '').replace(/-/g, ' ');
                                variationsHtml += `
                                    <div class="variation-row">
                                        <label for="${attribute}">${attributeName}</label>
                                        <select name="${attribute}" class="variation-select" data-attribute="${attribute}">
                                            <option value="">Choose ${attributeName}</option>
                                            ${options.map(option => `<option value="${option}">${option}</option>`).join('')}
                                        </select>
                                    </div>
                                `;
                            }
                        });
                        variationsHtml += '</div>';
                    }

                    // Store variations data globally with proper structure
                    window.quickViewVariations = {
                        data: Array.isArray(variations.variations) ? variations.variations.map(variation => ({
                            ...variation,
                            attributes: Object.entries(variation.attributes || {}).reduce((acc, [key, value]) => {
                                // Ensure attribute keys are consistent
                                acc[key.toLowerCase()] = value;
                                return acc;
                            }, {})
                        })) : [],
                        attributes: variations.attributes || {}
                    };
                    
                    console.log('Processed variations data:', window.quickViewVariations);

                    // Create WooCommerce gallery HTML with variation support
                    var galleryHtml = '';
                    if (images && images.length > 0) {
                        console.log('Original images:', images);
                        
                        // Start with main product images
                        var allImages = [...images];
                        
                        // Only add variation images if product has variations
                        var hasVariations = window.quickViewVariations && 
                                           window.quickViewVariations.data && 
                                           window.quickViewVariations.data.length > 0;
                        
                        console.log('Product has variations:', hasVariations);
                        
                        if (hasVariations) {
                            // Add variation images only for variable products
                            console.log('Adding variation images...');
                            window.quickViewVariations.data.forEach(function(variation, index) {
                                console.log(`Variation ${index}:`, {
                                    id: variation.variation_id,
                                    attributes: variation.attributes,
                                    has_image: !!(variation.image && variation.image.src),
                                    image_src: variation.image ? variation.image.src : 'No image'
                                });
                                
                                if (variation.image && variation.image.src && !allImages.includes(variation.image.src)) {
                                    allImages.push(variation.image.src);
                                    console.log('Added variation image:', variation.image.src);
                                }
                            });
                        }
                        
                        console.log('All images before deduplication:', allImages);
                        
                        // Remove duplicate images using Set for better performance
                        var uniqueImages = [...new Set(allImages)];
                        
                        console.log('Unique images after deduplication:', uniqueImages);
                        
                        // Use first unique image as main image
                        var mainImage = uniqueImages[0] || images[0];
                        
                        // Only show thumbnails if there are multiple images
                        var showThumbnails = uniqueImages.length > 1;
                        
                        galleryHtml = `
                            <div class="woocommerce-product-gallery woocommerce-product-gallery--with-images woocommerce-product-gallery--columns-4 images" data-columns="4">
                                <div class="main-image-container">
                                    <img src="${mainImage}" class="main-product-image" alt="${title}" data-large_image="${mainImage}" data-large_image_width="800" data-large_image_height="800">
                                </div>
                                ${showThumbnails ? `
                                    <div class="flex-control-nav flex-control-thumbs">
                                        ${uniqueImages.map((imgSrc, index) => `
                                            <li class="${index === 0 ? 'flex-active' : ''}" data-thumb="${imgSrc}">
                                                <img src="${imgSrc}" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="${title}">
                                            </li>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }
                    
                    // Create modal HTML with all product details
                    var modal = `
                        <div class="quick-view-modal">
                            <div class="quick-view-content">
                                <button class="close-modal" aria-label="Close modal">&times;</button>
                                
                                <div class="quick-view-grid">
                                    <div class="product-gallery">
                                        ${galleryHtml}
                                    </div>

                                    <div class="product-details">
                                        <h2 class="product-title">${title}</h2>
                                        ${rating ? `
                                            <div class="product-rating">
                                                ${rating}
                                                ${reviewCount > 0 ? 
                                                    `<a href="${window.location.origin}${window.location.pathname}?post_type=product&p=${productId}#reviews" class="review-count-link">
                                                        ${reviewCount === 1 ? '1 customer review' : `${reviewCount} customer reviews`}
                                                    </a>` : 
                                                    ''}
                                            </div>
                                        ` : ''}
                                        ${price ? `<div class="product-price">${price}</div>` : ''}
                                        ${description ? `<div class="product-description">${description}</div>` : ''}
                                        <div class="product-variations">
                                            <form class="cart">
                                                ${variationsHtml}
                                                <div class="variation-availability"></div>
                                                <div class="quantity">
                                                    <label for="quantity_${productId}">Quantity</label>
                                                    <input 
                                                        type="number" 
                                                        id="quantity_${productId}" 
                                                        class="input-text qty text" 
                                                        step="1" 
                                                        min="1" 
                                                        max="" 
                                                        name="quantity" 
                                                        value="1" 
                                                        title="Qty" 
                                                        size="4" 
                                                        inputmode="numeric"
                                                    >
                                                </div>
                                                <button 
                                                    type="submit" 
                                                    class="single_add_to_cart_button button alt${!variationsHtml ? '' : ' disabled'}" 
                                                    data-product_id="${productId}"
                                                    ${!variationsHtml ? '' : 'disabled'}
                                                >
                                                    Add to cart
                                                </button>
                                            </form>
                                        </div>
                                        <div class="product-meta">
                                            ${sku ? `<div class="product-sku">SKU: ${sku}</div>` : ''}
                                            ${categories ? `<div class="product-categories">Categories: ${categories}</div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    // Remove any existing modals
                    $('.quick-view-modal').remove();
                    
                    // Add new modal
                    $('body').append(modal);
                    
                    // Show modal with animation
                    setTimeout(() => {
                        $('.quick-view-modal').addClass('show');
                        $('body').addClass('modal-open');
                    }, 10);

                    // Setup modal events
                    setupModalEvents();
                    
                    // Prevent body scroll when modal is open
                    $('body').css('overflow', 'hidden');
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX Error:', error);
            }
        });
    });



    function setupModalEvents() {
        // Close modal on clicking close button or outside modal
        function closeModal() {
            $('.quick-view-modal').removeClass('show');
            $('body').removeClass('modal-open').css('overflow', '');
            setTimeout(() => {
                $('.quick-view-modal').remove();
            }, 300);
        }

        // Close on button click or outside click
        $(document).on('click', '.close-modal, .quick-view-modal', function(e) {
            if (e.target === this || $(e.target).hasClass('close-modal')) {
                closeModal();
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Close on ESC key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('.quick-view-modal').hasClass('show')) {
                closeModal();
            }
        });

        // Handle thumbnail clicks
        $(document).on('click', '.flex-control-thumbs li', function() {
            var $this = $(this);
            var newSrc = $this.find('img').attr('src');
            var $modal = $this.closest('.quick-view-modal');
            
            console.log('Thumbnail clicked:', newSrc);
            console.log('Modal found:', $modal.length);
            console.log('Main image found:', $modal.find('.main-product-image').length);
            
            // Update main image
            $modal.find('.main-product-image').attr('src', newSrc);
            
            // Update active states
            $modal.find('.flex-control-thumbs li').removeClass('flex-active');
            $this.addClass('flex-active');
            
            console.log('Image updated to:', newSrc);
        });

        // Handle variation selection changes
        $(document).on('change', '.variation-select', function() {
            var $form = $(this).closest('form');
            var $variationId = $form.find('input[name="variation_id"]');
            var $select = $(this);
            
            console.log('Variation select changed:', $select.attr('name'), '=', $select.val());
            
            // Reset variation ID when changing attributes
            $variationId.val(0);
            
            // Update variation availability
            updateVariationAvailability($form);
        });

        // Handle form submission
        $(document).on('submit', '.cart', function(e) {
            e.preventDefault();
            var $form = $(this);
            var $button = $form.find('.single_add_to_cart_button');
            
            if ($button.hasClass('disabled') || $button.hasClass('loading')) {
                return false;
            }

            $button.addClass('loading');
            
            // Get the product ID from the form or button data
            var productId = $form.find('[name="add-to-cart"]').val() || $button.data('product_id');
            if (!productId) {
                console.error('No product ID found');
                return false;
            }

            // Prepare the data object
            var data = {
                action: 'woocommerce_ajax_add_to_cart',
                product_id: productId,
                quantity: $form.find('input.qty').val() || '1',
                security: cryzel_quick_view_params.ajax_nonce || ''
            };

            // Add variation data if this is a variable product
            if ($form.find('.variations').length) {
                var variationId = $form.find('.single_add_to_cart_button').data('variation_id');
                
                if (variationId) {
                    data.variation_id = variationId;
                    
                    // Get all selected variation attributes
                    $form.find('select.variation-select').each(function() {
                        var $select = $(this);
                        var name = $select.attr('name');
                        if (name) {
                            data[name] = $select.val();
                        }
                    });
                } else {
                    // If no valid variation is selected, show error
                    $form.find('.variation-availability')
                        .html('Please select all options')
                        .show();
                    $button.removeClass('loading');
                    return false;
                }
            }

            // Debug: Log the request data
            console.log('Sending AJAX request to:', cryzel_quick_view_params.ajax_url);
            console.log('Request data:', data);
            
            $.ajax({
                type: 'POST',
                url: cryzel_quick_view_params.ajax_url,
                data: data,
                dataType: 'json',
                success: function(response) {
                    console.log('AJAX Response:', response);
                    $button.removeClass('loading');
                    
                    if (!response) {
                        console.error('Empty response from server');
                        return;
                    }

                    // If there's an error, redirect to product page
                    if (response.error) {
                        if (response.product_url) {
                            window.location = response.product_url;
                        } else {
                            // Show error message
                            $('.woocommerce-message, .woocommerce-error, .woocommerce-info').remove();
                            $('body').prepend('<div class="woocommerce-error" role="alert">' + (response.error_message || 'Error adding product to cart.') + '</div>');
                        }
                        return;
                    }

                    // Show success message
                    if (response.message) {
                        $('.woocommerce-message, .woocommerce-error, .woocommerce-info').remove();
                        $('body').prepend('<div class="woocommerce-message" role="alert">' + response.message + '</div>');
                    }
                    
                    // Update cart fragments
                    if (response.data && response.data.fragments) {
                        $.each(response.data.fragments, function(key, value) {
                            $(key).replaceWith(value);
                        });
                        $(document.body).trigger('wc_fragment_refresh');
                        $(document.body).trigger('wc_fragments_refreshed');
                        $(document.body).trigger('added_to_cart', [response.data.fragments, response.data.cart_hash]);
                    }
                    
                    // Show success message and close modal after delay
                    if (response.data && response.data.message) {
                        // Close modal after a short delay
                        setTimeout(function() {
                            $('.quick-view-modal').removeClass('show');
                            $('body').removeClass('modal-open');
                            setTimeout(function() {
                                $('.quick-view-modal').remove();
                            }, 300);
                        }, 1000);
                        $('.woocommerce-message, .woocommerce-error, .woocommerce-info').remove();
                        $('body').prepend('<div class="woocommerce-message" role="alert">' + response.data.message + '</div>');
                    }
                    
                    // Close modal and reload page after a short delay
                    const $modal = $('.quick-view-modal');
                    $modal.removeClass('show');
                    
                    // Remove modal and reload after animation
                    setTimeout(() => {
                        $modal.remove();
                        $('body').css({'overflow': '', 'position': ''});
                        window.location.reload();
                    }, 300);
                },
                error: function(xhr, status, error) {
                    console.error('AJAX Error:', {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: xhr.responseText,
                        error: error
                    });
                    
                    $button.removeClass('loading');
                    
                    // Try to parse error response
                    let errorMessage = 'Error adding product to cart. Please try again.';
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        if (errorResponse.message) {
                            errorMessage = errorResponse.message;
                        }
                    } catch (e) {
                        console.error('Error parsing error response:', e);
                    }
                    
                    // Show error message
                    $('.woocommerce-message, .woocommerce-error, .woocommerce-info').remove();
                    $('body').prepend(
                        '<div class="woocommerce-error" role="alert">' + 
                        errorMessage + 
                        ' <a href="' + (woocommerce_params.cart_url || '#') + '" class="button wc-forward">' + 
                        (woocommerce_params.i18n_view_cart || 'View Cart') + 
                        '</a></div>'
                    );
                }
            });
        });
    }
});