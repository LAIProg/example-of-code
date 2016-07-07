<?
mysql_connect('localhost', 'root', '1mqkaoZ056');
mysql_select_db('english');
mysql_set_charset('utf8');
$start = $_POST['lesson_start_number'];
$end = $start+$_POST['kol']-1;
$login = $_POST['login'];
$result = mysql_query("SELECT lesson_name_eng, lesson_name_rus FROM lesson_list WHERE id BETWEEN $start AND $end");
$progress = mysql_fetch_row(mysql_query("SELECT progress, sublesson_star FROM users WHERE login='$login'"));
$star = array();
for ($i=0; $i<$_POST['kol']; $i++) {
	$vrem = mysql_fetch_row($result);
	$lesson_name_eng[$i] = $vrem[0];
	$lesson_name_rus[$i] = $vrem[1];
}
for ($i=0; $progress[0]>$end*5-5?$i<$_POST['kol']:$i<=ceil($progress[0]/5)-$start; $i++) {
	$star[$i] = 0;
	for ($j=0; $j<5; $j++) if (substr(substr($progress[1], ($start-1+$i)*5, 5), $j, 1) == '1') $star[$i]++;
}
echo json_encode(array($lesson_name_eng, $lesson_name_rus, $progress[0], $star))
?>