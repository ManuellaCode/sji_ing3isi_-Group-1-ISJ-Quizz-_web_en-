const peer = new Peer();
let matchingGame;
let gameCode;
let opponentId;
let opponentName;
// Fetch the gameInfo object from local storage
const gameInfo = JSON.parse(localStorage.getItem("game-party"));
console.log(gameInfo);

let category = gameInfo.category;
let level = gameInfo.level;
let questions;
let play = false;
username = gameInfo.username;

const profilePicture = document.querySelector('.profile-picture');

// Set the profile picture based on the first letter of the username
const firstLetter = user.username.charAt(0).toUpperCase();
profilePicture.src = `./Avatars/${firstLetter}.jpeg`;

// Check if gameInfo exists and populate the header
if (gameInfo) {
    const userName = gameInfo.username || "N/A";
    document.getElementById("user").textContent = `Username: ${userName}`;
    document.getElementById("user-level").textContent = `Level: ${gameInfo.level || "N/A"}`;
    document.getElementById("user-category").textContent = `Category: ${gameInfo.category || "N/A"}`;
    document.getElementById("user-score").textContent = `Score: ${gameInfo.userScore || 0}`;
    document.getElementById("opponent-user").textContent = `Opponent: N/A`;
    document.getElementById("opponent-score").textContent = `Score: ${gameInfo.opponentScore || 0}`;
} else {
    console.log("No gameInfo found in local storage.");
}

// Peer connection setup
peer.on('open', id => {
    const username = gameInfo.username || "Anonymous";
    gameCode = gameInfo.game_code || "N/A";

    const playerInfo = {
        username: username,
        peerId: id,
        gameCode: gameCode,
        type: 'game'
    };

    const conn = peer.connect(gameInfo.serverId);
    if (gameInfo.me === "receiver") {
        conn.on('open', () => {
            conn.send(JSON.stringify(playerInfo));
        });
    } else if (gameInfo.me === "challenger") {
        conn.on('open', () => {
            conn.send(JSON.stringify({ type: "send-me-game-data" }));
        });

        conn.on('data', data => {
            const rec_games = JSON.parse(data);
            console.log(rec_games);
            gameCode = gameInfo.game_code || "N/A";
            matchingGame = rec_games.find(game => game.gameCode === gameCode);
            if (matchingGame) {
                opponentId = matchingGame.peerId;
                opponentName = matchingGame.username;
                const userPicElement = document.querySelector('.profile-container:nth-child(2) .profile-picture');
                const picpath = userPicElement.src;
                const connec = peer.connect(opponentId);
                connec.on('open', () => {
                    connec.send(JSON.stringify({ type: "send-user-info", username: username, picpath: picpath }));
                });
                connec.on('data', data => {
                    const message = JSON.parse(data);
                    if (message.type === "reply-with-user-info") {
                        document.getElementById("opponent-user").textContent = `Opponent: ${message.username}`;
                        const opponentPic = document.getElementsByClassName("opponent-picture")[0];
                        opponentPic.src = message.picpath;
                    }
                });
            } else {
                console.log("No matching game found for game code:", gameCode);
            }
        });
    }
});

peer.on('connection', conn => {
    conn.on('data', data => {
        const message = JSON.parse(data);
        if (message.type === "send-user-info") {
            opponentId = conn.peer;
            opponentName = message.username;
            document.getElementById("opponent-user").textContent = `Opponent: ${message.username}`;
            const opponentPic = document.getElementsByClassName("opponent-picture")[0];
            opponentPic.src = message.picpath;
            const userPicElement = document.querySelector('.profile-container:nth-child(2) .profile-picture');
            const picpath = userPicElement.src;
            conn.send(JSON.stringify({ type: "reply-with-user-info", username: gameInfo.username || "N/A", picpath: picpath }));
        }
    });
});


