let categories = [];
let currentCategoryIndex = 0;  // Set default category index
let currentLevelIndex = 0;
let currentQuestionIndex = 0;
let timerInterval;
let score = 0;

// Fetch categories and levels from JSON
fetch("Geo.json")
  .then((response) => response.json())
  .then((data) => {
    categories = data.categories;
    displayQuestion();  // Start the quiz immediately
  })
  .catch((error) => console.error("Error loading questions:", error));

// Display the current question
// function displayQuestion() {
//   const currentCategory = categories[currentCategoryIndex];
//   const currentLevel = currentCategory.levels[currentLevelIndex];

//   if (!currentLevel) {
//     showFinalResult();
//     return;
//   }

//   const questions = currentLevel.questions;
//   if (currentQuestionIndex >= questions.length) {
//     currentLevelIndex++; // Move to the next level
//     currentQuestionIndex = 0; // Reset question index for the new level
//     if (currentLevelIndex < currentCategory.levels.length) {
//       // Show a styled congratulatory message for completing the level
//       showMessage(
//         `🎉 Congratulations! 🎉`,
//         `You've completed Level ${currentLevel.level}! Get ready for Level ${currentLevelIndex + 1}.`
//       );

//       // Delay loading the next level slightly for a better user experience
//       setTimeout(() => {
//         displayQuestion();
//       }, 3000);
//     } else {
//       // If all levels are completed, show the final result
//       showMessage(
//         `🎉 Category Completed!🎉`,
//         `You've completed the category: ${currentCategory.category}.`
//       );
//       setTimeout(() => {
//         showFinalResult();
//       }, 3000);
//     }
//     return;
//   }

//   const questionObj = questions[currentQuestionIndex];
//   document.querySelector(".quiz-container").innerHTML = `
//     <div id="questionNumber" class="mb-3">Level ${currentLevel.level} - Question ${currentQuestionIndex + 1}</div>
//     <div id="question" class="mb-3">${questionObj.question}</div>
//     <div id="options" class="mb-3 d-flex flex-wrap justify-content-center gap-3"></div>
//     <div id="timer" class="mb-3">Time left: 10 seconds</div>
//     <div id="score">Score: ${score}</div>
//   `;

//   const optionsDiv = document.getElementById("options");
//   const optionLabels = ["A", "B", "C", "D"];
//   questionObj.options.forEach((option, index) => {
//     const optionButton = document.createElement("button");
//     optionButton.className = "btn btn-outline-primary option";
//     optionButton.innerHTML = `<span class="option-label">${optionLabels[index]}.</span> ${option}`;
//     optionButton.onclick = () => checkAnswer(option);
//     optionsDiv.appendChild(optionButton);
//   });

//   startTimer();
// }

// Display the current question
function displayQuestion() {
  const currentCategory = categories[currentCategoryIndex];
  const currentLevel = currentCategory.levels[currentLevelIndex];

  if (!currentLevel) {
    showFinalResult();
    return;
  }

  const questions = currentLevel.questions;

  if (currentQuestionIndex >= questions.length) {
    currentLevelIndex++; // Move to the next level
    currentQuestionIndex = 0;

    if (currentLevelIndex < currentCategory.levels.length) {
      showMessage(
        `🎉Level Complete!🎉`,
        `You've completed Level ${currentLevel.level}. Get ready for the next level!`
      );

      setTimeout(() => {
        displayQuestion();
      }, 3000); // Delay before showing the next level
    } else {
      showMessage(
        `🎉Category Complete!🎉`,
        `You've completed the category: ${currentCategory.category}.`
      );

      setTimeout(() => {
        showFinalResult();
      }, 3000); // Delay before showing final result
    }
    return;
  }

  const questionObj = questions[currentQuestionIndex];
  updateQuizUI(questionObj, currentLevel.level);
}

