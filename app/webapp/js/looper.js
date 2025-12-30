// DATA LOOPER 2.O - Revised 12/04/14

// ADD DOCUMENT TITLE IF NOT PRESENT
	  $(function() {
        var looperTitle = $('img').first().attr('alt');
		
		// If no title
		if (document.title === '') {
			$('title').append(looperTitle);
		}
		// If title = Data Looper
		else if (document.title === 'Data Looper') {
			$('title').replaceWith('<title>' +looperTitle+ '</title>');
		};
    });

// DATA LOOPER 2.0 function
(function($) {

  $.fn.looper = function(options) {
    var defaults = {
      speed				:	100, // transition between slides, in milliseconds
      pause				:	1000, // length of time to remain on each slide, in milliseconds
      transition		:	'crossfade', // crossfade is the only option right now
      navigation		:	true, // set to false to turn off the navigation
      slide_reset		:	true,
      slide_captions	:	false,
      slide_counter		:	true,
      speed_controls	:	true,
      forward_backward	:	true,
      autoplay			:	true
    },
    
    options = $.extend(defaults, options);
    
    if (options.pause <= options.speed) options.pause = options.speed + 100;
	
	
// CREATE A DATA LOOPER FOR EACH DIV.looper
    return this.each(function() {

      var $this = $(this);
      
      var $interval = ''; // variable used in the setInterval method
      var $curr_pause = options.pause; // take the start value from defaults. this is used for the speed controls
      
      $this.wrap('<div class="looper-wrap" />');
      
      var $paused = '';
      if (options.autoplay === true) {
        $paused = false;
      } else {
        $paused = true;
      }
      
      // GRAB THE FIRST IMAGE DIMENSIONS
      var $image_width = $this.children('img:first').width()+'px';
      var $image_height = $this.children('img:first').height()+'px';
      $this.css({
        'position'	:	'relative',
        'width'		:	'auto',
        'height'		:	'100%'
      });
	  
	  
      // THE DEFAULT CROSSFADE EFFECT
      if (options.transition === 'crossfade') {
        
        var $images = $this.children('img');
        
        for (var i = 0; i<$images.length; i++){
          $images[i].setAttribute('id', i+1);
        }
        
        $this.children().css({
          'position'	:	'absolute'
          //'left'		:	0
        });
        
        $this.children(':first').appendTo($this).show();
        
        if (options.navigation === true) {
          createNavigation();

          var $nav = $this.siblings('.navigation');
          
          // PLAY PAUSE BUTTON
          $nav.children('.nav_right').children('.pauseplay').click(function() {
            if ($paused === false) {
              stopIt();  
            } else {
              moveIt();
            }
          });
          
          // NEXT BUTTON
          $nav.children('.nav_right').children('.next').click(function() {
            stopIt();
            forward();
          });
          
          // PREVIOUS BUTTON
          $nav.children('.nav_right').children('.prev').click(function() {
            stopIt();
            backward();
          });
          
          /// RESET BUTTON
          $nav.children('.nav_right').children('.reset').click(function() {
			stopIt();
            resetSlides();
          });
                    // OVERLAY TOGGLE BUTTON
          $nav.children('.nav_left').children('.overlay-toggle').click(function() {
            const overlay = $('#overlayImage');
            const button = $(this);
            
            if (overlay.is(':visible')) {
              overlay.hide();
              button.removeClass('active').val('👁');
            } else {
              overlay.show();
              button.addClass('active').val('👁');
            }
          });
                    /// SPEED CONTROLS
        
          var $slower = $nav.children('.nav_right').children('.speed').children('.slower');
          var $faster = $nav.children('.nav_right').children('.speed').children('.faster');
          $slower.click(function() {
            if ($curr_pause < 2000) {
              clearInterval($interval);
              $curr_pause = $curr_pause * 1.5;
              moveIt();
            }
          });
          $faster.click(function() {
            if ($curr_pause > 100) {
              clearInterval($interval);
              $curr_pause = $curr_pause / 1.5;
              moveIt();
            }
          });
        }
        
      if (options.autoplay === false) {
          stopIt();
        } else {
          $interval = setInterval(function() {
            forward();
          }, options.pause);
        }
      }
      
      
      
      // PAUSE THE CYCLING
      function stopIt() {
        $this
          .siblings('.navigation')
          .children('.nav_right')
          .children('.pauseplay')
          .removeClass('pause')
		  .removeClass('glyphicon-pause');
        $this
          .siblings('.navigation')
          .children('.nav_right')
          .children('.pauseplay')
          .addClass('play')
		  .addClass('glyphicon-play')
		  .val('\ue072');
        clearInterval($interval);
        $paused = true;
      }
      
      
      // START THE CYCLING	
      function moveIt() {
        $this
          .siblings('.navigation')
          .children('.nav_right')
          .children('.pauseplay')
          .removeClass('play')
		  .removeClass('glyphicon-play');
        $this
          .siblings('.navigation')
          .children('.nav_right')
          .children('.pauseplay')
          .addClass('pause')
		  .addClass('glyphicon-pause')
		  .val('\ue073');
        $interval = setInterval(function() {
          forward();
        }, $curr_pause);
        $paused = false;
      }
      
      
      // STEP FORWARD
      function forward() {
        var $curr_first = $this.children(':first');
        $curr_first.hide().appendTo($this).fadeIn(options.speed);
          if (options.navigation === true) {
            fetchSlideNumber();
          }
          if (options.slide_captions === true) {
            updateCaption();
          }
      }

      // STEP BACKWARD
      function backward() {
          var $curr_last = $this.children(':last');
          $curr_last.fadeOut(options.speed, function(){
          $curr_last.show().prependTo($this);
          if (options.navigation === true) {
            if (options.slide_counter === true) {
              fetchSlideNumber();
            }
            if (options.slide_captions === true) {
              updateCaption();
            }
          }
        });
      }
      
      // RESET SLIDES
      function resetSlides() {
      	
        // gather all the slides and stuff them into an array
        var $collectedSlides = new Array();
        var $slidesToCollect = $this.children('img');
        for (var i = 0; i < $slidesToCollect.length; i++) {
          var $curr_slide = $slidesToCollect[i].getAttribute('id');
          $collectedSlides[i] = $this.children('#'+(i+1));
		  
        }
        
        // sort the array numerically and ascending
		//this next line broke the reset button in FF 6-10-13, removing it seemed to solve the issue
		//$collectedSlides.sort(function(a,b){return a-b});
		
        // loop through the array and append them in order
        for (var x in $collectedSlides) {
          $this.append($collectedSlides[x]);
        }
        
        // take the first slide and move it to the end
        $this.children(':first').appendTo($this).show();
        
        if (options.navigation === true) {
          if (options.slide_counter === true) {
            fetchSlideNumber();
          }
          if (options.slide_captions === true) {
            updateCaption();
          }
        }
      }

      // UPDATE SLIDE NUMBER
      function fetchSlideNumber(){
        var $slideID = $this.children(':last').attr('id');
        var $slideNumber = $this.siblings('.navigation').children('.nav_right').children('.counter').children('.slidenumber');
        $slideNumber.html($slideID);
      }
      
      // UPDATE CAPTION
      function updateCaption(){
        var $slideAlt = $this.children(':last').attr('alt');
        var $slideCaption = $this.siblings('.navigation').children('.nav_left').children('.caption');
        $slideCaption.html($slideAlt);
      }
	  
	  //UPDATE SPEED
	  function updateSpeed(){
	  	// create stuff here!
	  
	  } 
      
      
      // CREATE THE NAVIGATION DIV
      function createNavigation() {
		// PUSH LOOPER HEIGHT TO BE RESPONSIVE
		var $imageSrc = $this.children('img:last').attr("src");
		
		// Create a responsive invisible image
		$this.parent().append('<img src="' + $imageSrc + '" class="img-responsive invisible" />');
		
		
		// ADD THE LOOPER CONTROLS
        $this.parent().append('<div class="navigation looper-controls"></div>');
		
		
        var $nav = $this.siblings('.navigation');
        
		
		$nav.append('<div class="nav_left"></div>');
        $nav.append('<div class="nav_right"></div>');
        
        var $nav_left = $nav.children('.nav_left');
        var $nav_right = $nav.children('.nav_right');
        
        
        if (options.slide_captions === true) {
			$nav_left.append('<span class="caption"></span>');
			$nav_left.children('.caption').html($this.children('img:last').attr('alt'));
        }
        
        // Add overlay toggle button to left side if overlay exists
        if (options.overlay_toggle === true) {
          $nav_left.append('<input type="button" class="overlay-toggle active" title="Show/Hide Overlay" value="👁" tabindex="0" accesskey="o" />');
        }
		
		if (options.slide_counter === true) {
          $nav_right.append('<span class="counter"><b class="slidenumber"></b>/<b class="totalslides"></b></span>');
		  $nav_right.children('.counter').children('.slidenumber').html(1);
		  $nav_right.children('.counter').children('.totalslides').html($this.children('img').length);
		}
		
		if (options.slide_reset === true) {
		  $nav_right.append('<input type="button" class="reset glyphicon glyphicon-stop" title="stop" value="&#xe074;" tabindex="0" accesskey="r" />');
        }
		
		  $nav_right.append('<input type="button" class="pauseplay pause glyphicon glyphicon-pause" title="play/pause" value="&#xe073;" tabindex="0" accesskey="p" />');
        
        
        
        if (options.forward_backward === true) {
          $nav_right.append('<input type="button" class="prev glyphicon glyphicon-step-backward" title="step backward" value="&#xe069;" tabindex="0" accesskey="a" />');
        }
		
		if (options.forward_backward === true) {
          $nav_right.append('<input type="button" class="next glyphicon glyphicon-step-forward" title="step forward" value="&#xe077;" tabindex="0" accesskey="d" />');
        }
        
		if (options.speed_controls === true) {
          $nav_right.append('<span class="speed"><input type="button" class="slower glyphicon glyphicon-minus" title="slower" tabindex="0" value="&#x2212;" accesskey="s"></input><input type="button" class="faster glyphicon glyphicon-plus" title="faster" tabindex="0" value="&#x2b;" accesskey="w"></input></span>');
        }
      	  
	  }
	  
	  // SPECIFY MAX-WIDTH FOR LOOPER WRAP
	  $('.looper-wrap').each(function() {
        // Get on screen image
		var screenImage = $(this).children('.looper').children('img').last();

		// Create new offscreen image to test
		var theImage = new Image();
		theImage.src = screenImage.attr("src");

		// Get accurate measurements from that.
		var imageWidth = theImage.width;
		var imageHeight = theImage.height;
		
		// WebKit adjustment minimum width
		var loopMinWidth = 640;
		
		// WebKit adjustment maximum width set at document head
		//var loopMaxWidth = 1200;
		
		// Write it to the Preload Wrapper
		if (imageWidth === 0){
			$('#preload-wrapper').css('min-width', loopMinWidth).css('max-width', loopMaxWidth);
		}
		else {
			$('#preload-wrapper').css('max-width', imageWidth);
		}
    });
	
	
	}); 
    
   
  }
})(jQuery);