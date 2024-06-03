window.addEventListener('DOMContentLoaded', async () => {

  class point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#5C8374';
      ctx.stroke();
      ctx.fillStyle = '#1B4242';
      ctx.fill();
    }

    equals(other) {
      if (!(other instanceof point)) 
        return false;
      return this.x === other.x && this.y === other.y;
    }
  }

  class curve {
    constructor(start, startControl, end, endControl) {
      this.start = start;
      this.startControl = startControl;
      this.end = end;
      this.endControl = endControl;
    }

    drawLine(ctx) {
      ctx.beginPath();
      ctx.moveTo(this.start.x, this.start.y);
      ctx.bezierCurveTo(
        this.startControl.x, this.startControl.y,
        this.endControl.x, this.endControl.y,
        this.end.x, this.end.y
      );
      ctx.strokeStyle = '#9EC8B9';
      ctx.stroke();
    }

    drawPoints(ctx) {

    }
  }

  let curves = [
    new curve(
      new point(0,0),
      new point(50,0),
      new point(100,100),
      new point(50,100)
    ),
    new curve(
      new point(100,100),
      new point(150,100),
      new point(200,0),
      new point(150,0)
    )
  ];

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  window.addEventListener('resize', onResize);

  onResize();
  draw();

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const curve of curves)
      curve.drawLine(ctx);
  }

  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window .innerHeight;
    draw();
  }
});
