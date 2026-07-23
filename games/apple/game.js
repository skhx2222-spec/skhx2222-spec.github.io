// Game state
const gameState = {
    grid: [],
    score: 0,
    moves: 0,
    isSelecting: false,
    selectionStart: null,
    selectionEnd: null,
    currentSum: 0,
    selectedCells: new Set()
};

// Constants
const GRID_SIZE = 10;
const TARGET_SUM = 10;
const MIN_NUMBER = 1;
const MAX_NUMBER = 9;

// DOM elements
const gameGrid = document.getElementById('game-grid');
const scoreValue = document.getElementById('score-value');
const movesValue = document.getElementById('moves-value');
const sumValue = document.getElementById('sum-value');
const selectionSumEl = document.getElementById('selection-sum');
const restartButton = document.getElementById('restart-button');

// Initialize game
function initializeGame() {
    gameState.grid = [];
    gameState.score = 0;
    gameState.moves = 0;
    gameState.currentSum = 0;
    gameState.selectedCells.clear();
    
    // Generate random grid
    for (let row = 0; row < GRID_SIZE; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            gameState.grid[row][col] = getRandomNumber();
        }
    }
    
    renderGrid();
    updateUI();
}

// Generate random number between MIN_NUMBER and MAX_NUMBER
function getRandomNumber() {
    return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
}

// Render the grid
function renderGrid() {
    gameGrid.innerHTML = '';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const apple = document.createElement('div');
            apple.className = 'apple';
            apple.dataset.row = row;
            apple.dataset.col = col;
            
            const number = document.createElement('div');
            number.className = 'apple-number';
            number.textContent = gameState.grid[row][col];
            
            apple.appendChild(number);
            gameGrid.appendChild(apple);
        }
    }
}

// Get cell coordinates from mouse event
function getCellFromEvent(event) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (element && element.classList.contains('apple')) {
        return {
            row: parseInt(element.dataset.row),
            col: parseInt(element.dataset.col)
        };
    }
    return null;
}

// Get cells in rectangular selection
function getSelectedCells(start, end) {
    if (!start || !end) return [];
    
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    
    const cells = [];
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            cells.push({ row, col });
        }
    }
    return cells;
}

// Calculate sum of selected cells
function calculateSum(cells) {
    return cells.reduce((sum, cell) => {
        return sum + gameState.grid[cell.row][cell.col];
    }, 0);
}

// Update visual selection
function updateSelection(cells) {
    // Clear previous selection
    document.querySelectorAll('.apple.selected').forEach(apple => {
        apple.classList.remove('selected');
    });
    
    // Apply new selection
    cells.forEach(cell => {
        const apple = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
        if (apple) {
            apple.classList.add('selected');
        }
    });
}

// Update UI displays
function updateUI() {
    scoreValue.textContent = gameState.score;
    movesValue.textContent = gameState.moves;
    sumValue.textContent = gameState.currentSum;
    
    // Update sum display styling
    selectionSumEl.classList.remove('sum-valid', 'sum-invalid');
    if (gameState.currentSum === TARGET_SUM) {
        selectionSumEl.classList.add('sum-valid');
    } else if (gameState.currentSum > 0 && gameState.currentSum !== TARGET_SUM) {
        selectionSumEl.classList.add('sum-invalid');
    }
}

// Handle mouse down (start selection)
function handleMouseDown(event) {
    const cell = getCellFromEvent(event);
    if (cell) {
        gameState.isSelecting = true;
        gameState.selectionStart = cell;
        gameState.selectionEnd = cell;
        
        const cells = getSelectedCells(gameState.selectionStart, gameState.selectionEnd);
        gameState.currentSum = calculateSum(cells);
        updateSelection(cells);
        updateUI();
    }
}

// Handle mouse move (update selection)
function handleMouseMove(event) {
    if (gameState.isSelecting) {
        const cell = getCellFromEvent(event);
        if (cell) {
            gameState.selectionEnd = cell;
            
            const cells = getSelectedCells(gameState.selectionStart, gameState.selectionEnd);
            gameState.currentSum = calculateSum(cells);
            updateSelection(cells);
            updateUI();
        }
    }
}

// Handle mouse up (finalize selection)
function handleMouseUp(event) {
    if (gameState.isSelecting) {
        gameState.isSelecting = false;
        
        const cells = getSelectedCells(gameState.selectionStart, gameState.selectionEnd);
        const sum = calculateSum(cells);
        
        gameState.moves++;
        
        if (sum === TARGET_SUM) {
            // Valid selection - remove apples
            removeApples(cells);
        } else {
            // Invalid selection - clear selection
            updateSelection([]);
            gameState.currentSum = 0;
            updateUI();
        }
        
        gameState.selectionStart = null;
        gameState.selectionEnd = null;
    }
}

// Remove apples with animation
function removeApples(cells) {
    // Add animation class
    cells.forEach(cell => {
        const apple = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
        if (apple) {
            apple.classList.add('removing');
        }
    });
    
    // Wait for animation, then regenerate
    setTimeout(() => {
        // Update score
        gameState.score += cells.length;
        
        // Regenerate apples
        cells.forEach(cell => {
            gameState.grid[cell.row][cell.col] = getRandomNumber();
        });
        
        // Re-render grid
        renderGrid();
        
        // Add appearing animation
        cells.forEach(cell => {
            const apple = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
            if (apple) {
                apple.classList.add('appearing');
            }
        });
        
        // Reset sum display
        gameState.currentSum = 0;
        updateUI();
    }, 500);
}

// Restart game
function restartGame() {
    // Clear any ongoing selection
    document.querySelectorAll('.apple.selected').forEach(apple => {
        apple.classList.remove('selected');
    });
    
    initializeGame();
}

// Event listeners
gameGrid.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
restartButton.addEventListener('click', restartGame);

// Prevent default drag behavior
gameGrid.addEventListener('dragstart', (e) => e.preventDefault());

// Initialize game on load
initializeGame();
