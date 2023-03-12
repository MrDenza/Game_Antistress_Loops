"use strict"; // Строгий режим
// ----------------------- JavaScript -----------------------

// ---------- JSON параметры ----------
console.log('JSON: Загружаем данные...');
import levelJson from "../resource/level/level_list.json" assert {type: "json"};
console.log('JSON: Данные получены!');

// ---------- Переменные ----------
const bodyBackground = document.body; // body
// gradientBody - Градиент фона и цвет значков
// num - применённый стиль, №:[1 цвет градиента, 2 цвет градиента, цвет значков, цвет элементов игры]
let gradientBody = {num: 0,
	1: ['#000851','#1CB5E0','#0E5F99','#7baed3'],
	2: ['#0700b8','#00ff88','#0474A2','#93ccb1'],
	3: ['#009b9f','#b922c3','#436FAC','#69bbbd'],
	4: ['#C33764','#1D2671','#873169','#bd6482'],
	5: ['#1CB5E0','#000851','#0F669F','#51aac5'],
	6: ['#8E2DE2','#0700b8','#4414CB','#975dd2'],
	7: ['#c4c813','#7e07a2','#B1933A','#b2b460'],
	8: ['#31a207','#1372c8','#238C5F','#8fcc79'],
}
const bodyAnimation = document.querySelector('.body_animation');// canvas
//const bodyContainer = document.querySelector('.body__container'); // main
let screenSizeW = (bodyAnimation.width = window.innerWidth); // ширина окна
let screenSizeH = (bodyAnimation.height = window.innerHeight); // высота окна
let vhFix = screenSizeH * 0.01; // фикс для мобильной версии - вписать по высоте без адресной строки
let bodyAnimationCanvas = bodyAnimation.getContext('2d'); // canvas холст для рисования
let numElemBackground = 50; // количество элементов анимации фона
let massElemBackground = []; // массив всех элементов анимации фона
const svgLink = 'http://www.w3.org/2000/svg';
// massAnimLamp объект всех линий анимации Lamp во всех дубликатах, где ключ:
// num - счёт от 1 до 9 линий; lot - кол-во дубликатов анимации; mass - массив всех линий
let massAnimLamp = {};
let animUpdate = {key: false, count: 0, obj: document.querySelector('.body__update')}; // ключ запуска анимации вспышки
let lastTimeFrame = 0; // для выполнения функции через определённое время в цикле requestAnimationFrame
let fixNum = 0; // фикс первого запуска функции gameLoop
const formInRegPage = document.forms['reg-form']; // форма на странице регистрации
const formInLogPage = document.forms['login-form']; // форма на странице залогиниться

const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php"; // серверный скрип с БД https://fe.it-academy.by/AjaxStringStorage2.php
const ajaxListUsers = 'DUDEVICH_GAME_LOOPS_USERS'; // хранение информации пользователей {'ник':{pass:'пароль',lvl: значение}, ...}
let updateAjaxPassword; // пароль доступа к БД
let userInfo = {}; // данные пользователя {nick:'ник',pass:'пароль',lvl: значение}
let cookieUsersInfo = {}; // переменная временного хранения списка пользователей
let keyReg = false; // ключ раздела "регистрация" для "асинхронного" выполнения регистрации с разделом "загрузка"
let keyLog = false; // ключ раздела "логин" для "асинхронного" выполнения авторизации с разделом "загрузка"
let keyAjax = false; // служебный ключ AJAX
let keyStart = false; // ключ раздела "старт" для "асинхронного" выполнения подключения с разделом "загрузка"
let keyTops = false; // ключ раздела "топ" для "асинхронного" выполнения генерации списка с разделом "загрузка"
let keyWarUpdate = false; // ключ предупреждения о несохранённых данных
let keyGo = false; // ключ начала
let keySave = false; // ключ обновления и сохранения данных
let calendar; // объект класса календарь
let gameLvl; // объект класса уровень
let cookieUrl = {pagename: window.location.hash.substr(1)}; // переменная временного хранения закладки URL

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
// Класс для анимации фона
class elemBackground {
	constructor() {
		this.elemPosX = randomNum(0)*screenSizeW;
		this.elemPoxY = randomNum(0)*screenSizeH;
		this.elemRadius = randomNum(2,1,5); // размер элемента
		this.elemAngle = randomNum(1,0.1,2)*Math.PI; // угол движения элемента
		this.elemSpeed = randomNum(0)/20; // скорость элемента
	}
	move() {
		this.elemPosX += this.elemSpeed * Math.cos(this.elemAngle);
		this.elemPoxY += this.elemSpeed * Math.sin(this.elemAngle);
		this.elemAngle += randomNum(1, 0.1,20) * Math.PI/180 - 10*Math.PI/180;
	}
	show() {
		bodyAnimationCanvas.beginPath();
		bodyAnimationCanvas.arc(this.elemPosX,this.elemPoxY,this.elemRadius,0,2*Math.PI);
		bodyAnimationCanvas.fillStyle = 'rgba(255, 255, 255, 0.4)';
		bodyAnimationCanvas.fill();
	}
}
// Класс генерации календаря
class Calendar {
	currYear;
	currMonth;
	currDay;
	classElem;
	months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
	daysList = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
	openDate;
	constructor(className) {
		let nowDate = new Date();
		this.classElem = className; // сохраняем класс бокса для календаря
		this.currMonth = nowDate.getMonth();
		this.currYear = nowDate.getFullYear();
		this.currDay = nowDate.getDate();
		this.showCurr();
	}

