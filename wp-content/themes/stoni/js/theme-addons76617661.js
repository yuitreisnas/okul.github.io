"use strict";
// Accordion 
function stoni_accordion_init() {
    var item = jQuery('.wgl-accordion');

    item.each(function(){
        var header = jQuery(this).find('.wgl-accordion_header');
        var content = jQuery(this).find('.wgl-accordion_content');
        var acc_type = jQuery(this).data('type');
        var speed = 400;
        header.off("click");

        header.each(function(){
            if (jQuery(this).data('default') == 'yes') {
                jQuery(this).addClass('active');
                jQuery(this).next().slideDown(speed);
            }
        })

        header.on('click', function(e){
            e.preventDefault();
            var $this = jQuery(this);
    
            if (acc_type == 'accordion') {
                $this.toggleClass('active');
                $this.next().slideToggle(speed);
                content.not($this.next()).slideUp(speed);
                header.not($this).removeClass('active');
            } else if (acc_type == 'toggle'){
                $this.toggleClass('active');
                $this.next().slideToggle(speed);
            }
    
        })

    })

}
( function ($){

  jQuery(document).ready(function (){ 
    stoni_ajax_load();
  });
  
  function stoni_ajax_load (){
    var i, section;
    var sections = document.getElementsByClassName( 'wgl_cpt_section' );
    for ( i = 0; i < sections.length; i++ ){
      section = sections[i];
      stoni_ajax_init ( section );
    }
  }

  var wait_load = false;
  var offset_items = 0;
  var infinity_item;

  function stoni_ajax_query(grid,section, request_data){

    if ( wait_load ) return;
    wait_load = true;
    request_data['offset_items'] = offset_items;
    request_data['items_load'] = request_data.items_load;

    $.post( wgl_core.ajaxurl, {
      'action'    : 'wgl_ajax',
      'data'      : request_data

    }, function ( response, status ){
      var resp, new_items, load_more_hidden, count_products;
      resp = document.createElement( "div" );
      resp.innerHTML = response;
      new_items = $( ".item", resp );
      count_products = $( ".woocommerce-result-count", resp );

      load_more_hidden = $( ".hidden_load_more", resp );

      if(load_more_hidden.length){
        jQuery(section).find('.load_more_wrapper').fadeOut(300, function() { $(this).remove(); });
      }else{
        jQuery(section).find('.load_more_wrapper .load_more_item').removeClass('loading');
      }

      jQuery(section).find('.woocommerce-result-count').html(jQuery(count_products).html());

      if($( grid ).hasClass('carousel')){
        $( grid ).find('.slick-track').append( new_items );
        $( grid ).find('.slick-dots').remove();
        $( grid ).find('.wgl-carousel_slick').slick('reinit');            
      }
      else if($( grid ).hasClass('grid')){
        new_items = new_items.hide();
        $( grid ).append( new_items );
        new_items.fadeIn('slow');         
      }else{
        var items = jQuery(new_items);
        jQuery(grid).append(items ).isotope( 'appended', items );      
        jQuery(grid).imagesLoaded().always(function(){
            jQuery(grid).isotope( 'layout' );          
          updateFilter();
        });                       
      }

          //Call vc waypoint settings
          if(typeof jQuery.fn.waypoint === "function"){
            jQuery(grid).find(".wpb_animate_when_almost_visible:not(.wpb_start_animation)").waypoint(function() {
              jQuery(this).addClass("wpb_start_animation animated")
            }, { offset: "100%"}); 
          }

          //Call video background settings
          if(typeof jarallax === 'function'){
            stoni_parallax_video();
          }else{
            jQuery.getScript(wgl_core.JarallaxPluginVideo, function()
            {
             jQuery.getScript(wgl_core.JarallaxPlugin, function(){}).always(function( s, Status ) {
              jQuery(grid).find('.parallax-video').each(function() {
                jQuery( this ).jarallax( {
                  loop: true,
                  speed: 1,
                  videoSrc: jQuery( this ).data( 'video' ),
                  videoStartTime: jQuery( this ).data( 'start' ),
                  videoEndTime: jQuery( this ).data( 'end' ),
                } );    
              });
            });
           });         
          }         

          //Call slick settings
          if (jQuery(grid).find('.wgl-carousel_slick').size() > 0) {
            jQuery.getScript(wgl_core.slickSlider).always(function( s, Status ) {
              jQuery(grid).find('.wgl-carousel_slick').each(function() {
                destroyCarousel(jQuery(this));
                slickCarousel(jQuery(this));
                if(jQuery(grid).hasClass('blog_masonry')){
                  jQuery(grid).isotope( 'layout' );
                }     
              });
            });
          }

          stoni_scroll_animation();   
          //Update Items
          offset_items += parseInt(request_data.items_load);
          
          wait_load = false;

        });
  }

  function stoni_ajax_init ( section ){

    var grid, form, data_field, data, request_data, load_more;

    //if Section CPT return
    if ( section == undefined ) return;
    
    //Get grid CPT
    grid = section.getElementsByClassName( 'container-grid' );  
    if ( !grid.length ) return;
    grid = grid[0];
    
    //Get form CPT
    form = section.getElementsByClassName( 'posts_grid_ajax' );
    if ( !form.length ) return;
    form = form[0];

    //Get field form ajax
    data_field = form.getElementsByClassName( 'ajax_data' );
    if ( !data_field.length ) return;
    data_field = data_field[0];
    
    data = data_field.value;
    data = JSON.parse( data ); 
    request_data =  data;

    //Add pagination
    offset_items += request_data.post_count;

    infinity_item = section.getElementsByClassName( 'infinity_item' );

    if ( infinity_item.length ){
      infinity_item = infinity_item[0];
      if(jQuery( infinity_item ).is_visible()){
        stoni_ajax_query(grid, section, request_data);
      }
      var lastScrollTop = 0;

      jQuery(window).on('resize scroll', function() {
        if(jQuery( infinity_item ).is_visible()){
          var st = jQuery(this).scrollTop();
          if (st > lastScrollTop){
            stoni_ajax_query(grid, section, request_data);
          }
          lastScrollTop = st;
        }
      });
    } 

    load_more = section.getElementsByClassName( 'load_more_item' );
    if ( load_more.length ){
      load_more = load_more[0];
      load_more.addEventListener( 'click', function ( e ){
          e.preventDefault();
          jQuery(this).addClass('loading');
          stoni_ajax_query(grid, section, request_data)
      }, false );
    }     


  }
  
  function slickCarousel(grid) {
    jQuery(grid).slick({
      draggable: true,
      fade: true,
      speed: 900,
      cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
      touchThreshold: 100
    });
  }
  function destroyCarousel(grid) {
    if (jQuery(grid).hasClass('slick-initialized')) {
      jQuery(grid).slick('destroy');
    }      
  }

  function updateFilter(){
    jQuery(".isotope-filter a").each(function(){
      var data_filter = this.getAttribute("data-filter");
      var num = jQuery(this).closest('.wgl_portfolio_list').find('.wgl_portfolio_list-item').filter( data_filter ).length;
      jQuery(this).find('.number_filter').text( num );

      if(jQuery(this).parent().hasClass('shop__filter')){
        var num_product = jQuery(this).closest('.wgl-products-catalog').find('.product').filter( data_filter ).length;
        jQuery(this).find('.number_filter').text( num_product );        
      }
    });
      
  }

}(jQuery));
function stoni_scroll_animation(){
  var portfolio = jQuery('.wgl-portfolio_container');
  var shop = jQuery('.wgl-products.appear-animation');

  //Scroll Animation
  (function($) {

      var docElem = window.document.documentElement;

      function getViewportH() {
        var client = docElem['clientHeight'],
          inner = window['innerHeight'];
        
        if( client < inner )
          return inner;
        else
          return client;
      }

      function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
      }

      // http://stackoverflow.com/a/5598797/989439
      function getOffset( el ) {
        var offsetTop = 0, offsetLeft = 0;
        do {
          if ( !isNaN( el.offsetTop ) ) {
            offsetTop += el.offsetTop;
          }
          if ( !isNaN( el.offsetLeft ) ) {
            offsetLeft += el.offsetLeft;
          }
        } while( el = el.offsetParent )

        return {
          top : offsetTop,
          left : offsetLeft
        }
      }

      function inViewport( el, h ) {
        var elH = el.offsetHeight,
          scrolled = scrollY(),
          viewed = scrolled + getViewportH(),
          elTop = getOffset(el).top,
          elBottom = elTop + elH,
          h = h || 0;

        return (elTop + elH * h) <= viewed && (elBottom - elH * h) >= scrolled;
      }

      function extend( a, b ) {
        for( var key in b ) { 
          if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
          }
        }
        return a;
      }

      function AnimOnScroll( el, options ) {  
        this.el = el;
        this.options = extend( this.defaults, options );
        if(this.el.length){
          this._init();
        }      
      }

      AnimOnScroll.prototype = {
        defaults : {
          viewportFactor : 0
        },
        _init : function() {
          this.items = Array.prototype.slice.call( jQuery(this.el ).children() );
          this.itemsCount = this.items.length;
          this.itemsRenderedCount = 0;
          this.didScroll = false;
          this.delay = 100;
          

          var self = this;

          if(typeof imagesLoaded === 'function'){
            imagesLoaded( this.el, this._imgLoaded(self));
          }else{
            this._imgLoaded(self);
          } 
          
        },
        _imgLoaded : function(self) {
          
          var interval;

              // the items already shown...
              self.items.forEach( function( el, i ) {
                if( inViewport( el ) ) {

                  self._checkTotalRendered();
                  if(!jQuery(el).hasClass('show') && !jQuery(el).hasClass('animate') && inViewport( el, self.options.viewportFactor )){
                    self._item_class(jQuery(el), self.delay, interval );
                    self.delay += 200;
                    setTimeout( function() {
                      self.delay = 100;
                    }, 200 );                    
                  }
                }
              } );

              // animate on scroll the items inside the viewport
              window.addEventListener( 'scroll', function() {
                self._onScrollFn();
              }, false );
              window.addEventListener( 'resize', function() {
                self._resizeHandler();
              }, false );          
        },

        _onScrollFn : function() {
          var self = this;
          if( !this.didScroll ) {
            this.didScroll = true;
            setTimeout( function() { self._scrollPage(); }, 60 );
          }
        },
        _item_class : function(item_array, delay, interval) {

          interval = setTimeout(function(){
            if ( item_array.length) {
              jQuery(item_array).addClass( 'animate' );
            } else {
              clearTimeout( interval );
            }
          }, delay);   
           
        },

        _scrollPage : function() {
          var self = this;
          var interval;

          this.items.forEach( function( el, i ) {
            if( !jQuery(el).hasClass('show') && !jQuery(el).hasClass('animate') && inViewport( el, self.options.viewportFactor ) ) {
              setTimeout( function() {
                var perspY = scrollY() + getViewportH() / 2;

                self._checkTotalRendered();
                self._item_class(jQuery(el), self.delay, interval);
                self.delay += 200;
                setTimeout( function() {
                  self.delay = 100;
                }, 200 );

              }, 25 );
            }
          });
          this.didScroll = false;
        },
        _resizeHandler : function() {
          var self = this;
          function delayed() {
            self._scrollPage();
            self.resizeTimeout = null;
          }
          if ( this.resizeTimeout ) {
            clearTimeout( this.resizeTimeout );
          }
          this.resizeTimeout = setTimeout( delayed, 1000 );
        },
        _checkTotalRendered : function() {
          ++this.itemsRenderedCount;
          if( this.itemsRenderedCount === this.itemsCount ) {
            window.removeEventListener( 'scroll', this._onScrollFn );
          }
        }
      }

      // add to global namespace
      window.AnimOnScroll = AnimOnScroll;

  })(jQuery);

  new AnimOnScroll( portfolio, {} );
  new AnimOnScroll( shop, {} );
    
} 
// Scroll Up button
function stoni_scroll_up() {
	(function($) {
		$.fn.goBack = function (options) {
			var defaults = {
				scrollTop: jQuery(window).height(),
				scrollSpeed: 600,
				fadeInSpeed: 1000,
				fadeOutSpeed: 500
			};
			var options = $.extend(defaults, options);
			var $this = $(this);
			$(window).on('scroll', function () {
				if ($(window).scrollTop() > options.scrollTop) {
					$this.addClass('active');
				} else {
					$this.removeClass('active');
				}
			})
			$this.on('click', function () {
				$('html,body').animate({
					'scrollTop': 0
				}, options.scrollSpeed)
			})
		}
	})(jQuery);

	jQuery('#scroll_up').goBack();
};
function stoni_blog_masonry_init () {
  if (jQuery(".blog_masonry").length) {
    var blog_dom = jQuery(".blog_masonry").get(0);
    var $grid = imagesLoaded( blog_dom, function() {
      // initialize masonry
      jQuery(".blog_masonry").isotope({
            layoutMode: 'masonry',
            masonry: {
                columnWidth: '.item',
            },
        itemSelector: '.item',
        percentPosition: true
      });
      jQuery(window).trigger('resize');
    
    });
  }
}
// wgl Carousel List
function stoni_carousel_slick () {
  var carousel = jQuery('.wgl-carousel_slick');
  if (carousel.length !== 0 ) {
    carousel.each(function(item, value){     
      if (jQuery(this).hasClass('slick-initialized')) {
        jQuery(this).slick('destroy');
      }    
      if(jQuery(this).hasClass('fade_slick')){
        jQuery(this).slick({
          draggable: true,
          fade: true, 
          speed: 900,
          cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
          touchThreshold: 100
        });
      }else{
        jQuery(this).slick({});
      }

    });      
  }  
}

