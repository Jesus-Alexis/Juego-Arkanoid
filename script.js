const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d"); /* Dibujar el codigo en 2d */

const $sprite = document.querySelector("#sprite");
const $bricks = document.querySelector("#bricks");

canvas.width = 448;
canvas.height = 400;

// Variables del juego
let counter = 0;

// Variables de la pelota
const ballRadius = 3;
// Poscición de la pelota
let x = canvas.width / 2;
let y = canvas.height - 30;
// Velocidad de la pelota
let dx = 1;
/* Dirección en el eje x si es 2 más ira mas rapido */
let dy = -1;
/* Dirección en el eje y si es -2 ira hacia arriba la pelota */

// Variables de la paleta
const paddleHeigt = 10;
const paddleWidth = 50;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeigt - 10;

let rigthPressed = false;
let leftPressed = false;

// Varables de los ladrillos
const brickRowCount = 6;
const brickColumnCount = 13;
const brickWidth = 30;
const brickHeight = 14;
const brckpadding = 2;
const brickOffseTop = 80;
const brickOffsetLeft = 16;
const bricks = [];

const Bricks_Status = {
  ACTIVE: 1,
  DESTROYED: 0,
};

for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    // Calcular la posción del ladrillo en la pantalla
    const brickX = c * (brickWidth + brckpadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brckpadding) + brickOffseTop;
    // Asignar un color aleatorio a cada ladrillo
    const random = Math.floor(Math.random() * 8);
    // Guardar la información  de cada ladrillo
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      status: Bricks_Status.ACTIVE,
      color: random,
    };
  }
}

const padleSensibility = 8;

// Funcion dibujar pelota
function drawBall() {
  ctx.beginPath(); /* Iniciar el trazado */
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath(); /* Terminar el trazado */
}

// Función para dibujar la paleta
function drawPaddle() {
  ctx.drawImage(
    $sprite /* La imagen */,
    29 /* ClipX: donde empieza a recortar la imagen */,
    174 /* ClipY: donde empieza a recortar la imagen */,
    paddleWidth /* el tamaño del recorte */,
    paddleHeigt /* la altura del recorte */,
    paddleX /* Posiccion en X donde estara el dibujo */,
    paddleY /* Posicion en Y donde estara el dibujo */,
    paddleWidth /* Ancho del dibujo */,
    paddleHeigt /* Alto del dibujo */
  );
}

// Función para dibujar y pintar los ladrillos
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === Bricks_Status.DESTROYED) continue;

      const clipX = currentBrick.color * 32;

      ctx.drawImage(
        $bricks,
        clipX,
        0,
        brickWidth, // 31
        brickHeight, // 14
        currentBrick.x,
        currentBrick.y,
        brickWidth,
        brickHeight
      );
    }
  }
}

// Función para romper los ladrillos
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === Bricks_Status.DESTROYED) continue;

      const isBallSameXAsBrick =
        x > currentBrick.x && x < currentBrick.x + brickWidth;

      const isBallSameYAsBrick =
        y > currentBrick.y && y < currentBrick.y + brickHeight;

      if (isBallSameXAsBrick && isBallSameYAsBrick) {
        dy = -dy;
        currentBrick.status = Bricks_Status.DESTROYED;
      }
    }
  }
}

// Función para que la pelota se mueva
function ballMovent() {
  // Rebotar las pelotas en los laterales
  if (
    x + dx > canvas.width - ballRadius /* La pared derecha */ ||
    x + dx < ballRadius /* La pared izquierda */
  ) {
    dx = -dx;
  }

  // rebotar en la parte de arriba
  if (y + dy < ballRadius) {
    dy = -dy;
  }

  // la pelota toca la pala
  const isBallSameXAspddle = x > paddleX && x < paddleX + paddleWidth;

  const isBallTouchingPaddle = y + dy > paddleY;

  if (isBallSameXAspddle && isBallTouchingPaddle) {
    dy = -dy;
    /* Cambiar la dirección de la pelota */
  }

  // Fin del jeugo
  if (y + dy > canvas.height - ballRadius) {
    /*     console.log("Game Over"); */
    document.location.reload();
  }

  //Mover la pelota
  x += dx;
  y += dy;
}

// Función para hacer qwe se mueva la paleta
function paddleMovement() {
  if (rigthPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += padleSensibility;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= padleSensibility;
  }
}

// funció para limpiar el canvas y que no se hagan muchos dibujos
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Fucnión para detectar si se toco una tecla
function initEvents() {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  function keyDownHandler(event) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight") {
      rigthPressed = true;
    } else if (key === "Left" || key === "ArrowLeft") {
      leftPressed = true;
    }
  }
  function keyUpHandler(event) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight") {
      rigthPressed = false;
    } else if (key === "Left" || key === "ArrowLeft") {
      leftPressed = false;
    }
  }
}

function draw() {
  clearCanvas();
  // aqui se haran las dibujos y checks de colisiones
  drawBall();
  drawPaddle();
  drawBricks();

  // Coplisiones y movimientos
  collisionDetection();
  ballMovent();
  paddleMovement();

  // Aqui esta la animación haciendo recusion de cada frame
  window.requestAnimationFrame(draw);
  /* El metodo requestAnimatioFrame sirve para hacer 
  animanciones aqui se estara ejecutando el refresco de 
  la pantalla 60 veces cada */
}

// aqui estoy llamando a la función
draw();
initEvents();
