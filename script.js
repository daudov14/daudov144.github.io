const words = [
  { arabic: "كتاب", russian: "книга" },
  { arabic: "قلم", russian: "ручка" },
  { arabic: "باب", russian: "дверь" },
  { arabic: "شمس", russian: "солнце" },
  { arabic: "قمر", russian: "луна" },
];

let currentUser = null;
let usersData = {};
let timerInterval = null;
let timerValue = 20;

function loadUsers() {
  const data = localStorage.getItem('arabRusUsers');
  usersData = data ? JSON.parse(data) : {};
}

function saveUsers() {
  localStorage.setItem('arabRusUsers', JSON.stringify(usersData));
}

function showAuthModal() {
  document.getElementById('modalOverlay').style.display = 'flex';
}

function hideAuthModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

function auth(username, password) {
  username = username.trim();
  if (!username || !password) return "Введите имя пользователя и пароль";

  if (usersData[username]) {
    if (usersData[username].password !== password) {
      return "Неверный пароль";
    }
  } else {
    usersData[username] = {
      password,
      bestScore: 0
    };
    saveUsers();
  }
  currentUser = username;
  return null;
}

document.getElementById('authSubmitBtn').addEventListener('click', () => {
  const username = document.getElementById('usernameInput').value;
  const password = document.getElementById('passwordInput').value;
  const error = auth(username, password);
  const errorEl = document.getElementById('authError');

  if (error) {
    errorEl.textContent = error;
  } else {
    errorEl.textContent = '';
    hideAuthModal();
    afterLogin();
  }
});

function afterLogin() {
  showOnly('menu');
  document.getElementById('bestScore').textContent = 'Лучший: ' + (usersData[currentUser].bestScore || 0);
}

// Навигация
function showOnly(sectionId) {
  document.getElementById('menu').classList.remove('visible');
  document.getElementById('gameSection').classList.remove('visible');
  document.getElementById('wordsSection').classList.remove('visible');
  document.getElementById('recordsSection').classList.remove('visible');
  document.getElementById(sectionId).classList.add('visible');
}

loadUsers();
showAuthModal();

const errorSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

let score = 0;
let currentQuestionIndex = 0;

document.getElementById('btnPlay').addEventListener('click', () => {
  startGame();
});
document.getElementById('btnAllWords').addEventListener('click', () => {
  showAllWords();
});
document.getElementById('btnBackToMenu').addEventListener('click', () => {
  endGame();
});
document.getElementById('btnBackFromWords').addEventListener('click', () => {
  showOnly('menu');
});
document.getElementById('btnRecords').addEventListener('click', () => {
  showRecords();
});
document.getElementById('backFromRecords').addEventListener('click', () => {
  showOnly('menu');
});

function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  updateScore(0);
  showOnly('gameSection');
  showQuestion();
}

function endGame(reason = '') {
  stopTimer();

  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
    document.getElementById('bestScore').textContent = 'Лучший: ' + score;
  }

  if (reason) {
    if (confirm(`${reason} Твой счёт: ${score}. Играть ещё?`)) {
      startGame();
    } else {
      showOnly('menu');
    }
  } else {
    showOnly('menu');
  }
}

function updateScore(newScore) {
  score = newScore;
  document.getElementById('score').textContent = 'Очки: ' + score;
}

function showQuestion() {
  if (currentQuestionIndex >= words.length) {
    endGame('Игра окончена!');
    return;
  }

  timerValue = 20;
  updateTimer();
  startTimer();

  const q = words[currentQuestionIndex];
  document.getElementById('question').textContent = 'Переведите: ' + q.arabic;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  const options = [q.russian];
  while (options.length < 4) {
    const rand = words[Math.floor(Math.random() * words.length)].russian;
    if (!options.includes(rand)) options.push(rand);
  }

  shuffleArray(options);

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.onclick = () => {
      window.getSelection().removeAllRanges(); // убрать выделение
      checkAnswer(opt);
    };
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const correct = words[currentQuestionIndex].russian;
  if (selected === correct) {
    updateScore(score + 1);
    currentQuestionIndex++;
    showQuestion();
  } else {
    errorSound.play();
    endGame('Неправильный ответ!');
  }
}

// Таймер
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    timerValue--;
    updateTimer();
    if (timerValue <= 0) {
      endGame('Время вышло!');
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

function updateTimer() {
  document.getElementById('score').textContent = `Очки: ${score} | Время: ${timerValue}`;
}

// Другие разделы
function showAllWords() {
  showOnly('wordsSection');
  const list = document.getElementById('allWordsList');
  list.innerHTML = '';
  words.forEach(w => {
    const div = document.createElement('div');
    div.textContent = `${w.arabic} — ${w.russian}`;
    list.appendChild(div);
  });
}

function showRecords() {
  showOnly('recordsSection');

  const arr = Object.keys(usersData).map(user => ({
    user,
    score: usersData[user].bestScore || 0
  }));
  arr.sort((a, b) => b.score - a.score);

  const list = document.getElementById('recordsList');
  list.innerHTML = '';
  arr.forEach((r, i) => {
    list.innerHTML += `<div>${i + 1}. ${r.user}: ${r.score}</div>`;
  });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
