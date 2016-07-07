var timer;	//переменная таймера

$(function() {
	
	
/*		Выкатывание - закатывание профиля		*/
	$('.header>div[profile]').data('profile_open', '0').on('click', function() {
		if ($(this).data('profile_open') == '0') {
			$(this).data('profile_open', '1').off('mouseleave');
			$('.header>div[profile]>img').css({borderColor: '#ccc', backgroundColor: '#fff', boxShadow: '0 0 10px #bbb'});
			$('.header>div[profile]>div').show();
			$('.profile').stop().slideDown()
		}
		else {
			$(this).data('profile_open', '0');
			$('.profile').stop().slideUp(function() {
				$('.header>div[profile]>div').hide();
				$('.header>div[profile]>img').css({borderColor: 'transparent', backgroundColor: 'transparent', boxShadow: 'none'});
				$('.header>div[profile]').on('mouseleave', function() {$('.header>div[profile]>img').css('borderColor', 'transparent')})
			})
		}
	});

/*		Наведение мыши на кнопки и динамик		*/
	$('.main').on('mouseenter', '.button', function() {$(this).css('opacity', 0.8)})
		.on('mouseleave', '.button', function() {$(this).css('opacity', 1)})
		.on('mouseenter', '.speaker', function() {$(this).css('opacity', 0.8)})
		.on('mouseleave', '.speaker', function() {$(this).css('opacity', 1)})
		.data('open_next_level', 0); //Нужно ли делать анимацию открытия следующего урока

/*		Управление формой "связаться"		*/
	$('.feedback>img').on('click', function() {$('.feedback').animate({bottom: '35px', opacity: 0}, 'fast', function() {$(this).hide()})});
	$('.bottom>p[feedback]').on('click', function() {$('.feedback').show().animate({bottom: '75px', opacity: 1}, 'fast')});
	$('.feedback input[type="text"]').on({focus: function() {if ($(this).val() == 'Введите ваш адрес эл. почты') $(this).css('color', '#555').val('')}, blur: function() {if ($(this).val() == '') $(this).css('color', '#aaa').val('Введите ваш адрес эл. почты')}});
	$('.feedback textarea').on({focus: function() {if ($(this).val() == 'Введите текст сообщения') $(this).css('color', '#555').val('')}, blur: function() {if ($(this).val() == '') $(this).css('color', '#aaa').val('Введите текст сообщения')}});
	

		
/*		Запуск с места последнего пройденного задания		*/
	$.post('profile_statistic_update.php', {login: $('.header>p[login]').text()}, function(data) {
		$('.profile>p[progress]>span').text(data[0]+' %');
		$('.profile>p[star]>span').text(data[1]+' / 200');
		var kol = $(window).height()>650?Math.floor(($(window).height()-155)/165)*3:9; //Количество уроков на экране
		lesson_list_load(Math.ceil(data[2]/(kol*5)))
	}, 'json')

	




})

/*		Загрузка списка уроков		*/
function lesson_list_load(lesson_page) {
	var kol = $(window).height()>650?Math.floor(($(window).height()-155)/165)*3:9; //Количество уроков на экране
	var lesson_start_number = (lesson_page-1)*kol+1;
	$('.main').html('<div class="lesson_page_switch"></div>');
	$(window).height()<650?$('.lesson_page_switch').css('bottom', 0):$('.lesson_page_switch').css('bottom', '15px');
	for (var i=1; i<=Math.ceil(40/kol); i++) $('.lesson_page_switch').append('<p>'+i); //40 - Количество уроков
	$('.lesson_page_switch>p').eq(lesson_page-1).attr('active', '');
	$('.lesson_page_switch>p').on('click', function() {
		var vrem=Number($(this).text());
		$('.main').fadeOut('fast', function() {$('.lesson_page_switch>p').removeAttr('active'); lesson_list_load(vrem)})
	})
	if (40-kol*lesson_page<0) kol=40-kol*(lesson_page-1);
	$.post('lesson_list.php', {lesson_start_number: lesson_start_number, kol: kol, login: $('.header>p[login]').text()}, function(data) {
		var last_open_lesson = $('.main').data('open_next_level')?Math.ceil(data[2]/5)-1:Math.ceil(data[2]/5);
		for (var i=0; i<kol; i++) {
			$('.main').append('<div class="lesson"></div>');
			$('.lesson').eq(i).html('<p number>'+(lesson_start_number+i)+'.<p eng>'+data[0][i]+'<p rus>'+data[1][i]+'<div footer></div>');
			if (data[3][i] == null) for (var j=0; j<5; j++) $('.lesson>div[footer]').eq(i).append('<img src="image/star_medium_blank.png">');
			else {
				for (var j=0; j<data[3][i]; j++) $('.lesson>div[footer]').eq(i).append('<img src="image/star_medium.png">');
				for (var j=data[3][i]; j<5; j++) $('.lesson>div[footer]').eq(i).append('<img src="image/star_medium_blank.png">');
			}
			lesson_start_number+i>last_open_lesson?$('.lesson').eq(i).append('<img src="image/padlock.png">'):$('.lesson').eq(i).attr('enable','')
		}
		if ($(window).height()<650) {
			for (var i=0; i<Math.ceil(kol/3); i++) 
				for (var j=0; j<3; j++) $('.lesson').eq(i*3+j).css({left: j*335, top: i*155+15}).data('position', i*155+15)
		}
		else {		
			for (var i=0; i<Math.ceil(kol/3); i++) 
				for (var j=0; j<3; j++) $('.lesson').eq(i*3+j).css({left: j*335, top: i*165+25}).data('position', i*165+25)
		}	
		$('.main').fadeIn(function() {
			$('.lesson[enable]').hover(function() {$(this).stop().animate({top: $(this).data('position')-3, boxShadow: '0 0 10px #bbb'}, 'fast')}, function() {$(this).stop().animate({top: $(this).data('position'), boxShadow: 'none'}, 'fast')}).on('click', lesson_open);
			if ($('.main').data('open_next_level')) {
				var vrem = $('.lesson').index($('.lesson').has('img[src="image/padlock.png"]'));
				$('.lesson>img').eq(0).fadeOut('slow', function() {
					$('.lesson').eq(vrem).attr('enable','').hover(function() {$(this).stop().animate({top: $(this).data('position')-3, boxShadow: '0 0 10px #bbb'}, 'fast')}, function() {$(this).stop().animate({top: $(this).data('position'), boxShadow: 'none'}, 'fast')}).on('click', lesson_open);
					$('.main').data('open_next_level', 0)
				})
			}
		})
	}, 'json')
}

/*		Открытие урока		*/
function lesson_open() {
	$('.info>p[number]').html($(this).children('p[number]').text());
	$('.info>p[name]').html($(this).children('p[eng]').text()+' / <span>'+$(this).children('p[rus]').text()+'</span>');
	$('.info>p').fadeIn();
	$('.main').fadeOut('fast', function() {$(this).load('lessons/lesson.html', function() {$.getScript('lessons/lesson.js')})})
}

/*		Обновление статистики профиля		*/
function profile_statistic_update() {
	$.post('profile_statistic_update.php', {login: $('.header>p[login]').text()}, function(data) {
		$('.profile>p[progress]>span').text(data[0]+' %');
		$('.profile>p[star]>span').text(data[1]+' / 200')
	}, 'json')
}






