const LEFT_PLAYER_MARK = "X";
const RIGHT_PLAYER_MARK = "O";

const CreatePlayer = (mark, playerContainer) => {
    // Initialization
    let score = 0;
    let type = null;
    playerContainer.style.border = "";
    playerContainer.querySelector(".score").textContent = score;

    const getMark = () => mark;

    const openSelection = () => {
        // Activate selection UI
        playerContainer.querySelector("select").removeAttribute("disabled");
        playerContainer.querySelector(".select-container").style.border = "1px dotted var(--border-color)";
    };

    const lockSelection = () => {
        // Store selection value
        type = playerContainer.querySelector("select").value;
        // Deactivate selection UI
        playerContainer.querySelector("select").setAttribute("disabled", "");
        playerContainer.querySelector(".select-container").style.border = "1px solid var(--bg-color)";
    };

    const startTurn = () => {
        // Light up the border
        playerContainer.style.border = "1px dotted var(--border-color)";
        // If it is AI (easy) turn, make a random move
        // If it is AI (hard) turn, make the best move
        if (type === "comp-easy") {
            const randomMove = findRandomMove(gameBoard.toArray());
            gameBoard.input(randomMove.row, randomMove.col, mark);
        } else if (type === "comp-hard") {
            const bestMove = findBestMove(gameBoard.toArray());
            if (bestMove.col > -1 && bestMove.row > -1) {
                gameBoard.input(bestMove.row, bestMove.col, mark);
            }
        }
    };

    const endTurn = () => {
        // Turn off the border
        playerContainer.style.border = "";
    };

    const winRound = () => {
        // Update score and display
        playerContainer.style.border = "";
        playerContainer.querySelector(".score").textContent = ++score;
    };

    // MINIMAX ALGORITHM FUNCTIONS

    const evaluate = (board) => {
        winner = gameBoard.getWinner(board);
        if (winner === mark) {
            return 10;
        } else if (winner === 0) {
            return 0;
        } else {
            return -10;
        }
    };

    // This function evaluates all the possible moves and returns the best value for that move
    // Maximizing player is _this_ player
    const minimax = (board, depth, isMaximizingPlayer) => {
        let score = evaluate(board);
        let opponentMark = (mark === LEFT_PLAYER_MARK) ? RIGHT_PLAYER_MARK : LEFT_PLAYER_MARK;

        // If it is in final state, return its score
        if (gameBoard.getWinner(board) !== 0) {
            return score;
        }
        if (gameBoard.anyFreeCell(board) === false) {
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
                        board[row][col] = opponentMark;
                        let mmVal = minimax(board, depth + 1, !isMaximizingPlayer)
                        bestVal = bestVal <= mmVal ? bestVal : mmVal;
                        board[row][col] = "_";
                    }
                }
            }
            return bestVal + depth;
        }
    };

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
        const choose = (array) => array[Math.floor(Math.random() * possibleMoves.length)]
        let possibleMoves = []
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === "_") {
                    possibleMoves.push({ row: row, col: col });
                }
            }
        }
        return choose(possibleMoves);
    };

    return {
        getMark,
        openSelection,
        lockSelection,
        startTurn,
        endTurn,
        winRound,
    };
};

const Cell = (cellContainer) => {
    let mark = null;

    const isFree = () => mark !== null;

    const getMark = () => {
        return isFree() ? mark : "_";
    };

    const clear = () => {
        mark = null;
        cellContainer.textContent = "";
    };

    const activate = () => {
        cellContainer.classList.add("free-cell");
        cellContainer.addEventListener("click", handleClick);
    };

    const deactivate = () => {
        cellContainer.classList.remove("free-cell");
        cellContainer.removeEventListener("click", handleClick);
    };

    const input = (newMark) => {
        mark = newMark;
        cellContainer.textContent = mark;
        deactivate();
        game.nextTurn();
    };

    const handleClick = () => {
        input(game.getActivePlayer().getMark());
    }

    return {
        isFree,
        getMark,
        clear,
        activate,
        deactivate,
        input
    };
};

