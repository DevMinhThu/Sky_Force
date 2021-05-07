// setup
const canvasEl = document.getElementById("canvas");
const context = canvasEl.getContext("2d");

canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;

const game = {
  gameOver: false,
};

//=== Get element ===
let startScreen = document.querySelector(".start-screen");
let startButton = document.querySelector(".start-button");
let overScreen = document.querySelector(".over-screen");
let againButton = document.querySelector(".again-button");
let pointScreen = document.querySelector(".point-screen");
let totalPoint = document.querySelector(".total-point");

//=== CREATE PLAYER_PLANE ===
let player_plane = new Sprite(
  innerWidth / 2 - 80 / 2,
  innerHeight / 2 - 80 / 2 + 250,
  80,
  80
);

// add img plane
const img_plane = new Image();
img_plane.src = "./images/plane.png";

// set direction
let direction = { x: 0, y: 0 };

// draw player_plane
player_plane.painter = {
  paint: (context, x, y, w, h) => {
    // handle touch Ox
    if (player_plane.x <= 0) {
      player_plane.x = 0;
    } else if (player_plane.x >= innerWidth - 80) {
      player_plane.x = innerWidth - 80;
    }

    // handle touch Oy
    if (player_plane.y <= 0) {
      player_plane.y = 0;
    } else if (player_plane.y >= innerHeight - 80) {
      player_plane.y = innerHeight - 80;
    }
    context.drawImage(img_plane, x, y, w, h);
  },
};

// move 0x
player_plane.behaviors.push({
  //horizontal moving
  direction: 1,
  speed: 10,
  enable: false,
  exec: function (sprite) {
    sprite.x += this.direction * this.speed;
  },
});

// move Oy
player_plane.behaviors.push({
  //vertical moving
  direction: 1,
  speed: 10,
  enable: false,
  exec: function (sprite) {
    sprite.y += this.direction * this.speed;
  },
});

//=== CREATE ENEMY ===
var enemyArray = [];
var enemyIndex = 0;
var enemy_width = 80;
var enemy_height = 80;
var enemy_timer = 1000; // hen gio sau 1s thi enemy lai xuat hien
var lastTime = 0;
var score = 0;

// add img enemy
const img_enemy = new Image();
img_enemy.src = "./images/alien1.png";

// create enemy object
function enemy(x, y, dx, dy, img_enemy, enemy_width, enemy_height, rotation) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.img = img_enemy;
  this.width = enemy_width;
  this.height = enemy_height;
  this.rotation = rotation;
  enemyIndex++;
  enemyArray[enemyIndex] = this; // luu cac gia tri doi tuong this(enemy) vao trong mang enemyArray
  this.id = enemyIndex;

  // lam cho ke thu xuat hien tu trai->phai va phai->trai
  if (this.rotation < 0.1) {
    this.dx = -this.dx;
  } else if (this.rotation > 0.5) {
    this.dx = -this.dx;
  } else {
    this.dx = 0;
    this.dx = this.dy;
  }

  // function update enemy
  this.update = function () {
    this.y += this.dy;
    this.x += this.dx;

    // TH: handle kha nang khi enemy cham canh trai va phai
    if (this.x + this.width >= innerWidth) {
      this.dx = -this.dx; // -this.dx: de enemy khi cham canh phai, enemy van di chuyen duoc trong chieu am cua Ox
    } else if (this.x <= 0) {
      this.dx = Math.abs(this.dx);
    }

    // TH: enemy vuot qua truc Oy ==> delete enemy
    if (this.y > innerHeight + this.height) {
      this.delete();
      gameOver = true;
    }

    this.draw();
  };

  // handle delete enemy
  this.delete = function () {
    delete enemyArray[this.id];
  };

  // function draw enemy
  this.draw = function () {
    context.drawImage(this.img, this.x, this.y, this.width, this.height);
  };
}

// create enemy
function createEnemy() {
  var x = Math.random() * (innerWidth - enemy_width);
  var y = -enemy_height;
  var dx = 3;
  var dy = 3;
  var rotation = Math.random();

  new enemy(x, y, dx, dy, img_enemy, enemy_width, enemy_height, rotation);
}

//=== SETUP BULLETS ===
const img_bullet = new Image();
img_bullet.src = "./images/fire_space.png";

