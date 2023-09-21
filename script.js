//! CSS color names of colors that can be used for tiles
const colors = ['red', 'orange', 'yellow', 'green', 'lightblue',
                'blue', 'purple', 'brown', 'pink', 'lightgrey'];

//! cells count
const fieldHeight = document.getElementsByTagName('tr').length;
const fieldWidth = document.getElementsByTagName('td').length / fieldHeight;

//! amount of tiles to generate at the beginning of the game
const countOfTilesInTheBeginning = 2;

//! in an array of strings search for a one that starts from pattern
function findPattern(array, pattern){
	if (typeof(pattern) != 'string') console.log(typeof(pattern));
	if (typeof(array) != 'object') return null;
	for (let element of array)
		if (element.substring(0, pattern.length) === pattern) return element;
	return null;
}

function randomInt(min, max){
	return Math.floor(Math.random() * (max - min) + min);
}

// for debug
function myTypeOf(value){
	if (typeof(value) != 'object') return typeof(value);
	if (value === null) return 'null';
	if (Array.isArray(value)) return 'Array';
	if (value.textContent != undefined) return 'Node';
	return 'object';
}

function col(cell){
	let patternResult = findPattern(cell.classList, 'col');
	if (patternResult == null) return null;
	return Number(patternResult.substring(3))
}

function row(cell){
	if (findPattern(cell.classList, 'row') == null) return null;
	return Number(findPattern(cell.classList, 'row').substring(3))
}

function findCell(col, row){
	for (let cell of document.getElementsByClassName('col' + col))
		if (cell.classList.contains('row' + row)) return cell;
	return null;
}

function processCell(target, source){
	if (Array.from(target.classList).join() === Array.from(source.classList).join())
		alert('processing cell ' + col(target) + 'x' + row(target) + ' on itself');
	console.log(target.textContent, ' ', source.textContent);
	if (target.textContent === '' && source.textContent !== ''){
		console.log('move to ' + Array.from(target.classList).join());
		target.textContent = source.textContent;
		target.style.backgroundColor = source.style.backgroundColor;
		source.textContent = '';
		source.style.backgroundColor = 'lightblue';
		return 'MOVE';
	}
	if (target.textContent !== '' &&
	    (target.textContent === source.textContent ||
	     target.style.backgroundColor == source.style.backgroundColor)){
		console.log('merge ' + Array.from(target.classList).join() +
		            ' and ' + Array.from(source.classList).join());
		target.textContent = Number(target.textContent) + Number(source.textContent);
		source.textContent = '';
		source.style.backgroundColor = 'lightblue';
		score = document.getElementById('score-itself');
		score.textContent = Number(score.textContent) + Number(target.textContent);
		return 'MERG';
	}
	return 'NONE';
}

function processLine(number, vertical, direction){
	if (typeof(number) != 'number' ||
	    typeof(vertical) != 'boolean' ||
	    typeof(direction) != 'boolean')
		alert('Bad types at processLine: (' +
		      typeof(number) + ', ' +
			  typeof(vertical) + ', ' +
			  typeof(direction) + ') instead of (number, boolean, boolean)');
	let line = Array.from(document.getElementsByClassName((vertical? 'col': 'row') + number));
	let logLine = '';
	for (let a of line) logLine += a.textContent + ' ';
	if (!direction) line.reverse();
	console.log('processLine: ' + logLine);
	let movedAnything = false; // if no tiles moved, we will not make new one
	for (let targetIndex = 0; targetIndex < line.length - 1; ++targetIndex){
		for (let sourceIndex = targetIndex + 1; sourceIndex < line.length; ++sourceIndex){
			let status = processCell(line[targetIndex], line[sourceIndex]);
			if (status !== 'NONE') movedAnything = true;
			if (status === 'MERG' || line[sourceIndex].textContent != '') break;
		}
	}
	return movedAnything;
}

