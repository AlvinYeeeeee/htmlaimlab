const arena = document.querySelector('.arena');
const mapArena = document.querySelector('.map--arena');

let isCameraActive = false;
let isShooting = false;
let isEnemy = false;
let viewEnded = false;

let body = document.body;

// The enemies list tells the program which enemy is now on the screen, so it can check whether the camera is facing it.
let enemies = [false, false, false, false, true, false, false, false, false];

let gameStarted = true;

let cameraRotateX = 0;
let cameraRotateY = 0;

let time = 0;
let score = 0;
let shots = 0;
let accuracy = 0;

let newScore = 0;
let newShots = 0;
let newAccuracy = 0;

const audio = {
    gunshot: new Audio(`/static/assets/audio/gunshot.mp3`),
    groan1: new Audio(`/static/assets/audio/cs50.mp3`)

}


// Rotate the arena through changing the variables in the html file.
const rotateArena = (dir, x, y) => {
    if (dir == 'r' || dir == 'l') {
        arena.style.transform = `rotateX(${x}rad) rotateY(${y}rad)`;
    } else if (dir == 'u' || dir == 'd') {
        arena.style.transform = `rotateX(${x}rad) rotateY(${y}rad)`;
    }
}



const camera = () => {
    if (gameStarted) {
        if (isCameraActive) {
            const sensitivity = 0.005;

            let prevX = 0;
            let prevY = 0;

            window.addEventListener("mousemove", (e) => {
                const currentX = e.clientX;
                const currentY = e.clientY;

                const transform = arena.style.transform;

                cameraRotateX = parseFloat(transform.match(/rotateX\((-?[0-9.]+)rad\)/)[1]);
                cameraRotateY = parseFloat(transform.match(/rotateY\((-?[0-9.]+)rad\)/)[1]);

                let xRound = Math.round(cameraRotateX * 100) / 100;
                let yRound = Math.round(cameraRotateY * 100) / 100;

                // console.log(cameraRotateX, cameraRotateY);

                // mapCoordinates(xRound, yRound);

                // Move the camera based on the movement of the mouse.
                if (currentX > prevX) {
                    cameraRotateY += sensitivity;
                    rotateArena('r', cameraRotateX, cameraRotateY);
                } else if (currentX < prevX) {
                    cameraRotateY -= sensitivity;
                    rotateArena('l', cameraRotateX, cameraRotateY);
                }

                if (currentY > prevY) {
                    if (cameraRotateX >= -0.27426) {
                        cameraRotateX -= sensitivity;
                        rotateArena('d', cameraRotateX, cameraRotateY);
                    }
                } else if (currentY < prevY) {
                    if (cameraRotateX <= 0.132434) {
                        cameraRotateX += sensitivity;
                        rotateArena('u', cameraRotateX, cameraRotateY);
                    }
                }

                prevX = currentX;
                prevY = currentY;
            });
        }
    } else {
        return;
    }
}

// Position the enemies to 9 preset positions.
const positionEnemies = () => {
    if (gameStarted) {
        let xPos;
        let yPos;
        let zPos;

        if (enemies[0]) {
            xPos = 450;
            yPos = 150;
            zPos = -2000;
        } else if (enemies[1]) {
            xPos = 450;
            yPos = 350;
            zPos = -2000;
        } else if (enemies[2]) {
            xPos = 450;
            yPos = 550;
            zPos = -2000;
        } else if (enemies[3]) {
            xPos = 700;
            yPos = 150;
            zPos = -2000;
        } else if (enemies[4]) {
            xPos = 700;
            yPos = 350;
            zPos = -2000;
        } else if (enemies[5]) {
            xPos = 700;
            yPos = 550;
            zPos = -2000;
        } else if (enemies[6]) {
            xPos = 950;
            yPos = 150;
            zPos = -2000;
        } else if (enemies[7]) {
            xPos = 950;
            yPos = 350;
            zPos = -2000;
        } else if (enemies[8]) {
            xPos = 950;
            yPos = 550;
            zPos = -2000;
        }

        const enemyMarkup = `<div style="
        top: ${yPos}px;
        left: ${xPos}px;
        transform: translateZ(${zPos}px);
        " class="enemy-cont"></div>`;

        arena.insertAdjacentHTML('afterbegin', enemyMarkup);
    } else {
        return;
    }
}


