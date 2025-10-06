const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const img1 = new Image();
img1.src = "assets/eyecloseup_face.png";
const img2 = new Image();
img2.src = "assets/eyecloseup_eyeWhite.png";
img3src = "assets/eyecloseup_pupil_sclera.png"
const img4 = new Image();
img4.src = "assets/eyecloseup_hair.png";
reflectside = "assets/eyecloseup_pupil_reflect_side.png"
reflectfront = "assets/eyecloseup_pupil_reflect_front.png"
reflectfront2 = "assets/eyecloseup_pupil_reflect_front.png"
reflectinner = "assets/eyecloseup_pupil_reflection_inner.png"
reflectdepth = "assets/eyecloseup_pupil_reflect_depth.png"
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






window.addEventListener('load', () => {
	const face = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img1, 2)
	const eyeWhite = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img2, 2)
	const hair = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img4, 2)
	const eye = new Eye(ctx, canvas.width/2, canvas.height/2, 200, 110, img3src, 0.10, 500)
	eye.addReflection(reflectinner, 0, -40, 0.2, 0.10, 200)
	eye.addReflection(reflectdepth, 0, -19, 0.8, 0.10, 400)
	eye.addReflection(reflectside, 100, -80, 1, 0.09, 60)
	eye.addReflection(reflectfront, 0, 0, 0.5, 0.09, 60)

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
		eye.drawEye(false);
		eye.drawReflection();
		face.draw();
		hair.draw();
		requestAnimationFrame(animate);
	}
	animate()	
})