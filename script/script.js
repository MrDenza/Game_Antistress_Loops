"use strict"; // Строгий режим
// ----------------------- JavaScript -----------------------
let bodyBackground = document.body; // body
let bodyAnimation = document.querySelector('.body_animation');// canvas
let bodyAnimationCanvas = bodyAnimation.getContext('2d'); // canvas холст для рисования
let screenSizeW = (bodyAnimation.width = window.innerWidth); // ширина окна
let screenSizeH = (bodyAnimation.height = window.innerHeight); // высота окна
const bodyContainer = document.querySelector('.body__container'); // main

let massElemBackground = []; // массив всех элементов анимации фона

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
		this.elemRadius = randomNum(2,1,8); // размер элемента
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

// ---------- Слушатели ----------
window.addEventListener("resize", function() { // изменение размера окна
	(screenSizeW = bodyAnimation.width = window.innerWidth); 
	(screenSizeH = bodyAnimation.height = window.innerHeight);
	massElemBackground = [];
});

// ---------- Работа с фоном ----------
function backgroundGame() { // установка градиента фона
	bodyBackground.className = `body_gradient-${randomNum(2,1,5)}`;
}
backgroundGame();
function drawAnimBackground() {
	bodyAnimationCanvas.clearRect(0,0, screenSizeW, screenSizeH);
	
	if(massElemBackground.length < 50){
		do {
			massElemBackground.push(new elemBackground());
		}
		while (massElemBackground.length > 50);
	}
	//animation
	for(let i = 0; i < massElemBackground.length; i++){
		massElemBackground[i].move();
		massElemBackground[i].show();
		if(massElemBackground[i].elemPosX < 0 || massElemBackground[i].elemPosX > screenSizeW || massElemBackground[i].elemPoxY < 0 || massElemBackground[i].elemPoxY > screenSizeH){
			massElemBackground.splice(i,1);
		}
	}
}

// ---------- Игровой цикл ----------
function gameLoop() { // цикл
	drawAnimBackground();
	updateGame();
	renderGame();
	window.requestAnimationFrame(gameLoop);
	
}
gameLoop();
function updateGame() { // физика игры
	
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

// ----------  ----------
