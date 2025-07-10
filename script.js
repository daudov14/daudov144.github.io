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
let timerInterval;
let timeLeft;

const errorSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

function loadUsers() {
  const data = localStorage.getItem('arabRusUsers');
  usersData = data ? JSON.parse(data) : {};
}

function saveUsers() {
  localStorage.setItem('arabRusUsers', JSON.stringify(usersData));
}

function showSection(sectionId) {
  document.querySelectorAll('main').forEach(m => m.classList.remove('visible'));
  document.getElementById(sectionId).classList.add('visible');
}

function auth(username, password) {
  if (!username.trim() || !password) return "Введите имя пользователя и пароль";
  if (usersData[username]) {
    if (usersData[username].password !== password) return "Неверный пароль";
  } else {
    usersData[username] = { password, bestScore: 0 };
    saveUsers();
  }
  currentUser = username;
  return null;
}

document.getElementById('authSubmitBtn').addEventListener('click', () => {
  const username = document.getElementById('usernameInput').value;
  const password = document.getElementById('passwordInput').value;
  const error = auth(username, password);
  if (error) {
    document.getElementById('authError').textContent = error;
  } else {
    document.getElementById('authError').textContent = '';
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('bestScore').textContent = 'Лучший: ' + (usersData[currentUser].bestScore || 0);
    showSection('menu');
  }
});

document.getElementById('btnPlay').addEventListener('click', startGame);
document.getElementById('btnAllWords').addEventListener('click', showAllWords);
document.getElementById('btnRecords').addEventListener('click', showRecords);

document.getElementById('btnBackToMenu').addEventListener('click', endGame);
document.getElementById('btnBackFromWords').addEventListener('click', () => showSection('menu'));
document.getElementById('backFromRecords').addEventListener('click', () => showSection('menu'));

function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  showSection('gameSection');
  nextQuestion();
}

function endGame() {
  clearInterval(timerInterval);
  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
  }
  document.getElementById('bestScore').textContent = 'Лучший: ' + usersData[currentUser].bestScore;
  showSection('menu');
}

function nextQuestion() {
  if (currentQuestionIndex >= words.length) {
    alert(`Игра окончена! Ваш счет: ${score}`);
    endGame();
    return;
  }
  timeLeft = 20;
  updateTimer();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      alert('Время вышло! Игра окончена.');
      endGame();
    }
  }, 1000);

  const q = words[currentQuestionIndex];
  document.getElementById('question').textContent = 'Переведите: ' + q.arabic;

  const answers = [q.russian];
  while (answers.length < 4) {
    const rand = words[Math.floor(Math.random() * words.length)].russian;
    if (!answers.includes(rand)) answers.push(rand);
  }

  const shuffled = answers.sort(() => Math.random() - 0.5);
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';
  shuffled.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => checkAnswer(opt));
    answersDiv.appendChild(btn);
  });
}

function updateTimer() {
  document.getElementById('score').textContent = `Очки: ${score} | Время: ${timeLeft}`;
}

function checkAnswer(selected) {
  const correct = words[currentQuestionIndex].russian;
  if (selected === correct) {
    score++;
    currentQuestionIndex++;
    nextQuestion();
  } else {
    errorSound.play();
    alert('Неправильный ответ! Игра окончена.');
    endGame();
  }
}

function showAllWords() {
  showSection('wordsSection');
  const list = document.getElementById('allWordsList');
  list.innerHTML = words.map(w => `<div>${w.arabic} — ${w.russian}</div>`).join('');
}

function showRecords() {
  showSection('recordsSection');
  const list = document.getElementById('recordsList');
  const sorted = Object.entries(usersData)
    .map(([name, data]) => ({ name, score: data.bestScore }))
    .sort((a, b) => b.score - a.score);
  list.innerHTML = sorted.map((r, i) => `<div>${i+1}. ${r.name}: ${r.score}</div>`).join('');
}

loadUsers();
showSection('');
