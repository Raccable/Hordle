const correctAnswer = "HORDA";
let currentRow = 0;
let currentCol = 0;
let board = [];

window.onload = function () {
  console.log("Script loaded!"); // Debug
  initBoard();
  initKeyboard();
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
      message.textContent = "Enter a full 5-letter word!";
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
  tile.textContent = letter;
}

function revealRow(guess) {
  const message = document.getElementById("message");

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${currentRow}-${i}`);
    const letter = guess[i];

    if (letter === correctAnswer[i]) {
      tile.classList.add("green");
    } else if (correctAnswer.includes(letter)) {
      tile.classList.add("yellow");
    } else {
      tile.classList.add("gray");
    }
  }

  if (guess === correctAnswer) {
  message.textContent = "🎉 You guessed it: HORDA!";
  disableInput();
  const countSpan = document.getElementById(`count-${currentRow + 1}`);
  if (countSpan) countSpan.textContent = parseInt(countSpan.textContent) + 1;
  updateGuessDistribution();
  showStatsModal();
} else if (currentRow === 5) {
  message.textContent = "💀 The word was HORDA.";
  disableInput();
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
document.getElementById("close-modal").onclick = function() {
  document.getElementById("stats-modal").style.display = "none";
};
document.getElementById("play-again").onclick = function() {
  location.reload();
};
document.getElementById("share").onclick = function() {
  navigator.clipboard.writeText("I played HORDLE! https://raccable.github.io/Hordle/");
  alert("Result copied to clipboard!");
};

function updateGuessDistribution() {
  // Get counts from inputs (or store in an array for a real game)
  let counts = [];
  for (let i = 1; i <= 6; i++) {
    // If you use <input> elements, you can get their values like this:
    // counts[i-1] = parseInt(document.querySelector(`#stats-modal table tr:nth-child(${i}) input`).value) || 0;
    // But with the bar chart, store counts in localStorage or a JS array instead.
    counts[i-1] = parseInt(document.getElementById(`count-${i}`).textContent) || 0;
  }
  // Find the max for scaling
  const max = Math.max(...counts, 1);
  for (let i = 1; i <= 6; i++) {
    const bar = document.getElementById(`bar-${i}`);
    const count = counts[i-1];
    bar.style.width = (count === 0 ? 10 : (220 * count / max)) + "px";
    bar.classList.toggle("active", count > 0 && count === Math.max(...counts));
    document.getElementById(`count-${i}`).textContent = count;
  }
}