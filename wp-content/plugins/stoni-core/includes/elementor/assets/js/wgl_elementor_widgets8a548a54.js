(function( $ ) {
    "use strict";

    jQuery(window).on('elementor/frontend/init', function (){
        if ( window.elementorFrontend.isEditMode() ) {
            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-blog.default',
                function( $scope ){ 
                    stoni_parallax_video();
                    stoni_blog_masonry_init();
                    stoni_carousel_slick(); 
                }
            );            

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-blog-hero.default',
                function( $scope ){ 
                    stoni_parallax_video();
                	stoni_blog_masonry_init();
                	stoni_carousel_slick(); 
                }
            );            

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-carousel.default',
                function( $scope ){ 
                    stoni_carousel_slick();  
                }
            );            

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-portfolio.default',
                function( $scope ){ 
                    stoni_isotope();
                	stoni_carousel_slick();  
                    stoni_scroll_animation();
                }
            );

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-progress-bar.default',
                function( $scope ){ 
                    stoni_progress_bars_init();  
                }
            ); 

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-testimonials.default',
                function( $scope ){ 
                	stoni_carousel_slick();  
                }
            );

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-toggle-accordion.default',
                function( $scope ){ 
                    stoni_accordion_init();  
                }
            ); 

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-tabs.default',
                function( $scope ){ 
                    stoni_tabs_init();  
                }
            ); 

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-clients.default',
                function( $scope ){ 
                	stoni_carousel_slick();  
                }
            );

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-image-layers.default',
                function( $scope ){ 
                	stoni_img_layers();  
                }
            );

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-video-popup.default',
                function( $scope ){ 
                    stoni_videobox_init();  
                }
            );            

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-countdown.default',
                function( $scope ){ 
                	stoni_countdown_init();  
                }
            );

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-time-line-vertical.default',
                function( $scope ){ 
                	stoni_init_timeline_appear();  
                }
            );

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-striped-services.default',
                function( $scope ){ 
                	stoni_striped_services_init();  
                }
            );

            window.elementorFrontend.hooks.addAction( 'frontend/element_ready/wgl-image-comparison.default',
                function( $scope ){ 
                	stoni_image_comparison();  
                }
            );
        }
    });

})( jQuery );

