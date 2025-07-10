const words = [
  { arabic: "كتاب", russian: "книга" },
  { arabic: "قلم", russian: "ручка" },
  { arabic: "باب", russian: "дверь" },
  { arabic: "شمس", russian: "солнце" },
  { arabic: "قمر", russian: "луна" },
];

let currentUser = null;
let usersData = {};
let score = 0;
let currentQuestionIndex = 0;
let timerInterval = null;
let timeLeft = 20;

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
      password: password,
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

function showOnly(sectionId) {
  document.querySelectorAll('#menu, #gameSection, #wordsSection, #recordsSection').forEach(el => {
    el.classList.remove('visible');
  });
  document.getElementById(sectionId).classList.add('visible');
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 20;
  document.getElementById('timer').textContent = `⏳ ${timeLeft}`;
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `⏳ ${timeLeft}`;
    if (timeLeft <= 0) {
      endGame('Время вышло!');
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

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

// Игра
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  showOnly('gameSection');
  updateScore(0);
  startTimer();
  showQuestion();
}

function endGame(message = 'Игра окончена!') {
  stopTimer();
  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
    document.getElementById('bestScore').textContent = 'Лучший: ' + score;
  }

  if (message) {
    if (confirm(`${message} Твой счёт: ${score}. Играть ещё?`)) {
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
    endGame('Все вопросы закончились!');
    return;
  }
  const q = words[currentQuestionIndex];
  const questionDiv = document.getElementById('question');
  questionDiv.textContent = 'Переведите: ' + q.arabic;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  let options = [q.russian];
  while (options.length < 4) {
    const randWord = words[Math.floor(Math.random() * words.length)].russian;
    if (!options.includes(randWord)) options.push(randWord);
  }
  options = shuffleArray(options);

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.onclick = (e) => {
      e.preventDefault();
      document.activeElement.blur();
      if (opt === q.russian) {
        updateScore(score + 1);
        currentQuestionIndex++;
        showQuestion();
      } else {
        endGame('Неправильный ответ!');
      }
    };
    answersDiv.appendChild(btn);
  });
}

function showAllWords() {
  showOnly('wordsSection');
  const allWordsList = document.getElementById('allWordsList');
  allWordsList.innerHTML = '';
  words.forEach(w => {
    const div = document.createElement('div');
    div.textContent = `${w.arabic} — ${w.russian}`;
    allWordsList.appendChild(div);
  });
}

function showRecords() {
  showOnly('recordsSection');
  const recordsList = document.getElementById('recordsList');
  recordsList.innerHTML = '';
  const arr = [];
  for (const user in usersData) {
    arr.push({ user: user, score: usersData[user].bestScore || 0 });
  }
  arr.sort((a,b) => b.score - a.score);

  arr.forEach((r,i) => {
    recordsList.innerHTML += `<div>${i+1}. ${r.user}: ${r.score}</div>`;
  });
}

// утилита
function shuffleArray(arr) {
  for(let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

loadUsers();
showAuthModal();