function stoni_circuit_services() {
  if (jQuery('.stoni_module_circuit_services').length) {
    jQuery('.stoni_module_circuit_services').each(function(){
      var $circle = jQuery(this).find('.services_item-icon');

      var agle = 360 / $circle.length;
      var agleCounter = -1;

      $circle.each(function() {
        var $this = jQuery(this);

        jQuery(this).parents('.services_item-wrap:first-child').addClass('active');
        $this.on('hover', function(){
          jQuery(this).parents('.services_item-wrap').addClass('active').siblings().removeClass('active');
        })

        var percentWidth = (100 * parseFloat($this.css('width')) / parseFloat($this.parent().css('width')));
        var curAgle = agleCounter * agle;
        var radAgle = curAgle * Math.PI / 180;
        var x = (50 + ((50 - (percentWidth / 2)) * Math.cos(radAgle))) - (percentWidth / 2);
        var y = (50 + ((50 - (percentWidth / 2)) * Math.sin(radAgle))) - (percentWidth / 2);
            
        $this.css({
          left: x + '%',
          top: y + '%'
        });
        
        agleCounter++;
      });

    });
  }
}
function stoni_circuit_services_resize (){
  if (jQuery('.stoni_module_circuit_services').length) {
    setTimeout(function(){
      jQuery('.stoni_module_circuit_services').each(function(){
        var $this = jQuery(this);
        var wwidth = $this.width();
        if (wwidth < 370){
          $this.removeClass('tablet_resp').addClass('mobile_resp');
        } else if (wwidth < 460) {
          $this.removeClass('mobile_resp').addClass('tablet_resp');
        } else {
          $this.removeClass('tablet_resp mobile_resp');
        }
      });
    }, 1);
  }
}
/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
    var registeredInModuleLoader;
    if (typeof define === 'function' && define.amd) {
        define(factory);
        registeredInModuleLoader = true;
    }
    if (typeof exports === 'object') {
        module.exports = factory();
        registeredInModuleLoader = true;
    }
    if (!registeredInModuleLoader) {
        var OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
            window.Cookies = OldCookies;
            return api;
        };
    }
}(function () {
    function extend () {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
            var attributes = arguments[ i ];
            for (var key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }

    function decode (s) {
        return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
    }

    function init (converter) {
        function api() {}

        function set (key, value, attributes) {
            if (typeof document === 'undefined') {
                return;
            }

            attributes = extend({
                path: '/'
            }, api.defaults, attributes);

            if (typeof attributes.expires === 'number') {
                attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
            }

            // We're using "expires" because "max-age" is not supported by IE
            attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

            try {
                var result = JSON.stringify(value);
                if (/^[\{\[]/.test(result)) {
                    value = result;
                }
            } catch (e) {}

            value = converter.write ?
                converter.write(value, key) :
                encodeURIComponent(String(value))
                    .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

            key = encodeURIComponent(String(key))
                .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
                .replace(/[\(\)]/g, escape);

            var stringifiedAttributes = '';
            for (var attributeName in attributes) {
                if (!attributes[attributeName]) {
                    continue;
                }
                stringifiedAttributes += '; ' + attributeName;
                if (attributes[attributeName] === true) {
                    continue;
                }

                // Considers RFC 6265 section 5.2:
                // ...
                // 3.  If the remaining unparsed-attributes contains a %x3B (";")
                //     character:
                // Consume the characters of the unparsed-attributes up to,
                // not including, the first %x3B (";") character.
                // ...
                stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
            }

            return (document.cookie = key + '=' + value + stringifiedAttributes);
        }

        function get (key, json) {
            if (typeof document === 'undefined') {
                return;
            }

            var jar = {};
            // To prevent the for loop in the first place assign an empty array
            // in case there are no cookies at all.
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            var i = 0;

            for (; i < cookies.length; i++) {
                var parts = cookies[i].split('=');
                var cookie = parts.slice(1).join('=');

                if (!json && cookie.charAt(0) === '"') {
                    cookie = cookie.slice(1, -1);
                }

                try {
                    var name = decode(parts[0]);
                    cookie = (converter.read || converter)(cookie, name) ||
                        decode(cookie);

                    if (json) {
                        try {
                            cookie = JSON.parse(cookie);
                        } catch (e) {}
                    }

                    jar[name] = cookie;

                    if (key === name) {
                        break;
                    }
                } catch (e) {}
            }

            return key ? jar[key] : jar;
        }

        api.set = set;
        api.get = function (key) {
            return get(key, false /* read as raw */);
        };
        api.getJSON = function (key) {
            return get(key, true /* read as json */);
        };
        api.remove = function (key, attributes) {
            set(key, '', extend(attributes, {
                expires: -1
            }));
        };

        api.defaults = {};

        api.withConverter = init;

        return api;
    }

    return init(function () {});
}));
// wgl Countdown function init
function stoni_countdown_init () {
    var countdown = jQuery('.wgl-countdown');
    if (countdown.length !== 0 ) {
        countdown.each(function () {
            var data_atts = jQuery(this).data('atts');
            var time = new Date(+data_atts.year, +data_atts.month-1, +data_atts.day, +data_atts.hours, +data_atts.minutes);
            jQuery(this).countdown({
                until: time,
                padZeroes: true,
                format: data_atts.format ? data_atts.format : 'yowdHMS',
                labels: [data_atts.labels[0],data_atts.labels[1],data_atts.labels[2],data_atts.labels[3],data_atts.labels[4],data_atts.labels[5], data_atts.labels[6], data_atts.labels[7]],
                labels1: [data_atts.labels[0],data_atts.labels[1],data_atts.labels[2], data_atts.labels[3], data_atts.labels[4], data_atts.labels[5], data_atts.labels[6], data_atts.labels[7]]
            });
        });
    }
}
// wgl Counter
function stoni_counter_init() {
	var counters = jQuery('.stoni_module_counter');
	if ( counters.length ) {
		counters.each(function() {
			var counter = jQuery(this).find('.counter_value_wrapper .counter_value');
			counter.appear(function() {
				var max = parseFloat(counter.text());
				counter.countTo({
					from: 0,
					to: max,
					speed: 2000,
					refreshInterval: 100
				});
			});
		});
	}
}


function stoni_dynamic_styles(){
    var style = jQuery('#stoni-footer-inline-css');

    (function($) {

        $.fn.wglAddDynamicStyles = function() {        

            if (this.length === 0) { return this; }
            
            return this.each(function () {
                var $style = '',
                self = jQuery(this);

                var init = function() {
                    $style += self.text();
                    self.remove();
                    appendStyle(); 
                },
                appendStyle = function(){    
                    jQuery('head').append('<style type="text/css">'+$style+'</style>');
                };
                
                /*Init*/
                init();
            });

        };
    })(jQuery);

    style.wglAddDynamicStyles();
    
} 
//https://gist.github.com/chriswrightdesign/7955464
function mobilecheck() {
    var check = false;
    (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

//Add Click event for the mobile device
var click = mobilecheck() ? ('ontouchstart' in document.documentElement ? 'touchstart' : 'click') : 'click';

function initClickEvent(){
    click =  mobilecheck() ? ('ontouchstart' in document.documentElement ? 'touchstart' : 'click') : 'click';
}
jQuery(window).on('resize', initClickEvent);

/*
 ** Plugin for counter shortcode
 */
(function($) {
    "use strict";

    $.fn.countTo = function(options) {
        // merge the default plugin settings with the custom options
        options = $.extend({}, $.fn.countTo.defaults, options || {});

        // how many times to update the value, and how much to increment the value on each update
        var loops = Math.ceil(options.speed / options.refreshInterval),
            increment = (options.to - options.from) / loops;

        return $(this).each(function() {
            var _this = this,
                loopCount = 0,
                value = options.from,
                interval = setInterval(updateTimer, options.refreshInterval);

            function updateTimer() {
                value += increment;
                loopCount++;
                $(_this).html(value.toFixed(options.decimals));

                if (typeof(options.onUpdate) === 'function') {
                    options.onUpdate.call(_this, value);
                }

                if (loopCount >= loops) {
                    clearInterval(interval);
                    value = options.to;

                    if (typeof(options.onComplete) === 'function') {
                        options.onComplete.call(_this, value);
                    }
                }
            }
        });
    };

    $.fn.countTo.defaults = {
        from: 0,  // the number the element should start at
        to: 100,  // the number the element should end at
        speed: 1000,  // how long it should take to count between the target numbers
        refreshInterval: 100,  // how often the element should be updated
        decimals: 0,  // the number of decimal places to show
        onUpdate: null,  // callback method for every time the element is updated,
        onComplete: null  // callback method for when the element finishes updating
    };
})(jQuery);

/*
 ** Plugin for slick Slider
 */
function stoni_slick_navigation_init (){
  jQuery.fn.stoni_slick_navigation = function (){
    jQuery(this).each( function (){
      var el = jQuery(this);
      jQuery(this).find('span.left_slick_arrow').on("click", function() {
        jQuery(this).closest('.wgl_cpt_section').find('.slick-prev').trigger('click');
      });
      jQuery(this).find('span.right_slick_arrow').on("click", function() {
        jQuery(this).closest('.wgl_cpt_section').find('.slick-next').trigger('click');
      });
    });
  }
}

/*
 ** Plugin IF visible element
 */
function is_visible_init (){
  jQuery.fn.is_visible = function (){
    var elementTop = jQuery(this).offset().top;
    var elementBottom = elementTop + jQuery(this).outerHeight();
    var viewportTop = jQuery(window).scrollTop();
    var viewportBottom = viewportTop + jQuery(window).height();
    return elementBottom > viewportTop && elementTop < viewportBottom;
  }
}

/*
 ** Preloader
 */
jQuery(window).load(function(){
    jQuery('#preloader-wrapper').fadeOut();
});
// wgl image comparison
function stoni_image_comparison () {
	var item = jQuery('.wgl-image_comparison.cocoen');
	if (item.length !== 0 ) {
		item.each(function(){
			jQuery(this).cocoen();
		});      
	}  
}

// wgl Image Layers
function stoni_img_layers() {
	jQuery('.wgl-image-layers').each(function() {
		var container = jQuery(this);
		var initImageLayers = function(){
			container.appear(function() {
				container.addClass('img-layer_animate');
            },{done:true})
		}
		initImageLayers();
		// jQuery(window).on('resize', initImageLayers);
		// jQuery(window).on('load', initImageLayers);
	});
}
function stoni_isotope () {
  if (jQuery(".isotope").length) {

    var portfolio_dom = jQuery(".isotope").get(0);
    
    var $grid = imagesLoaded( portfolio_dom, function() {
      // initialize masonry
      var mode = jQuery(".isotope").hasClass('fit_rows') ? 'fitRows' : 'masonry';
      
      jQuery(".isotope").isotope({
            layoutMode: mode,
            percentPosition: true,
            itemSelector: '.wgl-portfolio-list_item, .item',
            masonry: {
                columnWidth: '.wgl-portfolio-list_item-size, .wgl-portfolio-list_item, .item',
            }
      }).isotope( 'layout' );

      jQuery(window).trigger('resize');
    
    });
  
    jQuery(".isotope-filter a").each(function(){
      var data_filter = this.getAttribute("data-filter");
      var num = jQuery(this).closest('.wgl-portfolio').find('.wgl-portfolio-list_item').filter( data_filter ).length;
      jQuery(this).find('.number_filter').text( num );      
      if(jQuery(this).parent().hasClass('shop__filter')){
        var num_product = jQuery(this).closest('.wgl-products-catalog').find('.product').filter( data_filter ).length;
        jQuery(this).find('.number_filter').text( num_product );        
      }

    });  
  
    
    var $filter = jQuery(".isotope-filter a");
    $filter.on("click", function (e){
      e.preventDefault();
      jQuery(this).addClass("active").siblings().removeClass("active");

      var filterValue = jQuery(this).attr('data-filter');  

      jQuery(this).closest('.wgl_cpt_section').find('.isotope').isotope({ filter: filterValue });
    
    });
  }
}

function stoni_menu_lavalamp(){
  var lavalamp = jQuery('.menu_line_enable > ul');
  if (lavalamp.length !== 0) {
    lavalamp.each(function(){
      var $this = jQuery(this);

      $this.lavalamp({
       easing: 'easeOutBack',
       duration: 800
     });
    });

  }
}

(function($, window) {
    var Lavalamp = function(element, options) {
        this.element = $(element).data('lavalamp', this);
        this.options = $.extend({}, this.options, options);

        this.init();
    };

    Lavalamp.prototype = {
        options: {
            current:   '.current-menu-ancestor,.current-menu-item,.current-category-ancestor',
            items:     'li',
            bubble:    '<div class="lavalamp-object"></div>',
            animation: false,
            blur:      $.noop,
            focus:     $.noop
        },
        easing:      'ease',    // Easing transition
        duration:    700,       // Duration of animation
        element: null,
        current: null,
        bubble:  null,
        _focus:  null,
        init: function() {
            var resizeTimer,
                self = this,
                child = self.element.children('li');

            this.onWindowResize = function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    self.reload();
                }, 100);
            };

            $(window).bind('resize.lavalamp', this.onWindowResize);
            
            setTimeout(function(){
                  self.element.addClass("lavalamp_animate")
            }, this.duration);

            $(child).addClass('lavalamp-item');

            this.element
                .on('mouseenter.lavalamp', '.lavalamp-item' , function() {
                    self.current.each(function() {
                      self.options.blur.call(this, self);
                    });

                    self._move($(this));
                })
                .on('mouseleave.lavalamp', function() {
                    if (self.current.index(self._focus) < 0) {
                        self._focus = null;

                        self.current.each(function() {
                            self.options.focus.call(this, self);
                        });

                        self._move(self.current);
                    }
                });

            this.bubble = $.isFunction(this.options.bubble)
                              ? this.options.bubble.call(this, this.element)
                              : $(this.options.bubble).prependTo(this.element);

            self.element.addClass('lavalamp');
            self.element.find('.lavalamp-object').addClass(self.options.easing);


            this.reload();
        },
        reload: function() {
            this.current = this.element.children(this.options.current);

            if (this.current.size() === 0) {
                this.current = this.element.children().not('.lavalamp-object').eq(0);
            }

            this._move(this.current, false);
        },
        destroy: function() {
            if (this.bubble) {
                this.bubble.remove();
            }

            this.element.unbind('.lavalamp');
            $(window).unbind('resize.lavalamp', this.onWindowResize);
        },
        _move: function(el, animate) {
            var pos = el.position();
            pos.left =  Math.round(pos.left) - 6

            var properties = {
                    transform: 'translate('+pos.left+'px,'+pos.top+'px)',
                    width:  52,
                    height:  1,
                    opacity:  1,
                    marginTop:  el.children().children().outerHeight(false) / 2 + 1,
                };

            this._focus = el;
            
            // Check for CSS3 animations
            if(this.bubble.css('opacity') === "0"){
              this.bubble.css({
                WebkitTransitionProperty: "opacity",
                msTransitionProperty: "opacity",
                MozTransitionProperty: "opacity",
                OTransitionProperty: "opacity",
                transitionProperty: "opacity",  
              });
            }else{
              this.bubble.css({
                WebkitTransitionProperty: "all",
                msTransitionProperty: "all",
                MozTransitionProperty: "all",
                OTransitionProperty: "all",
                transitionProperty: "all",                 
              })
            }

            this.bubble.css({
              WebkitTransitionDuration: this.options.duration / 1000 + 's',
              msTransitionDuration: this.options.duration / 1000 + 's',
              MozTransitionDuration: this.options.duration / 1000 + 's',
              OTransitionDuration: this.options.duration / 1000 + 's',
              transitionDuration: this.options.duration / 1000 + 's',
            });
            
            this.bubble.css(properties);
        }
    };

    $.fn.lavalamp = function(options) {
        if (typeof options === 'string') {
            var instance = $(this).data('lavalamp');
            return instance[options].apply(instance, Array.prototype.slice.call(arguments, 1));
        } else {
            return this.each(function() {
                var instance = $(this).data('lavalamp');

                if (instance) {
                    $.extend(instance.options, options || {});
                    instance.reload();
                } else {
                    new Lavalamp(this, options);
                }
            });
        }
    };
})(jQuery, window);
(function( $ ) {

  $(document).on('click', '.sl-button', function() {
    var button = $(this);
    var post_id = button.attr('data-post-id');
    var security = button.attr('data-nonce');
    var iscomment = button.attr('data-iscomment');
    var allbuttons;
    if ( iscomment === '1' ) { /* Comments can have same id */
      allbuttons = $('.sl-comment-button-'+post_id);
    } else {
      allbuttons = $('.sl-button-'+post_id);
    }
    var loader = allbuttons.next('#sl-loader');
    if (post_id !== '') {
      $.ajax({
        type: 'POST',
        url: wgl_core.ajaxurl,
        data : {
          action : 'stoni_like',
          post_id : post_id,
          nonce : security,
          is_comment : iscomment,
        },
        beforeSend:function(){
          loader.html('&nbsp;<div class="loader">Loading...</div>');
        },  
        success: function(response){
          var icon = response.icon;
          var count = response.count;
          allbuttons.html(icon+count);
          if(response.status === 'unliked') {
            var like_text = wgl_core.like;
            allbuttons.prop('title', like_text);
            allbuttons.removeClass('liked');
          } else {
            var unlike_text = wgl_core.unlike;
            allbuttons.prop('title', unlike_text);
            allbuttons.addClass('liked');
          }
          loader.empty();         
        }
      });

    }
    return false;
  });

})( jQuery );
function stoni_link_scroll () {
    jQuery('a.smooth-scroll, .smooth-scroll').on('click', function(event){
    	var href;
    	if(this.tagName == 'A') {
    		href = jQuery.attr(this, 'href');
    	} else {
    		var that = jQuery(this).find('a');
    		href = jQuery(that).attr('href');
    	}
        jQuery('html, body').animate({
            scrollTop: jQuery( href ).offset().top
        }, 500);
        event.preventDefault();
    });
}
//WGL MEGA MENUS GET AJAX POSTS
( function ($){

  jQuery(document).ready(function (){ 
    
    stoni_ajax_mega_menu_init();
  
  });
  
  var megaMenuAjax = false;
  var node_str = '<div class="mega_menu_wrapper_overlay">'; 
  node_str  += '<div class="preloader_type preloader_dot">';
  node_str  += '<div class="mega_menu_wrapper_preloader wgl_preloader dot">';
  node_str  += '<span></span>';
  node_str  += '<span></span>'; 
  node_str  += '<span></span>'; 
  node_str  += '</div>';
  node_str  += '</div>';
  node_str  += '</div>';

  function stoni_ajax_mega_menu_init ( ){

    var grid, mega_menu_item, mega_menu_item_parent;
 
    mega_menu_item = document.querySelectorAll('li.mega-menu ul.mega-menu.sub-menu.mega-cat-sub-categories li');
    mega_menu_item_parent = document.querySelectorAll('li.mega-menu.mega-cat');

    if ( mega_menu_item.length ){

      for (var i = 0; i < mega_menu_item.length; i++) {

        // Define an anonymous function here, to make it possible to use the i variable.
        (function (i) {
          var grid = mega_menu_item[i].closest('.mega-menu-container').getElementsByClassName( 'mega-ajax-content' );
          stoni_ajax_mega_menu_event(mega_menu_item[i], grid);
        }(i));
      }
    }     

    if ( mega_menu_item_parent.length ){

      for (var i = 0; i < mega_menu_item_parent.length; i++) {

        // Define an anonymous function here, to make it possible to use the i variable.
        (function (i) {
          var grid = mega_menu_item_parent[i].getElementsByClassName( 'mega-ajax-content' );
          stoni_ajax_mega_menu_event(mega_menu_item_parent[i], grid);
        }(i));
      }
    }     
  }

  function stoni_ajax_mega_menu_event(item, grid){
    var request_data = {};


    item.addEventListener( 'mouseenter', function ( e ){
      var not_uploaded = true;
      if(!this.classList.contains("mega-menu")){

        if( this.classList.contains("is-active") && this.classList.contains("is-uploaded")){
          return;
        } 

        var item_el = this.closest('ul.mega-menu').querySelectorAll( 'li.menu-item' );    
        for (var i = 0; i < item_el.length; i++){
          item_el[i].classList.remove('is-active');
        }

        this.classList.add("is-active");

        $( grid ).find('.ajax_menu').removeClass('fadeIn-menu').hide();
        
        if( ! $(grid).find('.loader-overlay').length ){
          $(grid).addClass('is-loading').append( node_str );
        }

        $( grid ).find("[data-url='" + this.getAttribute('data-id') + "']").show(400, function(){
          jQuery(this).addClass('fadeIn-menu');
          if($(grid).hasClass('is-loading')){
            $(grid).removeClass('is-loading').find('.mega_menu_wrapper_overlay').remove();
          }
        });           

      }else{
        var item_el = this.querySelectorAll( 'ul.mega-menu li.menu-item' );     
        for (var i = 0; i < item_el.length; i++){
          if(item_el[i].classList.contains('is-active')){
            $( grid ).find("[data-url='" + item_el[i].getAttribute('data-id') + "']").show().addClass('fadeIn-menu');               
            if($( grid ).find("[data-url='" + item_el[i].getAttribute('data-id') + "']").length == 0){
              not_uploaded = true;
            }else{
              not_uploaded = false;
            }
            
          }
        }
      }

      var item_menu = this;

      if(!this.classList.contains("is-uploaded") && not_uploaded){

            // Create request
            request_data.id = parseInt(this.getAttribute('data-id'));
            request_data.posts_count = parseInt(this.getAttribute('data-posts-count'));
            request_data.action = 'wgl_mega_menu_load_ajax';

            e.preventDefault(); 

            if( megaMenuAjax && megaMenuAjax.readyState != 4 ){
              megaMenuAjax.abort();
            }

            megaMenuAjax = $.ajax({
              url : wgl_core.ajaxurl,
              type: 'post',
              data: request_data,
              beforeSend: function(response){
                if( ! $(grid).find('.loader-overlay').length ){
                  $(grid).addClass('is-loading').append( node_str );
                }
              },
              success: function( response, status ){
                item_menu.classList.add('is-uploaded');

                var response_container, new_items, identifier, response_wrapper;
                response_container = document.createElement( "div" );
                response_wrapper = document.createElement( "div" );
                response_wrapper.classList.add("ajax_menu");

                response_container.innerHTML = response;            
                identifier = $( ".items_id", response_container );

                response_wrapper.setAttribute('data-url', $(identifier).data('identifier'));

                new_items = $( response_wrapper ).append($('.item', response_container ));

                $('.ajax_menu').removeClass('fadeIn-menu').hide();
                new_items = new_items.hide();
                $( grid ).append( new_items );
                new_items.show().addClass('fadeIn-menu');
                if(typeof jarallax === 'function'){
                  stoni_parallax_video();
                }else{
                  jQuery.getScript(wgl_core.JarallaxPluginVideo, function()
                  {
                   jQuery.getScript(wgl_core.JarallaxPlugin, function()
                   {
                   }).always(function( s, Status ) {
                    jQuery(grid).find('.parallax-video').each(function() {
                      jQuery( this ).jarallax( {
                        loop: true,
                        speed: 1,
                        videoSrc: jQuery( this ).data( 'video' ),
                        videoStartTime: jQuery( this ).data( 'start' ),
                        videoEndTime: jQuery( this ).data( 'end' ),
                      } );    
                    });
                  });
                 });         
                }            
              },
              error: function( response ){
                item_menu.classList.remove('is-uploaded');
              },
              complete: function( response ){
                $(grid).removeClass('is-loading').find('.mega_menu_wrapper_overlay').remove();
              },
            });
          }


        }, false );       
}

}(jQuery));
function stoni_message_anim_init() {
    jQuery('body').on('click', '.message_close_button', function () {
        jQuery(this).closest('.stoni_module_message_box.closable').slideUp(350);
    });
}


function stoni_mobile_header(){
	var menu = jQuery('.wgl-mobile-header .mobile_nav_wrapper .primary-nav > ul');

	//Create plugin Mobile Menu
	(function($) {

		$.fn.wglMobileMenu = function(options) {		
			var defaults = {  
				"toggleID"   	: ".mobile-hamburger-toggle",
				"switcher"      : ".button_switcher",
				"back"      	: ".back",
				"overlay"       : ".wgl-menu_overlay",
				"anchor"		: ".menu-item > a[href*=#]"
	    	};
		    
		    if (this.length === 0) { return this; }
		    
		    return this.each(function () {
		    	var wglMenu = {}, ds = $(this);
			    var sub_menu = jQuery('.mobile_nav_wrapper .primary-nav > ul ul');
			    var m_width = jQuery('.mobile_nav_wrapper').data( "mobileWidth" );
			    var m_toggle = jQuery('.mobile-hamburger-toggle');
			    var body = jQuery('body');

			    //Helper Menu
				var open = "is-active",
			    openSubMenu = "show_sub_menu",
			    mobile_on = "mobile_switch_on",
			    mobile_switcher = "button_switcher";
			    
			    var init = function() {
			    	wglMenu.settings = $.extend({}, defaults, options);
			    	createButton();
			    	showMenu();
			    	addPerfectScroll();
			    },
			    showMenu = function(){			    	
			    	if (jQuery(window).width() <= m_width) {
			    		if (!m_toggle.hasClass( open )) {
			    			create_nav_mobile_menu();
			    		}
					}else{
						reset_nav_mobile_menu();
					}
			    },
			    create_nav_mobile_menu = function() {
			    	sub_menu.removeClass(openSubMenu);
					ds.hide().addClass(mobile_on);
					body.removeClass(mobile_on);
			    },
			    reset_nav_mobile_menu = function() {
					sub_menu.removeClass(openSubMenu);
					body.removeClass(mobile_on);
					ds.show().removeClass(mobile_on);
					m_toggle.removeClass(open);
					jQuery('.' + mobile_switcher) .removeClass('is-active');
			    },
			    createButton = function() {
		  			ds.find('.menu-item-has-children').each(function() {
		  				jQuery(this).find('> a').append('<span class="'+ mobile_switcher +'"></span>');
		  			});
		        },			    
		        addPerfectScroll = function() {
		  			new PerfectScrollbar('#wgl-perfect-container', {
                    	wheelSpeed: 6,
                    	suppressScrollX: true
                	});
		        },
			    toggleMobileMenu = function(e) {
			    	jQuery(m_toggle).toggleClass(open);
			    	ds.toggleClass(openSubMenu).slideToggle();
			    	body.toggleClass(mobile_on);
			    },
			    showSubMenu = function(e) {
			    	e.preventDefault();	    	
			    	var item = jQuery(this).parents('li');
			    	
			    	if(!jQuery(this).hasClass(open)){	    		
			    		jQuery('.mobile_nav_wrapper .menu-item-has-children').not(item).find('.sub-menu').stop(true).slideUp(450).removeClass(openSubMenu);
			    		jQuery('.mobile_nav_wrapper .menu-item-has-children').not(item).find('.button_switcher').removeClass(open);
			    		jQuery('.mobile_nav_wrapper .menu-item-has-children').not(item).find('a[href*=#]').removeClass(open);			    		

			    		jQuery(this).parent().prev('.sub-menu').stop(true).slideDown(450).addClass(openSubMenu);
			    		jQuery(this).parent().next('.sub-menu').stop(true).slideDown(450).addClass(openSubMenu);
			    	}else{
			    		jQuery(this).parent().prev('.sub-menu').stop(true).slideUp(450).removeClass(openSubMenu);
			    		jQuery(this).parent().next('.sub-menu').stop(true).slideUp(450).removeClass(openSubMenu);
			   		 }
			    	
			    	jQuery(this).toggleClass(open);
				},
				hideSubMenu = function(e) {
			    	if(!jQuery('.button_switcher').is(e.target)){
				    	jQuery('.mobile_nav_wrapper .menu-item-has-children').find('.sub-menu').stop(true).slideUp(450).removeClass(openSubMenu);
				    	jQuery('.mobile_nav_wrapper .menu-item-has-children').find('.button_switcher').removeClass(open);	

						if( jQuery(e.target).closest(".wgl-mobile-header").length ) {
							toggleMobileMenu();
						}
			    	}
			    },
			    eventClose = function(e) {
                    var container = $("#wgl-perfect-container");

                    if (!container.is(e.target) && container.has(e.target).length === 0) {
                    	if ($('body').hasClass(mobile_on)) {
							toggleMobileMenu();
                    	}
                        
                    }  
                },
			    goBack = function(e) {
			    	e.preventDefault();
			    	jQuery(this).closest( '.sub-menu' ).removeClass(openSubMenu);
			    	jQuery(this).closest( '.sub-menu' ).prev( 'a' ).removeClass(open);
			    	jQuery(this).closest( '.sub-menu' ).prev( 'a' ).find('.' + mobile_switcher).removeClass(open);
			    };
			    
			    /*Init*/
			    init();
			    
			    jQuery(wglMenu.settings.toggleID).on(click, toggleMobileMenu);
			    jQuery(wglMenu.settings.overlay).on(click, eventClose);
			    
			    //switcher menu
			    jQuery(wglMenu.settings.switcher).on(click, showSubMenu);
			    jQuery(wglMenu.settings.anchor).on(click, hideSubMenu);

			    //Go back menu
			    jQuery(wglMenu.settings.back).on(click, goBack);

		    	jQuery( window ).resize(
		    		function() {
		    			showMenu();
		    		}
		    	);
		    });

		};
	})(jQuery);

	menu.wglMobileMenu();
    
} 
// wgl Page Title Parallax
function stoni_page_title_parallax() {
    var page_title = jQuery('.page-header.page_title_parallax')
    if (page_title.length !== 0 ) {
        page_title.paroller();
    }
}

// wgl Extended Parallax
function stoni_extended_parallax() {
    var item = jQuery('.extended-parallax')
    if (item.length !== 0 ) {
        item.each( function() {
            jQuery(this).paroller();
        })
    }
}
// wgl Portfolio Single Parallax
function stoni_portfolio_parallax() {
    var portfolio = jQuery('.wgl-portfolio-item_bg.portfolio_parallax')
    if (portfolio.length !== 0 ) {
        portfolio.paroller();
    }
}

function stoni_parallax_video () {
	jQuery( '.parallax-video' ).each( function() {
		jQuery( this ).jarallax( {
			loop: true,
			speed: 1,
			videoSrc: jQuery( this ).data( 'video' ),
			videoStartTime: jQuery( this ).data( 'start' ),
			videoEndTime: jQuery( this ).data( 'end' ),
		} );
	} );
}
function particles_custom () {
    jQuery('.particles-js').each(function () {
        var id = jQuery(this).attr('id');
        var type = jQuery(this).data('particles-type');
        var color_type = jQuery(this).data('particles-colors-type');
        var color = jQuery(this).data('particles-color');
        var color_line = jQuery(this).data('particles-color');
        var number = jQuery(this).data('particles-number');
        var lines = jQuery(this).data('particles-line');
        var size = jQuery(this).data('particles-size');
        var speed = jQuery(this).data('particles-speed');
        var hover = jQuery(this).data('particles-hover');
        var hover_mode = jQuery(this).data('particles-hover-mode');
        switch (type) {
            case 'particles':
                type = 'circle';
                break;
            case 'hexagons':
                type = 'polygon';
                break;
            default:
                type = 'circle';
                break;
        }
        if (color_type == 'random_colors') {
            color = color.split(',');
            color_line = color[0]
        }
        
        particlesJS(
            id, {
                "particles":{
                    "number":{
                        "value":number,
                        "density":{
                            "enable":true,
                            "value_area":800
                        }
                    },
                    "color":{
                        "value": color
                    },
                    "shape":{
                        "type":type,
                        "polygon":{
                            "nb_sides":6
                        },
                    },
                    "opacity":{
                        "value":1,
                        "random":true,
                        "anim":{
                            "enable":false,
                            "speed":1,
                            "opacity_min":0.1,
                            "sync":false
                        }
                    },
                    "size":{
                        "value":size,
                        "random":true,
                        "anim":{
                            "enable":false,
                            "speed":30,
                            "size_min": 1,
                            "sync":false
                        }
                    },
                    "line_linked":{
                        "enable":lines,
                        "distance":150,
                        "color":color_line,
                        "opacity":0.4,
                        "width":1
                    },
                    "move":{
                        "enable":true,
                        "speed":speed,
                        "direction":"none",
                        "random":false,
                        "straight":false,
                        "out_mode":"out",
                        "bounce":false,
                        "attract":{
                            "enable":false,
                            "rotateX":600,
                            "rotateY":1200
                        }
                    }
                },
                "interactivity":{
                    "detect_on":"canvas",
                    "events":{
                        "onhover":{
                            "enable":hover,
                            "mode":hover_mode
                        },
                        "onclick":{
                            "enable":true,
                            "mode":"push"
                        },
                        "resize":true
                    },
                    "modes":{
                        "grab":{
                            "distance":150,
                            "line_linked":{
                                "opacity":1
                            }
                        },
                        "bubble":{
                            "distance":200,
                            "size":size*1.6,
                            "duration":20,
                            "opacity":1,
                            "speed":30
                        },
                        "repulse":{
                            "distance":80,
                            "duration":0.4
                        },
                        "push":{"particles_nb":4},
                        "remove":{"particles_nb":2}
                    }
                },
                "retina_detect":true
            });
        var update;
        update = function() {
            requestAnimationFrame(update); 
        }; 
        requestAnimationFrame(update);
    })
}
//http://brutaldesign.github.io/swipebox/
function stoni_videobox_init () {
	if (jQuery(".videobox, .swipebox, .gallery a[href$='.jpg'], .gallery a[href$='.jpeg'], .gallery a[href$='.JPEG'], .gallery a[href$='.gif'], .gallery a[href$='.png']").length !== 0 ) {
		jQuery(".videobox, .swipebox, .gallery a[href$='.jpg'], .gallery a[href$='.jpeg'], .gallery a[href$='.JPEG'], .gallery a[href$='.gif'], .gallery a[href$='.png']").swipebox({autoplayVideos: true});
	}
}
// wgl Progress Bars
function stoni_progress_bars_init(e) {

    var item = jQuery('.progress_wrap');
    var slidable_label = false; 

    if (item.length) {
        item.each(function() {
            var item = jQuery(this),
                item_label = item.find('.progress_label_wrap'),
                bar = item.find('.progress_bar'),
                data_width = bar.data('width'),
                counter = item.find('.progress_value'),
                duration = parseFloat(bar.css('transition-duration'))*1000,
                interval = Math.floor(duration/data_width),
                temp = 0;
            if(!e){
                item.appear(function() {
					bar.css('width',data_width+'%');
                    if ( slidable_label ) {
                        item_label.css('width', data_width+'%');
                    }
                    var recap = setInterval( function() {
                        counter.text(temp);
                        temp++;
                    }, interval);
                    var stopCounter = setTimeout(function() {
                        clearInterval(recap);
                        counter.text(data_width);
                    }, duration);
                });                
            } else {
                bar.css('width',data_width+'%');
                if ( slidable_label ) {
                    item_label.css('width', data_width+'%');
                }
                var recap = setInterval( function() {
                    counter.text(temp);
                    temp++;
                }, interval);
                var stopCounter = setTimeout(function() {
                clearInterval(recap);
                counter.text(data_width);
                }, duration);               
            }
        });
    }
}
function stoni_search_init(){

    //Create plugin Search
    (function($) {

        $.fn.wglSearch = function(options) {        
            var defaults = {
                "toggleID"      : ".header_search-button",
                "closeID"      : ".header_search-close",
                "searchField"   : ".header_search-field",
                "body"          : "body > *:not(header)",
            };
            
            if (this.length === 0) { return this; }
            
            return this.each(function () {
                var wglSearch = {}, s = $(this);
                var openClass = 'header_search-open',
                searchClass = '.header_search';

                var init = function() {
                    wglSearch.settings = $.extend({}, defaults, options);
                },
                open = function () {
                    $(s).addClass(openClass);
                    setTimeout(function(){
                        $(s).find('input.search-field').focus();
                    }, 100);
                    return false;
                },                
                close = function () {
                    jQuery(s).removeClass(openClass);
                },
                toggleSearch = function(e) {
                    if (!$(s).closest(searchClass).hasClass(openClass)) {
                        open();
                    }else{
                        close();
                    }
                },
                eventClose = function(e) {
                    var element = jQuery(searchClass);
                    if(!$(e.target).closest('.search-form').length){
                        if ($(element).hasClass(openClass)) {
                            close();
                        }                        
                    }
                };

                /*Init*/
                init();

                if(jQuery(this).hasClass('search_standard')){
                    jQuery(this).find(wglSearch.settings.toggleID).on(click, toggleSearch);
                }else{
                    jQuery(wglSearch.settings.toggleID).on(click, toggleSearch);
                    jQuery(wglSearch.settings.searchField).on(click, eventClose);
                }
            
                jQuery(wglSearch.settings.body).on(click, eventClose);
                
            });

        };

    })(jQuery);

    jQuery('.header_search').wglSearch();

}
// Select Wrapper
function stoni_select_wrap() {
	jQuery( '.widget select, select.wpcf7-select, .woocommerce .woocommerce-ordering select' ).each( function() {
		jQuery( this ).wrap( "<div class='select__field'></div>" );
	} );
}
function stoni_side_panel_init(){

    //Create plugin Side Panel
    (function($) {

        $.fn.wglSidePanel = function(options) {        
            var defaults = {
                "toggleID"      : ".side_panel-toggle",
                "closeID"      : ".side-panel_close",
                "closeOverlay"  : ".side-panel_overlay",
                "body"          : "body > *:not(header)",
                "sidePanel"    : "#side-panel .side-panel_sidebar"
            };
            
            if (this.length === 0) { return this; }
            
            return this.each(function () {
                var wglSidePanel = {}, s = $(this);
                var openClass = 'side-panel_open',
                wglScroll,
                sidePanelClass = '.side_panel';

                var init = function() {
                    wglSidePanel.settings = $.extend({}, defaults, options);
                },
                open = function () {
                    if(!$('#side-panel').hasClass('side-panel_active')){
                        $('#side-panel').addClass('side-panel_active');
                    }

                    $('#side-panel').addClass(openClass);
                    $(s).addClass(openClass);
                    $('body').addClass('side-panel_active');
                    
                    var wglClassAnimated = $('#side-panel').find('section.elementor-element').data('settings');
                    if(wglClassAnimated && wglClassAnimated.animation){
                        $('#side-panel').find('section.elementor-element').removeClass('elementor-invisible').addClass('animated').addClass(wglClassAnimated.animation);
                    }
                },                
                close = function () {
                    $(s).removeClass(openClass);
                    $('#side-panel').removeClass(openClass);
                    $('body').removeClass('side-panel_active');
                    var wglClassAnimated = $('#side-panel').find('section.elementor-element').data('settings');
                    if(wglClassAnimated && wglClassAnimated.animation){
                        $('#side-panel').find('section.elementor-element').removeClass(wglClassAnimated.animation);
                    }
                },

                togglePanel = function(e) {
                    e.preventDefault();
                    wglScroll = $(window).scrollTop();

                    if (!$(s).closest(sidePanelClass).hasClass(openClass)) {
                        open();                    
                        jQuery(window).scroll(function(){
                            if(450 < Math.abs(jQuery(this).scrollTop() - wglScroll)){
                                close();
                            }
                        });
                    }else{
                        
                    }
                },
                closePanel = function(e){
                    e.preventDefault();
                    if ($(s).closest(sidePanelClass).hasClass(openClass)) {
                        close();
                    }
                },
                eventClose = function(e) {
                    var element = $(sidePanelClass),
                    container = $("#side-panel");

                    if (!container.is(e.target) && container.has(e.target).length === 0) 
                    {
                        if ($(element).hasClass(openClass)) {
                            close();
                        }   
                    }  
                };

                /*Init*/
                init();

                jQuery(wglSidePanel.settings.toggleID).on(click, togglePanel);            
                jQuery(wglSidePanel.settings.body).on(click, eventClose);
                jQuery(wglSidePanel.settings.closeID).on(click, closePanel);
                jQuery(wglSidePanel.settings.closeOverlay).on(click, closePanel);

                new PerfectScrollbar('#side-panel', {
                    wheelSpeed: 6,
                    suppressScrollX: true
                });
            });

        };

    })(jQuery);

    jQuery('.side_panel').wglSidePanel();

}
function stoni_skrollr_init(){
    var blog_scroll = jQuery('.blog_skrollr_init');
    if (blog_scroll.length) {
   		if(!(/Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i).test(navigator.userAgent || navigator.vendor || window.opera)){ 
	      // wgl Skrollr
	      skrollr.init({
	        smoothScrolling: false,
	        forceHeight: false
	      });  
  		}
    }
}

function stoni_split_slider() {

    var split_slider = jQuery('.stoni_module_split_slider');
    if ( split_slider.length ) {

        split_slider.each(function() {
            jQuery(this).height(jQuery(window).height()).addClass('slider_initialized');

            jQuery(this).multiscroll({
                easing: 'easeInOutQuart',
                navigation: true,
                sectionSelector: '.stoni_split_slider-section',
                leftSelector: '.stoni_split_slider-left',
                rightSelector: '.stoni_split_slider-right',
                afterRender: function () {
                    var cloneLeft = jQuery(this).closest('.stoni_split_slider-left > .stoni_split_slider-section');
                    var cloneRight = jQuery(this).closest('.stoni_split_slider-right  > .stoni_split_slider-section');
                    cloneRight = Array.prototype.reverse.apply(cloneRight);

                    var responsive = jQuery(this).closest('.stoni_module_split_slider-wrapper').find('.stoni_module_split_slider-responsive'); 
                    for(var i = 0; i < cloneLeft.length; i++){
                        jQuery(responsive).append(jQuery(cloneLeft[i]).clone(true));
                        jQuery(responsive).append(jQuery(cloneRight[i]).clone(true));
                    }
                    jQuery('body').addClass('ms-initialized');
                    stoni_progress_bars_init(true);
                }
            });
        });
 
        if (jQuery(window).width() <= 1024) {
            jQuery.fn.multiscroll.destroy();
        } else {
            jQuery.fn.multiscroll.build();
        }

        jQuery(window).resize(function () {
            if (jQuery(window).width() <= 1024) {
                jQuery.fn.multiscroll.destroy();
            } else {
                jQuery.fn.multiscroll.build();
            }

        });
    }
}

function stoni_sticky_init(){

	var section = '.wgl-sticky-header';
	var top = jQuery(section).height();
	var data = jQuery(section).data('style');

	//For Follow In up
	var previousScroll = 0;

	function init(element){        
		if(!element){
			return;
		}

		var y = jQuery(window).scrollTop();
		if(data == 'standard'){
	        if ( y >= top ) {   
	            jQuery(section).addClass( 'sticky_active' );
	        } else {
	            jQuery(section).removeClass('sticky_active');
	        }   			
		}else{
	        if(y > top) {
	            if (y > previousScroll) {
	                jQuery(section).removeClass('sticky_active');
	            } else {
	                jQuery(section).addClass( 'sticky_active' );
	            }
	        } else {
	             jQuery(section).removeClass('sticky_active');
	        }
	        previousScroll = y;
		}
    };   

    if ( jQuery( '.wgl-sticky-header' ).length !== 0 ) {
    	jQuery( window ).scroll(
    		function() {
    			init(jQuery(this));
    		}
    	);

    	jQuery( window ).resize(
    		function() {
    			init(jQuery(this));
    		}
    	);
    }
} 
function stoni_sticky_sidebar() {
  if (jQuery('.sticky-sidebar').length) {
    jQuery('body').addClass('sticky-sidebar_init');
    jQuery('.sticky-sidebar').each(function(){
      jQuery(this).theiaStickySidebar({
        additionalMarginTop: 30,
        additionalMarginBottom: 30
      });
    });
  }

  if (jQuery('.sticky_layout .info-wrapper').length) {
    jQuery('.sticky_layout .info-wrapper').each(function(){
      jQuery(this).theiaStickySidebar({
        additionalMarginTop: 150,
        additionalMarginBottom: 150
      });
    });
  }
} 
// Accordion 
function stoni_striped_services_init() {
    var item_wrap = jQuery('.wgl-striped-services');

    item_wrap.each(function(){
        var item = jQuery(this).find('.service-item');

        item.on('mouseenter', function(e){
            item_wrap.addClass('onhover');
            jQuery(this).addClass('active');
        })
        item.on('mouseleave', function(e){
            item_wrap.removeClass('onhover');
            jQuery(this).removeClass('active');
        })
    })

}
// Tabs
function stoni_tabs_init() {
	if (jQuery('.wgl-tabs').length) {
		jQuery('.wgl-tabs').each(function(){
			var $this = jQuery(this);
		
			var tab = $this.find('.wgl-tabs_headings .wgl-tabs_header');
			var	data = $this.find('.wgl-tabs_content-wrap .wgl-tabs_content');
			
			tab.filter(':first').addClass('active');

			data.filter(':not(:first)').hide();
			tab.each(function(){
				var currentTab = jQuery(this);

				currentTab.on('click tap', function(){
					var id = currentTab.data('tab-id');
				
					currentTab.addClass('active').siblings().removeClass('active');
					jQuery('.wgl-tabs .wgl-tabs_content[data-tab-id='+id+']').slideDown().siblings().slideUp();			
				});
			});
		})
	}
}
		
function stoni_text_background() {

    var anim_text = jQuery('.wgl-animation-background-text');
    if ( anim_text.length ) {


		anim_text.each(function(index){
			var paralax_text = jQuery('<div class="wgl-background-text"/>');

			jQuery(this).find(">div:eq(0)").before(paralax_text);
			var text = window.getComputedStyle(this,':before').content;
			var matches = text.match(/[^"]+/g);
			text = matches[0];

			paralax_text.addClass('element-'+ index);
			paralax_text.attr('data-info', index);
		  	
		  	jQuery(this).find(paralax_text).html(text.replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));

		  	var self = jQuery(this);

		  	anim_text.appear(function() {

		  		if(typeof anime === 'function'){

		  			var item_anime = jQuery(this).find('.wgl-background-text').data('info');

		  			if(item_anime === index){
			  			anime.timeline({loop: false})
			  			.add({
			  				targets: '.element-'+ index + ' .letter',
			  				translateY: [100,0],
			  				translateZ: 0,
			  				opacity: [0,1],
			  				easing: "easeOutExpo", 
			  				duration: 1400,
			  				delay: function(el, i) {
			  					return 0 + 350 * i;
			  				}
			  			});			  				
		  			}


		  		}
		  	}); 		  		
		  	

		});
    }
}
// WGL Time Line Vertical appear
function stoni_init_timeline_appear() {

    var item = jQuery('.wgl-timeline-vertical.appear_anim .time_line-item');

    if (item.length) {
        item.each(function() {
            var item = jQuery(this);
            item.appear(function() {
                item.addClass('item_show');
            });
        });
    }
}
function stoni_woocommerce_helper(){
    jQuery('body').on('click', '.quantity.number-input span.minus', function(e){    
        this.parentNode.querySelector('input[type=number]').stepDown();
        if(document.querySelector('.woocommerce-cart-form [name=update_cart]')){
            document.querySelector('.woocommerce-cart-form [name=update_cart]').disabled = false;
        }
    }); 
    
    jQuery('body').on('click', '.quantity.number-input span.plus', function(e){    
        this.parentNode.querySelector('input[type=number]').stepUp();
        if(document.querySelector('.woocommerce-cart-form [name=update_cart]')){
            document.querySelector('.woocommerce-cart-form [name=update_cart]').disabled = false;
        }
    }); 

    jQuery('ul.wgl-products li a.add_to_cart_button.ajax_add_to_cart').on( "click", function() {
        jQuery(this).closest('li').addClass('added_to_cart_item');
    });

    function slickCarousel(grid, catalog) {
        if(catalog){
            jQuery(grid).slick({
                draggable: true,
                fade: true,
                speed: 900,
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
                touchThreshold: 100
            });
        }else{
            jQuery(grid).slick({});
        }                   
    }

    function destroyCarousel(grid) {

        if (jQuery(grid).hasClass('slick-initialized')) {
            jQuery(grid).slick('destroy');
        }      
    }

    jQuery('body').on('click', '.yith-wcqv-button', function(e){               
        jQuery(document).ajaxComplete(function(){
             if(jQuery.fn.tawcvs_variation_swatches_form){
                //variations_form_init ();
            }         
            if (!jQuery.fn.slick) {
                jQuery.getScript(wgl_core.slickSlider).always(function( s, Status ) {
                    jQuery('#yith-quick-view-content .wgl-carousel_slick').each(function() {
                        destroyCarousel(jQuery(this));
                        slickCarousel(jQuery(this)); 
                    });
                });
            }else{
                jQuery('#yith-quick-view-content .wgl-carousel_slick').each(function() {
                    destroyCarousel(jQuery(this));
                    slickCarousel(jQuery(this)); 
                });              
            }

            new PerfectScrollbar('.summary.entry-summary .summary-content', {
                wheelSpeed: 1,
                suppressScrollX: true
            });
        });
    }); 

    jQuery( document ).ajaxComplete(function() {     
      
        stoni_woocommerce_tools();
        stoni_scroll_animation();

        jQuery('.wgl-products li .wgl-carousel_slick').each(function() {
            destroyCarousel(jQuery(this));
            slickCarousel(jQuery(this), true); 
        });        

    }); 
 
    function variations_form_init(){
        jQuery( '.variations_form' ).each(function(){
            jQuery(this).tawcvs_variation_swatches_form();
        })
        jQuery( document.body ).trigger( 'tawcvs_initialized' );        
    }
    
    jQuery(document).on('qv_loader_stop', function(){
        if( typeof jQuery.fn.tawcvs_variation_swatches_form ) {
            variations_form_init();
        }
    });

    var qv_modal    = jQuery(document).find( '#yith-quick-view-modal' ),
    qv_close    = qv_modal.find( '#yith-quick-view-close' ),
    qv_overlay  = qv_modal.find( '.yith-quick-view-overlay');
    // Close box by click close button
    qv_close.on( 'click', function(e) {
        variations_form_init();
    });

    // Close box by click overlay
    qv_overlay.on( 'click', function(e){
        console.log("reinit");
        variations_form_init();
    });
    
    // Close box with esc key
    jQuery(document).keyup(function(e){
        if( e.keyCode === 27 )
            variations_form_init();
    });



}


function stoni_woocommerce_filters(){
    (function($) {

        $.fn.wglWooFilters = function(options) {        
            var defaults = {
                "toggleID"      : ".filters-button",
            };
            
            if (this.length === 0) { return this; }
            
            return this.each(function () {
                var wglWooFilters = {}, s = $(this);

                var open = "active";

                var init = function() {
                    wglWooFilters.settings = $.extend({}, defaults, options);
                },
                toggleItemClass = function(e) {
                    if(!e.hasClass('active')){    
                        e.addClass('active');     
                        jQuery('.wgl-woocommerce-filter_wrapper').stop().slideDown( 450 );             
                    }else{
                        e.removeClass('active');
                        jQuery('.wgl-woocommerce-filter_wrapper').stop().slideUp( 450 ); 
                    }
                },
                eventItem = function() {
                    toggleItemClass(jQuery(this));
                };

                /*Init*/
                init();
            
                jQuery(wglWooFilters.settings.toggleID).on(click, eventItem);
                
            });

        };

    })(jQuery);

    jQuery('.wgl-woocommerce-filter').wglWooFilters();

} 
function stoni_woocommerce_login_in() {

	if (jQuery('header .login-in').length) {
		var mc = jQuery('header .login-in'),
			icon = mc.find('a.login-in_link'),
			overlay = mc.find('div.overlay');

		icon.on('click tap', function(e) { 
			e.preventDefault();
			mc.toggleClass('open_login'); 
		});

		overlay.on('click tap', function(e) { 
			if(!jQuery(e.target).closest('.modal_content').length && !jQuery(e.target).is('.modal_content')){
			 	mc.removeClass('open_login'); 
			}
		});

	};
};


function stoni_woocommerce_mini_cart() {

	if (jQuery('header .mini-cart').length) {
		jQuery('header .mini-cart').prepend('<div class="mini_cart-overlay"></div>');

		var mc = jQuery('header .mini-cart'),
			icon = mc.find('a.woo_icon'),
			overlay = mc.find('div.mini_cart-overlay');

		icon.on('click tap', function() { mc.toggleClass('open_cart'); });
		overlay.on('click tap', function() { mc.removeClass('open_cart'); });
		jQuery('body').on('click', 'header a.close_mini_cart', function(){
			mc.removeClass('open_cart');
		});
	};
};



function stoni_woocommerce_notifications() {
    if (!jQuery.fn.notify) {
        return
    }
    jQuery.notify.addStyle("wgl_notify", {
        html: '<div><div class="message_icon_wrap"><span class="message_icon"></span></div><span data-notify-text/></div>'
    });

    jQuery(document.body).on("added_to_cart", function() {
        jQuery.notify(wgl_woocommerce.added_to_cart_notify, {
            autoHideDelay: 4000,
            className: "success",
            style: "wgl_notify",
            showAnimation: "fadeIn",
            hideAnimation: "fadeOut"
        })
    });

    jQuery(document.body).on("added_to_wishlist", function() {
        jQuery.notify(wgl_woocommerce.wishlist_notify, {
            autoHideDelay: 4000,
            className: "success",
            style: "wgl_notify",
            showAnimation: "fadeIn",
            hideAnimation: "fadeOut"
        })
    })

}

function stoni_woocommerce_tabs(){
    (function($) {

        $.fn.wglWooTabs = function(options) {        
            var defaults = {
                "toggleID"      : ".wgl-tab-woo",
            };
            
            if (this.length === 0) { return this; }
            
            return this.each(function () {
                var wglWooTabs = {}, s = $(this);

                var open = "active";
                var tab = s.find('.wgl-tab-woo');
                var data =s.find('.tabs-panel');
                
                var init = function() {
                    wglWooTabs.settings = $.extend({}, defaults, options);
                },
                toggleItemClass = function(element) {             
                    element.addClass('active').siblings().removeClass('active');
                    var active_item = element.index();
                    jQuery(data).eq(active_item).addClass('active_panel')
                            .siblings().removeClass('active_panel'); 
                },
                eventItem = function(e) {
                    e.preventDefault();
                    toggleItemClass(jQuery(this));
                };

                /*Init*/
                init();
            
                jQuery(wglWooTabs.settings.toggleID).on('click tap', eventItem);
                
            });

        };

    })(jQuery);

    jQuery('.wgl-woocommerce-tabs').wglWooTabs();

} 