// Checking whether the camera faces the specific enemy by looking at the angle the camera is facing.
const checkTarget = (x, y) => {
    if (enemies[0]) {
        if ((x >= 0.075 && x <= 0.11) && (y <= -0.115 && y >= -0.155)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[1]) {
        if ((x >= -0.025 && x <= 0.01) && (y <= -0.115 && y >= -0.155)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[2]) {
        if ((x >= -0.125 && x <= -0.09) && (y <= -0.115 && y >= -0.155)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[3]) {
        if ((x >= 0.075 && x <= 0.11) && (y <= 0.01 && y >= -0.03)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[4]) {
        if ((x >= -0.025 && x <= 0.01) && (y <= 0.01 && y >= -0.03)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[5]) {
        if ((x >= -0.125 && x <= -0.09) && (y <= 0.01 && y >= -0.03)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[6]) {
        if ((x >= 0.075 && x <= 0.11) && (y <= 0.13 && y >= 0.095)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[7]) {
        if ((x >= -0.025 && x <= 0.01) && (y <= 0.13 && y >= 0.095)) {
            return true;
        } else {
            return false;
        }
    } else if (enemies[8]) {
        if ((x >= -0.125 && x <= -0.09) && (y <= 0.13 && y >= 0.095)) {
            return true;
        } else {
            return false;
        }
    }

}

// Shoot. More details below.
const shoot = () => {
    let isOnTarget = checkTarget(cameraRotateX, cameraRotateY);
    killEnemy(isOnTarget);
}


const killEnemy = (isOnTarget) => {
    const targetedEnemy = document.querySelector('.enemy-cont');

    // Based on the previous checkTarget function, if the camera faces the enemy and left click, kill enemy and get a new enemy.
    if (isOnTarget) {
        audio.groan1.play();
        audio.gunshot.pause();
        score++;
        document.getElementById('shotsDisplay').textContent = `${score}`;

        // Randomly get a new enemy.
        let r = Math.floor(Math.random() * enemies.length);
        targetedEnemy.remove();
        enemies = [false, false, false, false, false, false, false, false, false];

        // Not let a new enemy appear immediately after the previous one killed.
        setTimeout(() => {
            enemies[r] = true;
            positionEnemies();
            document.querySelector('.enemy--list').textContent = `${enemies[0]}, ${enemies[1]}, ${enemies[2]}, ${enemies[3]}, ${enemies[4]}`
        }, 250)
    }
}

const controls = () => {
    // console.log("111");
    if (gameStarted) {
        // When mouse clicked, shoot.
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                shoot();
                shots++;
                document.getElementById('accuracyDisplay').textContent = `${Math.round(score / shots * 100)}%`;
                audio.gunshot.play();
                // Play gunshot. Pause the current gunshot if the previous one is still playing and I shoot again and play a new one.
                if (!audio.gunshot.ended || !audio.gunshot.paused) {
                    audio.gunshot.currentTime = 0;
                    audio.gunshot.play();
                }
            }
        });
    } else {
        return;
    }
}

const starting = () => {
    // Run most of the functions.
    body.classList.toggle('after');
    time = 60;
    score = 0;
    shots = 0;
    gameStarted = true;
    isCameraActive = true;
    isShooting = true;
    isEnemy = true;
    controls();
    camera();
    positionEnemies();
    // Sending the variables to html and flask.
    document.getElementById('secondDisplay').textContent = `${time}`;
    document.getElementById('accuracyDisplay').textContent = "N/A";
    document.getElementById('shotsDisplay').textContent = `${score}`;

    const countdown = () => {
        if (time > 0) {
            time--;
            console.log(time);
            document.getElementById('secondDisplay').textContent = `${time}`;
        } else {
            console.log("ended")
            gameStarted = false;
            isCameraActive = false;
            isShooting = false;
            isEnemy = false;
            body.classList.toggle('before');
            console.log(shots, score, Math.round(score / shots * 100))
            accuracy = Math.round(score / shots * 100)
            // window.location.href = `../endpage.html?shots=${shots}&score=${score}&accuracy=${Math.round(score / shots * 100)}%`;
            // window.location.href = url_for('end_page', shots=shots, score=score, accuracy=Math.round(score / shots * 100) + '%');
            fetch('/endpage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ shots, score, accuracy }),
            })
            .then(() => {
                const accuracyValue = Math.round(score / shots * 100);
                // Redirect to endpage.html with actual variable values
                window.location.href = `/endpage?shots=${shots}&score=${score}&accuracy=${accuracyValue}%`;
            })
            /*
            .then(response => {
                if (response.ok) {
                    // Redirect to endpage.html upon successful POST request
                    window.location.href = '/endpage'; // Change the URL as needed
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });*/
            return;
        }

        // Call countdown function again after 1 second
        if (gameStarted) {
            setTimeout(countdown, 1000);
        }
    };

    // Start the countdown initially
    countdown();
};

starting();


/*
const starting = () => {
    console.log("started");
    body.classList.toggle('after');
    let time = 60;
    let score = 0;
    let shots = 0;
    gameStarted = true;
    isCameraActive = true;
    isShooting = true;
    isEnemy = true;
    controls();
    camera();
    positionEnemies();

    const countdown = () => {
        if (time > 0) {
            time--;
            console.log("-1");
            // Perform actions or updates based on time here
        } else {
            console.log("ended")
            gameStarted = false;
            isCameraActive = false;
            isShooting = false;
            isEnemy = false;
            body.classList.toggle('before');
            controls();
            camera();
            positionEnemies();
            return;
        }

        // Call countdown function again after 1 second
        if (gameStarted) {
            setTimeout(countdown, 1000);
        }
    };

    // Start the countdown initially
    countdown();
};

function buttonStart(event)
{
    let button = event.target;

    if (button.innerHTML)
    {
        starting();
        button.style.display = 'none';
        button.disabled = true;

        if (viewEnded) {
            button.style.display = 'block';
            button.disabled = false;
        }
    }
}
*/


