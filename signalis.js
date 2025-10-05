const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const img1 = new Image();
img1.src = "assets/eyecloseup_face.png";
const img2 = new Image();
img2.src = "assets/eyecloseup_eyeWhite.png";
const img3 = new Image();
img3.src = "assets/eyecloseup_pupil_sclera.png"
const img4 = new Image();
img4.src = "assets/eyecloseup_hair.png";

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

class Eyes extends Signalis{
	constructor(ctx, x, y, width, height, image, zoomMultiplier) {
		super(ctx, x, y, width, height, image, zoomMultiplier)
		this.boundaryWidth = 110;
		this.boundaryHeight = 55;
		this.boundaryX = this.cx;
		this.boundaryY = this.cy;
		this.vx = 0;
		this.vy = 0;
		this.pupilX = this.boundaryX;
		this.pupilY = this.boundaryY;

	}
	updateEyes(targetX, targetY, stiffness, damping) {
		const ax = (targetX - this.pupilX ) * stiffness;
		const ay = (targetY - this.pupilY ) * stiffness; 

		this.vx = (this.vx + ax) * damping;
		this.vy = (this.vy + ay) * damping;

		this.pupilX += this.vx;
		this.pupilY += this.vy;
		
		
		if (this.image.complete) {
			ctx.drawImage(this.image, this.pupilX - this.image.width / 2, this.pupilY - this.image.height / 2);
		}

	}
	


}


function getMouseAngle(mouseX, mouseY, width, height, bW, bH) {
	const boundaryWidth = bW;
	const boundaryHeight = bH;
	const boundaryCenterX = width / 2;
	const boundaryCenterY = height / 2;
	const dx = mouseX - boundaryCenterX;
	const dy = mouseY - boundaryCenterY;

	const inside = (dx * dx ) / (boundaryWidth / 2) ** 2 + (dy*dy) / (boundaryHeight / 2) ** 2 <= 1;
	if (inside){
		return { x: mouseX, y: mouseY};
	} else {
		const angle = Math.atan2(dx, dy);
		return {
			x: boundaryCenterX + (boundaryWidth / 2) * Math.cos(angle),
			y: boundaryCenterY + (boundaryHeight / 2) * Math.sin(angle)
		}
	}
}



window.addEventListener('load', function(){
	const face = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img1, 2)
	const eyeWhite = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img2, 3)
	const eye = new Eyes(ctx, 0, 0, canvas.width, canvas.height, img3, 2)
	const hair = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img4, 2)
	//eye.draw()

	canvas.addEventListener('mousemove', (e) => {
		function animate(){
			const mouseX = e.clientX;
			const mouseY = e.clientY;
			const t = getMouseAngle(mouseX, mouseY, canvas.width, canvas.height, 110, 55);
			targetX = t.x;
			targetY = t.y;
			ctx.clearRect(0,0,canvas.width, canvas.height);
			eyeWhite.draw();
			eye.updateEyes(targetX, targetY, 0.25, 0.75);
			face.draw();
			hair.draw();
			requestAnimationFrame(animate)
		}
		animate()
	})

	
})