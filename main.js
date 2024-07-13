window.addEventListener('DOMContentLoaded', async () => {
  
  const controlToggle = document.getElementById('controls-check');
  const animatedToggle = document.getElementById('animated-check');
  const circleToggle = document.getElementById('hide-circle-check');
  const animationSlider = document.getElementById('animation-slider');
  const speedSlider = document.getElementById('speed-slider');
  const stepsButton = document.getElementById('steps-preset');
  const ellipseButton = document.getElementById('ellipse-preset');
  const heartButton = document.getElementById('heart-preset');
  const infoButton = document.getElementById('info-button');
  const info = document.getElementById('info');

  const kappa = document.getElementById('kappa');
  const radius = document.getElementById('radius');
  const timeDisplay = document.getElementById('time-display');

  const time = document.getElementsByClassName('time');
  const p0x = document.getElementsByClassName('p0x');
  const p1x = document.getElementsByClassName('p1x');
  const p2x = document.getElementsByClassName('p2x');
  const p3x = document.getElementsByClassName('p3x');
  
  const p0y = document.getElementsByClassName('p0y');
  const p1y = document.getElementsByClassName('p1y');
  const p2y = document.getElementsByClassName('p2y');
  const p3y = document.getElementsByClassName('p3y');

  const bpx = document.getElementsByClassName('bpx')
  const bpy = document.getElementsByClassName('bpy');
  const bppx = document.getElementsByClassName('bppx');
  const bppy = document.getElementsByClassName('bppy');

  const n = document.getElementsByClassName('n');
  const d = document.getElementsByClassName('d');
  const kappaResult = document.getElementsByClassName('kappa-result');

  const LINE_FILL = '#9EC8B9';
  const POINT_FILL = '#1B4242';
  const POINT_OUTLINE = '#5C8374';

  const CURVE_THICKNESS = 3;
  const CTRL_LINE_THICKNESS = 2;
  const POINT_RADIUS = 5;
  const CTRL_RADIUS = 6;

  const POINT_HITBOX = POINT_RADIUS*2;
  const CTRL_HITBOX = CTRL_RADIUS*2;

  info.style.display = 'none';

  class point {
    constructor(x, y, controls, isEnd = false) {
      this.x = x;
      this.y = y;
      this.controls = controls;
      this.isEnd = isEnd;
    }

    draw(ctx) {
      if (!controlToggle.checked) {
        drawLine(ctx, this.x, this.y, this.controls[0], this.controls[1]);
        drawPoint(ctx, this.controls[0], this.controls[1], CTRL_RADIUS);
        if (!this.isEnd) {
          drawLine(ctx, this.x, this.y, this.controls[2], this.controls[3]);
          drawPoint(ctx, this.controls[2], this.controls[3], CTRL_RADIUS);
        }
      }
      drawPoint(ctx, this.x, this.y, POINT_RADIUS);
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
      isDragging = false,
      currentSegment = 0,
      t = 0,
      d1 = 0,
      d2 = 0,
      numerator = 0,
      denominator = 0;
      

  const initX = window.innerWidth/2;
  const initY = window.innerHeight/2;

  let curve = [
    new point(initX-100, initY+100, [initX, initY+100], true),
    new point(initX, initY, [initX-100, initY, initX+100, initY]),
    new point(initX+100, initY-100, [initX, initY-100])
  ];

  onResize();



  function drawCurve() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const point of curve) {
      if (previousPoint) {
        ctx.beginPath();
        ctx.moveTo(previousPoint.x, previousPoint.y);

        const controlSide = previousPoint.isEnd ? 0 : 2;
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
    previousPoint = null;
    if (!circleToggle.checked)
      drawBezierVisualCircle();
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

  function drawPoint(ctx, x, y, radius, strokeColor = POINT_OUTLINE, fillColor = POINT_FILL, strokeWidth = 3, opacity = 1) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
    ctx.fillStyle = fillColor;
    ctx.save();
    ctx.globalAlpha = opacity
    ctx.fill();
    ctx.restore();
  }

  function drawBezierVisualCircle() {
    let pointsOnCircle = getPointsOnCircle(t+.001, t-.001, t);

    let circleData = getRadiusAndCenter(pointsOnCircle[0][0], pointsOnCircle[0][1], pointsOnCircle[1][0], pointsOnCircle[1][1], pointsOnCircle[2][0], pointsOnCircle[2][1]);
    drawPoint(ctx, circleData.center.x, circleData.center.y, circleData.radius, '#b86767', '#808080', 3, .5);
    drawPoint(ctx, pointsOnCircle[2][0], pointsOnCircle[2][1], 2, '#b86767');

    radius.textContent = circleData.radius.toFixed(1);
    timeDisplay.textContent = t.toFixed(2);
  }

  function getPointsOnCircle(t0, t1, t2) {
    const controlSide = curve[currentSegment].isEnd ? 0 : 2;
    const points = [];

    for (let i = 0; i < 3; i++) {
      points.push(cubicBezier(
        [curve[currentSegment].x, curve[currentSegment].y],
        [curve[currentSegment].controls[controlSide], curve[currentSegment].controls[controlSide + 1]],
        [curve[currentSegment + 1].controls[0], curve[currentSegment + 1].controls[1]],
        [curve[currentSegment + 1].x, curve[currentSegment + 1].y],
        [t0, t1, t2][i]
      ));
    }

    kappa.textContent = curvature(
      [curve[currentSegment].x, curve[currentSegment].y],
      [curve[currentSegment].controls[controlSide], curve[currentSegment].controls[controlSide + 1]],
      [curve[currentSegment + 1].controls[0], curve[currentSegment + 1].controls[1]],
      [curve[currentSegment + 1].x, curve[currentSegment + 1].y], t
    ).toFixed(11);

     if (info.style.display === 'flex')
      fillEValues([curve[currentSegment].x, curve[currentSegment].y],
      [curve[currentSegment].controls[controlSide], curve[currentSegment].controls[controlSide + 1]],
      [curve[currentSegment + 1].controls[0], curve[currentSegment + 1].controls[1]],
      [curve[currentSegment + 1].x, curve[currentSegment + 1].y]);

    return points;
  }

  function getRadiusAndCenter(x1, y1, x2, y2, x3, y3) { // gpt
    // Midpoints of chords AB and BC
    const mxAB = (x1 + x2) / 2;
    const myAB = (y1 + y2) / 2;
    const mxBC = (x2 + x3) / 2;
    const myBC = (y2 + y3) / 2;

    // Slopes of AB and BC
    const mAB = (y2 - y1) / (x2 - x1);
    const mBC = (y3 - y2) / (x3 - x2);

    // Slopes of perpendicular bisectors
    const mPerpAB = -1 / mAB;
    const mPerpBC = -1 / mBC;

    // Equations of perpendicular bisectors
    const bPerpAB = myAB - mPerpAB * mxAB;
    const bPerpBC = myBC - mPerpBC * mxBC;

    // Coordinates of the center (intersection of perpendicular bisectors)
    const h = (bPerpBC - bPerpAB) / (mPerpAB - mPerpBC);
    const k = mPerpAB * h + bPerpAB;

    // Radius of the circle
    const radius = Math.sqrt(Math.pow((x1 - h), 2) + Math.pow((y1 - k), 2));

    return { center: { x: h, y: k }, radius: radius };
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
    let found = null;
    for (const point of curve) {
      if (Math.abs(x - point.x) < POINT_HITBOX && Math.abs(y - point.y) < POINT_HITBOX)
        found = point;
      for (let i = 0; i < point.controls.length; i+=2)
        if (Math.abs(x - point.controls[i]) < CTRL_HITBOX && Math.abs(y - point.controls[i+1]) < CTRL_HITBOX)
          return [point, i];
    }
    return found;
  }

  function cubicBezier(p0, p1, p2, p3, t) {
    const x = Math.pow(1 - t, 3) * p0[0] +
              3 * Math.pow(1 - t, 2) * t * p1[0] +
              3 * (1 - t) * Math.pow(t, 2) * p2[0] +
              Math.pow(t, 3) * p3[0];
    const y = Math.pow(1 - t, 3) * p0[1] +
              3 * Math.pow(1 - t, 2) * t * p1[1] +
              3 * (1 - t) * Math.pow(t, 2) * p2[1] +
              Math.pow(t, 3) * p3[1];
    return [x, y];
  }

  function firstDerivative(p0, p1, p2, p3, t) {
    const x = 3 * Math.pow(1 - t, 2) * (p1[0] - p0[0]) +
              6 * (1 - t) * t * (p2[0] - p1[0]) +
              3 * Math.pow(t, 2) * (p3[0] - p2[0]);
    const y = 3 * Math.pow(1 - t, 2) * (p1[1] - p0[1]) +
              6 * (1 - t) * t * (p2[1] - p1[1]) +
              3 * Math.pow(t, 2) * (p3[1] - p2[1]);
    return [x, y];
  }

  function secondDerivative(p0, p1, p2, p3, t) {
    const x = 6 * (1 - t) * (p2[0] - 2 * p1[0] + p0[0]) +
              6 * t * (p3[0] - 2 * p2[0] + p1[0]);
    const y = 6 * (1 - t) * (p2[1] - 2 * p1[1] + p0[1]) +
              6 * t * (p3[1] - 2 * p2[1] + p1[1]);
    return [x, y];
  }

  function vectorMagnitude(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }
  
  function crossProduct(v1, v2) {
    return v1[0] * v2[1] - v1[1] * v2[0];
  }

  function curvature(p0, p1, p2, p3, t) {
    d1 = firstDerivative(p0, p1, p2, p3, t);
    d2 = secondDerivative(p0, p1, p2, p3, t);
    numerator = Math.abs(crossProduct(d1, d2));
    denominator = Math.pow(vectorMagnitude(d1), 3);
    return numerator / denominator;
  }

  function animate() {
    animationSlider.value =  parseInt(animationSlider.value) !== 999 ? parseInt(animationSlider.value) + parseInt(speedSlider.value) : 0;
    updateCirclePosition();
    drawCurve();
  
    if (animatedToggle.checked)
      window.requestAnimationFrame(animate);
  }

  function updateCirclePosition() {
    if (circleToggle.checked) return;
    const sliderDivide500 = animationSlider.value / 500;
    currentSegment = Math.floor(sliderDivide500);
    t = remap(sliderDivide500, currentSegment, currentSegment + 1, 0, 1);
  }
  
  function remap(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

  function fillEValues(p0, p1, p2, p3) { // this is so bad
    for (let timeValue of time)
      timeValue.textContent = t.toFixed(2);

    for (let p0xV of p0x)
      p0xV.textContent = Math.round(p0[0]);
    for (let p1xV of p1x)
      p1xV.textContent = Math.round(p1[0]);
    for (let p2xV of p2x)
      p2xV.textContent = Math.round(p2[0]);
    for (let p3xV of p3x)
      p3xV.textContent = Math.round(p3[0]);
    for (let p0yV of p0y)
      p0yV.textContent = Math.round(p0[1]);
    for (let p1yV of p1y)
      p1yV.textContent = Math.round(p1[1]);
    for (let p2yV of p2y)
      p2yV.textContent = Math.round(p2[1]);
    for (let p3yV of p3y)
      p3yV.textContent = Math.round(p3[1]);
    for (let bpxV of bpx)
      bpxV.textContent = Math.round(d1[0]);
    for (let bpyV of bpy)
      bpyV.textContent = Math.round(d1[1]);
    for (let bppxV of bppx)
      bppxV.textContent = Math.round(d2[0]);
    for (let bppyV of bppy)
      bppyV.textContent = Math.round(d2[1]);
    for (let nV of n)
      nV.textContent = Math.round(numerator);
    for (let dV of d)
      dV.textContent = Math.round(denominator);

    kappaResult[0].textContent = parseFloat(kappa.textContent).toFixed(5);
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

  controlToggle.addEventListener('change', () => {
    if (!animatedToggle.checked)
      drawCurve();
  });

  animatedToggle.addEventListener('change', () => {
    if (animatedToggle.checked)
      animate();
  });

  circleToggle.addEventListener('change', () => {
    if (!animatedToggle.checked)
      drawCurve();
  });

  animationSlider.addEventListener('input', () => {
    updateCirclePosition();
    drawCurve();
  });

  stepsButton.addEventListener('click', () => {
    curve = [
      new point(initX-100, initY+100, [initX, initY+100], true),
      new point(initX, initY, [initX-100, initY, initX+100, initY]),
      new point(initX+100, initY-100, [initX, initY-100])
    ];
    drawCurve();
  });

  ellipseButton.addEventListener('click', () => {
    curve = [
      new point(initX, initY+100, [initX-100, initY+100], true),
      new point(initX, initY-100, [initX-100, initY-100, initX+100, initY-100]),
      new point(initX, initY+100, [initX+100, initY+100])
    ];
    drawCurve();
  });

  heartButton.addEventListener('click', () => {
    curve = [
      new point(initX, initY-100, [initX-100, initY-200], true),
      new point(initX, initY+100, [initX-200, initY-100, initX+200, initY-100]),
      new point(initX, initY-100, [initX+100, initY-200])
    ];
    drawCurve();
  });

  infoButton.addEventListener('click', () => {
    info.style.display = info.style.display === 'none' ? 'flex' : 'none';
  });
});
