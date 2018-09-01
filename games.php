<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <title>uinku.com | Games</title>
    <link rel="icon" type="image/png" href="http://uinku.com/favicon.png" />
    <link rel="stylesheet" href="/css/site.css" type="text/css" />
		<script type="text/javascript" src="/js/jquery-1.5.2.min.js"></script>          
    <script type="text/javascript" src="/js/index.js"></script> 
  </head>
  <?php flush(); ?>
  <body>
    <div id="holder"><div id="background"></div></div> 
    <div id="content">
      <?php require "includes/header.html" ; ?>
      <div class="subheader">
          <ul>
              <li><span>Games</span></li>
          </ul>
      </div>
      
      <div class="main">
					<?php
          // print out all games divided into categories 
          $xml = simplexml_load_file("includes/gamesList.xml");
          if ($xml) {
						// print each game category
            foreach ($xml->children() as $category) {
							if ($category->child != null) {
								print '<div class="infoSection">';
								print '<div class="gameLinkSection">';
								print '<h1>' . $category['type'] . '</h1><ul>';
								// print each game as a link using its display name and thumbnail
								foreach ($category->children() as $game) {
									print '<div class="gameLink">';
									print '<a href="/games/' . $game->fileName . '.php">';
									print '<li>' . $game->displayName . '<br>';
									print '<img src="/images/games/' . $game->fileName . '_thumb.jpg"></li></a></div>';
								}							
								print '</ul></div><!--end of gameLinkSection--></div><!--end of infoSection-->';
							}
            }
          }
          ?>
          <div class="infoSection">
          <div class="gameLinkSection">
            <h1>Unity Web Player</h1><br>
          	<ul>
              	<div class="gameLink">
                <a href="/games/LudumDare/LD32.html">
              		<li>Ludum Dare 32 - An Unconventional Weapon<br>
                  <img src="/images/games/LD32_thumb.jpg">
                  </li>
                 </a>
                </div>
              	<div class="gameLink">
                <a href="/games/uinku_FemaleLinkJam_webPlayer.html">
                	<li>Female Link Jam<br>
                	<img src="/images/games/FemaleLinkJam_thumb.jpg">
                  </li>
                </a>
              	</div>
              </li>
            </ul>
           </div>
          </div>
      </div><!--end of main-->
      
      <?php require "includes/footer.html"; ?>
    </div><!--end of content-->
  </body>
</html>
