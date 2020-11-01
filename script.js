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
        if (active) {
            if (type === "comp-easy") {
                console.log("Placeholder for random algorithm");
            } else if (type === "comp-hard") {
                console.log("Placeholder for min-max algorithm")
            }
        }
    };

    const getMark = () => mark;

    const setType = () => {
        type = typeContainer.value;
        typeContainer.setAttribute("disabled", "");
        container.querySelector(".select-container").style.border = "1px solid var(--bg-color)";
    };

    updateDisplay();

    return { win, reset, toggleActive, getMark, setType };
};

const Cell = (x, y, container) => {
    let mark = null;

    function inputClick() {
        mark = game.getActivePlayer().getMark();
        container.textContent = mark;
        deactivate();
        game.goToNextTurn(x, y);
    };

    const activate = () => {
        container.classList.add("free-cell");
        container.addEventListener("click", inputClick);
    };

    const deactivate = () => {
        container.classList.remove("free-cell");
        container.removeEventListener("click", inputClick);
    };

    const clear = () => {
        mark = null;
        container.textContent = "";
        deactivate();
    };

    const getMark = () => mark;

    return { activate, deactivate, clear, getMark };
};

const gameBoard = (() => {
    const board = [];
    for (let j = 1; j <= 3; j++){
        for (let i = 1; i <= 3; i++){
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

    return { getMarkAt, activateAll, deactivateAll, clearAll, checkWinner };
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
    };

    const getActivePlayer = () => players[(startingPlayer + turn) % 2];

    const goToNextTurn = (x, y) => {
        let winner = gameBoard.checkWinner(x, y)
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
    };

    newGame();

    return { getActivePlayer, goToNextTurn };
})();




