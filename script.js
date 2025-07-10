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
    document.getElementById('authError').textContent = error;
  } else {
    hideAuthModal();
    afterLogin();
  }
};

function afterLogin() {
  document.getElementById('menu').classList.add('visible');
  document.getElementById('bestScore').textContent =
    'Лучший: ' + (usersData[currentUser].bestScore || 0);
}

loadUsers();
showAuthModal();

// Навигация
const menu = document.getElementById('menu');
const gameSection = document.getElementById('gameSection');
const wordsSection = document.getElementById('wordsSection');
const recordsSection = document.getElementById('recordsSection');

function showOnly(section) {
  [menu, gameSection, wordsSection, recordsSection].forEach(el => el.classList.remove('visible'));
  section.classList.add('visible');
}

document.getElementById('btnPlay').onclick = () => {
  startGame();
};

document.getElementById('btnAllWords').onclick = () => {
  showAllWords();
};

document.getElementById('btnBackToMenu').onclick = () => {
  endGame();
};

document.getElementById('btnBackFromWords').onclick = () => {
  showOnly(menu);
};

document.getElementById('btnRecords').onclick = () => {
  showRecords();
};

document.getElementById('backFromRecords').onclick = () => {
  showOnly(menu);
};

// Игра
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  showOnly(gameSection);
  updateScore(0);
  showQuestion();
}

function endGame() {
  if (score > (usersData[currentUser].bestScore || 0)) {
    usersData[currentUser].bestScore = score;
    saveUsers();
  }
  showOnly(menu);
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
  document.getElementById('question').textContent = 'Переведите: ' + q.arabic;

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
    btn.onclick = () => checkAnswer(opt, btn);
    answersDiv.appendChild(btn);
  });
}

function checkAnswer(selected, btn) {
  const correct = words[currentQuestionIndex].russian;
  if (selected === correct) {
    updateScore(score + 1);
  } else {
    btn.style.background = '#800'; // подсветим красным
    setTimeout(() => btn.style.background = '', 500);
  }
  currentQuestionIndex++;
  setTimeout(showQuestion, 300);
}

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

function showRecords() {
  showOnly(recordsSection);
  const list = document.getElementById('recordsList');
  list.innerHTML = '';
  const arr = Object.entries(usersData).map(([u,d]) => ({ user: u, score: d.bestScore||0 }));
  arr.sort((a,b)=>b.score-a.score);
  arr.forEach((r,i) => {
    list.innerHTML += `<div>${i+1}. ${r.user}: ${r.score}</div>`;
  });
}

function shuffleArray(arr) {
  for(let i=arr.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}