	nextMonth() { // метод перехода к следующему месяц
		if (this.currMonth === 11) {
			this.currMonth = 0;
			this.currYear = this.currYear + 1;
		}
		else {
			this.currMonth = this.currMonth + 1;
		}
		this.showCurr();
	}
	prevMonth() { // метод перехода к предыдущему месяцу
		if (this.currMonth === 0) {
			this.currMonth = 11;
			this.currYear = this.currYear - 1;
		}
		else {
			this.currMonth = this.currMonth - 1;
		}
		this.showCurr();
	}
	showCurr() { // метод запуска отображения
		this.showMonth(this.currYear, this.currMonth);
	}
	goNowDate() { // установить актуальную дату
		let nowDate = new Date();
		this.currMonth = nowDate.getMonth();
		this.currYear = nowDate.getFullYear();
		this.currDay = nowDate.getDate();
		this.showCurr();
	}
	showMonth(y, m) { // метод отображения нужного месяца (месяц в году)
		let nowDate = new Date(); // ????????????
		let firstDayOfMonth = new Date(y, m, 7).getDay(); // первый день в месяце
		let lastDayOfMonth = new Date(y, m + 1, 0).getDate(); // последний день в месяце
		let lastDayOfLastMonth = m === 0 ? new Date(y-1, 11, 0).getDate() : new Date(y, m, 0).getDate(); // последний день пред месяца

		let codeHtml = `<table class="block-calendar__table"><thead><tr><td colspan="7">${this.months[m].toUpperCase()} ${y}</td></tr></thead>`;

		codeHtml += `<tr class="block-calendar__table-i-days">`;
		for (let i = 0; i < this.daysList.length; i++) {
			codeHtml += `<td>${this.daysList[i]}</td>`;
		}
		codeHtml += `</tr>`;

		let keyA = 1; // запись дней в календарь
		do {
			let rowN = new Date(y, m, keyA).getDay();
			if (rowN === 1) { // ПН
				codeHtml += `<tr>`;
			}
			else if (keyA === 1) {// если первый день не ПН показать дни прошлого месяца
				codeHtml += `<tr>`;
				let keyK = lastDayOfLastMonth - firstDayOfMonth + 1;
				for (let j = 0; j < firstDayOfMonth; j++) {
					codeHtml += `<td class="block-calendar__table-i-dayNotCur">${keyK}</td>`;
					keyK++;
				}
			}
			let checkY = nowDate.getFullYear();
			let checkM = nowDate.getMonth();
			if (checkY === this.currYear && checkM === this.currMonth && keyA === this.currDay) {
				codeHtml += `<td class="block-calendar__table-i-dayNow">${keyA}</td>`;
			}
			else {
				codeHtml += `<td class="block-calendar__table-i-dayNorm">${keyA}</td>`;
			}
			if (rowN === 0) { // закрываем строку в ВС
				codeHtml += `</tr>`;
			}
			else if (keyA === lastDayOfMonth) { // если последний день не ВС показать дни след месяца
				let keyB = 1;
				for (rowN; rowN < 7; rowN++) {
					codeHtml += `<td class="block-calendar__table-i-dayNotCur">${keyB}</td>`;
					keyB++;
				}
			}
			keyA++;
		} while (keyA <= lastDayOfMonth);

		codeHtml += `</table>`; // конец
		document.querySelector(this.classElem).innerHTML = codeHtml;
		document.querySelector('.block-calendar__table').onclick = () => this.getClickInfo();
	}
	getClickInfo(EO) { // вернуть дату по которой совершён клик
		EO = EO || window.event;
		let cellTable = EO.target.closest('td');
		if (!cellTable) {
			return;
		}
		if (!cellTable.classList[0] === false && (cellTable.classList[0].includes('dayNorm') === true || cellTable.classList[0].includes('dayNow') === true)) {
			let clickDate = `${cellTable.innerHTML}_${this.currMonth+1}_${this.currYear}`;
			this.openDate = clickDate;
			console.log(`GAME: Выбрано ежедневное испытание от ${clickDate}`);
			alert(`Ежедневное соревнование за ${clickDate} не найдено!`);
		}
	}
}
// Класс уровня
class Level {
	rotElemsUser = [];
	rotElemsGame = [];
	animFrameClasses = [];
	animFrameSetting = {}; // {rotationValue: 0, stepRot: 1, opacityValue: 0.5, stepOpacity: 0.05}
	constructor(elemDiv, textLvl, levelList, goLevel) {
		this.gameDiv = elemDiv; // сохраняем класс бокса для игрового поля
		this.lvlNumText = textLvl;
		this.allLevelInfo = levelList;
		this.maxGameLevel = goLevel;
		this.enterGameLevel = goLevel;
		this.levelPlayInfo = this.allLevelInfo[this.enterGameLevel];
		this.buildGame();
	}
	prevLevel(){
		if (!(this.enterGameLevel <= 1)) {
			this.enterGameLevel--;
			backgroundGame();
			this.buildGame();
		}
	}
	nextLevel(){
		if (!(this.enterGameLevel >= this.maxGameLevel)) {
			this.enterGameLevel++;
			backgroundGame();
			if (!(this.allLevelInfo[this.enterGameLevel])) {
				alert('К сожалению для тебя доступные уровни закончились! Ждите обновления! Либо пройдите снова предыдущие уровни =)');
			}
			this.buildGame();
		}
	}
	updateMaxLevel() {
		if (this.maxGameLevel === this.enterGameLevel) {
			this.maxGameLevel++;
			saveProgress();
		}
		//this.buildGame();
	}
	buildGame(){
		if (!(this.allLevelInfo[this.enterGameLevel])) {
			console.log('GAME: Достигнут предел пройденных уровней!');
			this.enterGameLevel--;
			this.buildGame();
			return;
		}
		console.log(`GAME: Генерация уровня #${this.enterGameLevel}`);
		this.rotElemsGame = [];
		this.rotElemsUser = [];
		// параметры анимированных блоков
		this.animFrameSetting = {rotationValue: 0, stepRot: 0.05, opacityValue: 0.1, stepOpacity: 0.005};
		document.querySelector(this.lvlNumText).textContent = `#${this.enterGameLevel}`;
		this.levelPlayInfo = this.allLevelInfo[this.enterGameLevel];
		let codeHtml = `<div class="js-game-grid" style="grid-template-columns: repeat(${this.levelPlayInfo['column']}, auto); grid-template-rows: repeat(${this.levelPlayInfo['row']}, auto)">`;
		let i = 0;
		for (let element of this.levelPlayInfo['elements']) {
			this.rotElemsGame.push(element.trueRot);
			this.rotElemsUser.push(element.rot);
			codeHtml += `<svg class="svg-elem-game" data-num="${i}" data-access-rot="${element.accessRot}" width=100 height=100>`;
			if (element.type === 6 || element.type === 7 || element.type === 8) {
				codeHtml += `<use xlink:href="#svg-elem-5" style="transform-origin: center center; transform: rotate(${element.rot}deg);"></use>`;
				codeHtml += `<use xlink:href="#svg-elem-${element.type}"></use>`;
			}
			else {
				codeHtml += `<use xlink:href="#svg-elem-${element.type}" style="transform-origin: center center; transform: rotate(${element.rot}deg);"></use>`;
			}
			if (element.animFrame === true) {
				codeHtml += `<use class="js-anim-frame" style="stroke-dashoffset: ${this.animFrameSetting.rotationValue}; opacity: ${this.animFrameSetting.opacityValue}" xlink:href="#svg-elem-9"></use>`;
			}
			codeHtml += `</svg>`;
			i++;
		}
		codeHtml += `</div>`;
		document.querySelector(this.gameDiv).innerHTML = codeHtml;
		this.animFrameClasses = document.querySelectorAll('.js-anim-frame');
		document.querySelector(this.gameDiv).onclick = () => this.getClickInfo();
	}
	getClickInfo(EO) { // вернуть дату по которой совершён клик
		EO = EO || window.event;
		let clickElem = EO.target.closest('svg');
		if (!clickElem || clickElem.getAttribute('data-access-rot') === 'false') {
			return;
		}
		if (clickElem.getAttribute('data-access-rot') === 'true') {
			this.rotationElem(clickElem, clickElem.getAttribute('data-num'));
		}
	}
	rotationElem(elem, num) {
		let stepRot = this.levelPlayInfo['stepRot'];
		let userInfoRot = this.rotElemsUser[parseInt(num)];
		userInfoRot += stepRot;
		this.rotElemsUser[parseInt(num)] = userInfoRot;
		elem.firstChild.style.cssText = `transform-origin: center center; transform: rotate(${userInfoRot}deg);`;
		this.validLevel();
	}
	validLevel() {
		let stepRot = this.levelPlayInfo['stepRot'];
		let keyGood = false;
		for (let key = 0; key < this.rotElemsGame.length; key++) {
			let a = this.rotElemsGame[key] / stepRot;
			let b = (((this.rotElemsUser[key] / 360) % 1) * 360) / stepRot;
			if (a !== b) {
				keyGood = false;
				break;
			}
			keyGood = true;
		}
		if (keyGood === true) {
			this.updateMaxLevel();
			animUpdate.key = true;
			//this.animFrameSetting.
			this.animFrameClasses.forEach((elemFrame) => elemFrame.style.display = 'none');
			this.animFrameClasses = [];
			document.querySelectorAll('.svg-elem-game').forEach((el) => el.classList.add('svg-elem-game-good'));
			document.querySelector(this.gameDiv).onclick = () => this.nextLevel();
			console.log('GAME: Уровень пройден!');
		}
	}
	animFrame() {
		//console.log(this.animFrameClasses)
		for (let element of this.animFrameClasses) {
			//{rotationValue: 0, stepRot: 1, opacityValue: 0.5, stepOpacity: 0.05}
			if (this.animFrameSetting.rotationValue > 1e5) {
				this.animFrameSetting.stepRot *= -1;
			}
			if (this.animFrameSetting.opacityValue >= 1 || this.animFrameSetting.opacityValue < 0.1) {
				this.animFrameSetting.stepOpacity *= -1;
			}
			this.animFrameSetting.rotationValue += this.animFrameSetting.stepRot;
			this.animFrameSetting.opacityValue += this.animFrameSetting.stepOpacity;
			element.style.cssText = `stroke-dashoffset: ${this.animFrameSetting.rotationValue}; opacity: ${this.animFrameSetting.opacityValue}`;
		}
		return true;
	}
}

