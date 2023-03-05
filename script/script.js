"use strict"; // Строгий режим
// ----------------------- JavaScript -----------------------
const bodyBackground = document.body; // body
let gradientBody = {num: 0,
	1: ['#000851','#1CB5E0','#0E5F99'],
	2: ['#0700b8','#00ff88','#0474A2'],
	3: ['#009b9f','#b922c3','#436FAC'],
	4: ['#C33764','#1D2671','#873169'],
	5: ['#1CB5E0','#000851','#0F669F'],
	6: ['#8E2DE2','#0700b8','#4414CB'],
	7: ['#c4c813','#7e07a2','#B1933A'],
	8: ['#31a207','#1372c8','#238C5F'],
}
// gradientBody - Градиент фона и цвет значков
// num - применённый стиль, №:[1 цвет градиента, 2 цвет градиента, цвет значков]
const bodyAnimation = document.querySelector('.body_animation');// canvas
const bodyContainer = document.querySelector('.body__container'); // main
let screenSizeW = (bodyAnimation.width = window.innerWidth); // ширина окна
let screenSizeH = (bodyAnimation.height = window.innerHeight); // высота окна
let vhFix = screenSizeH * 0.01; // фикс для мобильной версии - вписать по высоте без адресной строки
let bodyAnimationCanvas = bodyAnimation.getContext('2d'); // canvas холст для рисования
let numElemBackground = 50; // количество элементов анимации фона
let massElemBackground = []; // массив всех элементов анимации фона
const svgLink = 'http://www.w3.org/2000/svg';
let massAnimLamp = {};
// massAnimLamp объект всех линий анимации Lamp во всех дубликатах, где ключ: 
// num - счёт от 1 до 9 линий; lot - кол-во дубликатов анимации; mass - массив всех линий
let lastTimeFrame = 0; // для выполнения функции через определённое время в цикле requestAnimationFrame
let fixNum = 0; // фикс первого запуска функции gameLoop
const formInRegPage = document.forms['reg-form']; // форма на странице регистрации
const formInLogPage = document.forms['login-form']; // форма на странице залогиниться

const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php"; // серверный скрип с БД https://fe.it-academy.by/AjaxStringStorage2.php
const ajaxListUsers = 'DUDEVICH_GAME_LOOPS_USERS'; // хранение информации пользователей {'ник':{pass:'пароль',lvl: значение}, ...}
let updateAjaxPassword; // пароль доступа к БД
let userInfo = {}; // данные пользователя {nick:'ник',pass:'пароль',lvl: значение}
let cookieUsersInfo = {}; // переменная временного хранения списка пользователей
let keyReg = false; // ключ раздела "регистрация" для асинхронного выполнения регистрации с разделом "загрузка"
let keyLog = false; // ключ раздела "логин" для асинхронного выполнения авторизации с разделом "загрузка"
let keyAjax = false; // служебный ключ AJAX
let cookieUrlPage;
// !!! перенести слушатели и элементы в другое место и добавить снятие слушателей !!!

let formLoginL = formInLogPage.elements['nickname'];
let formPassL = formInLogPage.elements['password'];
formInRegPage.addEventListener('submit',registerUser,false);
formInLogPage.addEventListener('submit',logInUser,false);

// ---------- Проверка поддержки методов / Полифилы ----------
if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = function(){
		return (
			window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			}
		);
	}();
}
if (!window.cancelAnimationFrame) {
	window.cancelAnimationFrame = function(){
		return (
			window.cancelAnimationFrame       ||
			window.webkitCancelAnimationFrame ||
			window.mozCancelAnimationFrame    ||
			window.oCancelAnimationFrame      ||
			window.msCancelAnimationFrame     ||
			console.log('Отмена requestAnimationFrame не требуется')
		);
	}();
}

// ---------- Классы ----------
class elemBackground {
	constructor() {
		this.elemPosX = randomNum(0)*screenSizeW;
		this.elemPoxY = randomNum(0)*screenSizeH;
		this.elemRadius = randomNum(2,1,5); // размер элемента
		this.elemAngle = randomNum(1,0.1,2)*Math.PI; // угол движения элемента
		this.elemSpeed = randomNum(0)/20; // скорость элемента
	}
	move(){
		this.elemPosX += this.elemSpeed * Math.cos(this.elemAngle);
		this.elemPoxY += this.elemSpeed * Math.sin(this.elemAngle);
		this.elemAngle += randomNum(1, 0.1,20) * Math.PI/180 - 10*Math.PI/180;
	}
	show(){
		bodyAnimationCanvas.beginPath();
		bodyAnimationCanvas.arc(this.elemPosX,this.elemPoxY,this.elemRadius,0,2*Math.PI);
		bodyAnimationCanvas.fillStyle = 'rgba(255, 255, 255, 0.4)';
		bodyAnimationCanvas.fill();
	}
}

