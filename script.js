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
  showOnlyBlock('menu');
  updateBestScore();
}

// Обновление лучшего счета пользователя в меню
function updateBestScore() {
  document.getElementById('bestScore').textContent = 'Лучший: ' + (usersData[currentUser].bestScore || 0);
}

// Управление видимостью блоков, чтобы одновременно показывался только один
function showOnlyBlock(blockId) {
  const blocks = ['menu', 'gameSection', 'wordsSection', 'recordsSection'];
  blocks.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === blockId) {
        el.classList.add('visible');
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
        el.classList.remove('visible');
      }
    }
  });
}

// Логика меню
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
  showOnlyBlock('menu');
});

document.getElementById('backFromRecords').addEventListener('click', () => {
  showOnlyBlock('menu');
});

// Иконка рекордсменов снизу (создаем и добавляем)
const recordsIcon = document.createElement('button');
recordsIcon.id = 'btnRecordsBottom';
recordsIcon.title = 'Рекордсмены 🏆';
recordsIcon.setAttribute('aria-label', 'Рекордсмены');
recordsIcon.className = 'btn-records-bottom';
recordsIcon.textContent = '🏆 Рекордсмены';
recordsIcon.style.position = 'fixed';
recordsIcon.style.bottom = '10px';
recordsIcon.style.left = '50%';
recordsIcon.style.transform = 'translateX(-50%)';
recordsIcon.style.background = '#0ff';
recordsIcon.style.color = '#0a1a27';
recordsIcon.style.border = 'none';
recordsIcon.style.borderRadius = '14px';
recordsIcon.style.padding = '10px 20px';
recordsIcon.style.fontWeight = '700';
recordsIcon.style.cursor = 'pointer';
recordsIcon.style.boxShadow = '0 0 12px #0ff';
recordsIcon.style.zIndex = '10000';
document.body.appendChild(recordsIcon);

recordsIcon.addEventListener('click', () => {
  showRecords();
});

// Кнопка рекордсменов в левом верхнем углу теперь только скрываем
document.getElementById('btnRecords').style.display = 'none';

// Звуки
const errorSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

// Игра
let score = 0;
let currentQuestionIndex = 0;

function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  showOnlyBlock('gameSection');
  updateScore(0);
  showQuestion();
}

function endGame() {
  showOnlyBlock('menu');
  // Сохраняем лучший результат
  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
    updateBestScore();
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
    btn.onclick = () => {
      checkAnswer(opt);
      clearSelection();  // убираем выделение текста при нажатии
    };
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(selected) {
  const correct = words[currentQuestionIndex].russian;
  if (selected === correct) {
    updateScore(score + 1);
  } else {
    errorSound.play();
  }
  currentQuestionIndex++;
  showQuestion();
}

function showAllWords() {
  showOnlyBlock('wordsSection');
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
  showOnlyBlock('recordsSection');

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

// Убирает выделение текста на странице
function clearSelection() {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

// Инициализация
loadUsers();
showAuthModal();