// ---------- Слушатели / Адаптация ----------
window.onload = () => {
	calendar = new Calendar('.js-calendar');
}
// Слушатель изменения URL страницы
window.onhashchange = updateVisibleHtmlPage;
// Фикс адаптации по высоте
document.documentElement.style.setProperty('--vh',`${vhFix}px`);
// Слушатель изменения размера окна
window.addEventListener('resize', function() {
	(screenSizeW = bodyAnimation.width = window.innerWidth);
	(screenSizeH = bodyAnimation.height = window.innerHeight);
	vhFix = screenSizeH * 0.01;
	document.documentElement.style.setProperty('--vh',`${vhFix}px`); // для фикса адаптации по высоте
	massElemBackground = [];
});
// Активация ключа о потери данных
function checkUpdatePage(EO) {
	EO = EO || window.event;
	keyWarUpdate = true;
}
// Слушатель несохранённых изменений
window.onbeforeunload = (EO) => {
	EO = EO || window.event;
	if (keyWarUpdate === true) {
		EO.returnValue = 'Есть несохранённые данные!';
	}
};
// Обновление слушателей страницы
function updateListener(sectionPage) { // todo: переработать обработчики

	// удаляем слушателей
	formInRegPage.removeEventListener('submit',registerUser,false);
	formInLogPage.removeEventListener('submit',logInUser,false);
	document.querySelector('.js-menu').removeEventListener('change', chekedMenu);
	// добавляем слушателей
	switch (sectionPage) {
		case 'start':
			document.querySelector('.block-start__btn').onclick = () => {cookieUrl.pagename = 'game'; openGame();};
			break;
		case 'reg':
			formInRegPage.addEventListener('submit',registerUser,false);
			break;
		case 'login':
			formInLogPage.addEventListener('submit',logInUser,false);
			break;
		case 'game':
			document.querySelector('.js-menu').addEventListener('change', chekedMenu);
			//document.querySelector('.js-menu-1').onclick = () => /* todo: музыка */ ;
			//document.querySelector('.js-menu-2').onclick = () => /* todo: рестарт лвл */ ;
			//document.querySelector('.js-menu-3').onclick = () => /* todo: вибро */ ;
			document.querySelector('.js-menu-4').onclick = () => goToStatePage('calendar');
			document.querySelector('.js-menu-5').onclick = topsList;
			document.querySelector('.js-lvl-prev').onclick = () => gameLvl.prevLevel();
			document.querySelector('.js-lvl-next').onclick = () => gameLvl.nextLevel();
			break;
		case 'calendar':
			document.querySelectorAll('.js-cal-btnNext').forEach((el) => {el.onclick = () => calendar.nextMonth()});
			document.querySelectorAll('.js-cal-btnPrv').forEach((el) => {el.onclick = () => calendar.prevMonth()});
			break;
	}
}

