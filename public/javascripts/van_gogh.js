let sessionId = io.socket.sessionid;
console.log(sessionId);

var myRec = new p5.SpeechRec(); // new P5.SpeechRec object
myRec.continuous = true; // do continuous recognition
myRec.interimResults = true; // allow partial recognition (faster, less accurate)

let sessions = {};

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
var colorSN_img1, colorSN_img2, colorSN_img3, colorSN_img3, clearImage;
var blur_img; // image used to reference for brightness

let width_in_pixels = 1493;
let height_in_pixels = 1200;

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
let alpha = 255;

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

    road_set = loadImage('images/road.png');
}


function setup() {
    createCanvas(canvasWidth, canvasHeight);
    backgroundImage = ['images/monochorme faded.png', 'images/monochorme.png', 'images/outline.png']

    // create the drawing layer for the brush
    mainCanvas = createGraphics(canvasWidth, canvasHeight);
    mainCanvas_img = mainCanvas.loadImage(backgroundImage[2]);

    colorSN_img1.loadPixels();

    scrollingCanvas = createCanvas(canvasWidth, canvasHeight);
    my_color = color(random(255), random(255), random(255));
    r = new rectObj(random(width), random(height), boxSize, boxSize, my_color, [], sessionId);
    rects.push(r);


    // create the ui
    road_checkbox = createCheckbox("Draw Road", true);
    overlay_checkbox = createCheckbox("Draw Grid Overlay", false);

    grid = create2DArray(grid_cols, grid_rows, true);

    io.on('mouse', function(data, sessionId) {
        console.log(sessionId, data);
        let updated = false;
        for (i = 0; i < r.friends.length; i++) {
            if (r.friends[i].id == sessionId) {
                r.friends[i].x = data.x;
                r.friends[i].y = data.y;
                updated = true;
                return;
            }
        }

        if (!updated) {
            temp_color = color(random(255), random(255), random(255));
            Object.assign(temp_color, data.color);
            new_rect = new rectObj(data.x, data.y, data.w, data.h, temp_color, [], sessionId);
            r.friends.push(new_rect);
        }
    });


}


function draw() {
    background(255);

    r.update();
    r.disp();

    for (i = 0; i < r.friends.length; i++) {
        r.friends[i].disp();
    }

    emit('mouse', {
        x: r.x,
        y: r.y,
        w: r.w,
        h: r.h,
        color: r.color,
        id: sessionId
    }, sessionId);


    drawMap();
    drawGrid();


}


function mousePressed() {
    r.pressed();
    return false;
}



function mouseReleased() {
    r.released();
    return false;
}

function touchStarted() {
    // prevent default
    return false;
}


function emit(eventName, data) {
    io.emit(eventName, data, sessionId);
}

function rectObj(x, y, w, h, color, others, sessionId) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.color = color;
    this.hit = false;
    this.move = false;
    this.over = false;
    this.rest_posx = x
    this.rest_posy = y;
    this.friends = others;
    this.id = sessionId;

    this.collide = function(obj) {
        this.hit = collideRectRect(this.x, this.y, this.w, this.h, obj.x, obj.y, obj.w, obj.h);
        return this.hit;
    }

    this.disp = function() {
        if (this.over) {
            stroke(255);
            fill(0);
        } else {
            noStroke();
            fill(this.color);
        }

        rect(this.x, this.y, this.w, this.h);
    }


    this.update = function() {
        if (this.move) {
            this.x = mouseX;
            this.y = mouseY;
        }


        if (this.overEvent() || this.move) {
            this.over = true;
        } else {
            this.over = false;
        }

    }

    this.overEvent = function() {
        let hit = collidePointRect(mouseX, mouseY, r.x, r.y, r.w, r.h);
        if (hit)
            return true;
        else
            return false;
    }

    // Make sure we are not coliding with others 
    this.overOther = function() {
        for (let i = 0; i < this.friends.length; i++) {
            if (this.friends[i].id != this.id) {
                if (this.collide(this.friends[i])) {
                    this.hit = true;
                    return true;
                }
            }
        }
        this.hit = false;
        return false;
    }


    this.pressed = function() {
        if (this.over) {
            this.move = true;
            this.x = mouseX;
            this.y = mouseY;
        } else {
            this.move = false;
        }
    }

    this.released = function() {
        if (this.overOther()) {
            console.log('coliding');
        } else {
            if (this.over) {
                this.move = false;
                this.rest_posx = this.x;
                this.rest_posy = this.y;
            }
        }
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

function drawMap() {
    // loop over each cell
    for (let col = 0; col < grid_cols; col++) {
        for (let row = 0; row < grid_rows; row++) {

            // check the state of the cell
            let cellIsSet = sampleGrid(col, row);
            if (cellIsSet) {
                // draw the road
                if (road_checkbox.checked()) {
                    //let score = getScore(col, row);
                    //drawRoadTile(score, col, row);
                }

                // draw the overlay
                if (overlay_checkbox.checked()) {
                    blendMode(NORMAL);
                    fill(0, 0, 0, alpha);
                    noStroke();
                    let x = col * col_width;
                    let y = row * row_height;
                    rect(x, y, col_width, row_height);
                    blendMode(NORMAL);
                }
            } else {
                blendMode(MULTIPLY);
                fill(255, 255, 255, alpha);
                noStroke();
                let x = col * col_width;
                let y = row * row_height;
                rect(x, y, col_width, row_height);
                blendMode(NORMAL);
            }
        }
    }
}

// draw grid lines
function drawGrid() {
    stroke(0, 0, 0, 20);
    for (let x = 0; x < width; x += col_width) {
        line(x, 0, x, height);
    }
    for (let y = 0; y < height; y += row_height) {
        line(0, y, width, y);
    }
}

// draws a single tile from the atlas at the given grid col + row
function drawRoadTile(score, col, row) {
    // find location to draw
    let x = col * col_width;
    let y = row * row_height;

    // the tiles are packed into a single 4 x 4 atlas
    // we need calculate what part of the image to draw
    let sx = score % 4 * 16;
    let sy = floor(score / 4) * 16;

    // draw it
    image(road_set, x, y, col_width, row_height, sx, sy, 16, 16);
}

// apply the rules to find the tile id that should be dawn
function getScore(col, row) {
    let score = 0;
    if (sampleGrid(col, row - 1)) score += 1;
    if (sampleGrid(col + 1, row)) score += 2;
    if (sampleGrid(col, row + 1)) score += 4;
    if (sampleGrid(col - 1, row)) score += 8;
    return score;
}

// check the grid value at the col, row
// if the location is out of bounds just return false
function sampleGrid(col, row) {
    if (col < 0 || col >= grid_cols) return false;
    if (row < 0 || row >= grid_rows) return false;
    return grid[col][row]
}

// init an array cols x rows large
function create2DArray(cols, rows, value) {
    let a = [];
    for (let col = 0; col < cols; col++) {
        a[col] = [];
        for (let row = 0; row < rows; row++) {
            a[col][row] = value;
        }
    }
    return a;
}
