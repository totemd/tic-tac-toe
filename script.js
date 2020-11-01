const CreatePlayer = (mark, container) => {
    let score = 0;
    let active = false;
    let type = null;
    const typeContainer = container.querySelector("select");

    typeContainer.removeAttribute("disabled");
    container.querySelector(".select-container").style.border = "1px dotted var(--border-color)";

    const updateDisplay = () => {
        const scoreContainer = container.querySelector(".score");
        scoreContainer.textContent = score;
        container.style.border = active ? "1px dotted var(--border-color)" : "";
    };

    updateDisplay();

    const win = () => {
        score++;
        updateDisplay();
    };

    const reset = () => {
        score = 0;
        active = false;
        updateDisplay();
    };

    const toggleActive = () => {
        active = !active;
        updateDisplay();
    };

    const makeMove = () => {
        const board = gameBoard.getAllMarks();
        if (type === "comp-easy") {
            const randomMove = findRandomMove(board);
            gameBoard.input(randomMove.col + 1, randomMove.row + 1);
        } else if (type === "comp-hard") {
            const bestMove = findBestMove(board);
            if (bestMove.col > -1 && bestMove.row > -1) {
                gameBoard.input(bestMove.col + 1, bestMove.row + 1);
            }
        }
        updateDisplay();
    };

    const getMark = () => mark;

    const setType = () => {
        type = typeContainer.value;
        typeContainer.setAttribute("disabled", "");
        container.querySelector(".select-container").style.border = "1px solid var(--bg-color)";
    };

    updateDisplay();

    // MINIMAX ALGORITHM FUNCTIONS

    // Results +10 if _this_ player is winning,
    // -10 if the opponent is winning,
    // 0 in case of draw.
    const evaluate = (board) => {
        // Checking rows
        for (let row = 0; row < 3; row++) {
            if (board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
                if (board[row][0] === mark) {
                    return 10;
                } else if (board[row][0] !== "_") {
                    return -10;
                }
            }
        }
        // Checking columns
        for (let col = 0; col < 3; col++) {
            if (board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
                if (board[0][col] === mark) {
                    return 10;
                } else if (board[0][col] !== "_") {
                    return -10;
                }
            }
        }
        // Checking diagonals
        if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            if (board[0][0] === mark) {
                return 10;
            } else if (board[0][0] !== "_") {
                return -10;
            }
        }
        if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            if (board[0][2] === mark) {
                return 10;
            } else if (board[0][2] !== "_") {
                return -10;
            }
        }
        return 0;
    }

    const isMovesLeft = (board) => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === "_") {
                    return true;
                }
            }
        }
        return false;
    };

    // This function evaluates all the possible moves and returns the best value for that move
    // Maximizing player is _this_ player
    const minimax = (board, depth, isMaximizingPlayer) => {
        // Evaluate the current board
        let score = evaluate(board);
        // If it is in final state, return its score
        if (score === 10 || score === -10) {
            return score;
        }
        if (isMovesLeft(board) === false) {
            return 0;
        }
        // Otherwise, evaluate "further" boards :
        if (isMaximizingPlayer) {
            let bestVal = -Infinity;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board[row][col] === "_") {
                        board[row][col] = mark;
                        let mmVal = minimax(board, depth + 1, !isMaximizingPlayer)
                        bestVal = bestVal >= mmVal ? bestVal : mmVal;
                        board[row][col] = "_";
                    }
                }
            }
            return bestVal - depth;
        } else {
            let bestVal = Infinity;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board[row][col] === "_") {
                        board[row][col] = (mark === "X") ? "O" : "X";   // Fix this
                        let mmVal = minimax(board, depth + 1, !isMaximizingPlayer)
                        bestVal = bestVal <= mmVal ? bestVal : mmVal;
                        board[row][col] = "_";
                    }
                }
            }
            return bestVal + depth;
        }
    };

    // This function evaluates all moves with minimax and returns the best move
    const findBestMove = (board) => {
        bestVal = -Infinity;
        bestMove = { row: -1, col: -1 };
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === "_") {
                    board[row][col] = mark;
                    moveVal = minimax(board, 0, false);
                    board[row][col] = "_";
                    if (moveVal > bestVal) {
                        bestMove.row = row;
                        bestMove.col = col;
                        bestVal = moveVal;
                    }
                }
            }
        }
        return bestMove;
    };

    const findRandomMove = (board) => {
        let possibleMoves = []
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === "_") {
                    possibleMoves.push({row: row, col: col});
                }
            }
        }
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    return { win, reset, toggleActive, getMark, setType, makeMove };
};

const Cell = (x, y, container) => {
    let mark = null;

    function input() {
        mark = game.getActivePlayer().getMark();
        container.textContent = mark;
        deactivate();
        game.goToNextTurn(x, y);
    };

    const activate = () => {
        container.classList.add("free-cell");
        container.addEventListener("click", input);
    };

    const deactivate = () => {
        container.classList.remove("free-cell");
        container.removeEventListener("click", input);
    };

    const clear = () => {
        mark = null;
        container.textContent = "";
        deactivate();
    };

    const getMark = () => mark;

    return { activate, deactivate, clear, getMark, input };
};