var bulletArray = [];
var bulletIndex = 0;
var bullet_width = 25;
var bullet_height = 25;
var bullet_timer = 200; // 200 milliseconds
var speed = 6;
var bullet_lastTime = 0;

// create bullets object
function bullet(x, y, width, height, speed) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.speed = speed;

  bulletIndex++;
  bulletArray[bulletIndex] = this;
  this.id = bulletIndex;

  this.update = function () {
    this.y += -this.speed;
    if (this.y < -this.height) {
      delete this.delete();
    }
    this.draw();
  };

  this.delete = function () {
    delete bulletArray[this.id];
  };

  this.draw = function () {
    context.beginPath();
    context.drawImage(img_bullet, this.x, this.y, this.width, this.height);
  };
}

// fire bullets
function fire() {
  // setup start position bullet
  var x = player_plane.x + player_plane.width / 2 - bullet_width / 2;
  var y = player_plane.y;

  new bullet(x, y, bullet_width, bullet_height, speed);
}

// handle collides - xu ly va cham
function collides(a, b, flag) {
  //console.log(`${a.x}-${a.height}-${a.width}-${a.y}:${b.x}-${b.height}-${b.width}-${b.y}`);
  if (
    ((a.x + a.width >= b.x && b.x + b.width >= a.x) ||
      (b.x + b.width >= a.x && a.x + a.width >= b.x)) &&
    ((b.y + b.height >= a.y && a.y + a.height >= b.y) ||
      (a.y + a.height >= b.y && b.y + b.height >= a.y))
  ) {
    console.log("flag");
    if (flag) {
      gameOver = true;
    }
    return true;
  }

  return false;
}

// xu ly va cham  va check GameOver
let gameOver = false;

function handleCollisions() {
  bulletArray.forEach(function (bullet) {
    enemyArray.forEach(function (enemy) {
      if (collides(bullet, enemy, false)) {
        //console.log('Enemy die');
        bullet.delete();
        enemy.delete();
        score += 2;
      }
    });
  });

  // va cham player and enemy
  enemyArray.forEach(function (enemy) {
    collides(player_plane, enemy, true);
  });

  //console.log(gameOver);
}

//=== ACTION OF GAME ===

//Click
startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
});

// clear screen
function clear() {
  context.clearRect(0, 0, canvasEl.width, canvasEl.height);
}

// draw player
function draw() {
  player_plane.paint(context);
}

// function update
function update() {
  player_plane.exec();
}

// game loop
function game_loop(currentTime) {
  clear();
  draw();
  update();

  // score
  context.font = "24px serif";
  context.fillStyle = "#fff";
  context.fillText("SCORE: " + score, 30, 30);

  // draw enemy
  if (currentTime >= lastTime + enemy_timer) {
    lastTime = currentTime;
    createEnemy();
  }

  // update enemy positions
  enemyArray.forEach(function (enemy) {
    enemy.update();
  });

  // fire bullets
  if (currentTime >= bullet_lastTime + bullet_timer) {
    bullet_lastTime = currentTime;
    fire();
  }

  // update bullets position
  bulletArray.forEach(function (bullet) {
    bullet.update();
  });

  // detect collision
  handleCollisions();
  // collisionsPlayerAndEnemy();
  if (gameOver) {
    context.fillText("Game Over", innerWidth / 2, innerHeight / 2);
  }

  if (!gameOver) requestAnimationFrame(game_loop);
}

// load game on browser
img_plane.onload = () => {
  game_loop();
};

// event when click
document.onkeydown = (e) => {
  // console.log(e.code);
  if (e.code == "KeyD") {
    player_plane.behaviors[0].enable = true;
    player_plane.behaviors[0].direction = 1;
  }

  if (e.code == "KeyA") {
    player_plane.behaviors[0].enable = true;
    player_plane.behaviors[0].direction = -1;
  }

  if (e.code == "KeyW") {
    player_plane.behaviors[1].enable = true;
    player_plane.behaviors[1].direction = -1;
  }

  if (e.code == "KeyS") {
    player_plane.behaviors[1].enable = true;
    player_plane.behaviors[1].direction = 1;
  }
};

// event after click
document.onkeyup = (e) => {
  if (e.code == "KeyD" || e.code == "KeyA") {
    player_plane.behaviors[0].enable = false;
  }

  if (e.code == "KeyW" || e.code == "KeyS") {
    player_plane.behaviors[1].enable = false;
  }
};

// check check