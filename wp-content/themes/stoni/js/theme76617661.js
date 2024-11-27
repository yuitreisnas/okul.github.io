"use strict";

is_visible_init ();
stoni_slick_navigation_init();

jQuery(document).ready(function($) {
	stoni_split_slider();
	stoni_sticky_init();
	stoni_search_init();
	stoni_side_panel_init();
	stoni_mobile_header();
	stoni_woocommerce_helper();
	stoni_woocommerce_filters();
	stoni_woocommerce_tabs();
	stoni_woocommerce_login_in();
	stoni_init_timeline_appear();
	stoni_accordion_init();
	stoni_striped_services_init();
	stoni_progress_bars_init();
	stoni_carousel_slick();
	stoni_image_comparison();
	stoni_counter_init();
	stoni_countdown_init ();
	stoni_circuit_services();
	stoni_circuit_services_resize();
	stoni_img_layers();
	stoni_page_title_parallax();
	stoni_extended_parallax();
	stoni_portfolio_parallax();
	stoni_message_anim_init();
	stoni_scroll_up();
	stoni_link_scroll();
	stoni_skrollr_init();
	stoni_sticky_sidebar ();
	stoni_videobox_init ();
	stoni_parallax_video();
	stoni_tabs_init();
	stoni_select_wrap();
	jQuery( '.wgl_module_title .carousel_arrows' ).stoni_slick_navigation();
	jQuery( '.wgl-products > .carousel_arrows' ).stoni_slick_navigation();
	jQuery( '.stoni_module_custom_image_cats > .carousel_arrows' ).stoni_slick_navigation();
	stoni_scroll_animation();
	stoni_woocommerce_mini_cart();
	stoni_woocommerce_notifications();
	stoni_text_background();
	stoni_dynamic_styles();
});

jQuery(window).load(function() {
	stoni_isotope();
	stoni_blog_masonry_init();
	setTimeout(function(){
		jQuery('#preloader-wrapper').fadeOut();
	},1100);
	particles_custom();
	stoni_menu_lavalamp();

	jQuery(".wgl-currency-stripe_scrolling").each(function(){
    	jQuery(this).simplemarquee({
	        speed: 40,
	        space: 0,
	        handleHover: true,
	        handleResize: true
	    });
    })
});
