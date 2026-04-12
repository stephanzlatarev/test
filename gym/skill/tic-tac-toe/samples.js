
const CELLS = [
  [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2], [2, 3],
  [3, 1], [3, 2], [3, 3],
];

const WIN_LINES = [
  [[1, 1], [1, 2], [1, 3]],
  [[2, 1], [2, 2], [2, 3]],
  [[3, 1], [3, 2], [3, 3]],
  [[1, 1], [2, 1], [3, 1]],
  [[1, 2], [2, 2], [3, 2]],
  [[1, 3], [2, 3], [3, 3]],
  [[1, 1], [2, 2], [3, 3]],
  [[1, 3], [2, 2], [3, 1]],
];

const MOVES = {
  win: getWinningMoves,
  block: getBlockingMoves,
  fork: getForkMoves,
};

const win = [];
const block = [];
const fork = [];

const SAMPLES = { win, block, fork };

function getMark(board, row, column) {
  return board[(row - 1) * 3 + (column - 1)];
}

function hasWin(board, mark) {
  return WIN_LINES.some((line) => line.every(([row, column]) => getMark(board, row, column) === mark));
}

function getNextPlayer(board) {
  const xCount = board.filter((mark) => mark === "X").length;
  const oCount = board.filter((mark) => mark === "O").length;

  if (!(xCount === oCount || xCount === oCount + 1)) {
    return false;
  }

  if (getMark(board, 2, 2) === null) {
    return false;
  }

  if (hasWin(board, "X") || hasWin(board, "O")) {
    return false;
  }

  return (xCount === oCount) ? "X" : "O";
}

function getWinningMoves(board, mark) {
  const moves = [];

  CELLS.forEach(([row, column], index) => {
    if (board[index] !== null) return;

    const nextBoard = [...board];
    nextBoard[index] = mark;

    if (hasWin(nextBoard, mark)) {
      moves.push([row, column, mark]);
    }
  });

  return moves;
}

function getBlockingMoves(board, mark) {
  const opponent = (mark === "X") ? "O" : "X";
  const moves = [];

  CELLS.forEach(([row, column], index) => {
    if (board[index] !== null) return;

    const nextBoard = [...board];
    nextBoard[index] = mark;

    if (getWinningMoves(nextBoard, opponent).length === 0) {
      moves.push([row, column, mark]);
    }
  });

  return moves;
}

function getForkMoves(board, mark) {
  const moves = [];

  CELLS.forEach(([row, column], index) => {
    if (board[index] !== null) return;

    const nextBoard = [...board];
    nextBoard[index] = mark;

    if (getWinningMoves(nextBoard, mark).length >= 2) {
      moves.push([row, column, mark]);
    }
  });

  return moves;
}

function toSample(board, move) {
  const marks = [];

  board.forEach((mark, index) => {
    if (mark === null) return;

    const row = Math.floor(index / 3) + 1;
    const column = (index % 3) + 1;
    marks.push([row, column, mark]);
  });

  return {
    observe: { marks },
    act: { marks: [move] }
  };
}

function buildSamples(board, index) {
  if (index === board.length) {
    const player = getNextPlayer(board);
    if (!player) return;

    const winners = getWinningMoves(board, player);
    if (winners.length > 1) return;

    for (const [playbook, getMoves] of Object.entries(MOVES)) {
      const moves = getMoves(board, player);

      if (moves.length) {
        SAMPLES[playbook].push(toSample(board, moves[0]));
        return;
      }
    }
  } else {
    for (const mark of [null, "X", "O"]) {
      board[index] = mark;
      buildSamples(board, index + 1);
    }

    board[index] = null;
  }
}

buildSamples(Array(9).fill(null), 0);

export { win, block, fork };
