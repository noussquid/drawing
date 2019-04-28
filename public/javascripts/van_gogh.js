let sessionId = io.socket.sessionId;
let sessions = [];

var STROKE_WIDTH_FACTOR = 1.2;
var STROKE_DISTANCE_FACTOR = 1.0;
var CHEATING = true;

var BLUE = 1;
var YELLOW = 2;
var BROWN = 3;
var strokeOffset = 1;
var brushType = 1;
var viscosity = 0.18;

var skyHues = ['#CEFFFF', '#B8FFFF', '#88E0FF', '#8BEAFF', '#9BD9FF', '#6ABFD3', '#013D85', '#003274'];
var skyHuesHSB = [
    [213, 99, 52],
    [207, 95, 80]
];

var brownHues = ['#2A0F14', '#301816', '#2C1821', '#1A1422', '#22101C', '#19121A'];
var greenHues = ['#111828', '#021621', '#071226', '#040420', '#20272D', '#112120', '#14222D'];
var brownHuesHSB = [
    [349, 64, 16],
    [293, 31, 10]
];
var whiteHues = ['#FFFEEB', '#F8F9F3', '#FEF4AC', '#F3E29A', '#FEFACB', '#FFFEEB', '#F8F9F3', '#FFFFD3', '#FBF295', '#F2D669', '#FFE241', '#FFC921', '#E9A806']
var whiteHuesHSB = [
    [60, 17, 100],
    [55, 41, 98]
];


//object Oriented Collision
var rects = [];
var numRects = 1;
var cir;

var scrollingCanvas;

var canvasWidth = 1493;
var canvasHeight = 1200;

let colorBackground;
let mainCanvas;

var renderOverlay = true;
var outlineOverlay = true;

var buttonA, buttonB, buttonC, buttonD;
var colorSN_img1, colorSN_img2, colorSN_img3, clearImage;
var blur_img; // image used to reference for brightness

let grid_cols = 47;
let grid_rows = 38;
let row_height = 32;
let col_width = 32;

let grid;
let road_set;

let canvas_height = 1493;
let canvas_width = 1200;

let smallPoint = 4;
let largePoint = 4;

// draw a box
let bx;
let by;
let boxSize = 128;
let overBox = false;
let locked = false;
let xOffset = 0.0;
let yOffest = 0.0;

function preload() {
    // create a new Layer to load these Images onto
    colorSN = createGraphics(canvasWidth, canvasHeight);
    clearImage = createGraphics(canvasWidth, canvasHeight);
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
    createCanvas(canvasWidth, canvasHeight);
    backgroundImage = ['images/monochorme faded.png', 'images/monochorme.png', 'images/outline.png']

    // create the drawing layer for the brush
    mainCanvas = createGraphics(canvasWidth, canvasHeight);
    mainCanvas_img = mainCanvas.loadImage(backgroundImage[2]);

    colorSN_img1.loadPixels();

    scrollingCanvas = createCanvas(canvasWidth, canvasHeight);

    r = new rectObj(random(width), random(height), row_height * 3, col_width * 3); // generate a rectObj
    rects.push(r);


    cir = new circleObj(20); // create a new circle object
    console.log(rects);

    io.on('mouse', function(data) {

    });
}

function draw() {
    background(255);

    for (i = 0; i < numRects; i++) {
        rects[i].disp();
        rects[i].collide(cir); //collide against the circle object
    }

    cir.disp(mouseX, mouseY); //pass the x,y pos in to the circle.
}



function mouseClicked() {

}

function mousePressed() {
    var hit = false;

    r.locked  = collidePointRect(mouseX, mouseY, r.x, r.y, r.w, r.h); //see if the mouse is in the rect
}


function mouseDragged() {
	if (r.locked) {
		r.x = mouseX; 
		r.y = mouseY;
	}
}

function mouseReleased() {
}


function emit(eventName, data) {
    io.emit(eventName, data, sessionId);
}

function rectObj(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.color = color(random(255),random(255),random(255));
    this.hit = false;
    this.locked = false;

    this.collide = function(obj) {
        this.hit = collideRectCircle(this.x, this.y, this.w, this.h, obj.x, obj.y, obj.dia); //collide the cir object into this rectangle object.
   	hit = collideRectRect(200,200,100,150,mouseX,mouseY,50,75);
     }

    this.disp = function() {
        noStroke();
        fill(this.color);
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

function previewColoredImage() {
    image(colorSN_img1, 0, 0, width, height);
}

function clearPreview() {
    image(clearImage, 0, 0, width, height);
}

function BackgroundSelector4() {
    mainCanvas.clear();
}


function BackgroundSelector(bgSelect) {
    if (bgSelect == 'white') {
        image(clearImage, 0, 0, width, height);
    } else if (bgSelect == 'outline') {
        outlineOverlay = !outlineOverlay;
    } else if (bgSelect == 'monochrome faded') {
        image(colorSN_img3, 0, 0, width, height);
    }
}

// HTML Navigation

function toggleMenu() {
    const menu = document.querySelector('.menu');
    menu.addEventListener('click', menu.classList.toggle('menuActive'));
}

function brushSelector(brushInput) {
    if (brushInput == 'blue') {
        brushType = BLUE;
    } else if (brushInput == 'yellow') {
        brushType = YELLOW;
    } else if (brushInput == 'brown') {
        brushType = BROWN;
    }
}
