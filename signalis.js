const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const img1 = new Image();
img1.src = "assets/eyecloseup_face.png";
const img2 = new Image();
img2.src = "assets/eyecloseup_eyeWhite.png";
img3src = "assets/eyecloseup_pupil_sclera.png"
hairimg = "assets/eyecloseup_hair.png";
reflectside = "assets/eyecloseup_pupil_reflect_side.png"
reflectfront = "assets/eyecloseup_pupil_reflect_front.png"
reflectinner = "assets/eyecloseup_pupil_reflection_inner.png"
reflectdepth = "assets/eyecloseup_pupil_reflect_depth.png"
lidEye = "assets/eyecloseup_lid_closed.png" 

class Signalis {
	constructor(ctx, x, y, width, height, image, zoomMultiplier) {
		this.ctx = ctx;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.image = image;
		this.zoomMultiplier = zoomMultiplier;
		this.cx = this.width / 2;
		this.cy = this.height / 2;
		this.scaledWidth = this.image.width * zoomMultiplier;
		this.scaledHeight = this.image.height * zoomMultiplier;
		this.dx = this.cx - this.scaledWidth / 2;
		this.dy = this.cy - this.scaledHeight / 2;
	}
	draw() {
		ctx.drawImage(this.image, this.dx, this.dy, this.scaledWidth, this.scaledHeight);
	}
}


class Eye {
  constructor(ctx, centerX, centerY, width, height, imageSrc, lag = 0.15, size = 80) {
		this.ctx = ctx;
		this.center = { x: centerX, y: centerY };
		this.boundary = { w: width, h: height };
		this.pupil = { x: centerX, y: centerY };
		this.mouse = { x: centerX, y: centerY };
		this.lag = lag;
		this.size = size;
		
		this.image = new Image();
		this.image.src = imageSrc;


		/**
		 * @type {Array<{image: HTMLImageElement, offset: {x:number,y:number}, anchored: number, lag:number, size:number, pos:{x:number,y:number}}>} 
		 */
		this.reflections = [];

		// // reflection stuff;
		// this.reflectionImage = null;
		// this.reflectionOffset = { x: 0, y: 0}
		// this.reflectionLag = 0.25; // default lag;
		// this.reflectionPos = {x: centerX, y: centerY};
		// this.reflectionSize = null;
	}

	// set reflection Layer;
	addReflection(src, offsetX = 0, offsetY = 0, scale = 1.0, lag = 0.25, size = 0.1){
		const img = new Image();
		img.src = src;
		const refSize = size < 1 ? this.size * size : size;
		this.reflections.push({
			image: img,
			offset: {x: offsetX, y: offsetY},
			anchorScale: scale, 
			lag,
			size: refSize,
			pos: {x: this.center.x, y: this.center.y}
		});
	}


	setMousePosition(x, y) {
		this.mouse.x = x;
		this.mouse.y = y;
	}

	update() {
		const dx = this.mouse.x - this.center.x;
		const dy = this.mouse.y - this.center.y;

		// Check if the mouse is inside the elliptical boundary
		const inside =
		(dx * dx) / ((this.boundary.w / 2) ** 2) +
		(dy * dy) / ((this.boundary.h / 2) ** 2) <= 1;

		let targetX, targetY;
		if (inside) {
		targetX = this.mouse.x;
		targetY = this.mouse.y;
		} else {
		const angle = Math.atan2(dy, dx);
		targetX = this.center.x + (this.boundary.w / 2) * Math.cos(angle);
		targetY = this.center.y + (this.boundary.h / 2) * Math.sin(angle);
		}

		// Interpolation 
		this.pupil.x += (targetX - this.pupil.x) * this.lag;
		this.pupil.y += (targetY - this.pupil.y) * this.lag;

		//reflection calculation;
		for (const ref of this.reflections) {
			const scaledW = (this.boundary.w / 2) * ref.anchorScale;
			const scaledH = (this.boundary.h / 2) * ref.anchorScale;
			const dxScaled = dx * ref.anchorScale;
			const dyScaled = dy * ref.anchorScale;

			const insideSmall = (dxScaled * dxScaled) / (scaledW ** 2) + (dyScaled * dyScaled) / (scaledH ** 2 ) <= 1;
			let targetRefX, targetRefY;
/* 
			if (ref.anchored) {
				ref.pos.x = this.center.x + ref.offset.x;
				ref.pos.y = this.center.y + ref.offset.y;
			} else {
				const TargetX = this.pupil.x + ref.offset.x;
				const TargetY = this.pupil.y + ref.offset.y;
				ref.pos.x += (TargetX - ref.pos.x) * ref.lag;
				ref.pos.y += (TargetY - ref.pos.y) * ref.lag;
			}
			 */

			if (insideSmall) {
				targetRefX = this.center.x + dxScaled;
				targetRefY = this.center.y + dyScaled;
			} else {
				const angle = Math.atan2(dyScaled, dxScaled)
				targetRefX = this.center.x + scaledW * Math.cos(angle);
				targetRefY = this.center.y + scaledH * Math.sin(angle);
			}
			targetRefX += ref.offset.x;
			targetRefY += ref.offset.y;
			ref.pos.x += (targetRefX - ref.pos.x) * ref.lag;
			ref.pos.y += (targetRefY - ref.pos.y) * ref.lag;

		}
	}