function makeNewTile(){
	let freeCells = []
	for (let cell of document.getElementsByTagName('td')){
		if (cell.textContent == '' || cell.textContent == undefined){
			freeCells.push(cell);
		}
	}
	cellIndex = randomInt(0, freeCells.length);
	freeCells[cellIndex].textContent = '2';
	freeCells[cellIndex].style.backgroundColor =
		colors[randomInt(0, Number(document.getElementById('colors-regulator-value').textContent))];
}

// loose condition
function isLost(){
	for (let cell of document.getElementsByTagName('td')){
		if (cell.textContent === '') return false;
		let neighbours = []
		neighbours.push(findCell(col(cell), row(cell) - 1));
		neighbours.push(findCell(col(cell), row(cell) + 1));
		neighbours.push(findCell(col(cell) - 1, row(cell)));
		neighbours.push(findCell(col(cell) + 1, row(cell)));
		for (let n of neighbours){
			console.log('Type of n: ' + myTypeOf(n));
			if (n != null &&
				(n.textContent == cell.textContent ||
					n.style.backgroundColor == cell.style.backgroundColor)){
				return false;
			}
		}
	}
	return true;
}

function loose(){
	window.removeEventListener('keypress', (e) => {});
	alert('Вы проиграли!');
}

function up(){
	let movedAnything = false;
	for (let col = 1; col <= fieldWidth; ++col)
		movedAnything = processLine(col, true, true) || movedAnything;
	if (movedAnything) makeNewTile();
	if (isLost()) loose();
}

function down(){
	let movedAnything = false;
	for (let col = 1; col <= fieldWidth; ++col)
		movedAnything = processLine(col, true, false) || movedAnything;
	if (movedAnything) makeNewTile();
	if (isLost()) loose();
}

function left(){
	let movedAnything = false;
	for (let row = 1; row <= fieldWidth; ++row)
		movedAnything = processLine(row, false, true) || movedAnything;
	if (movedAnything) makeNewTile();
	if (isLost()) loose();
}

function right(){
	let movedAnything = false;
	for (let row = 1; row <= fieldWidth; ++row)
		movedAnything = processLine(row, false, false) || movedAnything;
	if (movedAnything) makeNewTile();
	if (isLost()) loose();
}

window.addEventListener("keypress", (e) => {
	console.log(e.code);
	switch (e.code){
		case "ArrowUp"   : case "KeyW": up(); break;
		case "ArrowDown" : case "KeyS": down(); break;
		case "ArrowLeft" : case "KeyA": left(); break;
		case "ArrowRight": case "KeyD": right();
	}
	for (let cell of document.getElementsByTagName('td')){
		var str;
		str += cell.textContent + ' ';
		if (cell.classList.contains("col4")){console.log(str); str = '';}
	}
});

for (let i = 0; i < countOfTilesInTheBeginning; ++i) makeNewTile();

// dark mode
document.getElementById('dark-mode-switcher').addEventListener('click', (event) => {
	document.body.classList.toggle('dark-mode');
	document.getElementById('score').classList.toggle('dark-mode');
	document.getElementById('colors-regulator-value').classList.toggle('dark-mode');
	for (let button of document.getElementsByClassName('button'))
		button.classList.toggle('dark-mode');
});

// change colors count
document.getElementById('minus').addEventListener('click', (event) => {
	let minus = document.getElementById('minus');
	let val = document.getElementById('colors-regulator-value');
	let plus = document.getElementById('plus');

	if (minus.classList.contains('disabled')) return;
	val.textContent -= 1;
	if (val.textContent == 1) minus.classList.add('disabled');
	plus.classList.remove('disabled');

	for (let cell of document.getElementsByTagName('td'))
		if (cell.style.backgroundColor == colors[val.textContent] && cell.textContent != '')
			cell.style.backgroundColor = colors[randomInt(0, val.textContent - 1)];
});

document.getElementById('plus').addEventListener('click', (event) => {
	let minus = document.getElementById('minus');
	let val = document.getElementById('colors-regulator-value');
	let plus = document.getElementById('plus');

	if (plus.classList.contains('disabled')) return;
	val.textContent = Number(val.textContent) + 1;
	if (val.textContent == 10) plus.classList.add('disabled');
	minus.classList.remove('disabled');
});