const words = [
  { arabic: "كتاب", russian: "книга" },
  { arabic: "قلم", russian: "ручка" },
  { arabic: "باب", russian: "дверь" },
  { arabic: "شمس", russian: "солнце" },
  { arabic: "قمر", russian: "луна" },
];

let currentUser = null;
let usersData = {};
let score = 0, currentQuestionIndex = 0, timer = null, timeLeft = 20;

function hideAll() {
  document.querySelectorAll("section, #menu").forEach(s => s.classList.add("hidden"));
}

function show(section) {
  hideAll();
  section.classList.remove("hidden");
}

function updateTimer() {
  timeLeft--;
  document.getElementById("timer").textContent = `⏳ ${timeLeft}`;
  if (timeLeft <= 0) endGame("Время вышло!");
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 20;
  document.getElementById("timer").textContent = `⏳ ${timeLeft}`;
  timer = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function auth(username, password) {
  if (!username || !password) return "Введите имя пользователя и пароль";
  if (usersData[username] && usersData[username].password !== password) return "Неверный пароль";

  if (!usersData[username]) usersData[username] = { password, bestScore: 0 };
  currentUser = username;
  localStorage.setItem("arabRusUsers", JSON.stringify(usersData));
  return null;
}

function loadUsers() {
  const data = localStorage.getItem("arabRusUsers");
  usersData = data ? JSON.parse(data) : {};
}

document.getElementById("authSubmitBtn").addEventListener("click", () => {
  const u = document.getElementById("usernameInput").value;
  const p = document.getElementById("passwordInput").value;
  const err = auth(u, p);
  document.getElementById("authError").textContent = err || "";
  if (!err) {
    document.getElementById("modalOverlay").style.display = "none";
    document.getElementById("bestScore").textContent = `Лучший: ${usersData[currentUser].bestScore}`;
  }
});

document.getElementById("btnPlay").onclick = startGame;
document.getElementById("btnAllWords").onclick = showAllWords;
document.getElementById("btnRecords").onclick = showRecords;
document.getElementById("btnBackToMenu").onclick =
document.getElementById("btnBackFromWords").onclick =
document.getElementById("backFromRecords").onclick = () => show(document.getElementById("menu"));
document.getElementById("playAgainBtn").onclick = () => {
  document.getElementById("endGameModal").classList.add("hidden");
  startGame();
};

function startGame() {
  score = 0; currentQuestionIndex = 0;
  show(document.getElementById("gameSection"));
  updateScore(0);
  startTimer();
  showQuestion();
}

function endGame(message) {
  stopTimer();
  if (score > usersData[currentUser].bestScore) {
    usersData[currentUser].bestScore = score;
    localStorage.setItem("arabRusUsers", JSON.stringify(usersData));
    document.getElementById("bestScore").textContent = `Лучший: ${score}`;
  }
  document.getElementById("endGameMessage").textContent = `${message} Твой счёт: ${score}`;
  document.getElementById("endGameModal").classList.remove("hidden");
}

function updateScore(val) {
  score = val;
  document.getElementById("score").textContent = `Очки: ${score}`;
}

function showQuestion() {
  if (currentQuestionIndex >= words.length) return endGame("Все вопросы закончились!");

  const q = words[currentQuestionIndex];
  document.getElementById("question").textContent = `Переведите: ${q.arabic}`;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  let options = [q.russian];
  while (options.length < 4) {
    const r = words[Math.floor(Math.random() * words.length)].russian;
    if (!options.includes(r)) options.push(r);
  }

  shuffle(options).forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = opt;
    btn.onclick = e => {
      e.target.blur();
      if (opt === q.russian) {
        updateScore(score + 1);
        currentQuestionIndex++;
        showQuestion();
      } else {
        endGame("Неправильный ответ!");
      }
    };
    answersDiv.appendChild(btn);
  });
}

function showAllWords() {
  show(document.getElementById("wordsSection"));
  const list = document.getElementById("allWordsList");
  list.innerHTML = "";
  words.forEach(w => list.innerHTML += `<div>${w.arabic} — ${w.russian}</div>`);
}

function showRecords() {
  show(document.getElementById("recordsSection"));
  const list = document.getElementById("recordsList");
  list.innerHTML = "";
  Object.entries(usersData).sort(([,a],[,b])=>b.bestScore-a.bestScore)
    .forEach(([u,d],i)=>list.innerHTML+=`<div>${i+1}. ${u}: ${d.bestScore}</div>`);
}

function shuffle(a) {
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

loadUsers();
document.getElementById("modalOverlay").style.display = "flex";
