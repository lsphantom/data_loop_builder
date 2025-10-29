/**
 * HTML Generator Module
 * Creates interactive HTML loop files from processed images
 */

class HTMLGenerator {
    static async generateLoop(folderName, processedData, config) {
        const { images, dimensions } = processedData;
        
        if (!images || images.length === 0) {
            throw new Error('No images provided for HTML generation');
        }

        const html = await this.generateCompleteHTML(folderName, images, dimensions, config);
        return html;
    }

    static async generateCompleteHTML(folderName, images, dimensions, config) {
        const title = this.sanitizeTitle(folderName);
        const imageElements = this.generateImageElements(images);
        const looperConfig = this.generateLooperConfig(config);
        const width = dimensions.width || 800;

        // Load the template
        const template = await this.loadTemplate();
        
        // Replace template placeholders
        let html = template
            .replace(/\{\{TITLE\}\}/g, title)
            .replace(/\{\{IMAGE_COUNT\}\}/g, images.length)
            .replace(/\{\{MAX_WIDTH\}\}/g, width)
            .replace(/\{\{LOOPER_CONFIG\}\}/g, looperConfig)
            .replace(/\{\{IMAGE_ELEMENTS\}\}/g, imageElements);

        return html;
    }

    static async loadTemplate() {
        // For now, return a simplified inline template
        // In a real deployment, this would load from templates/looper-template.html
        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{TITLE}} - Data Looper</title>
    <style>
        body { margin: 0; padding: 20px; background: #f5f5f5; font-family: Arial, sans-serif; }
        .container-fluid { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .loop-header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 20px; margin: 0; }
        .loop-header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .loop-content { padding: 0; }
        #preload-wrapper { min-width: 640px; max-width: {{MAX_WIDTH}}px; margin: 0 auto; }
        .looper-wrap { clear: left; display: block; margin: 0 auto; font-family: Arial, sans-serif; }
        .looper { position: relative; }
        .img-responsive { display: block; max-width: 100%; height: auto; }
        .navigation { padding: 8px; overflow: hidden; color: #000; background: #f8f9fa; border-top: 1px solid #ddd; }
        .nav_left { float: left; }
        .nav_right { float: right; }
        .prev, .next, .reset, .slower, .faster, .play, .pause { float: left; display: block; width: 32px; height: 32px; margin: 4px; cursor: pointer; border: 2px solid #333; text-align: center; line-height: 28px; border-radius: 4px; background: #f8f9fa; color: #333; text-decoration: none; }
        .prev:hover, .next:hover, .reset:hover, .slower:hover, .faster:hover, .play:hover, .pause:hover { color: #007bff; border-color: #007bff; background: #e7f1ff; }
        .counter { float: left; margin-top: 12px; margin-right: 8px; font-weight: bold; }
        .speed { float: left; border-left: 1px solid #333; padding: 0 10px; margin-left: 10px; }
        .slower, .faster { border-radius: 50%; }
        .play::after { content: "▶"; }
        .pause::after { content: "⏸"; }
        .reset::after { content: "⏹"; }
        .prev::after { content: "⏮"; }
        .next::after { content: "⏭"; }
        .slower::after { content: "−"; }
        .faster::after { content: "+"; }
        .invisible { visibility: hidden; }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script>
        (function($) {
            $.fn.looper = function(options) {
                var defaults = { speed: 100, pause: 1000, transition: 'crossfade', navigation: true, slide_reset: true, slide_captions: false, slide_counter: true, speed_controls: true, forward_backward: true, autoplay: true };
                options = $.extend(defaults, options);
                if (options.pause <= options.speed) options.pause = options.speed + 100;

                return this.each(function() {
                    var $this = $(this), $interval = '', $curr_pause = options.pause;
                    $this.wrap('<div class="looper-wrap" />');
                    var $paused = !options.autoplay;
                    
                    $this.css({ 'position': 'relative', 'width': 'auto', 'height': '100%' });

                    if (options.transition === 'crossfade') {
                        var $images = $this.children('img');
                        for (var i = 0; i < $images.length; i++) { $images[i].setAttribute('id', i+1); }
                        $this.children().css({ 'position': 'absolute' });
                        $this.children(':first').appendTo($this).show();
                        
                        if (options.navigation) {
                            createNavigation();
                            var $nav = $this.siblings('.navigation');
                            
                            $nav.find('.pauseplay').click(function() { $paused ? moveIt() : stopIt(); });
                            $nav.find('.next').click(function() { stopIt(); forward(); });
                            $nav.find('.prev').click(function() { stopIt(); backward(); });
                            $nav.find('.reset').click(function() { stopIt(); resetSlides(); });
                            $nav.find('.slower').click(function() { if ($curr_pause < 2000) { clearInterval($interval); $curr_pause *= 1.5; moveIt(); } });
                            $nav.find('.faster').click(function() { if ($curr_pause > 100) { clearInterval($interval); $curr_pause /= 1.5; moveIt(); } });
                        }
                        
                        if (!options.autoplay) { stopIt(); } else { $interval = setInterval(forward, options.pause); }
                    }
                    
                    function stopIt() { $this.siblings('.navigation').find('.pauseplay').removeClass('pause').addClass('play'); clearInterval($interval); $paused = true; }
                    function moveIt() { $this.siblings('.navigation').find('.pauseplay').removeClass('play').addClass('pause'); $interval = setInterval(forward, $curr_pause); $paused = false; }
                    function forward() { var $curr_first = $this.children(':first'); $curr_first.hide().appendTo($this).fadeIn(options.speed); if (options.navigation) fetchSlideNumber(); }
                    function backward() { var $curr_last = $this.children(':last'); $curr_last.fadeOut(options.speed, function(){ $curr_last.show().prependTo($this); if (options.navigation && options.slide_counter) fetchSlideNumber(); }); }
                    function resetSlides() { var $slides = [], $toCollect = $this.children('img'); for (var i = 0; i < $toCollect.length; i++) { $slides[i] = $this.children('#'+(i+1)); } for (var x in $slides) { $this.append($slides[x]); } $this.children(':first').appendTo($this).show(); if (options.navigation && options.slide_counter) fetchSlideNumber(); }
                    function fetchSlideNumber(){ var $slideID = $this.children(':last').attr('id'); $this.siblings('.navigation').find('.slidenumber').html($slideID); }
                    function createNavigation() {
                        var $imageSrc = $this.children('img:last').attr("src");
                        $this.parent().append('<img src="' + $imageSrc + '" class="img-responsive invisible" />');
                        $this.parent().append('<div class="navigation"></div>');
                        var $nav = $this.siblings('.navigation');
                        $nav.append('<div class="nav_left"></div><div class="nav_right"></div>');
                        var $nav_right = $nav.children('.nav_right');
                        if (options.slide_counter) { $nav_right.append('<span class="counter"><b class="slidenumber">1</b>/<b class="totalslides">' + $this.children('img').length + '</b></span>'); }
                        if (options.slide_reset) { $nav_right.append('<a href="#" class="reset" title="Stop/Reset"></a>'); }
                        $nav_right.append('<a href="#" class="pauseplay pause" title="Play/Pause"></a>');
                        if (options.forward_backward) { $nav_right.append('<a href="#" class="prev" title="Previous"></a><a href="#" class="next" title="Next"></a>'); }
                        if (options.speed_controls) { $nav_right.append('<span class="speed"><a href="#" class="slower" title="Slower"></a><a href="#" class="faster" title="Faster"></a></span>'); }
                    }
                }); 
            };
        })(jQuery);
        
        $(document).ready(function() { $(".looper").looper({{LOOPER_CONFIG}}); });
    </script>
</head>
<body>
    <div class="container-fluid">
        <div class="loop-header">
            <h1>{{TITLE}}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 16px;">{{IMAGE_COUNT}} images • Created by Data Loop Builder</p>
        </div>
        <div class="loop-content">
            <div id="preload-wrapper">
                <div class="looper-wrap">
                    <div class="looper">
{{IMAGE_ELEMENTS}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    static generateImageElements(images) {
        return images.map(image => 
            `                        <img src='${image.dataUrl}' alt='${image.alt}' class='img-responsive'>`
        ).join('\n');
    }

    static generateLooperConfig(config) {
        const looperConfig = {
            navigation: config.showNavigation,
            slide_captions: false, // We don't use captions in this version
            slide_counter: config.showCounter,
            speed_controls: config.showSpeedControls,
            forward_backward: config.showStepControls,
            autoplay: config.autoplay
        };

        return JSON.stringify(looperConfig, null, 12); // Indent for readability
    }

    static sanitizeTitle(title) {
        // Remove or replace characters that could cause issues in HTML
        return title
            .replace(/[<>]/g, '') // Remove < and >
            .replace(/[&]/g, '&amp;') // Escape ampersands
            .replace(/['"]/g, '') // Remove quotes
            .trim();
    }

    static getEncodedCSS() {
        // Create a combined CSS string with Bootstrap and Looper styles
        const css = `
/* Bootstrap CSS (minimal required styles) */
.container-fluid {
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
}

.img-responsive {
    display: block;
    max-width: 100%;
    height: auto;
}

/* Looper CSS */
.looper-wrap {
    clear: left;
    float: none;
    display: block;
    margin-bottom: 20px auto;
    font-family: Arial, sans-serif;
    margin: 0px auto;
}

.looper {
    position: relative;
}

.navigation {
    padding: 5px;
    overflow: hidden;
    color: #000;
    background-color: #fff;
}

.nav_left {
    float: left;
}

.nav_right {
    float: right;
}

.prev, .next, .reset,
.slower, .faster, .play, .pause {
    float: left;
    display: block;
    width: 26px;
    height: 26px;
    margin: 4px;
    padding-top: 1px;
    padding-left: 5px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid;
    text-align: center;
    vertical-align: middle;
    border-radius: 2px;
    font-size: 12px;
}

.prev:hover, .next:hover, .reset:hover,
.slower:hover, .faster:hover, .play:hover, .pause:hover {
    color: #1f7eff;
}

.counter {
    float: left;
    margin-top: 8px;
    margin-right: 8px;
}

.counter b {
    padding: 0 2px;
}

.speed {
    float: left;
    display: block;
    border-left: 1px solid #333;
    padding: 0px 10px;
}

.slower, .faster {
    display: block;
    float: left;
    width: 26px;
    height: 26px;
    margin-top: 4px;
    margin-right: 6px;
    margin-left: 6px;
    text-align: center;
    vertical-align: middle;
    padding-top: 1px;
    padding-left: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid;
    border-radius: 2.5em;
    font-size: 10px;
}

.looper-controls {
    background-color: #eee;
    min-height: 30px;
}

/* Glyphicons (basic set for controls) */
.glyphicon {
    position: relative;
    top: 1px;
    display: inline-block;
    font-family: 'Glyphicons Halflings';
    font-style: normal;
    font-weight: normal;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.glyphicon-play:before { content: "\\e072"; }
.glyphicon-pause:before { content: "\\e073"; }
.glyphicon-stop:before { content: "\\e074"; }
.glyphicon-step-backward:before { content: "\\e069"; }
.glyphicon-step-forward:before { content: "\\e077"; }
.glyphicon-minus:before { content: "\\e082"; }
.glyphicon-plus:before { content: "\\e081"; }

.invisible {
    visibility: hidden;
}
`;
        return btoa(css);
    }

    static getEncodedJQuery() {
        // For now, return a placeholder - in a real implementation, 
        // you would embed the actual minified jQuery
        const jqueryPlaceholder = `
// jQuery placeholder - should be replaced with actual jQuery code
console.log("jQuery should be loaded here");
`;
        return btoa(jqueryPlaceholder);
    }

    static getEncodedLooper() {
        // For now, return a placeholder - in a real implementation,
        // you would embed the actual looper.js
        const looperPlaceholder = `
// Looper.js placeholder - should be replaced with actual looper code
console.log("Looper.js should be loaded here");
`;
        return btoa(looperPlaceholder);
    }

    static async generateStandaloneHTML(folderName, images, dimensions, config) {
        // This method would create a truly standalone HTML file by
        // reading the actual jQuery and looper.js files and embedding them
        try {
            const jquery = await this.loadScript('/js/jquery.min.js');
            const looper = await this.loadScript('/js/looper.js');
            const css = await this.loadCSS('/css/looper.css');
            
            // Replace the base64 placeholders with actual code
            let html = this.generateCompleteHTML(folderName, images, dimensions, config);
            html = html.replace('${this.getEncodedJQuery()}', btoa(jquery));
            html = html.replace('${this.getEncodedLooper()}', btoa(looper));
            html = html.replace('${this.getEncodedCSS()}', btoa(css));
            
            return html;
        } catch (error) {
            console.warn('Could not load external scripts, using placeholders');
            return this.generateCompleteHTML(folderName, images, dimensions, config);
        }
    }

    static loadScript(url) {
        return fetch(url).then(response => response.text());
    }

    static loadCSS(url) {
        return fetch(url).then(response => response.text());
    }

    static validateHTMLOutput(html) {
        const validation = {
            isValid: true,
            warnings: [],
            errors: []
        };

        // Basic HTML structure validation
        if (!html.includes('<!doctype html>')) {
            validation.errors.push('Missing DOCTYPE declaration');
        }

        if (!html.includes('<html>') || !html.includes('</html>')) {
            validation.errors.push('Missing HTML tags');
        }

        if (!html.includes('<head>') || !html.includes('</head>')) {
            validation.errors.push('Missing HEAD section');
        }

        if (!html.includes('<body>') || !html.includes('</body>')) {
            validation.errors.push('Missing BODY section');
        }

        // Check for looper-specific elements
        if (!html.includes('class="looper"')) {
            validation.errors.push('Missing looper container');
        }

        if (!html.includes('<img')) {
            validation.errors.push('No images found in HTML');
        }

        // Check for potential issues
        if (html.length > 10 * 1024 * 1024) { // 10MB
            validation.warnings.push('Generated HTML is very large (>10MB)');
        }

        if (!html.includes('looper(')) {
            validation.warnings.push('Looper initialization script not found');
        }

        validation.isValid = validation.errors.length === 0;
        return validation;
    }
}

// Export for use in other modules
window.HTMLGenerator = HTMLGenerator;