// Countdown functionality
document.getElementById("countdown-message").style.display = "none"; // Initially hide the countdown message
setTimeout(() => {
    document.getElementById("countdown-message").style.display = "block"; // Show countdown message
    let countdown = 5;
    const countdownInterval = setInterval(() => {
        document.getElementById("countdown-message").textContent = `The game will begin in ${countdown}...`;
        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            document.getElementById("countdown-message").style.display = "none"; // Hide countdown message
            document.getElementById("quizz-section").style.display = "flex"; // Show quiz section
            document.getElementById("welcome-message").style.display = "none"; // Hide welcome message
            document.getElementById("game-instruction").style.display = "none"; // Hide game instructions
            // Start the quiz after the countdown ends
            // Load questions and start the game
            loadQuestions(level, category).then(loadedQuestions => {
               questions = loadedQuestions;
               const conn = peer.connect(opponentId);
               startQuiz(questions);
            }).catch(error => {
                console.error('Error loading questions:', error);
            });
        }
    }, 1000); // Update every second
}, 2000); // Start after 2 seconds

function updateScoreDisplay() {
    document.getElementById("user-score").textContent = `Score: ${playerScore}`;
    document.getElementById("opponent-score").textContent = `Score: ${opponentScore}`;
}
//after the quiz session ends
function proceedToPlayerPage() {
    window.location.href = 'player.html'; // Redirect to player.html
}

// Function to load questions from the JSON file
function loadQuestions(level, category) {
    return fetch('./questions.json') // Return the fetch Promise
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON data
        })
        .then(data => {
            if (data && data[level]) {
                if (data[level][category]) {
                    return data[level][category]; // Return the array of questions
                } else {
                    console.error(`Category "${category}" does not exist for level "${level}".`);
                    return []; // Return an empty array if the category doesn't exist
                }
            } else {
                console.error(`Level "${level}" does not exist.`);
                return []; // Return an empty array if the level doesn't exist
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            return []; // Return an empty array in case of an error
        });
}

// Function to start the quiz
let playerScore = 0; // Initialize player score
let opponentScore = 0; // Initialize opponent score
let countdownInterval; // Declare this globally
let timefor //seconds for each question
if(level == "Mougou"){
    timefor = 12;
}
else if(level === "Don Man"){
    timefor = 9;
}
else{
    timefor = 5;
}