// ---------- Работа с фоном ----------
// Установка градиента фона и цвета для значков
function backgroundGame() {
	gradientBody.num = randomNum(2,1,8);
	bodyBackground.style.cssText = (`background: linear-gradient(45deg, ${gradientBody[gradientBody.num][0]} 0%, ${gradientBody[gradientBody.num][1]} 100%) fixed;`);
	document.documentElement.style.setProperty('--colorItem',`${gradientBody[gradientBody.num][2]}`);
	document.documentElement.style.setProperty('--colorItemGame',`${gradientBody[gradientBody.num][3]}`);
}
backgroundGame();
// Генерация анимация и анимация фона
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
// Генерация SVG Логотипа
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
// Добавление SVG Логотипа в нужные места HTML
function addAnimLoad() {
	document.querySelectorAll('.box-svg-lamp').forEach((item) => {item.appendChild(generateAnimLamp());});
	massAnimLamp.num = 0;
	massAnimLamp.mass = document.querySelectorAll('.svg-loading_anim-line');
	massAnimLamp.lot = massAnimLamp.mass.length/9;
}
addAnimLoad();

// ---------- Работа с URL и содержимым страницы ----------
// Обновление содержимого страницы
function updateVisibleHtmlPage(load) {
	animUpdate.key = true;
	let stateUrlHash = window.location.hash.substr(1); // убираем из URL - #
	if (load === true) {
		if (!cookieUrl === undefined) {
			document.querySelector(`.js-${cookieUrl.pagename}_visible`).style.display = 'none';
		}
		document.querySelector(`.js-loading_visible`).style.display = 'flex';
	}
	else {
		if (stateUrlHash !== '') {
			cookieUrl = {pagename: stateUrlHash};
		} else {
			cookieUrl = {pagename: 'start'};
		}
		let allSectionHtml = document.getElementsByTagName('section');
		for (let HtmlElement of allSectionHtml) {
			HtmlElement.style.display = 'none';
		}
		updateListener(cookieUrl.pagename);
		document.querySelector(`.js-${cookieUrl.pagename}_visible`).style.display = 'flex';
		console.log(`GAME: Переход в раздел \"${cookieUrl.pagename}\".`);
	}
}
// Переход на другую
function goToStatePage(newPage) {
	// newPage = 'loading' 'start' 'reg' 'login' 'game' 'calendar' 'tops'
	if (newPage === 'calendar') {
		calendar.goNowDate();
	}
	if (newPage === 'loading') {
		updateVisibleHtmlPage(true);
	}
	else if (window.location.hash.substr(1) === newPage) {
		updateVisibleHtmlPage();
	}
	else {
		location.hash = newPage;
	}
}

