<!DOCTYPE html>
<html>
  <head>    	
    <meta charset="utf-8" />
    <title>uinku.com | Endless Runner</title>
    <link rel="icon" type="image/png" href="../favicon.png" />
    <link rel="stylesheet" href="../css/site.css" type="text/css" />
		<script type="text/javascript" src="../js/jquery-1.5.2.min.js"></script>          
    <script type="text/javascript" src="../js/index.js"></script>
    <script type="text/javascript" src="../js/processing.min.js"></script>
  </head>
  <?php flush(); ?>
  <body>
    <div id="holder"><div id="background"></div></div> 
    <div id="content">
      <?php require "../includes/header.html" ; ?>
      <div class="subheader">
          <ul>
              <li><span>Endless Runner</span></li>
          </ul>
      </div>
      <div class="main">
        <div class="infoSection">
        	<div class="game">
        		<canvas id="myCanvas" width="400px" height="400px" data-processing-sources="/js/endlessRunner.js" ></canvas>
        	</div>
        </div><!--end of infoSection-->
      </div><!--end of main-->      
      <?php require "../includes/footer.html"; ?>
    </div><!--end of content-->
		</script>
	</body>
</html>