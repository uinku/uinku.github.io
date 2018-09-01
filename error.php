<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
    <meta name="author" content="James Winkler" />
		<meta charset="utf-8" />
  	<title>uinku.com</title>
    <link rel="icon" type="image/png" href="http://uinku.com/favicon.png" />
    <link rel="stylesheet" href="/css/site.css" type="text/css" />
    <script type="text/javascript" src="/js/index.js"></script>
    <script type="text/javascript" src="/js/waitingRoom.js"></script>
	</head>
  <?php flush(); ?>
	<body>
    <div id="holder"><div id="background"></div></div> 
    <div id="content">
      <?php require "includes/header.html"; ?>
      <div class="main">
      	<div class="infoSection">
					<?php
            $status = $_SERVER['REDIRECT_STATUS']; 
            $codes = array( 
              403 => array('403 Forbidden', 'The server has refused to fulfill your request.'), 
              404 => array('404 Not Found', 'The document/file requested was not found.'), 
              405 => array('405 Method Not Allowed', 'The method specified in the Request-Line is not allowed for the specified resource.'), 
              408 => array('408 Request Timeout', 'Your browser failed to sent a request in the time allowed by the server.'), 
              500 => array('500 Internal Server Error', 'The request was unsuccessful due to an unexpected condition encountered by the server.'), 
              502 => array('502 Bad Gateway', 'The server received an invalid response from the upstream server while trying to fulfill the request.'), 
              504 => array('504 Gateway Timeout', 'The upstream server failed to send a request in the time allowed by the server.') 
            ); 
                     
            $title = $codes[$status][0]; 
            $message = $codes[$status][1]; 
            if ($title == false || strlen($status) != 3) { 
                $message = 'Please supply a valid status code.'; 
            } 
            
            echo '<p><h1>' . $title . '</h1></p>' .  '<p>' . $message . '</p>';			
          ?>
        </div>
      </div><!--end of main-->
    	<?php require "includes/footer.html"; ?>
    </div><!--end of content-->
	</body>
</html>