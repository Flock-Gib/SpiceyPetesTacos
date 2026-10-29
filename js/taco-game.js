/* Spicy Pete's Tacos - Taco Patrol arcade game. */
(function () {
  "use strict";

  const canvas = document.querySelector("#taco-game-canvas");
  const context = canvas && canvas.getContext("2d");
  const scoreNode = document.querySelector("#game-score");
  const livesNode = document.querySelector("#game-lives");
  const statusNode = document.querySelector("#game-status");
  const startButton = document.querySelector("#game-start");
  const pauseButton = document.querySelector("#game-pause");
  if (!canvas || !context || !scoreNode || !livesNode || !statusNode || !startButton || !pauseButton) return;

  const width = canvas.width;
  const height = canvas.height;
  const keys = new Set();
  const stars = Array.from({ length: 48 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.5,
  }));
  let state = "ready";
  let score = 0;
  let lives = 3;
  let level = 1;
  let player = { x: width / 2, y: height - 52, speed: 330 };
  let enemies = [];
  let playerShots = [];
  let enemyShots = [];
  let enemyDirection = 1;
  let enemyFireTimer = 0.8;
  let shotCooldown = 0;
  let invulnerableTime = 0;
  let previousTime = 0;

  function makeWave() {
    enemies = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        enemies.push({ x: 90 + col * 104, y: 58 + row * 46, width: 36, height: 34 });
      }
    }
    enemyDirection = 1;
    enemyShots = [];
  }

  function updateScoreboard() {
    scoreNode.textContent = String(score);
    livesNode.textContent = String(lives);
  }

  function updateStatus(message) {
    statusNode.textContent = message;
  }

  function draw() {
    const background = context.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#29140e");
    background.addColorStop(1, "#100805");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(255, 241, 214, 0.75)";
    stars.forEach((star) => {
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.strokeStyle = "rgba(255, 194, 26, 0.35)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, height - 23);
    context.lineTo(width, height - 23);
    context.stroke();

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "30px system-ui, sans-serif";
    enemies.forEach((enemy) => context.fillText("🌶️", enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));

    playerShots.forEach((shot) => {
      context.fillStyle = "#ffc21a";
      context.shadowColor = "#ff8a00";
      context.shadowBlur = 12;
      context.fillRect(shot.x - 3, shot.y - 10, 6, 18);
      context.shadowBlur = 0;
    });
    enemyShots.forEach((shot) => {
      context.fillStyle = "#ff6545";
      context.beginPath();
      context.arc(shot.x, shot.y, 6, 0, Math.PI * 2);
      context.fill();
    });

    if (player && (invulnerableTime <= 0 || Math.floor(invulnerableTime * 10) % 2 === 0)) {
      context.font = "42px system-ui, sans-serif";
      context.fillText("🌮", player.x, player.y);
    }

    if (state === "paused" || state === "ready" || state === "over") {
      context.fillStyle = "rgba(16, 8, 5, 0.7)";
      context.fillRect(0, height / 2 - 38, width, 76);
      context.fillStyle = "#fff1d6";
      context.font = "700 24px system-ui, sans-serif";
      context.fillText(
        state === "paused" ? "Game paused" : state === "over" ? "Taco patrol complete!" : "Ready for taco patrol?",
        width / 2,
        height / 2
      );
    }
  }

  function startGame() {
    if (state === "playing") return;
    if (state === "paused") {
      state = "playing";
      previousTime = 0;
      updateStatus("Back on patrol! Keep those tacos safe.");
      startButton.textContent = "Game in progress";
      pauseButton.textContent = "Pause";
      requestAnimationFrame(tick);
      return;
    }

    state = "playing";
    score = 0;
    lives = 3;
    level = 1;
    player = { x: width / 2, y: height - 52, speed: 330 };
    playerShots = [];
    shotCooldown = 0;
    invulnerableTime = 0;
    enemyFireTimer = 0.8;
    makeWave();
    updateScoreboard();
    updateStatus("Go, taco pilot! Pepper pods incoming.");
    startButton.textContent = "Game in progress";
    startButton.disabled = true;
    pauseButton.disabled = false;
    pauseButton.textContent = "Pause";
    previousTime = 0;
    draw();
    requestAnimationFrame(tick);
  }

  function pauseGame() {
    if (state === "playing") {
      state = "paused";
      keys.clear();
      updateStatus("Game paused. Press Resume when you're ready.");
      pauseButton.textContent = "Resume";
      draw();
    } else if (state === "paused") {
      startGame();
    }
  }

  function finishGame() {
    state = "over";
    keys.clear();
    startButton.disabled = false;
    startButton.textContent = "Play Again";
    pauseButton.disabled = true;
    pauseButton.textContent = "Pause";
    updateStatus(`Taco patrol complete! Final score: ${score}. Ready for another round?`);
    draw();
  }

  function loseLife() {
    if (state !== "playing" || invulnerableTime > 0) return;
    lives--;
    updateScoreboard();
    if (lives <= 0) {
      finishGame();
      return;
    }
    invulnerableTime = 1.4;
    player.x = width / 2;
    updateStatus(`A pepper pod got through! ${lives} ${lives === 1 ? "life" : "lives"} left.`);
  }

  function overlapsCircleRect(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy < circle.radius * circle.radius;
  }

  function update(delta) {
    if (keys.has("ArrowLeft") || keys.has("a")) player.x -= player.speed * delta;
    if (keys.has("ArrowRight") || keys.has("d")) player.x += player.speed * delta;
    player.x = Math.max(28, Math.min(width - 28, player.x));
    shotCooldown = Math.max(0, shotCooldown - delta);
    invulnerableTime = Math.max(0, invulnerableTime - delta);

    if ((keys.has("Space") || keys.has(" ")) && shotCooldown === 0) {
      playerShots.push({ x: player.x, y: player.y - 20, speed: 440 });
      shotCooldown = 0.24;
    }

    const enemySpeed = 46 + level * 8;
    enemies.forEach((enemy) => { enemy.x += enemyDirection * enemySpeed * delta; });
    const leftEdge = Math.min(...enemies.map((enemy) => enemy.x));
    const rightEdge = Math.max(...enemies.map((enemy) => enemy.x + enemy.width));
    if ((enemyDirection > 0 && rightEdge >= width - 18) || (enemyDirection < 0 && leftEdge <= 18)) {
      enemyDirection *= -1;
      enemies.forEach((enemy) => { enemy.y += 14; });
    }

    playerShots.forEach((shot) => { shot.y -= shot.speed * delta; });
    playerShots = playerShots.filter((shot) => shot.y > -20);
    for (let shotIndex = playerShots.length - 1; shotIndex >= 0; shotIndex--) {
      const shot = playerShots[shotIndex];
      const hitIndex = enemies.findIndex((enemy) =>
        shot.x >= enemy.x && shot.x <= enemy.x + enemy.width &&
        shot.y >= enemy.y && shot.y <= enemy.y + enemy.height
      );
      if (hitIndex !== -1) {
        enemies.splice(hitIndex, 1);
        playerShots.splice(shotIndex, 1);
        score += 10;
        updateScoreboard();
      }
    }

    enemyFireTimer -= delta;
    if (enemyFireTimer <= 0 && enemies.length) {
      const shooter = enemies[Math.floor(Math.random() * enemies.length)];
      enemyShots.push({ x: shooter.x + shooter.width / 2, y: shooter.y + shooter.height, speed: 190 + level * 12, radius: 6 });
      enemyFireTimer = Math.max(0.35, 1.1 - level * 0.06);
    }
    enemyShots.forEach((shot) => { shot.y += shot.speed * delta; });
    for (let shotIndex = enemyShots.length - 1; shotIndex >= 0; shotIndex--) {
      const shot = enemyShots[shotIndex];
      if (player && overlapsCircleRect(shot, { x: player.x - 22, y: player.y - 19, width: 44, height: 38 })) {
        enemyShots.splice(shotIndex, 1);
        loseLife();
      }
    }
    enemyShots = enemyShots.filter((shot) => shot.y < height + 10);

    if (enemies.some((enemy) => enemy.y + enemy.height >= player.y - 24)) {
      loseLife();
      if (state === "playing") makeWave();
    }
    if (enemies.length === 0) {
      level++;
      score += 50;
      updateScoreboard();
      makeWave();
      updateStatus(`Wave cleared! Wave ${level} is on its way.`);
    }
  }

  function tick(time) {
    if (state !== "playing") return;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    update(delta);
    draw();
    if (state === "playing") requestAnimationFrame(tick);
  }

  function setKey(key, pressed) {
    if (pressed) keys.add(key);
    else keys.delete(key);
  }

  document.addEventListener("keydown", (event) => {
    if (event.target.closest && event.target.closest("input, textarea, select")) return;
    const key = event.key === " " ? "Space" : event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (["ArrowLeft", "ArrowRight", "a", "d", "Space", "Escape"].includes(key) && state !== "ready") {
      event.preventDefault();
    }
    if (key === "Escape" && (state === "playing" || state === "paused")) {
      pauseGame();
      return;
    }
    if (state === "playing" && ["ArrowLeft", "ArrowRight", "a", "d", "Space"].includes(key)) setKey(key, true);
  });
  document.addEventListener("keyup", (event) => {
    const key = event.key === " " ? "Space" : event.key.length === 1 ? event.key.toLowerCase() : event.key;
    setKey(key, false);
  });
  window.addEventListener("blur", () => keys.clear());

  document.querySelectorAll("[data-game-key]").forEach((button) => {
    const key = button.dataset.gameKey;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (state === "playing") setKey(key, true);
    });
    ["pointerup", "pointercancel", "lostpointercapture", "pointerleave"].forEach((type) => {
      button.addEventListener(type, () => setKey(key, false));
    });
  });

  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", pauseGame);
  makeWave();
  draw();
})();
