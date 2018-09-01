<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="description" content="James Winkler's portfolio of art, music and games." />
    <meta name="keywords" content="art, artist, 2d, 3d, music" />
    <meta name="author" content="James Winkler" />
    <meta charset="utf-8" />
    <link rel="stylesheet" href="/css/site.css" type="text/css" />
    <link rel="stylesheet" href="/css/art.css" type="text/css" />
    <script type="text/javascript" src="/js/waitingRoom.js"></script>    
		<script type="text/javascript" src="/js/prototype.js"></script>
    <script type="text/javascript" src="/js/scriptaculous.js?load=effects,builder"></script>
    <script type="text/javascript" src="/js/lightbox.js"></script>
    <script type="text/javascript" src="/js/jquery-1.5.2.js"></script>
    <title>test</title>
    <style type="text/css">
		.main .test {
    	vertical-align: middle;
    	display: table-cell;
			height: 10em;
			text-shadow: 0.1em 0.1em 0.05em red;
			color: orange;
			-webkit-transition-propery: color;
			-webkit-transition-duration: 2s;
			-webkit-transition-timing-function: ease-in;
		}
		.main:hover .test {
			color: red;
		}
		@-webkit-keyframes FadeIn {
			0% { opacity:0; } 100% { opacity:1; }
		}
		.test {
			-webkit-animation-name: FadeIn;
			-webkit-animation-timing-function: ease-in;
			-webkit-animation-duration: 3s;
		}
		.thumb {
			-webkit-animation-name: FadeIn;
			-webkit-animation-timing-function: ease-in;
			-webkit-animation-duration: 2s;		
		}
		</style>
		<script type="text/javascript">
			 $(document).ready(function() {
				 $("a").click(function() {
					 alert("Hello world!");
				 });
			 });
		</script>
  </head>
  <?php flush(); ?>  
  <body>
    <div id="holder"><div id="background"></div>
  </div> 
    <div id="content">
			<?php require "../includes/header.html" ; ?>
      <div class="main">
      <a href="">Link</a>
      	<div class="infoSection">
          <div class="artHolder">
            <table>
              <tr>
                <td class="right">
                  <br />
                  <?php
                      $xml = simplexml_load_file( '../includes/imageList.xml' );
                      //$threeD = $xml->threeD;
                      
                      $nodes=array();
                      foreach($xml->threeD->img as $img){
                          $nodes[]=$img;
                      }
                      for($i = 0; $i < 4; $i++)
                      {
                        echo $i , $nodes[$i] , "<br />";
                      }
                      //for($i = 0; $i < 4; $i++)
  //                    {
  //                        $image = threeD[$i]->attributes()->src;
  //                        echo "<a href='/images/3d/" , $image , "'  rel='lightbox[3d]' title='" , $image , "'>";
  //                        echo "<img src='/images/3d/" , $xml->threeD->img[$i]->thumb , "' width='100' height='100' alt='" , $image , "'/></a>";
  //                    }
                   ?>
                </td>
                <td class="left">
                  <br />
                  <?php                    
                      for($i = 0; $i < 4; $i++)
                      {
                          $image = $xml->twoD->img[$i]->attributes()->src;
                          echo "<a href='/images/2d/" , $image , "'  rel='lightbox[2d]' title='" , $image , "'>";
                          echo "<img class='thumb' src='/images/2d/" , $xml->twoD->img[$i]->thumb , "' width='100' height='100' alt='" , $image , "'/></a>";
                      }
                   ?>
                </td>
              </tr>
            </table>  
          </div><!--end of artHolder-->
          <img src="/images/close.gif" /> 
          <div class="test">
          	<p>test text here</p>
          </div>
        <h1>100% Height Demo</h1>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque tempor. Nam in libero vel nisi accumsan euismod. Quisque quis neque. Donec condimentum, enim convallis vestibulum varius, quam mi accumsan diam, sollicitudin ultricies odio ante vitae purus. Etiam ultricies quam. Vestibulum turpis turpis, fermentum ut, accumsan quis, tempor at, ipsum. Nam felis elit, sollicitudin id, ultrices faucibus, fringilla vel, dui. Aliquam tincidunt iaculis eros. Sed in lorem. Nullam eu enim. Quisque tristique pretium diam. Fusce tempor sollicitudin ligula. Donec purus eros, mattis quis, mattis vestibulum, congue quis, felis. Nulla facilisi. Nam ultricies posuere justo. In feugiat.</p>
        <p>Ut lacus neque, interdum in, nonummy ac, placerat a, lorem. In interdum vulputate lectus. Aenean libero elit, eleifend id, tincidunt id, tristique eu, tortor. Pellentesque urna dolor, placerat a, pharetra eget, congue ut, ligula. Sed mi. Nunc volutpat. Donec pharetra accumsan lacus. Integer pede orci, vehicula vitae, porttitor id, pulvinar vel, nisi. Aliquam mauris ligula, eleifend sit amet, eleifend sit amet, luctus at, turpis. Sed neque orci, tincidunt id, tempus condimentum, eleifend a, nisl. Etiam auctor. Donec lectus lacus, consequat ac, ultrices venenatis, imperdiet vel, erat. In porttitor augue at tellus commodo pharetra.</p>
        <p>Sed non nibh. Sed sapien ipsum, fringilla condimentum, consectetuer vitae, convallis eu, urna. Aenean id elit eu nulla aliquet congue. Sed fringilla nonummy nisi. Donec aliquet. Quisque varius. Vivamus ut nulla. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Integer lacinia. In leo nulla, molestie ac, dignissim sed, pulvinar at, odio. Duis sit amet augue.</p>
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque tempor. Nam in libero vel nisi accumsan euismod. Quisque quis neque. Donec condimentum, enim convallis vestibulum varius, quam mi accumsan diam, sollicitudin ultricies odio ante vitae purus. Etiam ultricies quam. Vestibulum turpis turpis, fermentum ut, accumsan quis, tempor at, ipsum. Nam felis elit, sollicitudin id, ultrices faucibus, fringilla vel, dui. Aliquam tincidunt iaculis eros. Sed in lorem. Nullam eu enim. Quisque tristique pretium diam. Fusce tempor sollicitudin ligula. Donec purus eros, mattis quis, mattis vestibulum, congue quis, felis. Nulla facilisi. Nam ultricies posuere justo. In feugiat.</p>
        <p>Ut lacus neque, interdum in, nonummy ac, placerat a, lorem. In interdum vulputate lectus. Aenean libero elit, eleifend id, tincidunt id, tristique eu, tortor. Pellentesque urna dolor, placerat a, pharetra eget, congue ut, ligula. Sed mi. Nunc volutpat. Donec pharetra accumsan lacus. Integer pede orci, vehicula vitae, porttitor id, pulvinar vel, nisi. Aliquam mauris ligula, eleifend sit amet, eleifend sit amet, luctus at, turpis. Sed neque orci, tincidunt id, tempus condimentum, eleifend a, nisl. Etiam auctor. Donec lectus lacus, consequat ac, ultrices venenatis, imperdiet vel, erat. In porttitor augue at tellus commodo pharetra.</p>
        <p>Sed non nibh. Sed sapien ipsum, fringilla condimentum, consectetuer vitae, convallis eu, urna. Aenean id elit eu nulla aliquet congue. Sed fringilla nonummy nisi. Donec aliquet. Quisque varius. Vivamus ut nulla. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Integer lacinia. In leo nulla, molestie ac, dignissim sed, pulvinar at, odio. Duis sit amet augue.</p>
        </div><!--end of infoSection-->
      </div><!--end of main-->
    	<?php require "../includes/footer.html"; ?>
    </div><!--end of content-->
</body>
</html>
