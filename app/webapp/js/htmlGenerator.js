/**
 * HTML Generator Module
 * Creates HTML files and folder structures for image loops
 */

class HTMLGenerator {
    static async generateLoop(folderName, processedData, config) {
        const { images, dimensions } = processedData;
        
        if (!images || images.length === 0) {
            throw new Error('No images provided for HTML generation');
        }

        // Create a complete folder structure instead of a single HTML file
        const folderStructure = await this.generateFolderStructure(folderName, images, dimensions, config);
        return folderStructure;
    }

    static async generateFolderStructure(folderName, images, dimensions, config) {
        const title = this.sanitizeTitle(folderName);
        const looperConfig = this.generateLooperConfig(config);
        const width = dimensions.width || 800;

        // Create the folder structure object
        const folderStructure = {
            name: folderName,
            type: 'folder',
            files: {}
        };

        // Generate index.htm with external references
        folderStructure.files['index.htm'] = {
            type: 'text/html',
            content: this.generateHTMLWithExternalFiles(title, images, looperConfig, width)
        };

        // Create src folder for source files
        folderStructure.files['src'] = {
            type: 'folder',
            files: {}
        };

        // Add jQuery library to src folder
        const jqueryContent = await this.loadJQueryLibrary();
        folderStructure.files['src'].files['jquery.min.js'] = {
            type: 'application/javascript',
            content: jqueryContent
        };

        // Add looper JavaScript to src folder
        folderStructure.files['src'].files['looper.js'] = {
            type: 'application/javascript',
            content: this.getLooperScript()
        };

        // Add CSS file to src folder
        folderStructure.files['src'].files['styles.css'] = {
            type: 'text/css',
            content: this.generateCSSFile(width)
        };

        // Add image files directly to root folder
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const extension = this.getImageExtension(image.name);
            const filename = `image_${String(i + 1).padStart(3, '0')}.${extension}`;
            
            folderStructure.files[filename] = {
                type: `image/${extension}`,
                content: image.dataUrl,
                originalName: image.name
            };
        }

        return folderStructure;
    }

    static generateHTMLWithExternalFiles(title, images, looperConfig, width) {
        // Generate image elements with external file references (images at root)
        const imageElements = images.map((image, index) => {
            const extension = this.getImageExtension(image.name);
            const filename = `image_${String(index + 1).padStart(3, '0')}.${extension}`;
            return `        <img src="${filename}" alt="${image.alt}" class="img-responsive">`;
        }).join('\n');

        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title} - Data Looper</title>
    <link rel="stylesheet" href="src/styles.css">
    <script src="src/jquery.min.js"></script>
    <script src="src/looper.js"></script>
    <script>
        $(document).ready(function() { 
            $(".looper").looper(${looperConfig}); 
        });
    </script>
</head>
<body>
    <div class="container-fluid">
        <div class="loop-content">
            <div id="preload-wrapper">
                <div class="looper-wrap">
                    <div class="looper">