const gameBoard = (() => {
    // Initialize a 2D array with cell objects
    const board = [];
    for (let row = 0; row < 3; row++) {
        board[row] = [];
        for (let col = 0; col < 3; col++) {
            board[row][col] = Cell(document.getElementById(`x${col + 1}y${row + 1}`));
        }
    }

    // Handle input from AI
    const input = (row, col, mark) => {
        board[row][col].input(mark);
    };

    // Clear all cells
    const clearAll = () => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                board[row][col].clear();
            }
        }
    };

    // Activate all cells
    const activateAll = () => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                board[row][col].activate();
            }
        }
    };

    // Deactivate all cells
    const deactivateAll = () => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                board[row][col].deactivate();
            }
        }
    };

    // Extract only the mark characters to a 2D array 
    const toArray = () => {
        let output = [];
        for (let row = 0; row < 3; row++) {
            output[row] = [];
            for (let col = 0; col < 3; col++) {
                output[row][col] = board[row][col].getMark();
            }
        }
        return output;
    };

    // Check and return the mark of the winner, if any
    // board is a facultative argument that takes 
    // any 2d array of mark characters (userful for
    // minimax evaluations)
    const getWinner = (board) => {
        // If no argument is passed, use this gameBoard
        if (board === undefined) {
            board = toArray();
        }
        // Check rows
        for (let row = 0; row < 3; row++) {
            if (board[row][0] !== "_") {
                if (board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
                    return board[row][0];
                }
            }
        }
        // Check columns
        for (let col = 0; col < 3; col++) {
            if (board[0][col] !== "_") {
                if (board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
                    return board[0][col];
                }
            }
        }
        // Check diagonals
        if (board[1][1] !== "_") {
            if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
                return board[1][1];

            }
            if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
                return board[1][1];

            }
        }
        // If there is no winner, return 0
        return 0;
    };

    // Returns true if any cell is free
    // board is a facultative argument that takes 
    // any 2d array of mark characters (userful for
    // minimax evaluations)    
    const anyFreeCell = (board) => {
        // If no argument is passed, use the gameBoard
        if (board === undefined) {
            board = toArray();
        }
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === "_") {
                    return true;
                }
            }
        }
        return false;
    };

    return {
        input,
        clearAll,
        activateAll,
        deactivateAll,
        toArray,
        getWinner,
        anyFreeCell
    };
})();

const game = (() => {
    // Initialize game variables
    let players = [];
    let turn = 0;
    let startingPlayer = 0;

    // Button factory function
    // A button is defined by its ID in the DOM and
    // the function it triggers
    const CreateButton = (id, handler) => {
        // Initialize by adding an event listener
        const domElement = document.getElementById(id);
        domElement.addEventListener("click", handler);
        deactivate();

        // Activate the button
        function activate() {
            domElement.removeAttribute("disabled");
        }

        // Deactivate the button
        function deactivate() {
            domElement.setAttribute("disabled", true);
        }

        return { activate, deactivate }
    };

    // Display a message under the gameboard
    const footerMessage = (message) => {
        document.getElementById("winner").textContent = message;
    };

    // Get the player whose turn is on
    const getActivePlayer = () => players[(startingPlayer + turn) % 2];

    // Create the 3 menu buttons
    const newButton = CreateButton("new-button", newGame);
    const startButton = CreateButton("start-button", startGame);
    startButton.activate();
    const nextRoundButton = CreateButton("nextround-button", nextRound);

    // Reset the game to a clean state
    function newGame() {
        // Reset gameboard
        gameBoard.clearAll();
        gameBoard.deactivateAll();
        // Update menu
        footerMessage(`Select players and press "Start game!" to start!`);
        newButton.deactivate();
        startButton.activate();
        nextRoundButton.deactivate();
        // Create new players
        players[0] = CreatePlayer(LEFT_PLAYER_MARK, document.getElementById("player1-container"));
        players[1] = CreatePlayer(RIGHT_PLAYER_MARK, document.getElementById("player2-container"));
        // Reset game state
        turn = 0;
        startingPlayer = 0;
        // Activate the player selection menus
        players.forEach(p => p.openSelection());
    }

    // Start the gameplay
    function startGame() {
        // Activate gameboard
        gameBoard.activateAll();
        // Update menu
        footerMessage("");
        newButton.activate();
        startButton.deactivate();
        nextRoundButton.deactivate();
        // Lock player selection menus
        players.forEach(p => p.lockSelection());
        // Initiate first turn
        getActivePlayer().startTurn();
    }

    // Continue game with a new round
    function nextRound() {
        // Reset turn counts
        turn = 0;
        startingPlayer = (startingPlayer + turn + 1) % 2;
        // Reset gameboard
        gameBoard.clearAll();
        gameBoard.activateAll();
        // Reset menu
        footerMessage("");
        // Initiate first turn
        getActivePlayer().startTurn();
    }

    // Handle end of turn and start of next turn
    const nextTurn = () => {
        // End turn of active player
        getActivePlayer().endTurn();
        // Check if the round is over
        const winner = gameBoard.getWinner();
        const draw = gameBoard.anyFreeCell() === false;
        const isOver = winner || draw;
        if (isOver) {
            // Lock game board
            gameBoard.deactivateAll();
            // Display message
            if (winner) {
                footerMessage(`${winner} wins this round!`);
                getActivePlayer().winRound();
            } else if (draw) {
                footerMessage("Draw!");
            }
            // Activate next round button
            nextRoundButton.activate();
        } else {    // If round is not over, increment and init next turn
            turn++;
            getActivePlayer().startTurn();
        }
    };

    // Initialize with a clean game
    newGame();

    return {
        getActivePlayer,
        nextTurn
    };
})();




