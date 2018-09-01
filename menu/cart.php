<?php
session_start();

// load menu
if (file_exists('menu.xml')) {
	$menu = simplexml_load_file('menu.xml');
}

// print a link back to the menu
function printMenuLink() {
	print '<br><br><a href="/menu/menu.php">Back to Menu</a>';
}

// unset cart in session
function clearCart() {
	unset($_SESSION['cart']);
}

// print a button that entirely removes an item from the cart
function removeButton($item) {
	print '<form action="' . htmlspecialchars($_SERVER['PHP_SELF']) . '" method="post">';
	print '<input type="text" name="item" value="' . $item . '" class="hidden">';
	print '<input type="submit" name="remove" value="Remove"></form>';	
}

// prints item information
function printItemWithSubtotal($itemKey, $count, $isEditable = false) {	
	global $menu;
	//print 'itemKey: ' . $itemKey . '<br>';
	$keys = explode(';', $itemKey);
	//print count($keys) . '<br>';
	$path = '//category[@name="' . $keys[0] . '"]/subcategory[@name="' . $keys[1] . '"]/item[name="' . $keys[2] . '"]/prices/' . $keys[3];
	//print $path . '<br>';
	
	// set price
	$p = $menu->xpath($path);
	if ($p) {		
		$p = intval($p[0]);
	} else {
		exit('Price not found.');
	}
	$price = number_format($p / 100, 2);
	$subtotal = number_format($price * $count, 2);
	$subcategory = htmlspecialchars($keys[1]);
	$itemName = htmlspecialchars($keys[2]);
	$size = htmlspecialchars($keys[3]);
	
	// option
	if (isset($keys[4])) {
		$subcategory = $keys[4];
	}
	
	// start form
	if ($isEditable) {
		print '<form action="' . htmlspecialchars($_SERVER['PHP_SELF']) . '" method="post">';
	}	
	
	// print item
	print $subcategory . ' - ' . $itemName . ', ' . $size . ' $' . $price . ' x ';
	if ($isEditable) {
		print '<input type="text" name="item" value="' . $itemKey . '" class="hidden">';
		print '<input type="number" name="count" value="' . $count . '" class="count" min="0" max="10" required>';
	} else {
		print $count;
	}
	print ' = $' . $subtotal;	
	
	// end form
	if ($isEditable) {
		print '<input type="submit" name="update" value="Update"></form>';
	}
	
	return $subtotal;
}

// used to title the webpage
$title = 'Cart';

// validate form
if (isset($_POST)) {
	// clear cart
	if (isset($_POST['clearCart'])) {
		clearCart();
	}
	// print checkout page
	else if (isset($_POST['checkout']) && isset($_SESSION['cart']) && count($_SESSION['cart']) > 0) {
		// print all items in cart with subtotal
		print 'You purchased the following item(s):<br><br>';	
		$total = 0;
		foreach($_SESSION['cart'] as $item => $count) {
			print "&nbsp;&nbsp;&nbsp;&nbsp;";
			$total += printItemWithSubtotal($item, $count);
			print '<br>';
		}
		// total
		print '<br>Total: $' . number_format($total, 2) . '<br><br>';
		// thank you message
		print 'Thank you for shopping with Three Aces!';
		// clear cart and set title signifying checkout
		clearCart();
		$title = 'Checkout';
	}
	// remove
	else if (isset($_POST['remove'])) {
		if (!isset($_POST['item'])) {
			return;
		}
		$item = $_POST['item'];
		if (isset($_SESSION['cart'][$item])) {
			unset($_SESSION['cart'][$item]);
		}
	}
	// update
	else if (isset($_POST['update'])) {
		/*// debug update post
		print '<pre>';
		print_r($_POST);
		print '</pre>';*/
		
		// confirm post variables
		if (!isset($_POST['item']) || !isset($_POST['count'])) {
			exit('Item could not be updated.');
		}
		$item = $_POST['item'];
		$count = intval($_POST['count']);
		// make sure item exists in cart
		if (isset($_SESSION['cart'][$item])) {
			if ($count > 0) {
				$_SESSION['cart'][$item] = $count;
			} else {
				unset($_SESSION['cart'][$item]);
			}			
		}
	}
}

// print non checkout page depending of whether the cart has items in it
print '<html><head><title>' . $title . '</title><link type="text/css" rel="stylesheet" href="../css/menu.css"></head><body>';

if (isset($_SESSION['cart']) && count($_SESSION['cart']) > 0) {
	// print items in cart
	$total = 0;
	print 'Items:<br><br>';
	foreach($_SESSION['cart'] as $item => $count) {
		print "&nbsp;&nbsp;&nbsp;&nbsp;";
		$total += printItemWithSubtotal($item, $count, true);
		removeButton($item);
		print '<br>';
	}
	// total
	print '<br>Total: $' . number_format($total, 2) . '<br><br>';
	
	// clear cart button
	print '<form action="' . htmlspecialchars($_SERVER['PHP_SELF']) . '" method="post">';
	print '<input type="submit" name="clearCart" value="Clear Cart"></form>';
	// checkout button
	print '<form action="' . htmlspecialchars($_SERVER['PHP_SELF']) . '" method="post">';
	print '<input type="submit" name="checkout" value="Checkout"></form>';
	// menu back link
}
else if (!isset($_POST['checkout'])) {
	print 'Nothing in cart.<br>';	
}
printMenuLink();

print '</body></html>';
?>