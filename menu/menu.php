<?php
session_start();
			
// add to cart inputs helper - creates text input and add button
function addInputs($category, $subcategory, $name, $size) {
	print '<input type="text" name="category" value="'. $category . '" class="hidden">';
	print '<input type="text" name="subcategory" value="'. $subcategory . '" class="hidden">';
	print '<input type="text" name="item" value="'. $name . '" class="hidden">';
	print '<input type="text" name="size" value="'. $size . '" class="hidden">';
	print '<input type="number" name="count" class="count" min="0" max="10" oninput="enableButton(this)">';
}

// print a link to the cart, showing number of items in cart
function printCartLink() {
	$count = 0;
	if (isset($_SESSION['cart'])) {
		foreach ($_SESSION['cart'] as $item) {
			$count += $item;
		}
	}
	print '<a href="/menu/cart.php">Cart: ' . $count . ' item';
	if ($count != 1) {
		print 's';
	}
	print '</a>';
}

// print menu items by category and subcategory
function printMenu() {	
	global $menu;	
	if (isset($menu)) {					
		// print categories
		foreach ($menu->children() as $category) {
			print '<h1 class="category">' . $category['name'] . '</h1>';
			// print subcategories
			foreach ($category->children() as $subcategory) {
				print '<h2 class="subcategory">' . $subcategory['name'] . '</h2>';
				// print item
				foreach ($subcategory as $item) {										
					print $item->name . '<br>';
					// print description if it exists and is not empty
					if (isset($item->description) && !empty($item->description)) {
						print '<span class="description">';
						print $item->description;
						print '</span><br>';
					}
					// print item price
					foreach ($item->children() as $prices) {
						// print each size
						foreach($prices as $price) {
							// start form
							print '<form action="' . htmlspecialchars($_SERVER['PHP_SELF']) . '" method="post">';
							$size = $price->getName();
							print '<span class="price-size">' . $size . '</span> ';
							print '$' . number_format($price / 100, 2);
							addInputs($category['name'], $subcategory['name'], $item->name, $size);
							// print options if any
							if (isset($subcategory['options'])) {							
								print '<br>';
								$options = explode(', ', $subcategory['options']);
								print '<select name ="option">';
								foreach ($options as $option) {
									print '<option value="' . $option . '">' . $option . '</option>';
								}
								print '</select>';
							}
							// add button, end form
							print '<input type="submit" value="Add" disabled></input></form><br>';
						}
					}
					print '<br>';
				}
			}
			print '<br>';
		}
	} else {
		exit('Failed to load menu.xml.');
	}
}

// create cart array
if (!isset($_SESSION['cart'])) {
	$_SESSION['cart'] = array();
}

// create menu simple xml object from file
if (file_exists('menu.xml')) {
	$menu = simplexml_load_file('menu.xml');
}

// form validation
if (!empty($_POST)) {
	//debug post variable
	print '<pre>';
	print_r($_POST);
	print '</pre>';
	
	// exit if any variable is not set
	if (!isset($_POST['category']) || !isset($_POST['subcategory']) || !isset($_POST['item']) || !isset($_POST['count']) || !isset($_POST['size'])) {		
		exit('Item query missing argument.');
	}
	
	// easy reference variables
	$category = $_POST['category'];
	$subcategory = $_POST['subcategory'];
	$item = $_POST['item'];
	$count = intval($_POST['count']);
	$size = $_POST['size'];
	$option;
	
	// TODO use xml doc, extract any subcategories with options, add to array, compare
	
	// items with options
	if (($subcategory == 'Spaghetti or Ziti' || $subcategory == 'Homemade Lasagna, Ravioli or Manicotti')) {
		if (!isset($_POST['option'])) {
			exit('Option missing.');
		}
		$option = $_POST['option'];
		// debug option
		//print 'option: ' . $option . '<br>';
	}
	
		
	// only add items on the menu to cart
	$path = '//category[@name="' . $category . '"]/subcategory[@name="' . $subcategory . '"]/item[name="' . $item . '"]';
	$result = $menu->xpath($path);
	if ($result) {
		// debug result
		//print 'found item: ' . $result[0]->name . '<br>';
		$key = join(';', array($category, $subcategory, $item, $size));
		if (isset($option)) {
			//print 'option is set' . '<br>';
			$key .= ';' . $option;
		}
		// debug key
		//print 'key: ' . htmlspecialchars($key);
		
		// add key if not already in cart, else increment count
		if (!isset($_SESSION['cart'][$key])) {
			$_SESSION['cart'][$key] = $count;
		} else {
			$_SESSION['cart'][$key] += $count;
		}
	} else {
		print 'Item not found.';
	}
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Menu</title>
        <link type="text/css" rel="stylesheet" href="../css/menu.css">
    </head>
    <body>
    	<div>
      	<?php printCartLink() ?>
      </div>
      <div id="menu">
        <h1 class="category">Menu</h1>
        <?php	printMenu() ?>
      </div>
    <script type="text/javascript" src="../js/jquery-1.5.2.min.js"></script>
    <script>
			function enableButton(e) {
				//console.log(e.value);
				var val = parseInt(e.value);
				
				// make sure parse int was valid
				if (!val) {
					val = 0;
				}
				else {
					val = Math.floor(val);
					// cap max value
					if (val > e.max) {
							val = e.max;					
					}
				}
				e.value = val;
				
				// handle submit button enabling
				if (val > 0) {
					console.log($(e).nextAll("input[type='submit']"));
					$(e).nextAll("input[type='submit']").attr('disabled', false);
				}
				else if (val === 0) {
					console.log($(e).nextAll("input[type='submit']"));
					$(e).nextAll("input[type='submit']").attr('disabled', true);
				}
			}
			
			function main() {
			}
			$(document).ready(main);
		</script>
    </body>
</html>