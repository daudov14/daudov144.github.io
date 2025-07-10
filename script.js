const words = [
  { arabic: "كتاب", russian: "книга" },
  { arabic: "قلم", russian: "ручка" },
  { arabic: "باب", russian: "дверь" },
  { arabic: "شمس", russian: "солнце" },
  { arabic: "قمر", russian: "луна" }
];

let currentUser = 'Игрок';
let usersData = {};
let score = 0;
let currentQuestionIndex = 0;

const errorSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

function loadUsers() {
  const data = localStorage.getItem('arabRusUsers');
  usersData = data ? JSON.parse(data) : {};
}
function saveUsers() {
  localStorage.setItem('arabRusUsers', JSON.stringify(usersData));
}

loadUsers();
if (!usersData[currentUser]) {
  usersData[currentUser] = { bestScore: 0 };
}
document.getElementById('bestScore').textContent = 'Лучший: ' + usersData[currentUser].bestScore;

document.getElementById('btnPlay').onclick = () => startGame();
document.getElementById('btnAllWords').onclick = () => showAllWords();
document.getElementById('recordsBtn').onclick = () => showRecords();
document.querySelectorAll('#btnBack').forEach(btn => btn.onclick = () => showOnlyBlock('menu'));

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

function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  updateScore(0);
  showOnlyBlock('gameSection');
  showQuestion();
}

function updateScore(newScore) {
  score = newScore;
  document.getElementById('score').textContent = 'Очки: ' + score;
}

function showQuestion() {
  if (currentQuestionIndex >= words.length) {
    alert('Игра окончена! Твой счёт: ' + score);
    if (score > usersData[currentUser].bestScore) {
      usersData[currentUser].bestScore = score;
      saveUsers();
      document.getElementById('bestScore').textContent = 'Лучший: ' + score;
    }
    showOnlyBlock('menu');
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
  shuffleArray(options);

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.onclick = () => {
      setTimeout(() => btn.blur(), 100);
      checkAnswer(opt);
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
  const list = document.getElementById('allWordsList');
  list.innerHTML = '';
  words.forEach(w => {
    const div = document.createElement('div');
    div.textContent = `${w.arabic} — ${w.russian}`;
    list.appendChild(div);
  });
}

function showRecords() {
  showOnlyBlock('recordsSection');
  const arr = [];
  for (const user in usersData) {
    arr.push({ user, score: usersData[user].bestScore });
  }
  arr.sort((a,b) => b.score - a.score);
  const recordsList = document.getElementById('recordsList');
  recordsList.innerHTML = '';
  arr.forEach((r,i) => {
    recordsList.innerHTML += `<div>${i+1}. ${r.user}: ${r.score}</div>`;
  });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
