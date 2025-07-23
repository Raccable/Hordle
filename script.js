// script.js
const correctAnswer = "HORDA";
let currentRow = 0;
let currentCol = 0;
let board = [];
let stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0]
};

window.onload = function () {
  loadStats();
  initBoard();
  initKeyboard();

  document.getElementById("close-modal").onclick = () => {
    document.getElementById("stats-modal").style.display = "none";
  };

  document.getElementById("play-again").onclick = () => {
    currentRow = 0;
    currentCol = 0;
    board = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 5; c++) {
        const tile = document.getElementById(`tile-${r}-${c}`);
        if (tile) {
          tile.textContent = "";
          tile.className = "tile";
        }
      }
    }
    const keys = document.querySelectorAll(".key");
    keys.forEach(k => k.disabled = false);

    const msg = document.getElementById("message");
    if (msg) msg.textContent = "";

    document.getElementById("stats-modal").style.display = "none";

    for (let r = 0; r < 6; r++) {
      let row = [];
      for (let c = 0; c < 5; c++) {
        row.push("");
      }
      board[r] = row;
    }
  };

  document.getElementById("share").onclick = () => {
    navigator.clipboard.writeText("I played HORDLE! https://raccable.github.io/Hordle/");
    alert("Result copied to clipboard!");
  };
};

function initBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";
  board = [];
  for (let r = 0; r < 6; r++) {
    let row = [];
    for (let c = 0; c < 5; c++) {
      let tile = document.createElement("div");
      tile.id = `tile-${r}-${c}`;
      tile.classList.add("tile");
      boardElement.appendChild(tile);
      row.push("");
    }
    board.push(row);
  }
}

function initKeyboard() {
  const keys = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "⏎ZXCVBNM⌫"
  ];
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";
  keys.forEach((row) => {
    for (let key of row) {
      const btn = document.createElement("button");
      btn.textContent = key;
      btn.classList.add("key");
      if (key === "⏎") {
        btn.classList.add("wide");
        btn.onclick = () => handleKey("ENTER");
      } else if (key === "⌫") {
        btn.classList.add("wide");
        btn.onclick = () => handleKey("⌫");
      } else {
        btn.onclick = () => handleKey(key);
      }
      keyboard.appendChild(btn);
      if (key === "P" || key === "L") {
        const br = document.createElement("br");
        keyboard.appendChild(br);
      }
    }
  });
}

function handleKey(key) {
  const message = document.getElementById("message");
  if (key === "⌫") {
    if (currentCol > 0) {
      currentCol--;
      board[currentRow][currentCol] = "";
      updateTile(currentRow, currentCol, "");
    }
    return;
  }
  if (key === "ENTER") {
    if (currentCol === 5) {
      const guess = board[currentRow].join("");
      revealRow(guess);
    } else {
      if (message) message.textContent = "Enter a full 5-letter word!";
    }
    return;
  }
  if (currentCol < 5 && /^[A-Z]$/.test(key)) {
    board[currentRow][currentCol] = key;
    updateTile(currentRow, currentCol, key);
    currentCol++;
  }
}

function updateTile(row, col, letter) {
  const tile = document.getElementById(`tile-${row}-${col}`);
  if (tile) tile.textContent = letter;
}

function revealRow(guess) {
  const message = document.getElementById("message");
  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    const letter = guess[i];
    if (!tile) continue;
    if (letter === correctAnswer[i]) {
      tile.classList.add("green");
    } else if (correctAnswer.includes(letter)) {
      tile.classList.add("yellow");
    } else {
      tile.classList.add("gray");
    }
  }
  if (guess === correctAnswer) {
    if (message) message.textContent = "🎉 You guessed it: HORDA!";
    disableInput();
    stats.gamesPlayed++;
    stats.gamesWon++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    stats.guessDistribution[currentRow]++;
    saveStats();
    updateStatsUI();
    showStatsModal();
  } else if (currentRow === 5) {
    if (message) message.textContent = "💀 The word was HORDA.";
    disableInput();
    stats.gamesPlayed++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    stats.currentStreak = 0;
    saveStats();
    updateStatsUI();
    showStatsModal();
  } else {
    currentRow++;
    currentCol = 0;
  }
}

function disableInput() {
  const keys = document.querySelectorAll(".key");
  keys.forEach(k => k.disabled = true);
}

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "Backspace") {
    handleKey("⌫");
  } else if (key === "Enter") {
    handleKey("ENTER");
  } else if (/^[a-zA-Z]$/.test(key)) {
    handleKey(key.toUpperCase());
  }
});

function showStatsModal() {
  document.getElementById("stats-modal").style.display = "flex";
}

function updateGuessDistribution() {
  let counts = stats.guessDistribution;
  const max = Math.max(...counts, 1);
  for (let i = 1; i <= 6; i++) {
    const bar = document.getElementById(`bar-${i}`);
    const countElem = document.getElementById(`count-${i}`);
    const count = counts[i-1];
    if (bar) bar.style.width = (count === 0 ? 10 : (220 * count / max)) + "px";
    if (bar) bar.classList.toggle("active", count > 0 && count === max);
    if (countElem) countElem.textContent = count;
  }
}

function updateStatsUI() {
  document.getElementById('stat-played').textContent = stats.gamesPlayed;
  document.getElementById('stat-win-percent').textContent = stats.gamesPlayed ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) + "%" : "0%";
  document.getElementById('stat-current-streak').textContent = stats.currentStreak;
  document.getElementById('stat-max-streak').textContent = stats.maxStreak;

  for (let i = 0; i < 6; i++) {
    const countElem = document.getElementById(`count-${i+1}`);
    if (countElem) countElem.textContent = stats.guessDistribution[i];
  }
  updateGuessDistribution();
}

function saveStats() {
  localStorage.setItem('hordleStats', JSON.stringify(stats));
}

function loadStats() {
  const statsJSON = localStorage.getItem('hordleStats');
  if (statsJSON) {
    stats = JSON.parse(statsJSON);
  } else {
    stats = {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };
  }
  updateStatsUI();
}