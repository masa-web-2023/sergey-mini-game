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
	freeCells[cellIndex].style.backgroundColor = colors[randomInt(0, 9)];
}

function up(){
	let movedAnything = false;
	for (let col = 1; col <= fieldWidth; ++col)
		movedAnything = processLine(col, true, true) || movedAnything;
	if (movedAnything) makeNewTile();
}

function down(){
	let movedAnything = false;
	for (let col = 1; col <= fieldWidth; ++col)
		movedAnything = processLine(col, true, false) || movedAnything;
	if (movedAnything) makeNewTile();
}

function left(){
	let movedAnything = false;
	for (let row = 1; row <= fieldWidth; ++row)
		movedAnything = processLine(row, false, true) || movedAnything;
	if (movedAnything) makeNewTile();
}

function right(){
	let movedAnything = false;
	for (let row = 1; row <= fieldWidth; ++row)
		movedAnything = processLine(row, false, false) || movedAnything;
	if (movedAnything) makeNewTile();
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
	document.getElementById('dark-mode-switcher').classList.toggle('dark-mode');
})