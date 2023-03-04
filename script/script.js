"use strict"; // Строгий режим
// ----------------------- JavaScript -----------------------
const bodyBackground = document.body; // body
let gradientBody = {num: 0,
	1: ['#000851','#1CB5E0','#0E5F99'],
	2: ['#0700b8','#00ff88','#0474A2'],
	3: ['#009b9f','#b922c3','#AB8247'],
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

window.addEventListener("resize", function() { // изменение размера окна
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
// РАНДОМ - type: 0 = обычный рандом (нецелочисленное), 
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
// Массовая установка атрибутов элементу
// вызов: setAttributes(элемент,{'атрибут1':'значение1', ...})
function setAttributes(el, attrs) {
	for(let key in attrs) {
		el.setAttribute(key, attrs[key]);
	}
}
// ----------  ----------