// ---------- Слушатели / Адаптация ----------
document.documentElement.style.setProperty('--vh',`${vhFix}px`); // для фикса адаптации по высоте

window.addEventListener('resize', function() { // изменение размера окна
	(screenSizeW = bodyAnimation.width = window.innerWidth);
	(screenSizeH = bodyAnimation.height = window.innerHeight);
	vhFix = screenSizeH * 0.01;
	document.documentElement.style.setProperty('--vh',`${vhFix}px`); // для фикса адаптации по высоте
	massElemBackground = [];
});

// ---------- Работа с фоном ----------
function backgroundGame() { // установка градиента фона и цвета для значков
	gradientBody.num = randomNum(2,1,8);
	bodyBackground.style.cssText = (`background: linear-gradient(45deg, ${gradientBody[gradientBody.num][0]} 0%, ${gradientBody[gradientBody.num][1]} 100%) fixed;`);
	document.documentElement.style.setProperty('--colorItem',`${gradientBody[gradientBody.num][2]}`);
}
backgroundGame();
function drawAnimBackground() {
	bodyAnimationCanvas.clearRect(0,0, screenSizeW, screenSizeH);
	if (screenSizeW < screenSizeH){
		numElemBackground = 30;
	}
	else {
		numElemBackground = 50;
	}
	if(massElemBackground.length < numElemBackground){ // генерация и поддержание нужного количества элементов анимации фона
		do {
			massElemBackground.push(new elemBackground());
		}
		while (massElemBackground.length > numElemBackground);
	}
	for(let i = 0; i < massElemBackground.length; i++){ // изменение координат элементов анимации фона
		massElemBackground[i].move();
		massElemBackground[i].show();
		if(massElemBackground[i].elemPosX < 0 || massElemBackground[i].elemPosX > screenSizeW || massElemBackground[i].elemPoxY < 0 || massElemBackground[i].elemPoxY > screenSizeH){
			massElemBackground.splice(i,1);
		}
	}
}
// ---------- Анимация загрузки ----------
function generateAnimLamp() {
	let svgWidth = 400;
	let svgHeight = 400;
	let svgAnimLoad = document.createElementNS(svgLink,'svg');
	setAttributes(svgAnimLoad,{'class':'block-loading__svg',
		'style':'transform: translateZ(0)',
		'width':`100%`,
		'height':`100%`,
		'viewBox':`0 0 ${svgWidth} ${svgHeight}`,
		'xmlns':`${svgLink}`});
	let svgGroupImg = document.createElementNS(svgLink,'g');
	svgGroupImg.setAttribute('transform','translate(-433 -2970)')
	let svgPath = document.createElementNS(svgLink,'path');
	setAttributes(svgPath,{'d':'M714.116,3083.918a111.848,111.848,0,0,0-79.645-33c-62.1,0-112.758,50.542-112.758,112.668a112.287,' +
		'112.287,0,0,0,55.269,97.068v68.041a32.735,32.735,0,0,0,32.458,32.723h50.28c17.648,0,32.262-14.7,32.262-32.723v-68.1a112.649,' +
		'112.649,0,0,0,22.134-176.675Zm-54.4,253.5H609.44c-4.32,0-8.458-4.14-8.458-8.723v-19.277h67v19.277C667.982,3333.276,663.935,' +
		'3337.416,659.72,3337.416Zm14.738-94.89a11.9,11.9,0,0,0-6.476,10.848v32.042h-21v-78h29.6a12,12,0,1,0,0-24H592.99a12,12,0,1,' +
		'0,0,24h29.992v78h-22v-31.989a11.894,11.894,0,0,0-6.481-10.849c-30.022-14.915-48.551-45.183-48.551-78.994a88.5,88.5,0,0,1,177,' +
		'0C722.947,3197.355,704.461,3227.6,674.458,3242.526Z', 
		'fill':'#FFFFFF'});
	let svgGroupLine = document.createElementNS(svgLink,'g');
	let partsCircle = 12; // 12 --> окружность/12 = 1 часть окружности из 12
	for (let i = 0; i < 9; i++) { // 9 --> рисуем только 9 линий 
		let svgLine = document.createElementNS(svgLink,'line');
		let angleForLine = ((360/partsCircle)*(i+7)+(360/partsCircle))/180*Math.PI;
		setAttributes(svgLine,{'class':'svg-loading_anim-line',
			'x1':`${svgWidth/2 + 180 * Math.sin(angleForLine)}`,
			'y1':`${svgHeight/2 - 180 * Math.cos(angleForLine)}`,
			'x2':`${svgWidth/2 + 150 * Math.sin(angleForLine)}`,
			'y2':`${svgHeight/2 - 150 * Math.cos(angleForLine)}`,
			'stroke-linecap':'round',
			'stroke-width':'10', // полная ширина 25
			'stroke':'#FFFFFF'});
		svgGroupLine.appendChild(svgLine);
	}
	svgGroupImg.appendChild(svgPath);
	svgAnimLoad.appendChild(svgGroupLine);
	svgAnimLoad.appendChild(svgGroupImg);
	return svgAnimLoad;
}
function addAnimLoad() {
	document.querySelectorAll('.box-svg-lamp').forEach((item) => {item.appendChild(generateAnimLamp());});
	massAnimLamp.num = 0;
	massAnimLamp.mass = document.querySelectorAll('.svg-loading_anim-line');
	massAnimLamp.lot = massAnimLamp.mass.length/9;
}
addAnimLoad();
// ---------- Работа с формами ----------