	drawEye(debug = false) {
		const ctx = this.ctx;

		// Optional debug boundary
		if (debug) {
		ctx.beginPath();
		ctx.ellipse(
			this.center.x,
			this.center.y,
			this.boundary.w / 2,
			this.boundary.h / 2,
			0,
			0,
			Math.PI * 2
		);
		ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
		ctx.stroke();
		}

		// Draw eye image
		if (this.image.complete) {
		ctx.drawImage(
			this.image,
			this.pupil.x - this.size / 2,
			this.pupil.y - this.size / 2,
			this.size,
			this.size
		);
		}

		if (debug) {
		// Draw center point
		ctx.beginPath();
		ctx.arc(this.center.x, this.center.y, 3, 0, Math.PI * 2);
		ctx.fillStyle = "blue";
		ctx.fill();
    }
  }

  drawReflection(){
	const ctx = this.ctx;
	for (const ref of this.reflections) {
		if (!ref.image.complete) continue;
		ctx.drawImage(
			ref.image, 
			ref.pos.x - ref.size / 2,
			ref.pos.y - ref.size /2,	
			ref.size,
			ref.size
		);
	}

  }
}

class Blink {
  constructor(ctx, imgSrc, centerX, centerY, baseWidth, baseHeight, {
    minInterval = 3000,
    maxInterval = 8000,
    blinkDuration = 120,
    scale = 1.0,
    offsetX = 0,
    offsetY = 0
  } = {}) {
    this.ctx = ctx;
    this.center = { x: centerX, y: centerY };
    this.baseSize = { w: baseWidth, h: baseHeight };
    this.minInterval = minInterval;
    this.maxInterval = maxInterval;
    this.blinkDuration = blinkDuration;
    this.scale = scale;
    this.offset = { x: offsetX, y: offsetY };

    this.image = new Image();
    this.image.src = imgSrc;

    this.isBlinking = false;
    this.lastBlinkTime = 0;
    this.nextBlinkDelay = this._getNextBlinkDelay();
    this.visibleUntil = 0;
  }

  _getNextBlinkDelay() {
    return Math.random() * (this.maxInterval - this.minInterval) + this.minInterval;
  }

  triggerBlink() {
    if (this.isBlinking) return;
    this.isBlinking = true;
    const now = performance.now();
    this.visibleUntil = now + this.blinkDuration;
  }

  update() {
    const now = performance.now();

    // Check if time to trigger a random blink
    if (!this.isBlinking && now - this.lastBlinkTime > this.nextBlinkDelay) {
      this.triggerBlink();
    }

    // Hide blink after duration
    if (this.isBlinking && now > this.visibleUntil) {
      this.isBlinking = false;
      this.lastBlinkTime = now;
      this.nextBlinkDelay = this._getNextBlinkDelay();
    }
  }

  draw() {
    if (!this.isBlinking || !this.image.complete) return;

    const ctx = this.ctx;

    const drawWidth = this.baseSize.w * this.scale;
    const drawHeight = this.baseSize.h * this.scale;

    const x = this.center.x - drawWidth / 2 + this.offset.x;
    const y = this.center.y - drawHeight / 2 + this.offset.y;

    ctx.drawImage(this.image, x, y, drawWidth, drawHeight);
  }
}



class HairSway {
  constructor(ctx, imgSrc, rootX, rootY, baseWidth, baseHeight, {
    swayAmplitude = 3,       // degrees of rotation swing
    swaySpeed = 1.5,         // oscillation frequency
    offsetX = 0,
    offsetY = 0,
    scale = 1.0
  } = {}) {
    this.ctx = ctx;
    this.image = new Image();
    this.image.src = imgSrc;

    // "Root" point of the hair (the fixed anchor)
    this.root = { x: rootX, y: rootY };

    this.baseSize = { w: baseWidth, h: baseHeight };
    this.offset = { x: offsetX, y: offsetY };
    this.scale = scale;

    // Convert degrees to radians for math
    this.amplitude = swayAmplitude * (Math.PI / 180);
    this.speed = swaySpeed;

    this.startTime = performance.now();
  }

