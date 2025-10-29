#!/bin/tcsh

if ($#argv == 0) then
   echo "No path found."
   echo "Usage: loopBuilder.csh path"
   exit 1
endif

if ($#argv == 1) then
   echo "No path found."
   echo "Usage: loopBuilder.csh path imgtype"
   exit 1
endif

set loc=$argv[1]
echo $argv[0]
echo $argv[1]
echo $argv[2]

echo "Running script from $loc"
echo ""
setenv PATH /usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
set loc3=`pwd`
cd $loc

set folder_list=`ls -d */ | sed 's/\///'g`
echo $folder_list

foreach h ($folder_list) 
   cd $loc/$h
   echo `pwd`

#Adjusted by Bryan on 2025-01-08
#   set list=`ls -p | grep -v / | grep -v ".htm"`
#   set list=`ls -p *$argv[2]`
   set list=`ls -p *$argv[2] | grep -v "CONUS.jpg" | grep -v "Texas.jpg" | grep -v "NH.jpg"`
#   echo $list

   if ("$list" == "") then
      echo ""
      echo "WARNING :: No image files found of type $argv[2] in folder: $h"
      echo ""
      continue
   endif
   
   set imagename=`echo $list[1]`
   set filename=`echo $list[1] | rev | cut -d "." -f 2-10 | rev`
   set filename=$filename.htm
   echo $filename
   
   echo "Beginning htm build"
#   touch $filename 
   
   echo '<\!doctype html>' > $filename
   echo '<html>' >> $filename
   echo '<head>' >> $filename
   echo '<meta charset="UTF-8">' >> $filename
   echo '<title>Data Looper</title>' >> $filename
   echo '<link rel="stylesheet" type="text/css" href="src/looper.css">' >> $filename
   echo '<link rel="stylesheet" type="text/css" href="src/bootstrap/css/bootstrap.min.css">' >> $filename
   echo '<script type="text/javascript" src="src/jquery.min.js"></script>' >> $filename
   echo '<script type="text/javascript" src="src/looper.js"></script>' >> $filename
   echo '<script type="text/javascript">' >> $filename
   echo '// Set looper Max-Width (in Pixels)' >> $filename

   set width=`identify -format "%w" $imagename`

   echo "var loopMaxWidth = $width;" >> $filename
   echo '$(document).ready(function () {' >> $filename
   echo '	// Looper Settings' >> $filename
   echo '	$(".looper").looper({' >> $filename
   echo '		navigation			: true, // Display the navigation controls' >> $filename
   echo '      	slide_captions		: false, // Display the slide info' >> $filename
   echo '      	slide_counter		: true, // Display the slide counter' >> $filename
   echo '      	speed_controls		: true, // Display the speed controls' >> $filename
   echo '      	forward_backward	: true, // Display the step controls' >> $filename
   echo '      	autoplay			: true  // Set looper to autoplay' >> $filename
   echo '	});' >> $filename
   echo '});' >> $filename
   echo '</script>' >> $filename
   echo '</head>' >> $filename
   echo '' >> $filename
   echo '<body>' >> $filename
   echo '<div  id="preload-wrapper" class="container-fluid">' >> $filename
   echo '  <div class="looper-wrap">' >> $filename
   echo '    <div class="looper">' >> $filename
   
   echo "Starting img src/alt population loop"
   
   @ n=0
   foreach i ($list)
      @ n++
      set alt=`echo Image $n`
      echo "    <img src='$i' alt='$alt' class='img-responsive'>" >> $filename
   end
   
   echo '     </div>' >> $filename
   echo '   </div>' >> $filename
   echo '' >> $filename   
   echo '</div>' >> $filename
   
   echo '</body>' >> $filename
   echo '</html>' >> $filename
   
   set filename=`echo $filename | sed 's/.htm$//'`
   
   if ( -f index.htm ) then
    mv -f index.htm index_old.htm 
   endif

   mv $filename.htm index.htm
   chmod 775 index.htm
   cp -r $loc3/src ./

end

   
