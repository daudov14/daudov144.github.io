const menu = document.getElementById('menu');
const loginSection = document.getElementById('loginSection');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');

const btnGame = document.getElementById('btnGame');
const btnWords = document.getElementById('btnWords');
const btnRecords = document.getElementById('btnRecords');

const gameSection = document.getElementById('gameSection');
const wordsSection = document.getElementById('wordsSection');
const recordsSection = document.getElementById('recordsSection');

const backFromWords = document.getElementById('backFromWords');
const backFromRecords = document.getElementById('backFromRecords');

const scoreDisplay = document.getElementById('scoreDisplay');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const gameWord = document.getElementById('gameWord');
const gameOptions = document.getElementById('gameOptions');
const nextBtn = document.getElementById('nextBtn');
const wordsList = document.getElementById('wordsList');
const recordsList = document.getElementById('recordsList');

const words = [
  { word: "apple", translation: "яблоко" },
  { word: "cat", translation: "кот" },
  { word: "house", translation: "дом" },
  { word: "dog", translation: "собака" }
];

let currentUser = localStorage.getItem('currentUser') || null;
let score = 0, bestScore = 0;
let gameActive = false, currentWord;

if (!currentUser) {
  showOnly(loginSection);
} else {
  showOnly(menu);
}

loginBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (name.length >= 2) {
    currentUser = name;
    localStorage.setItem('currentUser', currentUser);
    showOnly(menu);
  } else {
    alert("Введите имя (минимум 2 буквы)");
  }
};

btnGame.onclick = () => {
  score = 0;
  scoreDisplay.textContent = `Очки: ${score}`;
  bestScore = +localStorage.getItem('bestScore') || 0;
  bestScoreDisplay.textContent = `Лучший: ${bestScore}`;
  showOnly(gameSection);
  nextWord();
};

btnWords.onclick = () => {
  showOnly(wordsSection);
  wordsList.innerHTML = "";
  words.forEach(w => {
    const li = document.createElement('li');
    li.textContent = `${w.word} - ${w.translation}`;
    wordsList.appendChild(li);
  });
};

btnRecords.onclick = () => {
  showOnly(recordsSection);
  showRecords();
};

backFromWords.onclick = () => showOnly(menu);
backFromRecords.onclick = () => showOnly(menu);

nextBtn.onclick = () => nextWord();

function showOnly(section) {
  [menu, loginSection, gameSection, wordsSection, recordsSection].forEach(s => s.classList.remove('visible'));
  section.classList.add('visible');
}

function nextWord() {
  gameOptions.innerHTML = "";
  nextBtn.disabled = true;
  currentWord = words[Math.floor(Math.random() * words.length)];
  gameWord.textContent = currentWord.word;
  const options = [currentWord.translation];
  while (options.length < 4) {
    const random = words[Math.floor(Math.random() * words.length)].translation;
    if (!options.includes(random)) options.push(random);
  }
  options.sort(() => Math.random() - 0.5);
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, opt);
    gameOptions.appendChild(btn);
  });
  gameActive = true;
}

function selectAnswer(button, chosen) {
  if (!gameActive) return;
  gameActive = false;
  const buttons = gameOptions.querySelectorAll('button');
  buttons.forEach(b => b.disabled = true);

  if (chosen === currentWord.translation) {
    score++;
    scoreDisplay.textContent = `Очки: ${score}`;
  } else {
    button.classList.add('wrong');
    buttons.forEach(b => {
      if (b.textContent === currentWord.translation) b.classList.add('correct');
    });
  }
  setTimeout(() => {
    buttons.forEach(b => b.classList.remove('correct', 'wrong'));
  }, 1000);
  nextBtn.disabled = false;
}

function endGame() {
  const records = JSON.parse(localStorage.getItem('records') || '[]');
  records.push({ name: currentUser, score });
  localStorage.setItem('records', JSON.stringify(records));
  if (score > bestScore) {
    localStorage.setItem('bestScore', score);
    alert('Новый рекорд!');
  }
  showOnly(menu);
}

function showRecords() {
  const records = JSON.parse(localStorage.getItem('records') || '[]');
  recordsList.innerHTML = "";
  if (records.length === 0) {
    recordsList.textContent = "Пока нет рекордов.";
    return;
  }
  const ul = document.createElement('ul');
  records.sort((a,b)=>b.score-a.score).forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.name}: ${r.score}`;
    ul.appendChild(li);
  });
  recordsList.appendChild(ul);
}