function registerUser(EO) { // форма регистрации
	EO = EO || window.event;
	EO.preventDefault();
	let infoErrLogin = document.querySelector('.reg-input-nick');
	let infoErrPass = document.querySelector('.reg-input-pass');
	infoErrLogin.textContent = '';
	infoErrPass.textContent = '';
	let formLoginR = formInRegPage.elements['nickname'].value.toUpperCase();
	let formPassR = formInRegPage.elements['password'].value;
	let errLogin = false;
	let errPass = false;
	if (keyReg === false) {
		cookieUsersInfo = {};
	}
	// валидация пароля
	if (formPassR.length < 4 || formPassR.length > 10) {
		infoErrPass.textContent = '*Длина пароля от 4 до 10 символов!';
		errPass = true;
	}
	else if (formPassR.search(/^[0-9]+$/) === -1) {
		infoErrPass.textContent = '*Пароль может состоять только из цифр!';
		errPass = true;
	}
	// валидация логина и проверка на его наличие в базе
	if (formLoginR.length < 3 || formLoginR.length > 10) {
		infoErrLogin.textContent = '*Длина логина от 3 до 10 символов!';
		errLogin = true;
	}
	else if (formLoginR.search(/^[A-Z0-9]+$/) === -1) {
		infoErrLogin.textContent = '*Логин может содержать только цифры и англ. буквы!';
		errLogin = true;
	}
	else {
		if (keyReg === false) { // 1 вызов функции - сначала запросим информацию
			restoreInfo('reg');
			keyReg = true;
			return false;
		}
		if (keyReg === true) { // 2 вызов функции AJAXом когда пришли данные
			for (let cookieUsersInfoKey in cookieUsersInfo) {
				if (formLoginR === cookieUsersInfoKey) {
					infoErrLogin.textContent = '*Такой логин существует!';
					errLogin = true;
					keyReg = false;
					cookieUsersInfo = {};
					break;
				}
			}
			if (errLogin === false && errPass === false) {
				infoErrLogin.textContent = '';
				infoErrPass.textContent = '';
				cookieUsersInfo[formLoginR] = {pass: formPassR, lvl: 0}; // {'ник':{pass:'пароль',lvl: значение}, ...}
				storeAjaxInfo('reg');
				console.log('GAME: Регистрируем пользователя...'); 
			}
			return false;
		}
	}
}
function logInUser(EO) {
	EO = EO || window.event;
	EO.preventDefault();
	let infoErrLogin = document.querySelector('.login-input-nick');
	let infoErrPass = document.querySelector('.login-input-pass');
	infoErrLogin.textContent = '';
	infoErrPass.textContent = '';
	let formLoginR = formInLogPage.elements['nickname'].value.toUpperCase();
	let formPassR = formInLogPage.elements['password'].value;
	let errLogin = false;
	let errPass = false;
	if (keyLog === false) {
		cookieUsersInfo = {};
	}
	// проверка заполненных полей
	if (formPassR.length === 0 || formPassR.length > 10) {
		infoErrPass.textContent = '*Поле не заполнено, либо переполнено (>10 символов)!';
		errPass = true;
	}
	else {
		infoErrPass.textContent = '';
	}
	if (formLoginR.length === 0 || formLoginR.length > 10) {
		infoErrLogin.textContent = '*Поле не заполнено, либо переполнено (>10 символов)!';
		errLogin = true;
	}
	else {
		infoErrLogin.textContent = '';
	}
	if (errLogin === false && errPass === false) {
		if (keyLog === false) { // 1 вызов функции - сначала запросим информацию
			restoreInfo('login');
			keyLog = true;
			return false;
		}
		if (keyLog === true) { // 2 вызов функции AJAXом когда пришли данные
			for (let cookieUsersInfoKey in cookieUsersInfo) {
				if (formLoginR === cookieUsersInfoKey) {
					errLogin = false;
					keyLog = false;
					break;
				}
				errLogin = true;
			}
			if (errLogin === true) {
				infoErrLogin.textContent = '*Такого логина не существует!';
			}
			if (errLogin === false && cookieUsersInfo[formLoginR].pass !== formPassR){
				infoErrPass.textContent = '*Пароль неверный!';
				cookieUsersInfo = {};
				keyLog = false;
				errPass = true;
			}
			if (errLogin === false && errPass === false){
				infoErrLogin.textContent = '';
				infoErrPass.textContent = '';
				console.log('GAME: Авторизация пользователя...');
				userInfo = {nick: (formLoginR), pass: (cookieUsersInfo[formLoginR].pass), lvl: (cookieUsersInfo[formLoginR].lvl)};
				// !!! сохранить пользователя отдельно !!!
				// !!! смена раздела !!!
				document.querySelector('.js-login_visible').style.display = 'none'; // временно
				document.querySelector('.js-start_visible').style.display = 'flex'; // временно
				cookieUsersInfo = {};
				console.log('GAME: Пользователь авторизован!');
			}
			return false;
		}
	}
}
// ---------- Работа с AJAX ----------
// Работа с записью по AJAX = временная блокировка изменения БД
// параметры: type - 'reg' - запрос для раздела "регистрация"
//					 'login' - запрос для раздела "логин"
function storeAjaxInfo(type) {
	updateAjaxPassword = Math.random();
	//cookieUrlPage =
	if (type === 'reg') {
		// !!! меняем на раздел загрузка !!!
		document.querySelector('.js-reg_visible').style.display = 'none'; // временно
		document.querySelector('.js-loading_visible').style.display = 'flex'; // временно
	}
	if (type === 'login') {
		// !!! меняем на раздел загрузка !!!
		document.querySelector('.js-login_visible').style.display = 'none'; // временно
		document.querySelector('.js-loading_visible').style.display = 'flex'; // временно
	}
	console.log('AJAX: Подключение к серверу...');
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType:'json',
		data: {f: 'LOCKGET', n: ajaxListUsers, p: updateAjaxPassword},
		success: writeAjaxUsers, error: errorAjaxUsers, timeout: 10000 
	});
}
// Запись данных по AJAX
function writeAjaxUsers(callresult) {
	if (callresult.error != undefined)
		alert(callresult.error +'\n\n Ошибка №1 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
		// !!! добавить переход на главную страницу !!!
	else {
		console.log('AJAX: Запись нового пользователя...');
		$.ajax({
			url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
			data: {f: 'UPDATE', n: ajaxListUsers,
				v: JSON.stringify(cookieUsersInfo), p: updateAjaxPassword},
			success: updateReady, error: errorAjaxUsers, timeout: 10000
		});
	}
}
// Статус записи данных по AJAX
function updateReady(callresult) {
	if (callresult.error != undefined) {
		alert(callresult.error +'\n\n Ошибка №2 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
		// !!! добавить переход на главную страницу !!!
	}
	else {
		console.log('AJAX: Пользователь успешно добавлен!');
		if (keyReg === true) {
			// !!! меняем обратно на раздел с которого ушли !!!
			keyReg = false;
			cookieUsersInfo = {};
			document.querySelector('.js-loading_visible').style.display = 'none'; // временно
			document.querySelector('.js-start_visible').style.display = 'flex'; // временно
		}
		if (keyLog === true) {
			// !!! меняем обратно на раздел с которого ушли !!!
			document.querySelector('.js-loading_visible').style.display = 'none'; // временно
			document.querySelector('.js-start_visible').style.display = 'flex'; // временно
		}
	}
}
// Чтение данных по AJAX
// параметры: type - 'reg' - запрос для раздела "регистрация"
//					 'login' - запрос для раздела "логин"
function restoreInfo(type) {
	//cookieUrlPage =
	if (type === 'reg') {
		// !!! меняем на раздел загрузка !!!
		document.querySelector('.js-reg_visible').style.display = 'none'; // временно
		document.querySelector('.js-loading_visible').style.display = 'flex'; // временно
	}
	if (type === 'login') {
		// !!! меняем на раздел загрузка !!!
		document.querySelector('.js-login_visible').style.display = 'none'; // временно
		document.querySelector('.js-loading_visible').style.display = 'flex'; // временно
	}
	console.log('AJAX: Запрашиваем данные...');
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
		data: {f: 'READ',n: ajaxListUsers},
		success: readReady, error: errorAjaxUsers, timeout: 10000
	});
}
// работа с полученными данными по AJAX
function readReady(callresult) {
	if (callresult.error != undefined) {
		alert(callresult.error +'\n\n Ошибка №3 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
		// !!! добавить переход на главную страницу !!!
	}
	else if (callresult.result != "") {
		console.log('AJAX: Данные получены!')
		cookieUsersInfo = JSON.parse(callresult.result);
		if (keyReg === true) {
			// !!! меняем обратно на раздел с которого ушли !!!
			document.querySelector('.js-loading_visible').style.display = 'none'; // временно
			document.querySelector('.js-reg_visible').style.display = 'flex'; // временно
			registerUser();
		}
		if (keyLog === true) {
			// !!! меняем обратно на раздел с которого ушли !!!
			document.querySelector('.js-loading_visible').style.display = 'none'; // временно
			document.querySelector('.js-login_visible').style.display = 'flex'; // временно
			logInUser();
		}
		if (keyAjax === true) {
			console.log(cookieUsersInfo);
			keyAjax = false;
		}
	}
}
// ошибка AJAX
function errorAjaxUsers(jqXHR,statusStr,errorStr) {
	alert(statusStr+' '+errorStr +'\n\n Ошибка №4 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
	// !!! добавить переход на главную страницу !!!
}
// ---------- Служебные функции AJAX ----------
// В случаи пустого содержимого или для обнуления БД выполняем: 
// !!! Добавить проверку админа !!!
function startAjax() {
	updateAjaxPassword = Math.random();
	cookieUsersInfo = {};
	console.log('AJAX: Выполняем сброс...');
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType:'json',
		data: {f: 'LOCKGET', n: ajaxListUsers, p: updateAjaxPassword},
		success: writeAjaxUsers, error: errorAjaxUsers, timeout: 10000
	});
}
function getInfoAjax() {
	keyAjax = true;
	restoreInfo();
}
// ---------- Игровой цикл ----------
function gameLoop(nowTimeFrame) { // цикл
	if (fixNum === 1) {
		drawAnimBackground();
		updateGame(nowTimeFrame);
		renderGame(nowTimeFrame);
	}
	else{
		fixNum++;
	}
	window.requestAnimationFrame(gameLoop);
}
gameLoop();
function updateGame(nowTimeFrame) { // физика игры
	if(!lastTimeFrame || nowTimeFrame - lastTimeFrame >= 500) {
		lastTimeFrame = nowTimeFrame;
		if (massAnimLamp.num === 9) {
			massAnimLamp.num = 0;
		}
		for (let i = 0; i < massAnimLamp.lot; i++) {
			if (massAnimLamp.num === 0) {
				massAnimLamp.mass[8+9*i].setAttribute('stroke-width','10');
			}
			else {
				massAnimLamp.mass[(massAnimLamp.num-1+9*i)].setAttribute('stroke-width','10');
			}
			massAnimLamp.mass[massAnimLamp.num+9*i].setAttribute('stroke-width','25');
		}
		massAnimLamp.num++;
	}
}
function renderGame() { // отрисовка игры
	
}

// ---------- Вспомогательные функции ----------
// randomNum - type: 0 = обычный рандом (нецелочисленное),
// 				  1 = от min до max (нецелочисленное), 
//				  2 = от min до max (целочисленное)
function randomNum(type, min, max) {
	let num = 0;
	switch (type) {
		case 0: 
			num = Math.random();
			break;
		case 1:
			do {
				num = Math.random()*(max - min) + min;
			}
			while (num === 0);
			break;
		case 2:
			do {
				num = Math.floor(Math.random()*(max - min + 1) + min);
			}
			while (num === 0);
			break;
		default: num = Math.random();
	}
	return num;
}
// setAttributes - массовая установка атрибутов элементу
// вызов: setAttributes(элемент,{'атрибут1':'значение1', ...})
function setAttributes(el, attrs) {
	for(let key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
}
// ----------  ----------
/*
document.querySelector('.block-connect__box').style.display = 'none';
document.querySelector('.block-loading__box').style.display = 'flex';
document.querySelector('.block-loading__box').style.display = 'none';
document.querySelector('.block-connect__box').style.display = 'flex';
 */