// ---------- Раздел "Start" ----------
// При запуске выполнить
function loadPage() {
	let link = window.location.hash.substr(1);
	if (link === 'game' || link === 'calendar' || link === 'tops') {
		openGame();
	}
	else {
		updateVisibleHtmlPage();
	}
}
loadPage();
// Авто авторизация и обновление
function openGame() {
	if (keyStart === false){
		console.log('GAME: Подключение...');
		if (readLocalStorage() === true){
			keyStart = true;
			restoreInfo('read');
		}
		else {
			goToStatePage('login');
		}
	}
	else {
		keyStart = false;
		if ((userInfo.name in cookieUsersInfo) && (userInfo.pass === cookieUsersInfo[userInfo.name].pass)) {
			userInfo.lvl = cookieUsersInfo[userInfo.name].lvl;
			generateGame();
			console.log('GAME: Успешная автоматическая авторизация пользователя!');
			let keysSorts = Object.keys(cookieUsersInfo).sort(function(a, b) {
				return cookieUsersInfo[b].lvl - cookieUsersInfo[a].lvl
			});
			for (let i = 0; i < 3; i++) {
				let rowEl = document.querySelector('.js-tops-list-'+ CSS.escape(String(i+1)));
				rowEl.innerHTML = `<td>${i+1}</td><td>${keysSorts[i]}</td><td>${cookieUsersInfo[keysSorts[i]].lvl}</td>`;
			}
			cookieUsersInfo = {};
			if (keyGo === true) {
				goToStatePage('game');
			}
			else {
				goToStatePage(cookieUrl.pagename);
			}
		}
		else {
			goToStatePage('login');
		}
	}
}

