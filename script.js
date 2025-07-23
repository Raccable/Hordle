const correctAnswer = "HORDA";
let currentRow = 0;
let currentCol = 0;
let board = [];
let gamesPlayed = 0;
let gamesWon = 0;
let currentStreak = 0;
let maxStreak = 0;
let guessDistribution = [0, 0, 0, 0, 0, 0]; // index 0 = 1 guess, index 5 = 6 guesses

window.onload = function () {
  console.log("Script loaded!"); // Debug
  initBoard();
  initKeyboard();

  // Modal button handlers
  document.getElementById("close-modal").onclick = function() {
    document.getElementById("stats-modal").style.display = "none";
  };
  document.getElementById("play-again").onclick = function() {
    currentRow = 0;
    currentCol = 0;
    board = [];
    // Clear tiles
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 5; c++) {
        const tile = document.getElementById(`tile-${r}-${c}`);
        if (tile) {
          tile.textContent = "";
          tile.className = "tile";
        }
      }
    }
    // Re-enable keyboard
    const keys = document.querySelectorAll(".key");
    keys.forEach(k => k.disabled = false);
    // Reset message
    const msg = document.getElementById("message");
    if (msg) msg.textContent = "";
    // Hide modal
    document.getElementById("stats-modal").style.display = "none";
    // Re-initialize board array
    for (let r = 0; r < 6; r++) {
      let row = [];
      for (let c = 0; c < 5; c++) {
        row.push("");
      }
      board[r] = row;
    }
  };
  document.getElementById("share").onclick = function() {
    navigator.clipboard.writeText("I played HORDLE! https://raccable.github.io/Hordle/");
    alert("Result copied to clipboard!");
  };
};

function initBoard() {
  const boardElement = document.getElementById("board");
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
      // Add line break after P and after L
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
    gamesPlayed++;
    gamesWon++;
    currentStreak++;
    if (currentStreak > maxStreak) maxStreak = currentStreak;
    guessDistribution[currentRow]++;
    updateStatsUI();
    showStatsModal();
  } else if (currentRow === 5) {
    if (message) message.textContent = "💀 The word was HORDA.";
    disableInput();
    gamesPlayed++;
    currentStreak = 0;
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
  let counts = [];
  for (let i = 1; i <= 6; i++) {
    const countElem = document.getElementById(`count-${i}`);
    counts[i-1] = countElem ? parseInt(countElem.textContent) || 0 : 0;
  }
  const max = Math.max(...counts, 1);
  for (let i = 1; i <= 6; i++) {
    const bar = document.getElementById(`bar-${i}`);
    const countElem = document.getElementById(`count-${i}`);
    const count = counts[i-1];
    if (bar) bar.style.width = (count === 0 ? 10 : (220 * count / max)) + "px";
    if (bar) bar.classList.toggle("active", count > 0 && count === Math.max(...counts));
    if (countElem) countElem.textContent = count;
  }
}

function updateStatsUI() {
  // Defensive checks for all stats elements
  const playedDiv = document.querySelector("#stats-modal .modal-content > div:nth-child(2) > div:nth-child(1) > div");
  if (playedDiv) playedDiv.textContent = gamesPlayed;
  const winDiv = document.querySelector("#stats-modal .modal-content > div:nth-child(2) > div:nth-child(2) > div");
  if (winDiv) winDiv.textContent = gamesPlayed ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const streakDiv = document.querySelector("#stats-modal .modal-content > div:nth-child(2) > div:nth-child(3) > div");
  if (streakDiv) streakDiv.textContent = currentStreak;
  const maxStreakDiv = document.querySelector("#stats-modal .modal-content > div:nth-child(2) > div:nth-child(4) > div");
  if (maxStreakDiv) maxStreakDiv.textContent = maxStreak;
  for (let i = 0; i < 6; i++) {
    const countElem = document.getElementById(`count-${i+1}`);
    if (countElem) countElem.textContent = guessDistribution[i];
  }
  updateGuessDistribution();
}