${imageElements}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    static generateCSSFile(width) {
        return `/* Data Loop Builder - Generated Styles */

body { 
    margin: 0; 
    padding: 20px; 
    background: #f5f5f5; 
    font-family: Arial, sans-serif; 
}

.container-fluid { 
    background: white; 
    border-radius: 8px; 
    box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    overflow: hidden; 
}

.loop-content { 
    padding: 0; 
}

#preload-wrapper { 
    min-width: 640px; 
    max-width: ${width}px; 
    margin: 0 auto; 
}

.looper-wrap { 
    clear: left; 
    display: block; 
    margin: 0 auto; 
    font-family: Arial, sans-serif; 
}

.looper { 
    position: relative; 
}

.img-responsive { 
    display: block; 
    max-width: 100%; 
    height: auto; 
}

.navigation { 
    padding: 8px; 
    overflow: hidden; 
    color: #000; 
    background: #f8f9fa; 
    border-top: 1px solid #ddd; 
}

.nav_left { 
    float: left; 
}

.nav_right { 
    float: right; 
}

.prev, .next, .reset, .slower, .faster, .play, .pause { 
    float: left; 
    display: block; 
    width: 32px; 
    height: 32px; 
    margin: 4px; 
    cursor: pointer; 
    border: 2px solid #333; 
    text-align: center; 
    line-height: 28px; 
    border-radius: 4px; 
    background: #f8f9fa; 
    color: #333; 
    text-decoration: none; 
}

.prev:hover, .next:hover, .reset:hover, .slower:hover, .faster:hover, .play:hover, .pause:hover { 
    color: #007bff; 
    border-color: #007bff; 
    background: #e7f1ff; 
}

.counter { 
    float: left; 
    margin-top: 12px; 
    margin-right: 8px; 
    font-weight: bold; 
}

.speed { 
    float: left; 
    border-left: 1px solid #333; 
    padding: 0 10px; 
    margin-left: 10px; 
}

.slower, .faster { 
    border-radius: 50%; 
}

.play::after { content: "▶"; }
.pause::after { content: "⏸"; }
.reset::after { content: "⏹"; }
.prev::after { content: "⏮"; }
.next::after { content: "⏭"; }
.slower::after { content: "−"; }
.faster::after { content: "+"; }
.invisible { visibility: hidden; }`;
    }

    static getImageExtension(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        return ext === 'jpeg' ? 'jpg' : ext;
    }

    static async loadJQueryLibrary() {
        try {
            const response = await fetch('/js/jquery.min.js');
            return await response.text();
        } catch (error) {
            // Fallback - return a comment indicating where to get jQuery
            return `/* jQuery library should be placed here
 * Download from: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
 * Or include this script tag in index.html instead:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
 */`;
        }
    }

    static getLooperScript() {
        return `/* Data Loop Builder - Looper Script */
(function($) {
    $.fn.looper = function(options) {
        var defaults = { 
            speed: 100, 
            pause: 1000, 
            transition: 'crossfade', 
            navigation: true, 
            slide_reset: true, 
            slide_captions: false, 
            slide_counter: true, 
            speed_controls: true, 
            forward_backward: true, 
            autoplay: true 
        };
        
        options = $.extend(defaults, options);
        if (options.pause <= options.speed) options.pause = options.speed + 100;

        return this.each(function() {
            var $this = $(this), $interval = '', $curr_pause = options.pause;
            $this.wrap('<div class="looper-wrap" />');
            var $paused = !options.autoplay;
            
            $this.css({ 'position': 'relative', 'width': 'auto', 'height': '100%' });

            if (options.transition === 'crossfade') {
                var $images = $this.children('img');
                for (var i = 0; i < $images.length; i++) { 
                    $images[i].setAttribute('id', i+1); 
                }
                $this.children().css({ 'position': 'absolute' });
                $this.children(':first').appendTo($this).show();
                
                if (options.navigation) {
                    createNavigation();
                    var $nav = $this.siblings('.navigation');
                    
                    $nav.find('.pauseplay').click(function() { 
                        $paused ? moveIt() : stopIt(); 
                    });
                    $nav.find('.next').click(function() { 
                        stopIt(); forward(); 
                    });
                    $nav.find('.prev').click(function() { 
                        stopIt(); backward(); 
                    });
                    $nav.find('.reset').click(function() { 
                        stopIt(); resetSlides(); 
                    });
                    $nav.find('.slower').click(function() { 
                        if ($curr_pause < 2000) { 
                            clearInterval($interval); 
                            $curr_pause *= 1.5; 
                            moveIt(); 
                        } 
                    });
                    $nav.find('.faster').click(function() { 
                        if ($curr_pause > 100) { 
                            clearInterval($interval); 
                            $curr_pause /= 1.5; 
                            moveIt(); 
                        } 
                    });
                }
                
                if (!options.autoplay) { 
                    stopIt(); 
                } else { 
                    $interval = setInterval(forward, options.pause); 
                }
            }
            
            function stopIt() { 
                $this.siblings('.navigation').find('.pauseplay')
                    .removeClass('pause').addClass('play'); 
                clearInterval($interval); 
                $paused = true; 
            }
            
            function moveIt() { 
                $this.siblings('.navigation').find('.pauseplay')
                    .removeClass('play').addClass('pause'); 
                $interval = setInterval(forward, $curr_pause); 
                $paused = false; 
            }
            
            function forward() { 
                var $curr_first = $this.children(':first'); 
                $curr_first.hide().appendTo($this).fadeIn(options.speed); 
                if (options.navigation) fetchSlideNumber(); 
            }
            
            function backward() { 
                var $curr_last = $this.children(':last'); 
                $curr_last.fadeOut(options.speed, function(){ 
                    $curr_last.show().prependTo($this); 
                    if (options.navigation && options.slide_counter) fetchSlideNumber(); 
                }); 
            }
            
            function resetSlides() { 
                var $slides = [], $toCollect = $this.children('img'); 
                for (var i = 0; i < $toCollect.length; i++) { 
                    $slides[i] = $this.children('#'+(i+1)); 
                } 
                for (var x in $slides) { 
                    $this.append($slides[x]); 
                } 
                $this.children(':first').appendTo($this).show(); 
                if (options.navigation && options.slide_counter) fetchSlideNumber(); 
            }
            
            function fetchSlideNumber(){ 
                var $slideID = $this.children(':last').attr('id'); 
                $this.siblings('.navigation').find('.slidenumber').html($slideID); 
            }
            
            function createNavigation() {
                var $imageSrc = $this.children('img:last').attr("src");
                $this.parent().append('<img src="' + $imageSrc + '" class="img-responsive invisible" />');
                $this.parent().append('<div class="navigation"></div>');
                var $nav = $this.siblings('.navigation');
                $nav.append('<div class="nav_left"></div><div class="nav_right"></div>');
                var $nav_right = $nav.children('.nav_right');
                
                if (options.slide_counter) { 
                    $nav_right.append('<span class="counter"><b class="slidenumber">1</b>/<b class="totalslides">' + $this.children('img').length + '</b></span>'); 
                }
                if (options.slide_reset) { 
                    $nav_right.append('<a href="#" class="reset" title="Stop/Reset"></a>'); 
                }
                $nav_right.append('<a href="#" class="pauseplay pause" title="Play/Pause"></a>');
                if (options.forward_backward) { 
                    $nav_right.append('<a href="#" class="prev" title="Previous"></a><a href="#" class="next" title="Next"></a>'); 
                }
                if (options.speed_controls) { 
                    $nav_right.append('<span class="speed"><a href="#" class="slower" title="Slower"></a><a href="#" class="faster" title="Faster"></a></span>'); 
                }
            }
        }); 
    };
})(jQuery);`;
    }

    static generateLooperConfig(config) {
        return JSON.stringify({
            navigation: config.showNavigation,
            slide_captions: false,
            slide_counter: config.showCounter,
            speed_controls: config.showSpeedControls,
            forward_backward: config.showStepControls,
            autoplay: config.autoplay
        }, null, 2);
    }

    static sanitizeTitle(title) {
        return title
            .replace(/[<>:"\/\\|?*]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

// Export for use in other modules
window.HTMLGenerator = HTMLGenerator;