// ---------- Раздел "Game" ----------
// Состояния меню
function chekedMenu(EO) {
	//EO = EO || window.event;
	animUpdate.key = true;
	if (this.checked) {
		document.querySelector('.js-lvl-list').style.width = '73px';
		document.querySelector('.js-game').addEventListener('click', clickMenu);
	}
	else {
		document.querySelector('.js-lvl-list').style.width = '0';
		document.querySelector('.js-game').removeEventListener('click', clickMenu);
	}
}
// Симуляция открытия меню
function clickMenu(EO) {
	//EO = EO || window.event;
	document.querySelector('.js-menu').click();
}
// Создаём игровое поле
function generateGame() {
	// параметры: класс контейнера, класс текста о номере уровня, данные уровней, уровень началы игры, функция сохранения
	gameLvl = new Level('.js-game','.js-lvl-numText', levelJson, userInfo.lvl + 1);
}
// Сохраняем пройденный уровень
function saveProgress() {
	keyWarUpdate = true;
	if (keySave === false) {
		keySave = true;
		console.log(userInfo);
		restoreInfo();
	}
	else if (keySave === true) {
		keySave = false
		userInfo.lvl = (gameLvl.maxGameLevel - 1);
		console.log(userInfo);
		cookieUsersInfo[userInfo.name].lvl = userInfo.lvl;
		storeAjaxInfo();
	}
}

// ---------- Раздел "Tops" ----------
// Создание таблицы топов
function topsList(EO) {
	//EO = EO || window.event;
	if (keyTops === false) {
		restoreInfo('read');
		keyTops = true;
	}
	else {
		let keysSort = Object.keys(cookieUsersInfo).sort(function(a, b) {
			return cookieUsersInfo[b].lvl - cookieUsersInfo[a].lvl
		});
		for (let i = 0; i < 3; i++) {
			let rowEl = document.querySelector('.js-tops-list-'+ CSS.escape(String(i+1)));
			rowEl.innerHTML = `<td>${i+1}</td><td>${keysSort[i]}</td><td>${cookieUsersInfo[keysSort[i]].lvl}</td>`;
		}
		cookieUsersInfo = {};
		keyTops = false;
		goToStatePage('tops');
	}
}

