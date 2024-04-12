import { canvasType } from "@/types/login";
import { randomNumber } from "@/utils/random";
const init = () => {
  const canvas = document.getElementById("canvas") as canvasType;

  const ctx = canvas.getContext("2d")!;
  const arr: Dot[] = [];
  setCanvasShape(canvas);
  class Dot {
    y: number;
    x: number;
    dirX: number;
    dirY: number;
    color: string;
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.dirX = Math.random() * 3 - 1;
      this.dirY = Math.random() * 3 - 1;
      this.color = `hsl(${Math.random() * 360},50%,50%)`;
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    updated() {
      if (this.y > canvas.height || this.y <= 0) {
        this.dirY = -this.dirY;
      }
      if (this.x > canvas.width || this.x <= 0) {
        this.dirX = -this.dirX;
      }
      this.x += this.dirX;
      this.y += this.dirY;
      this.color = this.color;
      this.draw();
    }
  }

  const ball = function () {
    for (let i = 0; i < 100; i++) {
      const dots = new Dot(
        randomNumber(0, canvas.width),
        randomNumber(0, canvas.height)
      );
      arr.push(dots);
    }
  };
  // let dots = new Dot(200, 200);
  // dots.draw();
  ball();
  const animation = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(animation);
    arr.forEach((value, key) => {
      arr.forEach((item, index) => {
        if (key === index) return;
        if (
          Math.abs(value.x - item.x) < 120 &&
          Math.abs(value.y - item.y) < 120
        ) {
          setLine(value.x, value.y, item.x, item.y, value.color);
        }
      });
      value.updated();
    });
  };

  const setLine = function (
    beginX: number,
    beginY: number,
    closeX: number,
    closeY: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(beginX, beginY);
    ctx.lineTo(closeX, closeY);
    ctx.stroke();
    ctx.closePath();
  };

  animation();
};

const setCanvasShape = (canvas: canvasType) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.background = "#FFFFFF ";
};
export default init;
