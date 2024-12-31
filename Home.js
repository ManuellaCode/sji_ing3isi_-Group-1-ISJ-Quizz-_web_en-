// Script to manage player selection, category selection, and quiz logic

let currentQuestionIndex = 0;
let timer = 10;
let timerInterval;
let scores = { player1: 0, player2: 0 };
let currentPlayer = "player1";
let selectedCategory;

// Step 1: Handle Player Selection
document.addEventListener("DOMContentLoaded", () => {
  const playerForm = document.getElementById("playerForm");
  if (playerForm) {
    playerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const player1 = document.getElementById("player1").value;
      const player2 = document.getElementById("player2").value;

      localStorage.setItem("player1", player1);
      localStorage.setItem("player2", player2);

      document.getElementById("playerSelection").style.display = "none";
      document.getElementById("categorySelection").style.display = "block";
    });
  }
});

// Step 2: Handle Category Selection
document.querySelectorAll(".category-button").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.getAttribute("data-category");
    localStorage.setItem("selectedCategory", selectedCategory);

    document.getElementById("categorySelection").style.display = "none";
    document.getElementById("quizContainer").style.display = "block";

    fetchQuestions(selectedCategory).then(questions => {
      loadQuestion(questions);
    });
  });
});

// Step 3: Fetch Questions by Category
async function fetchQuestions(category) {
  const response = await fetch(`questions/${category}.json`);
  return await response.json();
}

// Step 4: Load a Question
function loadQuestion(questions) {
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");

  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;

  optionsElement.innerHTML = "";
  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-button");
    button.addEventListener("click", () => checkAnswer(option, currentQuestion.correct, questions));
    optionsElement.appendChild(button);
  });

  resetTimer(() => {
    alert(`${currentPlayer} ran out of time!`);
    nextTurn(questions);
  });
}

// Step 5: Check Answer
function checkAnswer(selected, correct, questions) {
  clearInterval(timerInterval);

  if (selected === correct) {
    scores[currentPlayer]++;
    alert(`${currentPlayer} answered correctly!`);
  } else {
    alert(`${currentPlayer} answered incorrectly.`);
  }

  document.getElementById(`${currentPlayer}Score`).textContent = `${currentPlayer}: ${scores[currentPlayer]}`;
  nextTurn(questions);
}

// Step 6: Handle Turns
function nextTurn(questions) {
  currentPlayer = currentPlayer === "player1" ? "player2" : "player1";

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion(questions);
  } else {
    endQuiz();
  }
}

// Step 7: End Quiz
function endQuiz() {
  const player1Name = localStorage.getItem("player1");
  const player2Name = localStorage.getItem("player2");

  if (scores.player1 > scores.player2) {
    alert(`${player1Name} wins!`);
    nextLevel("player1");
  } else if (scores.player2 > scores.player1) {
    alert(`${player2Name} wins!`);
    nextLevel("player2");
  } else {
    alert("It's a draw!");
  }
}

function nextLevel(winner) {
  let currentLevel = parseInt(localStorage.getItem(`${winner}Level`) || 1);
  localStorage.setItem(`${winner}Level`, currentLevel + 1);
  alert(`${winner} advances to level ${currentLevel + 1}`);
}

// Step 8: Timer Logic
function resetTimer(onTimeout) {
  timer = 10;
  document.getElementById("timer").textContent = timer;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    document.getElementById("timer").textContent = timer;

    if (timer <= 0) {
      clearInterval(timerInterval);
      onTimeout();
    }
  }, 1000);
}
