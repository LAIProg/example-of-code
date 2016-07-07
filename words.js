function words() {
	
	var word=[];
	for (var i=0;i<20;i++) word[i]=[]; //массив слов
	var word_order=[]; //массив с порядком слов
	var answ_order=[];	//массив с порядком ответов
	var w_progress; //прогресс пройденных этапов в изучении слов для каждого подурока
	var sublesson_pos = $('.sublesson_list>div[sublesson]').index($('.sublesson_list>div[active]').get(0)); //позиция отрытого подурока
	
/*		Загрузка слов, прогресса		*/
	$.post('lessons/words/words.php', {id: Number($('.info>p[number]').text()), sublesson_num: Number($('.sublesson_list>div[active]').attr('sublesson_num')), login: $('.header>p[login]').text()}, function(data) {
		var j = 0; //номер последнего открытого этапа
		word = data[0];
		$('.sublesson_stage').html('<link rel="stylesheet" type="text/css" href="lessons/words/words.css"><div subles_stage="0" active enable></div>');
		if (data[1].charAt(0) == 1) $('.sublesson_stage>div[subles_stage="0"]').append('<img src="image/star_small.png">');
		for (var i=1; i<6; i++) {
			$('.sublesson_stage').append('<div subles_stage_small="'+i+'"></div><div subles_stage_small="'+i+'"></div><div subles_stage_small="'+i+'"></div><div subles_stage="'+i+'"></div>');
			if (data[1].charAt(i) != '?') {
				$('.sublesson_stage>div[subles_stage]').eq(i).attr('enable', '');
				$('.sublesson_stage>div[subles_stage_small="'+i+'"]').css('backgroundColor', '#8fbf8f');
				if (data[1].charAt(i) == 1) $('.sublesson_stage>div[subles_stage]').eq(i).append('<img src="image/star_small.png">');
				j++
			}
		}
		$('.sublesson_stage>div[subles_stage]:not([active])').css('boxShadow', 'none');
		data[2] > (Number($('.info>p[number]').text())-1)*5+Number($('.sublesson_list>div[active]').attr('sublesson_num'))?w_progress = 6:w_progress = j; // 6 - означает что открыт следующий подэтап
		$('.sublesson_stage>div[subles_stage]>img').css('display', 'block');
		$('.sublesson_stage').off().on('click', 'div[enable]', function() {	//Переключение этапов
			var vrem=Number($(this).attr('subles_stage'));
			if($('.w_body').attr('w_stage')!=vrem) {
				$('.sublesson_stage>div[active]').animate({boxShadow: 'none'}, 'fast', function() {$(this).removeAttr('active').css('boxShadow', 'none')});
				if($('.progress>div[progress_scale]>div').height()) $('.progress>div[progress_scale]>div').animate({height: 0}, 'fast', function() {$('.progress>p').text('0%')});
				if($('.w_body').attr('w_stage')<vrem) $('.w_body').animate({left: -1*(770-$('.w_body').width())/2, opacity: 0}, 'fast', function() {w_stage_switch(vrem, true)});
				else $('.w_body').animate({left: (770-$('.w_body').width())/2, opacity: 0}, 'fast', function() {w_stage_switch(vrem, false)})
			}
		})
		$('.sublesson').html('<div class="w_body" w_stage="0"><div w_body></div><img src="image/speaker.png" class="speaker"><div class="timer"></div><div w_footer></div></div>');
		$('.speaker').on('click', w_voice);
		$('.timer').hide();
		$('.w_body').data('w_number', 0).data('mistake', 0);
		$('.w_body>div[w_body]').load('lessons/words/0.html', function() {
			word_sort(0);
			$('.sublesson').fadeIn(function() {
				$('.sublesson_list>div[enable]:not([active])').hover(function() {$(this).css('backgroundColor', '#ebe5dd')}, function() {$(this).css('backgroundColor', 'transparent')}).on('click', sublesson_switch)
			});
			$('.sublesson_stage').fadeIn()	
		})
	}, 'json');

/*		Переключения этапов		*/
	function w_stage_switch(w_stage, flag) {
		$('.w_body>div[w_body]').load('lessons/words/'+w_stage+'.html', function() {
			$('.w_body').attr('w_stage', w_stage).data('w_number', 0).data('mistake', 0);
			word_sort(w_stage);
			w_stage==5?$('.speaker').hide():$('.speaker').show();
			!w_stage?$('.timer').hide():$('.timer').show();
			flag?$('.w_body').css({left: (770-$('.w_body').width())/2, opacity: 0}).animate({left: 0, opacity: 1}, 'fast'):$('.w_body').css({left: -1*(770-$('.w_body').width())/2, opacity: 0}).animate({left: 0, opacity: 1}, 'fast');
			$('.sublesson_stage>div[subles_stage]').eq(w_stage).attr('active', '').animate({boxShadow: '0 0 15px #c60'}, 'fast')		
		})
	}

/*		Случайный порядок слов		*/
	function word_sort(w_stage) {
		var pos, vrem;
		for (var i=0; i<20; i++) word_order[i] = i;
		if (w_stage) {
			for (i=0; i<20; i++) {
				pos=Math.floor(Math.random()*20);
				vrem=word_order[i];
				word_order[i]=word_order[pos];
				word_order[pos]=vrem
			}
		}
		next_word(w_stage)
	}

/*		Вывод следующего слова		*/
	function next_word(w_stage) {
		clearTimeout(timer);
		answ_order=[];
		var flag, pos;
		var vrem=$('.w_body').data('w_number');
		if (w_stage==1||w_stage==3||w_stage==5) {
			for (var i=0; i<5; i++) {
				while (answ_order[i]==undefined) {
					flag=0;
					pos=Math.floor(Math.random()*20);
					for (var j=0; j<i; j++) if (pos==answ_order[j]) flag=1;
					if (!flag) answ_order[i]=pos
				}
			}
			flag=0;
			for (i=0; i<5; i++) if (word_order[vrem] == answ_order[i]) flag=1;
			if(!flag) {
				pos=Math.floor(Math.random()*5);
				answ_order[pos] = word_order[vrem]
			}
		}
		$('.w_body>div[w_footer]').text('');
		if (w_stage!=0) {
			$('.w_body>div[w_body]>p[res]').css('color', '#fff').html('&nbsp;');
			$('.answ[w_answ]').removeClass('correct incorrect')
		}
		switch (w_stage) {
			case 0: {
				$('.w_body>div[w_body]>p[eng]').text(word[vrem][0]);
				$('.w_body>div[w_body]>p[transc]').text(word[vrem][3]);
				$('.w_body>div[w_body]>p[rus]').text(word[vrem][1])
			}
			break
			case 1:
			case 3: {
				$('.w_body>div[w_body]>p[transc]').text(word[word_order[vrem]][3]);
				for (i=0; i<5; i++) {
					$('.answ[w_answ]>p[rus]').eq(i).text(word[answ_order[i]][1]);
					$('.answ[w_answ]>p[comm]').eq(i).text(word[answ_order[i]][2])
				}
				if (w_stage == 1) {
					$('.w_body>div[w_body]>p[eng]').text(word[word_order[vrem]][0]);
					w_timer(20, w_stage)
				}
				else w_timer(15, w_stage)
			}
			break
			case 2: {
				$('.w_body>div[w_body]>p[eng]').html(word[word_order[vrem]][0]+'&nbsp;&nbsp;&rarr;&nbsp;&nbsp;<span></span>');
				if (!Math.floor(Math.random()*2)) vrem=Math.floor(Math.random()*20);
				$('.w_body>div[w_body]>p[eng]>span').text(word[word_order[vrem]][1]);
				w_timer(10, w_stage)
			}
			break
			case 4: {
				letter_order=[];
				var vrem_letter_order = [];
				$('.w_body>div[w_body]>div[w_hole]').text('');
				$('.w_body>div[w_body]>div[w_letter]').text('');
				for (i=0; i<word[word_order[vrem]][0].length; i++) letter_order[i] = vrem_letter_order[i] = i;
				while (letter_order.toString() == vrem_letter_order.toString()) {
					for (i=0; i<word[word_order[vrem]][0].length; i++) {
						pos=Math.floor(Math.random()*word[word_order[vrem]][0].length);
						flag=letter_order[i];
						letter_order[i]=letter_order[pos];
						letter_order[pos]=flag
					}
				}
				$('.w_body>div[w_body]>p[rus]').text(word[word_order[vrem]][1]);
				for (i=0; i<word[word_order[vrem]][0].length; i++) {
					$('.w_body>div[w_body]>div[w_hole]').append('<div></div>');
					$('.w_body>div[w_body]>div[w_letter]').append('<div class="answ">'+word[word_order[vrem]][0].charAt(letter_order[i])+'</div>');
					$('.w_body>div[w_body]>div[w_letter]>div').eq(i).css({top: '190px', left: (550-35*word[word_order[vrem]][0].length)/2+4+35*i}).attr('pos', letter_order[i])
						.hover(function() {$(this).addClass('answ_mouseenter')}, function() {$(this).removeClass('answ_mouseenter')}).on('click', letter_answer)
				}
				$('.answ[letter_clear]').hover(function() {$(this).addClass('answ_mouseenter')}, function() {$(this).removeClass('answ_mouseenter')}).on('click', w_letter_clear);
				$('.w_body>div[w_body]>div[w_hole]').data('answ_pos', 0).data('answer', '');
				w_timer(word[word_order[vrem]][0].length*3+5, w_stage)
			}
			break
			case 5: {
				$('.w_body>div[w_body]>p[rus]').text(word[word_order[vrem]][1]);
				for (i=0; i<5; i++) $('.answ[w_answ]').eq(i).text(word[answ_order[i]][0]);
				w_timer(10, w_stage)
			}
		}
		if (w_stage!=1&&w_stage!=3) {
			$('.w_body>div[w_body]>div[w_comm]').html('<b></b>'+word[word_order[vrem]][2]);
			if (word[word_order[vrem]][2]!='') $('.w_body>div[w_body]>div[w_comm]>b').text('Пояснение: ')
		}
		$('.button[w_button]').on('click', {w_stage: w_stage}, w_button);
		$('.answ[w_answ]').hover(function() {$(this).addClass('answ_mouseenter')}, function() {$(this).removeClass('answ_mouseenter')}).on('click', {w_stage: w_stage}, w_answ);
		!w_stage?$('.button[w_button]').html('Далее&nbsp;&nbsp;&rarr;'):$('.button[w_button]').text('Не знаю :-(');
		if (w_stage != 5 && $('.profile input[sound]').is(':checked')) w_voice()
	}

/*		Обработка нажатия функциональной кнопки		*/
	function w_button(event) {
		var vrem=$('.w_body').data('w_number');
		if ($(this).text() == 'Не знаю :-(') {
			clearTimeout(timer);
			switch (event.data.w_stage) {
				case 1:
				case 3: {
					var i=0;
					while ($('.answ[w_answ]>p[rus]').eq(i).text() != word[word_order[vrem]][1]) i++;
					$('.answ[w_answ]').eq(i).addClass('correct')		
				}
				break
				case 2: {
					if ($('.w_body>div[w_body]>p[eng]>span').text() == word[word_order[vrem]][1]) $('.answ[w_answ]').eq(0).addClass('correct');
					else {
						$('.answ[w_answ]').eq(1).addClass('correct');
						$('.w_body>div[w_footer]').html(word[word_order[vrem]][0]+'&nbsp;&nbsp;&rarr;&nbsp;&nbsp;'+word[word_order[vrem]][1])
					}				
				}
				break
				case 4: {
					for (var i=0; i<word[word_order[vrem]][0].length; i++) 
						$('.w_body>div[w_body]>div[w_letter]>div').eq(i).off().animate({top: $('.w_body>div[w_body]>div[w_hole]>div').position().top-1, left: $('.w_body>div[w_body]>div[w_hole]>div').eq($('.w_body>div[w_body]>div[w_letter]>div').eq(i).attr('pos')).position().left+1}, 'fast', function() {$(this).addClass('correct')});
						$('.answ[letter_clear]').off()
				}
				break
				case 5: {
					var i=0;
					while ($('.answ[w_answ]').eq(i).text() != word[word_order[vrem]][0]) i++;
					$('.answ[w_answ]').eq(i).addClass('correct')					
				}
			}
			$('.w_body>div[w_body]>p[res]').css('color', '#aaa').text('Правильный ответ:');
			$(this).html('Далее&nbsp;&nbsp;&rarr;');
			$('.answ[w_answ]').removeClass('w_answ_mouseenter').off();
			$('.w_body').data('mistake', $('.w_body').data('mistake')+1)
		}
		else if ($(this).text() == 'Ответить') {
			clearTimeout(timer);
			if ($('.w_body>div[w_body]>div[w_hole]').data('answer')==word[word_order[vrem]][0]) {
				$('.w_body>div[w_body]>div[w_letter]>div').addClass('correct');
				$('.w_body>div[w_body]>p[res]').css('color', '#1f991f').text('Правильно');
				$('.button[w_button]').off('click');
				setTimeout(function() {next_word_button(4)}, 500)
			}
			else {
				$('.w_body>div[w_body]>div[w_letter]>div').addClass('incorrect');
				$('.w_body>div[w_body]>p[res]').css('color', '#cc2929').text('Не правильно');
				$('.w_body>div[w_footer]').html(word[word_order[vrem]][1]+'&nbsp;&nbsp;&rarr;&nbsp;&nbsp;'+word[word_order[vrem]][0]);
				$('.w_body').data('mistake', $('.w_body').data('mistake')+1);
				$(this).html('Далее&nbsp;&nbsp;&rarr;')
			}
			$('.answ[w_answ]').removeClass('w_answ_mouseenter').off();
			$('.answ[letter_clear]').off()
		}
		else {
			$('.button[w_button]').off('click');
			next_word_button(event.data.w_stage)
		}
	}

/*		Функция отработки команды далее		*/
	function next_word_button(w_stage) {
		var vrem=$('.w_body').data('w_number');
		if (sublesson_pos == $('.sublesson_list>div[sublesson]').index($('.sublesson_list>div[active]').get(0))) $('.progress>div[progress_scale]>div').animate({height: (vrem+1)*10}, 'fast', function() {$('.progress>p').text((vrem+1)*5+'%')});
		if (vrem == 19) {
			$('.w_body>div[w_footer]').text('');
			$('.speaker').fadeOut('fast');
			$('.timer').fadeOut('fast');
			$('.w_body>div[w_body]').fadeOut('fast', function() {result(w_stage)})
		}
		else {
			$('.w_body').data('w_number', vrem+1);
			next_word(w_stage)
		}
	}

/*		Обработка нажатия кнопки с ответом		*/
	function w_answ(event) {
		if (event.data.w_stage !=4) clearTimeout(timer);
		var vrem=$('.w_body').data('w_number');
		$(this).removeClass('answ_mouseenter');
		switch (event.data.w_stage) {
			case 1:
			case 3: {
				if ($(this).children('p[rus]').text() == word[word_order[vrem]][1]) {
					$(this).addClass('correct');
					$('.w_body>div[w_body]>p[res]').css('color', '#1f991f').text('Правильно');
					$('.button[w_button]').off('click'); 
					if (event.data.w_stage == 1) setTimeout(function() {next_word_button(1)}, 500)
					else setTimeout(function() {next_word_button(3)}, 500)
				}
				else {
					$(this).addClass('incorrect');
					$('.w_body>div[w_body]>p[res]').css('color', '#cc2929').text('Не правильно');
					var i=0;
					while ($('.answ[w_answ]>p[rus]').eq(i).text() != word[word_order[vrem]][1]) i++;
					$('.answ[w_answ]').eq(i).addClass('correct')
					i=0;
					while ($(this).children("p[rus]").text() != word[i][1]) i++;
					$('.w_body>div[w_footer]').html($(this).children("p[rus]").text()+'&nbsp;&nbsp;&rarr;&nbsp;&nbsp;'+word[i][0]);
					$('.w_body').data('mistake', $('.w_body').data('mistake')+1);
					$('.button[w_button]').html('Далее&nbsp;&nbsp;&rarr;')
				}
			}
			break
			/*case 2: { Показ правильного ответа если выбрал "Не верно" и это оказалось правильно
				var text=$('.w_body>div[w_body]>p[eng]>span').text() == word[word_order[vrem]][1]?'Верно':'Не верно';
				if ($(this).text() == text) {
					$(this).addClass('w_correct');
					$('.w_body>div[w_body]>p[res]').css('color', '#090').text('Правильно');
					if (text == 'Верно') {
						$('.button[w_button]').off('click');
						setTimeout(function() {next_word_button(2)}, 500)
					}
					else $('.button[w_button]').html('Далее&nbsp;&nbsp;&rarr;')
				}
				else {
					$(this).addClass('w_incorrect');
					$('.w_body>div[w_body]>p[res]').css('color', '#c00').text('Не правильно');
					$('.w_body').data('mistake', $('.w_body').data('mistake')+1);
					$('.button[w_button]').html('Далее&nbsp;&nbsp;&rarr;')
				}
				if ($('.w_body>div[w_body]>p[eng]>span').text() != word[word_order[vrem]][1]) $('.w_body>div[w_footer]').html(word[word_order[vrem]][0]+'&nbsp;&nbsp;&rarr;&nbsp;&nbsp;'+word[word_order[vrem]][1])
			}*/
			case 2: {
				var text=$('.w_body>div[w_body]>p[eng]>span').text() == word[word_order[vrem]][1]?'Верно':'Не верно';
				if ($(this).text() == text) {
					$(this).addClass('correct');
					$('.w_body>div[w_body]>p[res]').css('color', '#1f991f').text('Правильно');
					$('.button[w_button]').off('click');
					setTimeout(function() {next_word_button(2)}, 500)
				}
				else {
					$(this).addClass('incorrect');
					$('.w_body>div[w_body]>p[res]').css('color', '#cc2929').text('Не правильно');
					$('.w_body').data('mistake', $('.w_body').data('mistake')+1);
					$('.button[w_button]').html('Далее&nbsp;&nbsp;&rarr;');
					if (text == 'Не верно') $('.w_body>div[w_footer]').html(word[word_order[vrem]][0]+'&nbsp;&nbsp;&rarr;&nbsp;&nbsp;'+word[word_order[vrem]][1])
				}
			}
			break
			case 4: { //Нажатие кнопки "Очистить"
				$('.w_body>div[w_body]>div[w_hole]').data('answ_pos', 0).data('answer', '');
				for (i=0; i<word[word_order[vrem]][0].length; i++)
					$('.w_body>div[w_body]>div[w_letter]>div').eq(i).removeAttr('hole_pos').animate({top: '190px', left: (550-35*word[word_order[vrem]][0].length)/2+4+35*i}, 'fast', function() {$('.button[w_button]').text('Не знаю :-(')}).off()
						.hover(function() {$(this).addClass('answ_mouseenter')}, function() {$(this).removeClass('answ_mouseenter')}).on('click', letter_answer)
			}
			break
			case 5: {
				if ($(this).text() == word[word_order[vrem]][0]) {
					$(this).addClass('correct');
					$('div[w_body]>p[res]').css('color', '#1f991f').text('Правильно');
					$('.button[w_button]').off('click'); 
					setTimeout(function() {next_word_button(5)}, 500)
				}
				else {
					$(this).addClass('incorrect');
					$('.w_body>div[w_body]>p[res]').css('color', '#cc2929').text('Не правильно');
					var i=0;
					while ($('.answ[w_answ]').eq(i).text() != word[word_order[vrem]][0]) i++;
					$('.answ[w_answ]').eq(i).addClass('correct')
					i=0;
					while ($(this).text() != word[i][0]) i++;
					$('.w_body>div[w_footer]').html($(this).text()+'&nbsp;&nbsp;&rarr;&nbsp;&nbsp;'+word[i][1]);
					$('.w_body').data('mistake', $('.w_body').data('mistake')+1);
					$('.button[w_button]').html('Далее&nbsp;&nbsp;&rarr;')
				}
			}
		}
		if (event.data.w_stage != 4) $('.answ[w_answ]').removeClass('w_answ_mouseenter').off()
	}

/*		Нажатие кнопки с буквой		*/
	function letter_answer() {
		var answ_pos = Number($('.w_body>div[w_body]>div[w_hole]').data('answ_pos'));
		$('.w_body>div[w_body]>div[w_hole]').data('answ_pos', answ_pos+1).data('answer', $('.w_body>div[w_body]>div[w_hole]').data('answer')+$(this).text());
		if (answ_pos == word[word_order[$('.w_body').data('w_number')]][0].length-1) $('.button[w_button]').html('Ответить');
		$(this).off().removeClass('answ_mouseenter').attr('hole_pos', answ_pos).animate({top: $('.w_body>div[w_body]>div[w_hole]>div').position().top-1, left: $('.w_body>div[w_body]>div[w_hole]>div').eq(answ_pos).position().left+1}, 'fast')
	}

/*		Очистка одной буквы		*/
	function w_letter_clear() {
		var answ_pos = Number($('.w_body>div[w_body]>div[w_hole]').data('answ_pos'));
		if (answ_pos != 0) {
			$('.w_body>div[w_body]>div[w_hole]').data('answ_pos', answ_pos-1).data('answer', $('.w_body>div[w_body]>div[w_hole]').data('answer').slice(0, answ_pos-1));
			var index = $('.w_body>div[w_body]>div[w_letter]>div').index($('.w_body>div[w_body]>div[w_letter]>div[hole_pos='+(answ_pos-1)+']'));
			$('.w_body>div[w_body]>div[w_letter]>div').eq(index).removeAttr('hole_pos').animate({top: '190px', left: (550-35*word[word_order[$('.w_body').data('w_number')]][0].length)/2+4+35*index}, 'fast', function() {
				$(this).hover(function() {$(this).addClass('answ_mouseenter')}, function() {$(this).removeClass('answ_mouseenter')}).on('click', letter_answer);
				if ($('.button[w_button]').text() == 'Ответить') $('.button[w_button]').html('Не знаю :-(')
			})
		}
	}

/*		Отображение результата		*/
	function result(w_stage) {
		$('.w_body>div[w_body]').load('lessons/words/result.html', function() {
			var star_write = 0;
			if (!$('.w_body').data('mistake')) {
				if ($('.sublesson_stage>div[active]>img').get(0) == undefined) star_write = 1;
				$('.w_body>div[w_body]>p[mistake]').css('color', '#1f991f').text('Ошибок: '+$('.w_body').data('mistake'))
			}
			else $('.w_body>div[w_body]>p[mistake]').css('color', '#cc2929').text('Ошибок: '+$('.w_body').data('mistake'));
			if (!w_stage) $('.w_body>div[w_body]>p[mistake]').hide();
			if ($('.w_body').data('mistake') > 5 || (!star_write && w_stage < w_progress)) {
				if (sublesson_pos == $('.sublesson_list>div[sublesson]').index($('.sublesson_list>div[active]').get(0))) {
					if ($('.sublesson_stage>div[active]>img').get(0) != undefined) $('.w_body>div[w_body]>img[star_blank]').attr('src', 'image/star_big.png');
					$('.w_body>div[w_body]').delay(300).fadeIn(function() {
						$('.answ[w_mistake]').hover(function() {$(this).addClass('answ_mouseenter')}, function() {$(this).removeClass('answ_mouseenter')}).on('click', function() {w_repeat_stage(w_stage)});
						if (w_stage < w_progress) $('.button[w_mistake]').on('click', function() {w_result_next_stage(w_stage, sublesson_pos)});
						else $('.button[w_mistake]').on('click', function() {alert ('Много ошибок!')});
					})
				}
			}
			else {
				var only_star = 1;
				if (w_stage == w_progress) {
					w_progress++;
					only_star = 0
				}
				$.post('lessons/words/words_write_progress.php', {id: Number($('.info>p[number]').text()), sublesson_pos: sublesson_pos, sublesson_num: Number($('.sublesson_list>div[sublesson]').eq(sublesson_pos).attr('sublesson_num')), login: $('.header>p[login]').text(), stage: w_stage, star_write: star_write, only_star: only_star}, function(data) {
					if (data[1]) $('.main').data('open_next_level', 1);
					profile_statistic_update();
					if (sublesson_pos == $('.sublesson_list>div[sublesson]').index($('.sublesson_list>div[active]').get(0))) {
						$('.w_body>div[w_body]').fadeIn(function() {
							$('.answ[w_mistake]').hover(function() {$(this).addClass('answ_mouseenter')}, function() {$(this).removeClass('answ_mouseenter')}).on('click', function() {w_repeat_stage(w_stage)});
							$('.button[w_mistake]').on('click', function() {w_result_next_stage(w_stage, sublesson_pos)});
							if (star_write == 1) w_get_star(w_stage, data[0], sublesson_pos);
							if (!only_star) {
								if (w_stage != 5) w_stage_small(0, w_stage+1);
								else if (sublesson_pos != 4) $('.sublesson_list>div[sublesson]').eq(sublesson_pos+1).animate({opacity: 1}, 'slow', function() {
									$(this).attr('enable', '').css('cursor', 'pointer').hover(function() {$(this).css('backgroundColor', '#f0e8dd')}, function() {$(this).css('backgroundColor', 'transparent')}).on('click', sublesson_switch)
								})
							}
						})
					}
					else if (data[0] == 1) $('.sublesson_list>div[sublesson]').eq(sublesson_pos).append('<img src="image/star_medium.png" star>').children('img[star]').fadeIn('slow')
				}, 'json')
			}
		})
	}

/*		Присвоение звезды в конце урока		*/
	function w_get_star(w_stage, w_sublesson_star, sublesson_pos) {
		$('.w_body>div[w_body]').append('<img src="image/star_big.png" star>');
		$('.w_body>div[w_body]>img[star]').css({top: $('div[w_body]>img[star_blank]').position().top-70, left: $('div[w_body]>img[star_blank]').position().left-70, opacity: 0})
			.animate({top: $('.w_body>div[w_body]>img[star_blank]').position().top, left: $('div[w_body]>img[star_blank]').position().left, width: '70px', opacity: 1}, 'slow', function() {
				$('.sublesson_stage>div[subles_stage="'+w_stage+'"]').append('<img src="image/star_small.png">');
				$('.sublesson_stage>div[subles_stage="'+w_stage+'"]>img').fadeIn('slow', function() {
					if (w_sublesson_star == 1) $('.sublesson_list>div[sublesson]').eq(sublesson_pos).append('<img src="image/star_medium.png" star>').children('img[star]').fadeIn('slow')
				})
			})
	}

/*		Установка доступным следующего этапа		*/
	function w_stage_small(vrem, w_stage) {
		if	(vrem == 3) $('.sublesson_stage>div[subles_stage="'+w_stage+'"]').attr('enable', '');
		else {
			$('.sublesson_stage>div[subles_stage_small="'+w_stage+'"]').eq(vrem).css('backgroundColor', '#8fbf8f');
			setTimeout(function() {w_stage_small(vrem+1, w_stage)}, 80)
		}
	}

/*		Повтор этапа из окна результата		*/
	function w_repeat_stage(w_stage) {
		$('.progress>div[progress_scale]>div').animate({height: 0}, 'fast', function() {$('.progress>p').text('0%')});
		$('.w_body>div[w_body]').fadeOut('fast', function() {
			$('.w_body').data('w_number', 0).data('mistake', 0);
			$(this).load('lessons/words/'+w_stage+'.html', function() {
				if (w_stage!=5) $('.speaker').fadeIn();
				if (w_stage!=0) $('.timer').fadeIn();
				word_sort(w_stage);
				$(this).fadeIn()
			})
		})
	}

/*		Следующий этап из окна результата		*/
	function w_result_next_stage(w_stage, sublesson_pos) {
		if (w_stage == 5) {
			if (sublesson_pos == 4) $('.sublesson_list>div[sublesson_back]').trigger('click');
			else $('.sublesson_list>div[sublesson]').eq(sublesson_pos+1).trigger('click');
		}
		else $('.sublesson_stage>div[enable]').eq(w_stage+1).trigger('click')
	}

/*		Управление таймером		*/
	function w_timer(vrem, w_stage) {
		$('.timer').text(vrem);
		!vrem?$('.button[w_button]').trigger('click', {w_stage: w_stage}, w_button):timer=setTimeout(function() {w_timer(vrem-1, w_stage)}, 1000)
	}

/*		Озвучка		*/
	function w_voice() {
		var voice = new SpeechSynthesisUtterance();
		voice.text = word[word_order[$('.w_body').data('w_number')]][0];
		speechSynthesis.speak(voice);
	}
	
}