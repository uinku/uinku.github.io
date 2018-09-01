<?php
// get quote
$handle = fopen("http://download.finance.yahoo.com/d/quotes.csv?s={$_GET['symbol']}&f=ell1", "r");

if ($handle !== false)
{
	$data = fgetcsv($handle);
  if ($data !== false)
	{
  	//print_r($data);
		print($data[2]);
	}
  fclose($handle);
}
?>