const gameBoard = (() => {
    const board = [];
    for (let j = 1; j <= 3; j++) {
        for (let i = 1; i <= 3; i++) {
            board.push(Cell(i, j, document.getElementById(`x${i}y${j}`)));
        }
    }

    const clearAll = () => {
        for (let i = 0; i < 9; i++) {
            board[i].clear();
        }
    };

    const activateAll = () => {
        for (let i = 0; i < 9; i++) {
            board[i].activate();
        }
    }

    const deactivateAll = () => {
        for (let i = 0; i < 9; i++) {
            board[i].deactivate();
        }
    }

    const getIndex = (x, y) => (x - 1) + 3 * (y - 1);

    const getMarkAt = (x, y) => board[getIndex(x, y)].getMark();

    const getAllMarks = () => {
        let output = [];
        for (let i = 0; i < 3; i++) {
            output[i] = [];
            for (let j = 0; j < 3; j++) {
                let mark = getMarkAt(j + 1, i + 1);
                mark = (mark === null) ? "_" : mark;
                output[i][j] = mark;
            }
        }
        return output;
    };

    const getRow = (y) => [getMarkAt(1, y), getMarkAt(2, y), getMarkAt(3, y)];

    const getCol = (x) => [getMarkAt(x, 1), getMarkAt(x, 2), getMarkAt(x, 3)];

    const checkWinner = (x, y) => {
        const allEqual = arr => arr.every(el => el === arr[0]);
        let firstDiagonal = ["cannot", "pass", "test"];
        let secondDiagonal = ["cannot", "pass", "test"];

        if (x === y) {
            firstDiagonal = [getMarkAt(1, 1), getMarkAt(2, 2), getMarkAt(3, 3)];
        }
        if (x + y === 4) {
            secondDiagonal = [getMarkAt(3, 1), getMarkAt(2, 2), getMarkAt(1, 3)];
        }

        if (allEqual(getRow(y)) || allEqual(getCol(x)) || allEqual(firstDiagonal) || allEqual(secondDiagonal)) {
            return getMarkAt(x, y);
        } else {
            return null;
        }

    };

    const input = (x, y) => {
        board[getIndex(x, y)].input();
    };

    return { getMarkAt, getAllMarks, activateAll, deactivateAll, clearAll, checkWinner, input };
})();

const game = (() => {
    let players = [];

    let turn = 0;
    let startingPlayer = 0;

    const startButton = document.getElementById("start-button");
    startButton.addEventListener("click", () => startGame());
    const newButton = document.getElementById("new-button");
    newButton.addEventListener("click", () => newGame());
    newButton.setAttribute("disabled", true)
    const nextRoundButton = document.getElementById("nextround-button");
    nextRoundButton.addEventListener("click", () => nextRound());
    nextRoundButton.setAttribute("disabled", true);

    const logFooter = (message) => {
        document.getElementById("winner").textContent = message;
    };

    const startGame = () => {
        turn = 0;
        players[startingPlayer].toggleActive();
        gameBoard.activateAll();
        newButton.removeAttribute("disabled");
        startButton.setAttribute("disabled", true);
        nextRoundButton.setAttribute("disabled", true);
        players.forEach(p => p.setType());
        getActivePlayer().makeMove();
    };

    const newGame = () => {
        startingPlayer = 0;
        turn = 0;
        gameBoard.clearAll();
        logFooter("");
        players.forEach(p => p.reset());
        startButton.removeAttribute("disabled");
        newButton.setAttribute("disabled", true);
        nextRoundButton.setAttribute("disabled", true);
        players[0] = CreatePlayer("X", document.getElementById("player1-container"));
        players[1] = CreatePlayer("O", document.getElementById("player2-container"));
    };

    const nextRound = () => {
        startingPlayer = (startingPlayer + turn) % 2;
        turn = 0;
        gameBoard.clearAll();
        gameBoard.activateAll();
        logFooter("");
        getActivePlayer().makeMove();
    };

    const getActivePlayer = () => players[(startingPlayer + turn) % 2];

    const goToNextTurn = (x, y) => {
        let winner = gameBoard.checkWinner(x, y);
        if (winner) {
            gameBoard.deactivateAll();
            logFooter(`${winner} wins!`);
            getActivePlayer().win();
            nextRoundButton.removeAttribute("disabled");
        } else if (turn === 8) {
            logFooter("Draw!");
            nextRoundButton.removeAttribute("disabled");
        } 
        turn++;
        players.forEach(p => p.toggleActive());
        if (winner === null && turn < 9) {
            getActivePlayer().makeMove();
        }
    };

    newGame();

    return { getActivePlayer, goToNextTurn };
})();




