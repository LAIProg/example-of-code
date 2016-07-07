<?
$id = $_POST['id'];
$sublesson_num = $_POST['sublesson_num'];
$login = $_POST['login'];
mysql_connect('localhost', 'root', '1mqkaoZ056');
mysql_select_db('english');
mysql_set_charset('utf8');
$progress =mysql_fetch_row(mysql_query("SELECT progress, words_star FROM users WHERE login='$login'"));
$star_array = explode("\r\n", $progress[1]);
$star = substr($star_array[$id-1], ($sublesson_num-1)*6, 6);
$result = mysql_query("SELECT eng, rus, comm, transc FROM words WHERE id=$id AND sublesson_num=$sublesson_num");
for ($i=0; $i<20; $i++) $word[$i] = mysql_fetch_row($result);
echo json_encode(array($word, $star, $progress[0]))
?>