  draw() {
    if (!this.image.complete) return;

    const ctx = this.ctx;
    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;

    // Smooth oscillation angle
    const angle = Math.sin(elapsed * this.speed) * this.amplitude;

    // Apply transform — rotation from top-left "root"
    ctx.save();

    // Move origin to root + optional offset
    ctx.translate(this.root.x + this.offset.x, this.root.y + this.offset.y);
    ctx.rotate(angle);
    ctx.scale(this.scale, this.scale);

    // Draw image with its top-left corner at the rotation pivot
    ctx.drawImage(this.image, 0, 0, this.baseSize.w, this.baseSize.h);

    ctx.restore();
  }
}


class FaceCRT {
  constructor(ctx, width, height, {
    lineSpacing = 3,           // distance between scanlines
    lineOpacity = 0.08,        // darkness of scanlines
    flickerStrength = 0.05,    // brightness flicker range
    vignetteStrength = 0.35,   // edge darkening
    distortion = 0.002         // wave distortion factor
  } = {}) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.lineSpacing = lineSpacing;
    this.lineOpacity = lineOpacity;
    this.flickerStrength = flickerStrength;
    this.vignetteStrength = vignetteStrength;
    this.distortion = distortion;

    this.startTime = performance.now();
  }

  draw() {
    const ctx = this.ctx;
    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;

    // Apply subtle flicker
    const flicker = 1 + (Math.random() - 0.5) * this.flickerStrength;

    // Slight wave distortion simulation
    const distortionY = Math.sin(elapsed * 3) * this.distortion * this.height;

    ctx.save();

    // Slight transparent overlay for CRT glow
    ctx.globalAlpha = 0.6 * flicker;

    // --- Scanlines ---
    ctx.fillStyle = `rgba(0, 0, 0, ${this.lineOpacity})`;
    for (let y = 0; y < this.height; y += this.lineSpacing) {
      const offset = Math.sin(y * 0.05 + elapsed * 5) * distortionY;
      ctx.fillRect(offset, y, this.width, 1);
    }

    // --- Vignette ---
    const gradient = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width / 3,
      this.width / 2,
      this.height / 2,
      this.width / 1.1
    );
    gradient.addColorStop(0, `rgba(0,0,0,0)`);
    gradient.addColorStop(1, `rgba(0,0,0,${this.vignetteStrength})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // --- Subtle reflection/glass glare ---
    ctx.globalAlpha = 0.05 * flicker;
    const glareGrad = ctx.createLinearGradient(0, 0, this.width, this.height / 3);
    glareGrad.addColorStop(0, "rgba(255,255,255,0.2)");
    glareGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glareGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.restore();
  }
}



window.addEventListener('load', () => {
	const face = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img1, 2)
	const eyeWhite = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img2, 2)
//	const hair = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img4, 2)
	const hair = new HairSway(ctx, hairimg, 0, 0, 1024, 1024, {
		swayAmplitude: 1,
		swaySpeed: 0.8,
		scale: 2,
		offsetX: -200,
		offsetY: -600,
	} )
	const eye = new Eye(ctx, canvas.width/2, canvas.height/2, 200, 110, img3src, 0.10, 500)
	const closedEye = new Blink(ctx, lidEye, canvas.width/2, canvas.height/2, 797, 309, {
		minInterval: 3000, 
		maxInterval: 8000,
		blinkDuration: 200,
		scale: 2.0,
		offsetX: 175, 
		offsetY: -22,
	})
	eye.addReflection(reflectinner, 0, -40, 0.2, 0.10, 200)
	eye.addReflection(reflectdepth, 0, -19, 0.8, 0.10, 400)
	eye.addReflection(reflectside, 100, -80, 1, 0.09, 60)
	eye.addReflection(reflectfront, 0, 0, 0.5, 0.09, 60)
	const crt = new FaceCRT(ctx, canvas.width, canvas.height, {
		lineSpacing: 3, 
		lineOpacity: 0.9,
		flickerStrength: 0.3,
		vignetteStrength: 0.8,
		distortion: 0.005
	})
	console.log(eye)
	canvas.addEventListener('mousemove', (e) => {
		const rect = canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;	
		eye.setMousePosition(mouseX, mouseY);
	})
	function animate(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
		eyeWhite.draw();
		eye.update();
		closedEye.update();
		eye.drawEye(false);
		eye.drawReflection();
		face.draw();
		closedEye.draw();
		hair.draw();
		crt.draw()
		requestAnimationFrame(animate);
	}
	animate()	
})