// Update the quiz UI
function updateQuizUI(questionObj, level) {
  const questionElement = document.getElementById("question");
  const optionsDiv = document.getElementById("options");
  const timerDiv = document.getElementById("timer");

  // Apply fade-out before updating
  questionElement.classList.add("fade-out");
  optionsDiv.classList.add("fade-out");

  setTimeout(() => {
    // Update content
    questionElement.innerText = questionObj.question;
    optionsDiv.innerHTML = ""; // Clear previous options
    questionObj.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "btn btn-outline-primary option button-hover";
      button.innerText = option;
      button.setAttribute("aria-label", `Option ${index + 1}`);
      button.onclick = () => checkAnswer(option); // Trigger answer check
      optionsDiv.appendChild(button);
    });

    // Apply fade-in after updating
    questionElement.classList.remove("fade-out");
    questionElement.classList.add("fade-in");
    optionsDiv.classList.remove("fade-out");
    optionsDiv.classList.add("fade-in");

    // Update timer
    startTimer(10); // 10 seconds per question
    timerDiv.innerText = `Time left: 10 seconds`;


    // Focus on the first option
    if (optionsDiv.firstChild) optionsDiv.firstChild.focus();
  }, 500);
}

function showMessage(title, message) {
  const quizContainer = document.querySelector(".quiz-container");
  quizContainer.innerHTML = `
      <div class="message-modal">
          <h2>${title}</h2>
          <p>${message}</p>
      </div>
  `;
}

// Check the user's answer
function checkAnswer(selectedOption) {
  clearInterval(timerInterval); // Stop the timer

  const currentCategory = categories[currentCategoryIndex];
  const currentLevel = currentCategory.levels[currentLevelIndex];
  const questionObj = currentLevel.questions[currentQuestionIndex];

  if (selectedOption === questionObj.answer) {
    score++;
    showPopup("Correct!", () => {
      currentQuestionIndex++;
      displayQuestion();
    });
  } else {
    showPopup("Wrong!", () => {
      currentQuestionIndex++;
      displayQuestion();
    });
  }
}

// Timer logic
function startTimer() {
  let timeLeft = 150;
  // const timerDiv = document.getElementById("timer");
  // timerDiv.innerText = `Time left: ${timeLeft} seconds`;

  // clearInterval(timerInterval);
  // timerInterval = setInterval(() => {
  //   timeLeft--;
  //   timerDiv.innerText = `Time left: ${timeLeft} seconds`;
  const timerDiv = document.getElementById("timer");
  // let timeLeft = seconds;

  clearInterval(timerInterval);
  timerDiv.innerText = `Time left: ${timeLeft} seconds`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDiv.innerText = `Time left: ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showPopup("Time's up!", () => {
        currentQuestionIndex++;
        displayQuestion();
      });
    }
  }, 1000);
}

// Show a styled message modal
function showMessage(title, message) {
  const quizContainer = document.querySelector(".quiz-container");
  quizContainer.innerHTML = `
    <div class="message-modal">
      <h2>${title}</h2>
      <p>${message}</p>
    </div>
  `;
}

// Show the final result
function showFinalResult() {
  clearInterval(timerInterval);
  const quizContainer = document.querySelector(".quiz-container");
  quizContainer.innerHTML = `
    <h1>Congratulations!</h1>
    <p>You have completed the category: ${categories[currentCategoryIndex].category}</p>
    <p>Your Final Score: ${score}</p>
    <button class="btn btn-primary" onclick="displayCategories()">Restart Quiz</button>
  `;
}

// Show a popup message
// function showPopup(message, callback) {
  // Create overlay and popup elements
  // const overlay = document.createElement("div");
  // overlay.className = "popup-overlay";
  // const popup = document.createElement("div");
  // popup.className = "popup-box";
  // popup.innerHTML = `
  //   <p>${message}</p>
  //   <button class="btn btn-primary mt-3">OK</button>
  // `;
  // document.body.appendChild(overlay);
  // overlay.appendChild(popup);

  // Remove popup on button click and execute callback
//   popup.querySelector("button").onclick = () => {
//     overlay.remove();
//     if (callback) callback();
//   };
// }

// Restart the quiz
function restartQuiz() {
  currentLevelIndex = 0;
  currentQuestionIndex = 0;
  score = 0;
  displayQuestion();
}

function showPopup(message, callback) {
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.innerHTML = `
    <div class="popup-box" role="alert" aria-live="assertive">
      <p>${message}</p>
      <button class="btn btn-primary mt-3" onclick="closePopup()">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const popupButton = overlay.querySelector("button");
  popupButton.focus(); // Move focus to popup button

  popupButton.onclick = () => {
    closePopup();
    if (callback) callback();
  };
}

function closePopup() {
  const overlay = document.querySelector(".popup-overlay");
  if (overlay) overlay.remove();
}

