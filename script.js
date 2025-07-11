const words = [
  { arabic: "كتاب", russian: "книга" },
  { arabic: "قلم", russian: "ручка" },
  { arabic: "باب", russian: "дверь" },
  { arabic: "شمس", russian: "солнце" },
  { arabic: "قمر", russian: "луна" }
];

let currentUser = null;
let usersData = {};
let score = 0;
let currentQuestionIndex = 0;

loadUsers();
showAuthModal();

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
  document.getElementById('menu').classList.add('visible');
  document.getElementById('bestScore').textContent = 'Лучший: ' + (usersData[currentUser].bestScore || 0);
}

function showSection(id) {
  document.querySelectorAll('main').forEach(m => m.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

document.getElementById('btnPlay').addEventListener('click', startGame);
document.getElementById('btnAllWords').addEventListener('click', () => {
  showSection('wordsSection');
  const allWordsList = document.getElementById('allWordsList');
  allWordsList.innerHTML = '';
  words.forEach(w => {
    allWordsList.innerHTML += `<div>${w.arabic} — ${w.russian}</div>`;
  });
});
document.getElementById('btnRecords').addEventListener('click', showRecords);
document.getElementById('btnBackFromWords').addEventListener('click', () => showSection('menu'));
document.getElementById('backFromRecords').addEventListener('click', () => showSection('menu'));
document.getElementById('btnBackToMenu').addEventListener('click', () => {
  endGame();
  showSection('menu');
});

function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  showSection('gameSection');
  updateScore(0);
  showQuestion();
}

function endGame() {
  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
  }
  document.getElementById('bestScore').textContent = 'Лучший: ' + (usersData[currentUser].bestScore || 0);
}

function updateScore(newScore) {
  score = newScore;
  document.getElementById('score').textContent = 'Очки: ' + score;
}

function showQuestion() {
  if (currentQuestionIndex >= words.length) {
    alert(`Игра окончена! Твой счёт: ${score}`);
    showSection('menu');
    return;
  }
  const q = words[currentQuestionIndex];
  document.getElementById('question').textContent = 'Переведите: ' + q.arabic;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  let options = [q.russian];
  while (options.length < 4) {
    const rand = words[Math.floor(Math.random() * words.length)].russian;
    if (!options.includes(rand)) options.push(rand);
  }
  options = options.sort(() => Math.random() - 0.5);

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => checkAnswer(opt));
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const correct = words[currentQuestionIndex].russian;
  if (selected === correct) {
    updateScore(score + 1);
  } else {
    alert(`Неверно. Игра окончена! Твой счёт: ${score}`);
    showSection('menu');
    return;
  }
  currentQuestionIndex++;
  showQuestion();
}

function showRecords() {
  showSection('recordsSection');
  const arr = Object.keys(usersData).map(user => ({
    user,
    score: usersData[user].bestScore || 0
  }));
  arr.sort((a, b) => b.score - a.score);

  const recordsList = document.getElementById('recordsList');
  recordsList.innerHTML = '';
  arr.forEach((r, i) => {
    recordsList.innerHTML += `<div>${i + 1}. ${r.user}: ${r.score}</div>`;
  });
}
