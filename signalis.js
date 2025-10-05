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

class Eyes {
	constructor(ctx, width, height, image ) {
		this.ctx = ctx;
		this.image = image;
		this.width = width;
		this.height = height;
		this.center = {
			x: this.width / 2,
			y: this.height / 2
		};
		this.eyePos = {
			x: this.center.x, 
			y: this.center.y
		};
		this.radius = 25;
		this.pupilMaxMove = 8;
		this.lookBoundary = 250;
	}
	
	updateEyes (mouseX, mouseY){
		const dx = mouseX - this.center.x;
		const dy = mouseY - this.center.y;
		const angle = Math.atan2(dy, dx);
		const distance = Math.sqrt(dx*dx + dy*dy);
		const clampedDistance = Math.min(distance, this.lookBoundary);
		const eyeX = this.center.x + Math.cos(angle) * clampedDistance;
		const eyeY = this.center.y + Math.sin(angle) * clampedDistance;

		ctx.drawImage(
			this.image, 
			eyeX - this.image.width / 2,
			eyeY - this.image.height / 2,
			this.image.width,
			this.image.height
		);
	}


}





window.addEventListener('load', function(){
	const face = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img1, 2)
	const eyeWhite = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img2, 2)
	const eye = new Eyes(ctx, canvas.width, canvas.height, img3, 2)
	const hair = new Signalis(ctx, 0, 0, canvas.width, canvas.height, img4, 2)
	canvas.addEventListener('mousemove', (e) => {
		let mouseX = e.clientX;
		let mouseY = e.clientY;
		function render(mouseX, mouseY) {
			ctx.clearRect(0,0,canvas.width,canvas.height);
			eye.updateEyes(mouseX, mouseY);
			requestAnimationFrame(render);
		}
		render();
	})	

	
})