function startQuiz(questions) {
    let currentIndex = 0; // Start with the first question
    const totalQuestions = questions.length;
    const timerElement = document.querySelector('.timer');
    const questionCounterElement = document.querySelector('.question-total');
    let tickingSound = new Audio('./clock-countdown.wav'); // Path to ticking sound
    let warningSound = new Audio('./start-countdown.wav'); // Path to warning sound
    let correctSound = new Audio('./correct.mp3'); // Path to correct answer sound
    let incorrectSound = new Audio('./wrong.mp3'); // Path to incorrect answer sound

    function displayQuestion() {
        console.log("yes")
        if (currentIndex < totalQuestions) {
            const question = questions[currentIndex];

            document.querySelector('.question-text').textContent = question.question;

            const optionElements = document.querySelectorAll('.option');
            optionElements.forEach((optionElement, index) => {
                if (index < question.proposed_answers.length) {
                    optionElement.textContent = question.proposed_answers[index];
                    optionElement.style.display = 'block';
                    optionElement.style.border = '2px solid rgba(255, 255, 255, .2)';
                    optionElement.style.pointerEvents = 'auto'; // Enable clicking
                    optionElement.onclick = () => handleOptionClick(optionElement, index);
                } else {
                    optionElement.style.display = 'none';
                }
            });

            questionCounterElement.textContent = `${currentIndex + 1} out of ${totalQuestions}`;
            startTimer(); // Start the timer for this question
        } else {
            endQuiz("normal"); // Handle quiz completion
        }
    }

    function handleOptionClick(selectedOption, index) {
        clearInterval(countdownInterval); // Stop timer when an option is clicked
        tickingSound.pause(); // Stop ticking sound on answer selection

        // Disable further interactions while transitioning
        const optionElements = document.querySelectorAll('.option');
        optionElements.forEach(el => el.style.pointerEvents = 'none');

        const question = questions[currentIndex];
        if (question.correct_answer === question.proposed_answers[index]) {
            correctSound.play(); // Play correct answer sound
            selectedOption.style.border = '2px solid green';
            playerScore += 5; // Update player score by 5 points
            updateScoreDisplay();
            sendScoreUpdateToOpponent("correct"); // Send score update to opponent
        } else {
            incorrectSound.play(); // Play incorrect answer sound
            selectedOption.style.border = '2px solid red';
            showCorrectAnswer(); // Show the correct answer
            sendScoreUpdateToOpponent("wrong"); // Send score update to opponent
        }
        setTimeout(proceedToNextQuestion, 1500); // Move to the next question after 1 second
    }

    function startTimer() {
        timeLeft = timefor; // 10 seconds for each question
        timerElement.textContent = `${timeLeft} seconds left`;
        timerElement.style.color = 'green';

        // Clear any existing timer interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        tickingSound.play(); // Start ticking sound

        countdownInterval = setInterval(() => {
            timerElement.textContent = `${timeLeft--} seconds left`;
            if (timeLeft <= 5) {
                timerElement.style.color = 'red';
                if (timeLeft === 8) {
                    tickingSound.pause();
                    warningSound.play();
                }
            }
            if (timeLeft < 0) {
                clearInterval(countdownInterval);
                tickingSound.pause(); // Stop ticking sound on timeout
                warningSound.pause();
                showCorrectAnswer(); // Show the correct answer
                setTimeout(proceedToNextQuestion, 1000); // Automatically proceed to the next question after 1 second
            }
        }, 1000);
    }

    function showCorrectAnswer() {
        const question = questions[currentIndex];
        const optionElements = document.querySelectorAll('.option');
        optionElements.forEach((el, i) => {
            if (question.correct_answer === question.proposed_answers[i]) {
                el.style.border = '2px solid green'; // Show correct answer
            }
        });
    }

    function proceedToNextQuestion() {
        currentIndex++; // Increment question index
        if (currentIndex < totalQuestions) {
            displayQuestion(); // Show next question
        } else {
            endQuiz("normal"); // Handle quiz completion
        }
    }

    function sendScoreUpdateToOpponent(reason) {
        const scoreUpdateMessage = {
            reason: reason,
            type: "score-update",
            score: playerScore,
            currentIndex: currentIndex // Send the current question index as well
        };
        const connection = peer.connect(opponentId);
        connection.on("open", () => {
            connection.send(JSON.stringify(scoreUpdateMessage));
        });
        console.log("sending my success");
    }

    //add event listener to the button leave game
    document.getElementById("leave-game-button").onclick = leaveGame;
    function leaveGame() {
        const leaveMessage = {
            type: "forfeit",
            username: gameInfo.username || "N/A",
            score: 0 // Player receives 0 points
        };

        if (opponentId) {
            const connection = peer.connect(opponentId);
            connection.on("open", () => {
                connection.send(JSON.stringify(leaveMessage)); // Notify opponent
                endGameWithForfeit();
            });
        } else {
            endGameWithForfeit(); // End game if opponentId is unavailable
        }
    }

    function endGameWithForfeit() {
        opponentScore = 25; //opponent wins by forfeit
        updateScoreDisplay();
        currentIndex = questions.length + 1
        endQuiz("forfeit")
    }

    function endQuiz(reason) {
        tickingSound.pause(); // Stop ticking sound on timeout
        warningSound.pause();
        console.log('All questions have been displayed.');
        document.querySelector('.quizz-section').style.display = 'none';

        // Display final scores
        document.getElementById("final-user-score").textContent = playerScore;
        document.getElementById("final-opponent-score").textContent = opponentScore;

        // Calculate percentages
        const totalScore = questions.length * 5;
        const userPercentage = (playerScore / totalScore) * 100 || 0;
        const opponentPercentage = (opponentScore / totalScore) * 100 || 0;

        // Update percentage circles
        document.getElementById("user-percentage").textContent = `${userPercentage.toFixed(0)}%`;
        document.getElementById("opponent-percentage").textContent = `${opponentPercentage.toFixed(0)}%`;

        // Add filled class for animation
        document.getElementById("user-circle").classList.add("filled");
        document.getElementById("opponent-circle").classList.add("filled");

        // Get player's current level from local storage
        const levels = ["Mougou", "Don Man", "Tara"];
        let currentLevelIndex = levels.indexOf(level);

        let playerData = JSON.parse(localStorage.getItem("player"));
        let users = JSON.parse(localStorage.getItem("users"));

        let currentuser = users.find(user => user.username === username);

        // Determine result message and level adjustments
        let resultMessage;
        const gameDate = new Date().toLocaleDateString(); // Format the date as needed

        // Create the game history entry
        const gameResult = {
            opponent: opponentName,
            level: playerData.level,
            category: category,
            userScore: playerScore,
            won: playerScore > opponentScore,
            date: gameDate
        };
        console.log(gameResult)

        // Update game history
        if (!currentuser.gameHistory) {
            currentuser.gameHistory = []; // Initialize if it doesn't exist
        }
        currentuser.gameHistory.push(gameResult); // Add the new entry to the game history
        console.log(currentuser)
        users.filter(user => { user.username === username })
        users.push(currentuser)

        // Update the user data in local storage
        localStorage.setItem("users", JSON.stringify(users));

        // Determine the result message based on the scores
        if (playerScore > opponentScore) {
            // Player wins
            if (currentLevelIndex < levels.length - 1) {
                currentLevelIndex++; // Promote to next level
                resultMessage = `You win! You have been promoted to level ${levels[currentLevelIndex]}.`;
                if(reason === "forfeit"){
                    resultMessage = `${opponentName} has forfeited the game. You win!. You have been promoted to level ${levels[currentLevelIndex]}.`
                }
            } else {
                resultMessage = "You win! Your level is maintained.";
                if(reason === "forfeit"){
                    resultMessage = `${opponentName} has forfeited the game. You win!`
                }
            }

        } else if (playerScore < opponentScore) {
            // Player loses
            if (currentLevelIndex > 0) {
                currentLevelIndex--; // Demote to previous level
                resultMessage = `You lose! You have been demoted to level ${levels[currentLevelIndex]}.`;
                if(reason === "forfeit"){
                    resultMessage = `You have forfeited the game. You lose!. You have been demoted to level ${levels[currentLevelIndex]}.`
                }
            } else {
                resultMessage = "You lose! Your level is maintained.";
                if(reason === "forfeit"){
                    resultMessage = `You have forfeited the game. You lose!`
                }
            }
        } else {
            // Draw
            resultMessage = "It's a draw! Your level remains unchanged.";
        }

        document.getElementById("result-message").textContent = resultMessage;

        // Update player's level in local storage
        playerData.level = levels[currentLevelIndex];
        localStorage.setItem("player", JSON.stringify(playerData));

        // Update CSS variable for percentage circle
        document.getElementById("user-circle").style.setProperty('--percentage', `${userPercentage*3.6}deg`);
        document.getElementById("opponent-circle").style.setProperty('--percentage', `${opponentPercentage*3.6}deg`);

        // Show the result section
        document.querySelector('.result-section').style.display = 'flex';
    }
    // Function to create and display a toast notification
function showToast(reason) {
    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add("toast")

    // Set the message based on the reason
    const message = `Next question: Your opponent entered a ${reason === 'wrong' ? 'wrong answer' : 'correct answer'}`;
    toast.textContent = message;

    // Append to body
    document.body.appendChild(toast);

    // Remove toast after 1.5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500); // Delay for fade out
    }, 1000);
}

// Listen for incoming messages
peer.on('connection', conn => {
    conn.on('data', data => {
        const message = JSON.parse(data);
        if (message.type === "score-update") {
            opponentScore = message.score; // Update opponent's score
            currentIndex = message.currentIndex; // Update to the opponent's current question index
            console.log(`Opponent's score updated to: ${opponentScore}`);
            updateScoreDisplay();
            proceedToNextQuestion(); // Proceed to the next question for the player

            // Show toast notification based on the reason
            showToast(message.reason);
        }
        if (message.type === "forfeit") {
            opponentScore = 0; // Update opponent score
            playerScore = 25
            updateScoreDisplay();
            currentIndex = questions.length + 1//end the game
            endQuiz("forfeit")
        }
    });
});

displayQuestion()

}

peer.on('error', err => {
    console.error(err);
});