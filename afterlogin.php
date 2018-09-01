<?php session_start(); ?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>after login</title>
		<base url="http://www.uinku.com/" />
	</head>
  <?php flush(); ?>
	<body>
		<? if ($_SESSION["loggedin"] == TRUE )
		{
			echo "Welcome back " . $_SESSION["user"];
		}
		else
			echo "You are not logged in.";
		?>
		<a href="login.php">Login</a>
	</body>
</html>