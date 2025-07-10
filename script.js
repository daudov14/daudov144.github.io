const words = [
  { arabic: "كتاب", russian: "книга" },
  { arabic: "قلم", russian: "ручка" },
  { arabic: "باب", russian: "дверь" },
  { arabic: "شمس", russian: "солнце" },
  { arabic: "قمر", russian: "луна" },
];

let currentUser = null;
let usersData = {};
let timerInterval;
let timeLeft = 20;

const menu = document.getElementById('menu');
const gameSection = document.getElementById('gameSection');
const wordsSection = document.getElementById('wordsSection');
const recordsSection = document.getElementById('recordsSection');

const modalOverlay = document.getElementById('modalOverlay');
const authError = document.getElementById('authError');
const scoreEl = document.getElementById('score');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');

let score = 0;
let currentQuestionIndex = 0;

// Авторизация
function loadUsers() {
  const data = localStorage.getItem('arabRusUsers');
  usersData = data ? JSON.parse(data) : {};
}

function saveUsers() {
  localStorage.setItem('arabRusUsers', JSON.stringify(usersData));
}

function auth(username, password) {
  username = username.trim();
  if (!username || !password) return "Введите имя пользователя и пароль";

  if (usersData[username]) {
    if (usersData[username].password !== password) {
      return "Неверный пароль";
    }
  } else {
    usersData[username] = { password, bestScore: 0 };
    saveUsers();
  }
  currentUser = username;
  return null;
}

document.getElementById('authSubmitBtn').onclick = () => {
  const username = document.getElementById('usernameInput').value;
  const password = document.getElementById('passwordInput').value;
  const error = auth(username, password);
  if (error) {
    authError.textContent = error;
  } else {
    modalOverlay.style.display = 'none';
    showOnly(menu);
    document.getElementById('bestScore').textContent = 'Лучший: ' + (usersData[currentUser].bestScore || 0);
  }
};

loadUsers();
modalOverlay.style.display = 'flex';

// Навигация
document.getElementById('btnPlay').onclick = startGame;
document.getElementById('btnAllWords').onclick = showAllWords;
document.getElementById('btnRecords').onclick = showRecords;

document.getElementById('btnBackToMenu').onclick = () => showOnly(menu);
document.getElementById('btnBackFromWords').onclick = () => showOnly(menu);
document.getElementById('backFromRecords').onclick = () => showOnly(menu);

function showOnly(section) {
  [menu, gameSection, wordsSection, recordsSection].forEach(s => s.style.display = 'none');
  section.style.display = 'block';
}

// Игра
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  showOnly(gameSection);
  updateScore(0);
  startTimer();
  showQuestion();
}

function updateScore(newScore) {
  score = newScore;
  scoreEl.textContent = 'Очки: ' + score + ' | Время: ' + timeLeft;
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 20;
  updateScore(score);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateScore(score);
    if (timeLeft <= 0) {
      endGame('Время вышло! Твой счёт: ' + score);
    }
  }, 1000);
}

function showQuestion() {
  if (currentQuestionIndex >= words.length) {
    endGame('Игра окончена! Твой счёт: ' + score);
    return;
  }
  const q = words[currentQuestionIndex];
  questionEl.textContent = 'Переведите: ' + q.arabic;

  answersEl.innerHTML = '';
  let options = [q.russian];
  while (options.length < 4) {
    const rand = words[Math.floor(Math.random() * words.length)].russian;
    if (!options.includes(rand)) options.push(rand);
  }
  options = shuffle(options);

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt);
    btn.onmousedown = e => e.preventDefault(); // убрать выделение
    answersEl.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const correct = words[currentQuestionIndex].russian;
  if (selected === correct) {
    score++;
    currentQuestionIndex++;
    timeLeft = 20; // сброс таймера
    showQuestion();
  } else {
    endGame('Неправильный ответ! Твой счёт: ' + score);
  }
}

function endGame(message) {
  clearInterval(timerInterval);
  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
    document.getElementById('bestScore').textContent = 'Лучший: ' + score;
  }

  if (confirm(message + '\n\nСыграть ещё?')) {
    startGame();
  } else {
    showOnly(menu);
  }
}

// Слова
function showAllWords() {
  showOnly(wordsSection);
  const list = document.getElementById('allWordsList');
  list.innerHTML = '';
  words.forEach(w => {
    const div = document.createElement('div');
    div.textContent = `${w.arabic} — ${w.russian}`;
    list.appendChild(div);
  });
}

// Рекорды
function showRecords() {
  showOnly(recordsSection);
  const list = document.getElementById('recordsList');
  list.innerHTML = '';
  const arr = Object.entries(usersData).map(([user, data]) => ({ user, score: data.bestScore || 0 }));
  arr.sort((a, b) => b.score - a.score);
  arr.forEach((r, i) => {
    const div = document.createElement('div');
    div.textContent = `${i + 1}. ${r.user}: ${r.score}`;
    list.appendChild(div);
  });
}

// Утилиты
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
