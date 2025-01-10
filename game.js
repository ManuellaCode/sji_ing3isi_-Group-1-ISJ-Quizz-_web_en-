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
function startQuiz(questions) {
    let currentIndex = 0; // Start with the first question
    const totalQuestions = questions.length;
    const timerElement = document.querySelector('.timer');
    const questionCounterElement = document.querySelector('.question-total');
    let tickingSound;
    let warningSound;

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
                    currentIndex++; // Move to the next question on timeout
                    displayQuestion();
                }
                timeLeft--;
            }, 1000);

            optionElements.forEach((optionElement, index) => {
                optionElement.addEventListener('click', () => {
                    clearInterval(countdownInterval); // Stop timer when an option is clicked
                    tickingSound.pause(); // Stop ticking sound on answer selection

                    if (question.correct_answer === question.proposed_answers[index]) {
                        optionElement.style.border = '2px solid green';
                        currentIndex++;
                        setTimeout(displayQuestion, 1000); // Wait before displaying the next question
                    } else {
                        optionElement.style.border = '2px solid red';
                        optionElements.forEach((el, i) => {
                            if (question.correct_answer === question.proposed_answers[i]) {
                                el.style.border = '2px solid green';
                            }
                        });
                        currentIndex++;
                        setTimeout(displayQuestion, 2000); // Wait before displaying the next question
                    }
                });
            });
        } else {
            console.log('All questions have been displayed.');
            document.querySelector('.quizz-section').style.display = 'none';
            alert('Quiz completed!');
        }
    }

    displayQuestion();
}

// Load questions and start the game
loadQuestions(level, category).then(loadedQuestions => {
    questions = loadedQuestions;
    const conn = peer.connect(opponentId);

    conn.on('open', () => {
        console.log(`Connected to opponent: ${opponentId}`);
        startQuiz(questions);
    });
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
            gameCode = gameInfo.game_code || "N/A";
            matchingGame = rec_games.find(game => game.gameCode === gameCode);
            if (matchingGame) {
                opponentId = matchingGame.peerId;
                const userPicElement = document.querySelector('.profile-container:nth-child(2) .profile-picture');
                const picpath = userPicElement.src;
                const conn = peer.connect(opponentId);
                conn.on('open', () => {
                    conn.send(JSON.stringify({ type: "send-user-info", username: username, picpath: picpath }));
                });
                conn.on('data', data => {
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