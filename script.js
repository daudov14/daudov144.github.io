// Пример слов (можешь заменить своими)
const words = [
  { arabic: "كتاب", russian: "книга" },
  { arabic: "قلم", russian: "ручка" },
  { arabic: "باب", russian: "дверь" },
  { arabic: "شمس", russian: "солнце" },
  { arabic: "قمر", russian: "луна" },
];

// Локальное хранение пользователей
let currentUser = null;
let usersData = {};

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
    // Регистрируем нового пользователя
    usersData[username] = {
      password: password,
      bestScore: 0,
      progress: {}
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

// Инициализация
loadUsers();
showAuthModal();

// Логика меню
const menu = document.getElementById('menu');
const gameSection = document.getElementById('gameSection');
const wordsSection = document.getElementById('wordsSection');
const recordsSection = document.getElementById('recordsSection');

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
  wordsSection.classList.remove('visible');
  menu.classList.add('visible');
});

document.getElementById('btnRecords').addEventListener('click', () => {
  showRecords();
});

document.getElementById('backFromRecords').addEventListener('click', () => {
  recordsSection.classList.remove('visible');
  menu.classList.add('visible');
});

// Звуки
const errorSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

// Игра
let score = 0;
let currentQuestionIndex = 0;

function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  menu.classList.remove('visible');
  gameSection.classList.add('visible');
  updateScore(0);
  showQuestion();
}

function endGame() {
  gameSection.classList.remove('visible');
  menu.classList.add('visible');
  // Сохраняем лучший результат
  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
    document.getElementById('bestScore').textContent = 'Лучший: ' + score;
  }
}

function updateScore(newScore) {
  score = newScore;
  document.getElementById('score').textContent = 'Очки: ' + score;
}

function showQuestion() {
  if (currentQuestionIndex >= words.length) {
    alert('Игра окончена! Твой счёт: ' + score);
    endGame();
    return;
  }
  const q = words[currentQuestionIndex];
  const questionDiv = document.getElementById('question');
  questionDiv.textContent = 'Переведите: ' + q.arabic;

  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  // Составим варианты ответов: правильный + 3 случайных
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
    btn.onclick = () => checkAnswer(opt);
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const correct = words[currentQuestionIndex].russian;
  if (selected === correct) {
    updateScore(score + 1);
    // Звук при правильном ответе не играет (по твоему запросу)
  } else {
    errorSound.play();
  }
  currentQuestionIndex++;
  showQuestion();
}

function showAllWords() {
  menu.classList.remove('visible');
  wordsSection.classList.add('visible');
  const allWordsList = document.getElementById('allWordsList');
  allWordsList.innerHTML = '';
  words.forEach(w => {
    const div = document.createElement('div');
    div.textContent = `${w.arabic} — ${w.russian}`;
    allWordsList.appendChild(div);
  });
}

// Показать рекордсменов
function showRecords() {
  menu.classList.remove('visible');
  recordsSection.classList.add('visible');

  const arr = [];
  for (const user in usersData) {
    arr.push({ user: user, score: usersData[user].bestScore || 0 });
  }
  arr.sort((a,b) => b.score - a.score);

  const recordsList = document.getElementById('recordsList');
  recordsList.innerHTML = '';
  arr.forEach((r,i) => {
    recordsList.innerHTML += `<div>${i+1}. ${r.user}: ${r.score}</div>`;
  });
}

// Утилита: тасование массива
function shuffleArray(arr) {
  for(let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
