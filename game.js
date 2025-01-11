const peer = new Peer();
let matchingGame;
let gameCode;
let opponentId;

// Fetch the gameInfo object from local storage
const gameInfo = JSON.parse(localStorage.getItem("game-party"));
console.log(gameInfo);

let category = gameInfo.category;
let level = gameInfo.level;
let questions;
let play = false;

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
            startQuiz(questions); // Start the quiz after the countdown ends
        }
    }, 1000); // Update every second
}, 2000); // Start after 2 seconds

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
let isPlayerTurn = true; // Track whose turn it is

function startQuiz(questions, ) {
    let currentIndex = 0; // Start with the first question
    const totalQuestions = questions.length;
    const timerElement = document.querySelector('.timer');
    const questionCounterElement = document.querySelector('.question-total');
    let tickingSound;
    let warningSound;
    let correctSound = new Audio('./correct.mp3'); // Path to correct answer sound
    let incorrectSound = new Audio('./wrong.mp3'); // Path to incorrect answer sound

    function displayQuestion() {
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
                } else {
                    optionElement.style.display = 'none';
                }
            });

            questionCounterElement.textContent = `${currentIndex + 1} out of ${totalQuestions}`;

            let timeLeft = 10; // 10 seconds for each question
            timerElement.textContent = `${timeLeft} seconds left`;
            timerElement.style.color = 'green';

            tickingSound = new Audio('./clock-countdown.wav'); // Path to ticking sound
            warningSound = new Audio('./start-countdown.wav'); // Path to warning sound

            tickingSound.play(); // Start ticking sound

            const countdownInterval = setInterval(() => {
                timerElement.textContent = `${timeLeft} seconds left`;
                if (timeLeft <= 5) {
                    timerElement.style.color = 'red';
                    if (timeLeft === 5) {
                        tickingSound.pause();
                        warningSound.play();
                    }
                }
                if (timeLeft < 0) {
                    clearInterval(countdownInterval);
                    tickingSound.pause(); // Stop ticking sound on timeout
                    showCorrectAnswer(); // Show the correct answer
                    proceedToNextQuestion(); // Automatically proceed to the next question
                }
                timeLeft--;
            }, 1000);

            optionElements.forEach((optionElement, index) => {
                optionElement.onclick = () => {
                    clearInterval(countdownInterval); // Stop timer when an option is clicked
                    tickingSound.pause(); // Stop ticking sound on answer selection

                    // Disable further interactions while transitioning
                    optionElements.forEach(el => el.style.pointerEvents = 'none');

                    if (question.correct_answer === question.proposed_answers[index]) {
                        correctSound.play(); // Play correct answer sound
                        optionElement.style.border = '2px solid green';
                        playerScore += 5; // Update player score by 5 points
                        sendScoreUpdateToOpponent(); // Send score update to opponent
                    } else {
                        incorrectSound.play(); // Play incorrect answer sound
                        optionElement.style.border = '2px solid red';
                        showCorrectAnswer(); // Show the correct answer
                        sendScoreUpdateToOpponent(); // Send score update to opponent
                    }

                    proceedToNextQuestion(); // Move to the next question
                };
            });
        } else {
            endQuiz(); // Handle quiz completion
        }
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
        setTimeout(() => {
            currentIndex++; // Increment question index
            if (currentIndex < totalQuestions) {
                displayQuestion(); // Show next question
            } else {
                endQuiz(); // Handle quiz completion
            }
        }, 300); // Wait for 0.3 seconds before showing the next question
    }

    function sendScoreUpdateToOpponent() {
        const scoreUpdateMessage = {
            type: "score-update",
            score: playerScore,
            currentIndex: currentIndex // Send the current question index as well
        };
        // Send the score update to the opponent
        const connection = peer.connect(opponentId)
        connection.on("open", ()=>{
            connection.send(JSON.stringify(scoreUpdateMessage));
        })
        console.log("sending my success")
    }

    function endQuiz() {
        console.log('All questions have been displayed.');
        document.querySelector('.quizz-section').style.display = 'none';

        // Display final scores
        document.getElementById("final-user-score").textContent = playerScore;
        document.getElementById("final-opponent-score").textContent = opponentScore;

        // Calculate percentages
        const totalScore = Math.max(playerScore, opponentScore); // Assume maximum score is the highest player score
        const userPercentage = (playerScore / totalScore) * 100 || 0; // Avoid division by zero
        const opponentPercentage = (opponentScore / totalScore) * 100 || 0;

        // Update percentage circles
        document.getElementById("user-percentage").textContent = `${userPercentage.toFixed(0)}%`;
        document.getElementById("opponent-percentage").textContent = `${opponentPercentage.toFixed(0)}%`;

        // Add filled class for animation
        document.getElementById("user-circle").classList.add("filled");
        document.getElementById("opponent-circle").classList.add("filled");

        // Determine result message
        let resultMessage;
        if (playerScore > opponentScore) {
            resultMessage = "You Win!";
        } else if (playerScore < opponentScore) {
            resultMessage = "You Lose!";
        } else {
            resultMessage = "It's a Draw!";
        }

        document.getElementById("result-message").textContent = resultMessage;

        // Show the result section
        document.querySelector('.result-section').style.display = 'flex';

        
    }
    // Peer connection setup for receiving opponent's score updates
peer.on('connection', conn => {
    conn.on('data', data => {
        const message = JSON.parse(data);
        if (message.type === "score-update") {
            opponentScore = message.score; // Update opponent's score
            currentIndex = message.currentIndex; // Update to the opponent's current question index
            console.log(`Opponent's score updated to: ${opponentScore}`);
            // Optionally, you could call displayQuestion() here if you want to move the opponent to the next question
            proceedToNextQuestion(); // Proceed to the next question for the player
        }
    });
});
    displayQuestion();
}


// Load questions and start the game
loadQuestions(level, category).then(loadedQuestions => {
    questions = loadedQuestions;
    const conn = peer.connect(opponentId);
    startQuiz(questions);

}).catch(error => {
    console.error('Error loading questions:', error);
});

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
            console.log(rec_games)
            gameCode = gameInfo.game_code || "N/A";
            matchingGame = rec_games.find(game => game.gameCode === gameCode);
            if (matchingGame) {
                opponentId = matchingGame.peerId;
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
            document.getElementById("opponent-user").textContent = `Opponent: ${message.username}`;
            const opponentPic = document.getElementsByClassName("opponent-picture")[0];
            opponentPic.src = message.picpath;
            const userPicElement = document.querySelector('.profile-container:nth-child(2) .profile-picture');
            const picpath = userPicElement.src;
            conn.send(JSON.stringify({ type: "reply-with-user-info", username: gameInfo.username || "N/A", picpath: picpath }));
        }
    });
});

peer.on('error', err => {
    console.error(err);
});