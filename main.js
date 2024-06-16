window.addEventListener('DOMContentLoaded', async () => {

  const LINE_FILL = '#9EC8B9';
  const POINT_FILL = '#1B4242';
  const POINT_OUTLINE = '#5C8374';

  const CURVE_THICKNESS = 3;
  const CTRL_LINE_THICKNESS = 2;
  const POINT_RADIUS = 5;
  const CTRL_RADIUS = 6;

  const POINT_HITBOX = POINT_RADIUS*2;
  const CTRL_HITBOX = CTRL_RADIUS*2;

  class point {
    constructor(x, y, controls, isEnd = false) {
      this.x = x;
      this.y = y;
      this.controls = controls;
      this.isEnd = isEnd;
    }

    draw(ctx, drawControls = true) {
      if (drawControls) {
        drawLine(ctx, this.x, this.y, this.controls[0], this.controls[1]);
        drawCircle(ctx, this.controls[0], this.controls[1], CTRL_RADIUS);
        if (!this.isEnd) {
          drawLine(ctx, this.x, this.y, this.controls[2], this.controls[3]);
          drawCircle(ctx, this.controls[2], this.controls[3], CTRL_RADIUS);
        }
      }
      drawCircle(ctx, this.x, this.y, POINT_RADIUS);
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

    shiftControl(i, x, y) {
        this.controls[i    ] += x;
        this.controls[i + 1] += y;
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
    new point(200, 0, [150, 0, 250, 0]),
    new point(300, 100, [250, 100])
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
        
        ctx.strokeStyle = LINE_FILL;
        ctx.lineWidth = CURVE_THICKNESS;
        ctx.stroke();

        previousPoint.draw(ctx);
      }
      previousPoint = point;
    }
    previousPoint.draw(ctx);
  }

  function onResize() {
    let ratio = (() => {
      let dpr = window.devicePixelRatio || 1,
          bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;
      return dpr / bsr;
    })();

    canvas.width = canvas.parentElement.offsetWidth * ratio;
    canvas.height = canvas.parentElement.offsetHeight * ratio;
    canvas.style.width = canvas.parentElement.offsetWidth + 'px';
    canvas.style.height = canvas.parentElement.offsetHeight + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawCurve();
  }

  function drawCircle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = POINT_OUTLINE;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = POINT_FILL;
    ctx.fill();
  }

  function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = POINT_OUTLINE;
    ctx.lineWidth = CTRL_LINE_THICKNESS;
    ctx.stroke();
  }

  function getSelectedPoint(x, y) {
    for (const point of curve) {
      if (Math.abs(x - point.x) < POINT_HITBOX && Math.abs(y - point.y) < POINT_HITBOX)
        return point
      for (let i = 0; i < point.controls.length; i+=2)
        if (Math.abs(x - point.controls[i]) < CTRL_HITBOX && Math.abs(y - point.controls[i+1]) < CTRL_HITBOX)
          return [point, i];
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    canvas.style.cursor = 'grabbing';

    if (!selectedPoint.length) {
      selectedPoint.shift(e.clientX - mPrevX,
                          e.clientY - mPrevY
      );
    }
    else {
      selectedPoint[0].shiftControl(selectedPoint[1],
                                    e.clientX - mPrevX,
                                    e.clientY - mPrevY
      );
    }

    mPrevX = e.clientX;
    mPrevY = e.clientY;
    drawCurve();
  });

  canvas.addEventListener('mousedown', (e) => {
    const selected = getSelectedPoint(e.clientX, e.clientY);
    if (selected) {
      mPrevX = e.clientX;
      mPrevY = e.clientY;
      selectedPoint = selected;
      isDragging = true;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
  });
});
