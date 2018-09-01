<?php
    if (isset($_GET[firstName]) && !empty($_GET[firstName]) &&
        isset($_GET[lastName]) && !empty($_GET[lastName]) &&
        isset($_GET[email]) && !empty($_GET[email])) {
        print('Hello, ' . htmlspecialchars($_GET[firstName]) . ' ' . htmlspecialchars($_GET[lastName]) . '!<br>');
        print('Your email address is ' . htmlspecialchars($_GET[email]) . '.');
        exit;
    }
    print('Try that again. <a href="index.php">Back</a>' . '.');
?>