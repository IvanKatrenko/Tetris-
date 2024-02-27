import {
    PLAYFIELD_COLUMNS,
    PLAYFIELD_ROWS,
    TETROMINO_NAMES,
    TETROMINOES,
    gameOverBlock,
    btnRestart
} from './utils.js';

// Змінні стану гри.
let playfield,
    tetromino,
    timeoutId,
    requestId,
    cells,
    score = 0,
    isPaused = false,
    isGameOver = false;



//идет запуск игры заново c обновленияем счетчика и падением фигур
// ЗАПУСК
init();

function init() {
    gameOverBlock.style.display = 'none'
    isGameOver = false;
    generatePlayfield();
    generateTetromino();
    startLoop();
    cells = document.querySelectorAll('.tetris div');
    score = 0;
    countScore(null);
}

//KEY DOWN EVENTS
document.addEventListener('keydown', onKeyDown)
btnRestart.addEventListener('click', function () {
    init();
});

function togglePauseGame() {
    isPaused = !isPaused;

    if (isPaused) {
        stopLoop()
    } else {
        startLoop()
    }
}

// Функція обробки події клавіатури та клік.
function onKeyDown(event) {
    // console.log(event);
    if (event.key == 'p') {
        togglePauseGame();
    }// нажимаем p и работает пауза

    if (isPaused) {
        return
    }

    switch (event.key) {
        case ' ':
            dropTetrominoDown(); // функия ускорению фигур при помощи пробела
            break;
        case 'ArrowUp':
            rotateTetromino();
            break;
        case 'ArrowDown':
            moveTetrominoDown();
            break;
        case 'ArrowLeft':
            moveTetrominoLeft();
            break;
        case 'ArrowRight':
            moveTetrominoRight();
            break;
    }

    draw();
}

//функция падения и ускрению при помощи пробела
function dropTetrominoDown() {
    while (!isValid()) {
        tetromino.row++;
    }
    tetromino.row--;
}

// Функція рух фігури вниз.
function moveTetrominoDown() {
    tetromino.row += 1;
    if (isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
}
// Функція рух фігури ліворуч.
function moveTetrominoLeft() {
    tetromino.column -= 1;
    if (isValid()) {
        tetromino.column += 1;
    }
}
// Функція рух фігури праворуч.
function moveTetrominoRight() {
    tetromino.column += 1;
    if (isValid()) {
        tetromino.column -= 1;
    }
}
//KEY DOWN EVENTS FINISH


// FUNCTION GENERATE PLAYFIELDS AND TETROMINO

function generatePlayfield() {
    document.querySelector('.tetris').innerHTML = '';
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }

    playfield = new Array(PLAYFIELD_ROWS).fill()
        .map(() => new Array(PLAYFIELD_COLUMNS).fill(0))
    // console.log(playfield);
}

function generateTetromino() {
    const nameTetro = getRandomElement(TETROMINO_NAMES);
    const matrixTetro = TETROMINOES[nameTetro];

    // const rowTetro = 3;
    const rowTetro = -2;
    const columnTetro = Math.floor(PLAYFIELD_COLUMNS / 2 - matrixTetro.length / 2);

    tetromino = {
        name: nameTetro,
        matrix: matrixTetro,
        row: rowTetro,
        column: columnTetro,
    }
}
// FUNCTION GENERATE PLAYFIELDS AND TETROMINO FINISH


// DRAW 
// Функція зміни кольру ігрового поля.
function drawPlayField() {

    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            // if(playfield[row][column] == 0) { continue };
            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
        }
    }

}
// Функція зміни кольру фігури.
function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            // cells[cellIndex].innerHTML = array[row][column];
            if (isOutsideTopBoard(row)) { continue }
            if (tetromino.matrix[row][column] == 0) { continue }
            const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function draw() {
    cells.forEach(function (cell) { cell.removeAttribute('class') });
    drawPlayField();
    drawTetromino();
    console.table(playfield)
}

//наш счетчик
function countScore(destroyRows) {
    switch (destroyRows) {
        case 1:
            score += 10;
            break;
        case 2:
            score += 20;
            break;
        case 3:
            score += 30;
            break;
        case 4:
            score += 40;
            break;
        default:
            score += 0;
    }
    document.querySelector('.score').innerHTML = score;
}

function gameOver() {
    stopLoop();

    gameOverBlock.style.display = 'flex';
}
// DRAW FINISH


function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}


function isOutsideTopBoard(row) {
    return tetromino.row + row < 0;
}

// Функція зміни стану поля та фігури.

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (!tetromino.matrix[row][column]) { continue; }
            //if (tetromino.matrix[row][column] == 0) { continue; }
            if (isOutsideOfGameBoard(row, column)) { return true }
            if (hasCollisions(row, column)) { return true }
        }
    }
    return false;
}

// Функція перевірки чи торкається фігура краю екрану.
function isOutsideOfGameBoard(row, column) {
    return tetromino.column + column < 0 ||
        tetromino.column + column >= PLAYFIELD_COLUMNS ||
        tetromino.row + row >= playfield.length
}

//cделаем нашу колизию что б фигпуки видели друг друга
function hasCollisions(row, column) {
    return playfield[tetromino.row + row]?.[tetromino.column + column]
}

function placeTetromino() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (!tetromino.matrix[row][column])
                continue;
            if (isOutsideTopBoard(row)) {
                isGameOver = true;
                return
            }
            playfield[tetromino.row + row][tetromino.column + column] = TETROMINO_NAMES[0];
        }
    }
    // пишем чтоб можно было удалять линию снизу  и свмещать все вниз
    const filledRows = findFilledRows();
    console.log(filledRows);
    removeFillRows(filledRows);
    generateTetromino();
}

// пишем чтоб можно было удалять линию снизу  и свмещать все вниз
function removeFillRows(filledRows) {
    // filledRows.forEach(row => {
    //     dropRowsAbove(row);
    // })

    for (let i = 0; i < filledRows.length; i++) {
        const row = filledRows[i];
        dropRowsAbove(row);
    }
    countScore(filledRows.length);
}

function dropRowsAbove(rowDelete) {
    for (let row = rowDelete; row > 0; row--) {
        playfield[row] = playfield[row - 1];
    }
    playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function findFilledRows() {
    const filledRows = [];
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        let filledColumns = 0;
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if (playfield[row][column] != 0) {
                filledColumns++;
            }
        }
        if (PLAYFIELD_COLUMNS == filledColumns) {
            filledRows.push(row);
        }
    }
    return filledRows;
}

function moveDown() {
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();
    if (isGameOver) {
        gameOver();
    }
}

//падение фигуры
function startLoop() {
    timeoutId = setTimeout(
        () => (requestId = requestAnimationFrame(moveDown)),
        700
    );
}
function stopLoop() {
    cancelAnimationFrame(requestId);
    timeoutId = clearTimeout(timeoutId);

}

// функция которая перевол=рачивает фигуры
function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    // array = rotateMatrix(array);
    tetromino.matrix = rotatedMatrix;
    if (isValid()) {
        tetromino.matrix = oldMatrix;
    }
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];
    for (let i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rotateMatrix;
}





















