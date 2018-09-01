<?php session_start(); ?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Login</title>
		<base url="http://www.uinku.com/" />
	</head>
  <?php flush(); ?>
	<body>
		<?
			session_start();
			
			// check if form is submitting to itself and all fields are filled out
			if ( isset($_POST["username"]) && isset($_POST["password"]) &&
				!empty($_POST["username"]) && !empty($_POST["password"]) ): ?>
			<?
			// connect to mysql
			$connect = mysql_connect("mysql12.000webhost.com","a8884181_fake","asdf1234");
			if (!$connect)
			{
				die('Could not connect: ' . mysql_error());
			}
			else
			{
				// connect to the correct database
				mysql_select_db("a8884181_1", $connect);
				
				/* removed entry code, to be used for registration page
				// cleanse the data for entry
				$sql = sprintf("INSERT INTO users
				VALUES ('%s', '%s')",
				mysql_real_escape_string($_POST[username]),
				mysql_real_escape_string($_POST[password]) );
				*/
				
				// prep sql query
				$sql = sprintf("SELECT 1 FROM users WHERE username='%s' AND password='%s'",
				mysql_real_escape_string($_POST[username]),
				mysql_real_escape_string($_POST[password]) );
				

				// check that the query executed
				$result = mysql_query($sql, $connect);
				if($result === FALSE)
				{
					die("Error: " . mysql_error());
				}
				// check the database for user/pass combination
				elseif (mysql_num_rows($result) == 1)
				{
					$_SESSION["loggedin"] = TRUE;
					$_SESSION["user"] = $_POST[username];
					echo "<p>You are now logged in.</p>";
				}
				else
				{
					echo "<p>Invalid username/password.</p>";
				}
			}
			// close connection to mysql
			mysql_close($connect);
			
			else:
				// if any fields are blank, warn the user
				if ( isset($_POST["username"]) || isset($_POST["password"]) )
				{
					echo "You must fill out all fields.";
				}
				// proceed to form
				?>
				<form action="login.php" method="post">
					<table>
						<tr>
							<td>Username:</td>
							<td>
								<input type="text" name="username" />
							</td>
						</tr>
						<tr>
							<td>Password:</td>
							<td>
								<input type="password" name="password" />
							</td>
						</tr>
						<tr>
							<td>
								<input type="submit" value="Submit" />
							</td>
							<? if ($_SESSION["loggedin"] == TRUE ): ?>
							<td>
								<button type="button" value="Log Out">Log Out</button>
							</td>
							<? endif; ?>
						</tr>
					</table>
				</form>
			<? endif;
		?>
		<a href="login.php">Login</a><br />
		<a href="afterlogin.php">Next</a>
	</body>
</html>