// ---------- Работа с формами ----------
// Регистрация
function registerUser(EO) { // форма регистрации
	EO = EO || window.event;
	EO.preventDefault();
	let infoErrLogin = document.querySelector('.reg-input-nick');
	let infoErrPass = document.querySelector('.reg-input-pass');
	infoErrLogin.textContent = infoErrPass.textContent = '';
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
		keyWarUpdate = true;
		if (keyReg === false) { // 1 вызов функции - сначала запросим информацию
			restoreInfo('read');
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
				infoErrLogin.textContent = infoErrPass.textContent = '';
				cookieUsersInfo[formLoginR] = {pass: formPassR, lvl: 0}; // {'ник':{pass:'пароль',lvl: значение}, ...}
				storeAjaxInfo('write');
				userInfo = {name: (formLoginR), pass: (formPassR), lvl: 0};
				// обнуляем форму, сброс ключа keyWarUpdate и переход по странице - после успешной записи в БД
				console.log('GAME: Регистрируем пользователя...'); 
			}
			return false;
		}
	}
}
// Авторизация
function logInUser(EO) {
	EO = EO || window.event;
	EO.preventDefault();
	let infoErrLogin = document.querySelector('.login-input-nick');
	let infoErrPass = document.querySelector('.login-input-pass');
	infoErrLogin.textContent = infoErrPass.textContent = '';
	let formLoginL = formInLogPage.elements['nickname'].value.toUpperCase();
	let formPassL = formInLogPage.elements['password'].value;
	let errLogin = false;
	let errPass = false;
	if (keyLog === false) {
		cookieUsersInfo = {};
	}
	// проверка заполненных полей
	if (formPassL.length === 0 || formPassL.length > 10) {
		infoErrPass.textContent = '*Поле не заполнено, либо переполнено (>10 символов)!';
		errPass = true;
	}
	else {
		infoErrPass.textContent = '';
	}
	if (formLoginL.length === 0 || formLoginL.length > 10) {
		infoErrLogin.textContent = '*Поле не заполнено, либо переполнено (>10 символов)!';
		errLogin = true;
	}
	else {
		infoErrLogin.textContent = '';
	}
	keyWarUpdate = true;
	if (errLogin === false && errPass === false) {
		if (keyLog === false) { // 1 вызов функции - сначала запросим информацию
			restoreInfo('read');
			keyLog = true;
			return false;
		}
		if (keyLog === true) { // 2 вызов функции AJAXом когда пришли данные
			for (let cookieUsersInfoKey in cookieUsersInfo) {
				if (formLoginL === cookieUsersInfoKey) {
					errLogin = false;
					keyLog = false;
					break;
				}
				errLogin = true;
			}
			if (errLogin === true) {
				infoErrLogin.textContent = '*Такого логина не существует!';
			}
			if (errLogin === false && cookieUsersInfo[formLoginL].pass !== formPassL){
				infoErrPass.textContent = '*Пароль неверный!';
				cookieUsersInfo = {};
				keyLog = false;
				errPass = true;
			}
			if (errLogin === false && errPass === false){
				infoErrLogin.textContent = infoErrPass.textContent = '';
				console.log('GAME: Авторизация пользователя...');
				userInfo = {name: (formLoginL), pass: (cookieUsersInfo[formLoginL].pass), lvl: (cookieUsersInfo[formLoginL].lvl)};
				writeLocalStorage();
				console.log('GAME: Пользователь авторизован!');
				cookieUsersInfo = {};
				keyWarUpdate = false;
				formInLogPage.reset();
				generateGame();
				goToStatePage('game');
			}
			return false;
		}
	}
	return false;
}

