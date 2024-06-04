window.addEventListener('DOMContentLoaded', async () => {

  class point {
    constructor(x, y, controls, isEnd = false) {
      this.x = x;
      this.y = y;
      this.controls = controls;
      this.isEnd = isEnd;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#5C8374';
      ctx.stroke();
      ctx.fillStyle = '#1B4242';
      ctx.fill();
    }

    shift(x, y) {
      this.x += x;
      this.y += y;
      this.controls[0] += x;
      this.controls[1] += y;

      if (this.isEnd) return;
      this.controls[2] += x;
      this.controls[3] += y;
    }

    equals(other) {
      if (!(other instanceof point)) 
        return false;
      return this.x === other.x && this.y === other.y;
    }
  }

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  window.addEventListener('resize', onResize);
  let previousPoint = null,
      selectedPoint = null,
      mPrevX = 0,
      mPrevY = 0,
      isDragging = false;

  let curve = [
    new point(0, 0, [50, 0], true),
    new point(100, 100, [50, 100, 150, 100]),
    new point(200, 0, [150, 0])
  ];

  onResize();


  function drawCurve() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const point of curve) {
      if (previousPoint) {
        ctx.beginPath();
        ctx.moveTo(previousPoint.x, previousPoint.y);

        let controlSide = previousPoint.isEnd ? 0 : 2;
        ctx.bezierCurveTo(previousPoint.controls[controlSide    ], 
                          previousPoint.controls[controlSide + 1], 
                          point.controls[0], 
                          point.controls[1],
                          point.x, point.y);
        
        ctx.strokeStyle = '#9EC8B9';
        ctx.stroke();

        previousPoint.draw(ctx);
      }
      previousPoint = point;
    }
    previousPoint.draw(ctx);
  }

  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window .innerHeight;
    drawCurve();
  }

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    canvas.style.cursor = 'grabbing';

    selectedPoint.shift(e.clientX - mPrevX,
                        e.clientY - mPrevY
    );

    mPrevX = e.clientX;
    mPrevY = e.clientY;

    drawCurve();
  });

  canvas.addEventListener('mousedown', (e) => {
    for (const point of curve) {
      if (Math.abs(e.clientX - point.x) < 10 && Math.abs(e.clientY - point.y) < 10) {
        mPrevX = e.clientX;
        mPrevY = e.clientY;
        selectedPoint = point;
        isDragging = true;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
  });
});
