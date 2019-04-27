//object Oriented Collision
var rects = [];
var numRects = 50;
var cir;

var scrollingCanvas;
var randomCanvas;

var canvasWidth = 1493;
var canvasHeight = 1200;

let colorBackground;
let mainCanvas;

function preload() {
    // create a new Layer to load these Images onto
    colorSN = createGraphics(1494, 1200);
    clearImage = createGraphics(1493, 1200);
    clearImage.fill(255);
    clearImage.noStroke();
    clearImage.rect(0, 0, clearImage.width, clearImage.height);
    colorSN_img1 = colorSN.loadImage('images/starry night.jpg');
    colorSN_img2 = colorSN.loadImage('images/monochorme.png');
    colorSN_img3 = colorSN.loadImage('images/monochorme faded.png');
    colorSN_img4 = colorSN.loadImage('images/outline.png');
    blur_img = loadImage('images/grayscale blur.png');
}


function setup() {
    createCanvas(1493, 1200);
    backgroundImage = ['images/monochorme faded.png', 'images/monochorme.png', 'images/outline.png']

    // create the drawing layer for the brush
    mainCanvas = createGraphics(canvasWidth, canvasHeight);
    mainCanvas_img = mainCanvas.loadImage(backgroundImage[2]);

    scrollingCanvas = createCanvas(canvasWidth, canvasHeight);


    for (i = 0; i < numRects; i++) {
        r = new rectObj(random(width), random(height), random(10, 50), random(10, 50)) // generate a rectObj
        rects.push(r); //add it to the array.
    }

    cir = new circleObj(20); // create a new circle object
    console.log(rects);
}

function draw() {
    background(255);

    for(i=0;i<numRects;i++){
		rects[i].disp();
		rects[i].collide( cir ); //collide against the circle object
	}

	cir.disp(mouseX,mouseY); //pass the x,y pos in to the circle.
}

function rectObj(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.color = color(random(255), random(255), random(255))
    this.hit = false;

    this.collide = function(obj) {

        this.hit = collideRectCircle(this.x, this.y, this.w, this.h, obj.x, obj.y, obj.dia); //collide the cir object into this rectangle object.

        if (this.hit) {
            this.color = color(0) //set this rectangle to be black if it gets hit
        }

    }

    this.disp = function() {
        noStroke();
        fill(this.color);
        this.x += 3 //move to the right!
        if (this.x > width) { //loop to the left!
            this.x = -this.w;
        }
        rect(this.x, this.y, this.w, this.h);

    }

}

function circleObj(dia) {
    this.dia = dia;
    this.color = color(random(255), random(255), random(255))
    this.x;
    this.y;

    this.disp = function(x, y) {
        this.x = x;
        this.y = y;
        noStroke();
        fill(this.color);
        ellipse(this.x, this.y, this.dia, this.dia);
    }

}