// ---------- Работа с AJAX и локальным хранилищем ----------
// Временная блокировка изменения БД
function storeAjaxInfo(type) {
	// параметры: type - 'write' - запись в БД с экраном "Загрузка"
	updateAjaxPassword = Math.random();
	if (type === 'write') {
		goToStatePage('loading');
	}
	keyWarUpdate = true;
	console.log('AJAX: Подключение к серверу...');
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType:'json',
		data: {f: 'LOCKGET', n: ajaxListUsers, p: updateAjaxPassword},
		success: writeAjaxUsers, error: errorAjaxUsers, timeout: 10000 
	});
}
// Запись данных по AJAX
function writeAjaxUsers(callresult) {
	if (callresult.error !== undefined) {
		alert(callresult.error + '\n\n Ошибка №1 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
		if (keyReg === true) {
			goToStatePage('reg');
			keyReg = false;
		} else {
			goToStatePage('login');
			keyLog = false;
		}
	}
	else {
		console.log('AJAX: Запись информации...');
		$.ajax({
			url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
			data: {f: 'UPDATE', n: ajaxListUsers, v: JSON.stringify(cookieUsersInfo), p: updateAjaxPassword},
			success: updateReady, error: errorAjaxUsers, timeout: 10000
		});
	}
}
// Статус записи данных по AJAX
function updateReady(callresult) {
	if (callresult.error !== undefined) {
		alert(callresult.error +'\n\n Ошибка №2 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
		if (keyReg === true) {
			goToStatePage('reg');
			keyReg = false;
		} else {
			goToStatePage('login');
			keyLog = false;
		}
	}
	else {
		writeLocalStorage();
		if (keyReg === true) {
			keyReg = false;
			cookieUsersInfo = {};
			formInRegPage.reset();
			keyWarUpdate = false;
			console.log('AJAX: Пользователь успешно добавлен!');
			generateGame();
			goToStatePage('game');
		}
		if (keyAjax === true) {
			keyAjax = false;
			goToStatePage('reg');
		}
		else {
			console.log('AJAX: Данный пользователя успешно обновлены!');
		}
		keyWarUpdate = false;
	}
}
// Чтение данных по AJAX
function restoreInfo(type) {
	// параметры: type - 'read' - обращение в БД с экраном "Загрузка"
	if (type === 'read') {
		goToStatePage('loading');
	}
	console.log('AJAX: Запрашиваем данные...');
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
		data: {f: 'READ',n: ajaxListUsers},
		success: readReady, error: errorAjaxUsers, timeout: 10000
	});
}
// Работа с полученными данными по AJAX
function readReady(callresult) {
	if (callresult.error !== undefined) {
		alert(callresult.error +'\n\n Ошибка №3 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
		if (keyReg === true) {
			goToStatePage('reg');
			keyReg = false;
		} else {
			goToStatePage('login');
			keyLog = false;
		}
	}
	else if (callresult.result !== "") {
		console.log('AJAX: Данные получены!')
		cookieUsersInfo = JSON.parse(callresult.result);
		if (keyReg === true) {
			goToStatePage('reg');
			registerUser();
		}
		if (keyLog === true) {
			goToStatePage('login');
			logInUser();
		}
		if (keyStart === true) {
			openGame();
		}
		if (keyTops === true) {
			topsList();
		}
		if (keySave === true) {
			saveProgress();
		}
		if (keyAjax === true) { // админ
			console.log(cookieUsersInfo);
			keyAjax = false;
		}
	}
}
// Ошибка AJAX
function errorAjaxUsers(jqXHR,statusStr,errorStr) {
	alert(statusStr+' '+errorStr +'\n\n Ошибка №4 обращения к серверу! Сделайте скриншот экрана и обратитесь к администратору TG: @aimpik');
	if (keyReg === true) {
		goToStatePage('reg');
		keyReg = false;
	} else {
		goToStatePage('login');
		keyLog = false;
	}
}
// Запись в LocalStorage
function writeLocalStorage() {
	localStorage.setItem('name', userInfo.name);
	localStorage.setItem('pass', userInfo.pass);
	console.log('LocalStorage: Данные записаны!');
	return true;
}
// Чтение из LocalStorage
function readLocalStorage() {
	let localStorageName = localStorage.getItem('name');
	let localStoragePass = localStorage.getItem('pass');
	if (localStorageName && localStoragePass) {
		userInfo = {name: (localStorageName), pass: (localStoragePass)};
		console.log('LocalStorage: Данные прочитаны!');
		return true;
	}
	else {
		console.log('LocalStorage: Данные отсутствуют!');
		return false;
	}
}

// ---------- Служебные функции ----------
// Добавить проверку админа !!!
function startAjax() {
	updateAjaxPassword = Math.random();
	keyAjax = true;
	cookieUsersInfo = {};
	console.log('AJAX: Выполняем сброс...');
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType:'json',
		data: {f: 'LOCKGET', n: ajaxListUsers, p: updateAjaxPassword},
		success: writeAjaxUsers, error: errorAjaxUsers, timeout: 10000
	});
	goToStatePage('reg');
}
function getInfoAjax() {
	keyAjax = true;
	restoreInfo();
}
function resetLocalStorage() {
	localStorage.removeItem('name');
	localStorage.removeItem('pass');
	console.log('LocalStorage: Данные обнулены!');
}

// ---------- Игровой цикл ----------
function gameLoop(nowTimeFrame) {
	if (fixNum === 1) {
		drawAnimBackground();
		updateGame(nowTimeFrame);
	}
	else{
		fixNum++;
	}
	window.requestAnimationFrame(gameLoop);
}
gameLoop();
function updateGame(nowTimeFrame) {
	if (gameLvl){
		gameLvl.animFrame();
	}
	if (!lastTimeFrame || nowTimeFrame - lastTimeFrame >= 500) {

		// анимация лампы с частотой 500мс
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
	if (animUpdate.key === true) {
		// разовый запуск анимации вспышки
		animUpdate.obj.style.opacity = '1';
		animUpdate.count += 5; // скорость перехода
		animUpdate.obj.style.width = `${animUpdate.count}%`;
		animUpdate.obj.style.height = `${animUpdate.count}%`;
		if (animUpdate.count > 400) { // длительность анимации
			animUpdate.obj.style.opacity = '0';
			animUpdate.key = false;
			animUpdate.count = 0;
		}
	}
}

// ---------- Вспомогательные функции ----------
// Случайное значение
function randomNum(type, min, max) {
	// параметры - type: 0 = обычный рандом (нецелочисленное),
	// 				  1 = от min до max (нецелочисленное),
	//				  2 = от min до max (целочисленное)
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
// Массовая установка атрибутов элементу
function setAttributes(el, attrs) {
	// вызов: setAttributes(элемент,{'атрибут1':'значение1', ...})
	for(let key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
}

// ----------  ----------
//import levelJson from "../resource/level/level_list.json" assert {type: "json"};