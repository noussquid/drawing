let sessionId = io.socket.sessionid;
console.log(sessionId);

var myRec = new p5.SpeechRec(); // new P5.SpeechRec object
myRec.continuous = true; // do continuous recognition
myRec.interimResults = true; // allow partial recognition (faster, less accurate)

//https://github.com/processing/p5.js/wiki/Local-server

var STROKE_WIDTH_FACTOR = 1.2;
var STROKE_DISTANCE_FACTOR = 1.0;
var CHEATING = true;
var b = new Brush();
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
// var skyHuesHSB = [[180, 19, 100], [180, 28, 100], [196, 47, 100], [191, 45, 100], [203, 39, 100], [191, 50, 83]];

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

let img;

var renderOverlay = true;
var outlineOverlay = true;

var buttonA, buttonB, buttonC, buttonD;
var colorSN_img1, colorSN_img2, colorSN_img3, clearImage;
var blur_img; // image used to reference for brightness

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
let grid_settings = {};

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
let xOffset = 0.0;
let yOffest = 0.0;
let alpha = 255;

function preload() {
    road_set = loadImage('images/road.png');

    // create a new Layer to load these Images onto
    colorSN = createGraphics(1493, 1200);
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

function getImageBrightness(x, y, actual, reference) {
    let percentX = x / actual.width;
    let percentY = y / actual.height;
    let referenceX = floor(percentX * reference.width);
    let referenceY = floor(percentY * reference.height);
    let color = reference.get(referenceX, referenceY);

    let actualX = floor(percentX * actual.width);
    let actualY = floor(percentY * actual.height);

    if (CHEATING) {
        return actual.get(actualX, actualY);
    }
    // add exception for brown brush
    if (brushType === BROWN) {
        return color[0] * 0.2;
    }
    return color[0];
}


function setup() {
    createCanvas(canvas_width, canvas_height);
    backgroundImage = ['images/monochorme faded.png', 'images/monochorme.png', 'images/outline.png']


    // create the drawing layer for the brush
    mainCanvas = createGraphics(canvas_width, canvas_width);
    mainCanvas_img = mainCanvas.loadImage(backgroundImage[2]);
    background(255, 255, 255, 0);
    colorMode(HSB);

    // generate a 2D array to hold the state of each grid cell
    grid = create2DArray(grid_cols, grid_rows, false);
    console.log(grid);
    // populate an initial drawing
    grid[6][4] = true;
    grid[7][4] = true;
    grid[8][4] = true;
    grid[7][3] = true;
    grid[7][5] = true;

    noSmooth();


    grid_settings = {
        grid_cols: grid_cols,
        grid_rows: grid_rows,
        col_width: col_width,
        row_height: row_height
    };


    my_color = color(random(255), random(255), random(255));
    r = new rectObj(random(width), random(height), boxSize, boxSize, my_color, [], grid_settings, sessionId);



    io.on('mouse', function(data, sessionId) {
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
            new_rect = new rectObj(data.x, data.y, data.w, data.h, temp_color, [], grid_settings, sessionId);
            r.friends.push(new_rect);
        }
    });


}


function toggleTile(mouseX, mouseY) {
    // find the grid location of the click
    let grid_x = floor(mouseX / col_width);
    let grid_y = floor(mouseY / col_width);

    // toggle the cell state
    grid[grid_x][grid_y] = !grid[grid_x][grid_y];

    redraw();
}


function draw() {
    background(255);

    console.log('this.r.over, this.r.moving ', this.r.over, this.r.move);
    if (mouseIsPressed && (!this.r.over || !this.r.move)) {
        b.update(mouseX, mouseY);
        b.render();
    } else {
        b.endLine();
    }

    image(mainCanvas, 0, 0, width, height);

    if (outlineOverlay == true) {
        image(colorSN_img4, 0, 0, width, height);
    }


    drawGrid();

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
    r.pressed();
    return false;
}

function touchMoved() {
    return false;
}

function touchEnded() {
    r.released();
    return false;
}

function emit(eventName, data) {
    io.emit(eventName, data, sessionId);
}

function previewColoredImage() {
    image(colorSN_img1, 0, 0, width, height);
}

function clearPreview() {
    image(clearImage, 0, 0, width, height);
}

function BackgroundSelector4() {
    //image(mainCanvas_img, 0, 0, width, height);
    //clear();
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

function BrushSegment(x, y, stroke, weight, brightness) {
    this.x = x;
    this.y = y;
    this.stroke = stroke;
    this.weight = weight;
    this.brightness = brightness;
}

function Brush() {
    this.drawing = false;
    this.upperHistory = [];
    this.lowerHistory = [];

    this.update = function(x, y) {
        if (!this.drawing) {
            // initial settings
            this.new = createVector(x, y);
            this.last = createVector(x, y);
            this.upper = createVector(x, y);
            this.lower = createVector(x, y);

            // set colors based on brush type
            if (brushType == BLUE) {
                this.upperColor = random(skyHuesHSB);
                this.lowerColor = random(skyHuesHSB);
            } else if (brushType == YELLOW) {
                this.upperColor = random(whiteHuesHSB);
                this.lowerColor = random(whiteHuesHSB);
            } else {
                this.upperColor = random(brownHuesHSB);
                this.lowerColor = random(brownHuesHSB);
            }

            this.lastSize = false;
            this.upperWidth = random(0.7, 1.5);
            this.lowerWidth = random(0.8, 1.75);
            this.lineLength = random(350, 550) * STROKE_DISTANCE_FACTOR;
            this.drawing = true;
        } else {
            this.new.x = lerp(this.last.x, x, viscosity);
            this.new.y = lerp(this.last.y, y, viscosity);
        }

        let distance = this.last.dist(this.new);
        this.distanceMoved += distance;
        this.heading = this.new.copy().sub(this.last).heading();

        let newSize = this.mapWeight(distance);
        let dist = this.mapDistance(distance)
        let limit = this.lineLength * 0.25;

        // add dampening at start and end of lines
        if (this.lineLength - this.distanceMoved < limit) {
            let remaining = this.lineLength - this.distanceMoved;
            if (remaining <= 1) {
                remaining = 1;
            }
            let percentageRemaining = remaining / limit;
            dist = this.mapDistance(distance * percentageRemaining);
            newSize = this.mapWeight(distance * percentageRemaining);
        } else if (this.distanceMoved < limit) {
            let percentageRemaining = this.distanceMoved / limit;
            dist = this.mapDistance(distance * percentageRemaining);
            newSize = this.mapWeight(distance * percentageRemaining);
        }

        // initial
        if (this.lastSize === false) {
            this.lastSize = newSize;
        }
        let size = lerp(this.lastSize, newSize, viscosity / 2);
        let uy = -cos(this.heading) * dist;
        let ux = sin(this.heading) * dist;
        let ly = cos(this.heading) * dist;
        let lx = -sin(this.heading) * dist;

        let newUpperX = this.new.x + ux;
        let newUpperY = this.new.y + uy;
        let newLowerX = this.new.x + lx;
        let newLowerY = this.new.y + ly;

        if (this.distanceMoved > 10) {
            // upper stroke
            this.upperHistory.push(new BrushSegment(
                this.upper.x,
                this.upper.y,
                this.upperColor,
                size * this.upperWidth,
                getImageBrightness(
                    (this.upper.x + newUpperX) / 2,
                    (this.upper.y + newUpperY) / 2,
                    colorSN_img1,
                    blur_img
                )
            ));

            // lower stroke
            this.lowerHistory.push(new BrushSegment(
                this.lower.x,
                this.lower.y,
                this.lowerColor,
                size * this.lowerWidth,
                getImageBrightness(
                    (this.lower.x + newLowerX) / 2,
                    (this.lower.y + newLowerY) / 2,
                    colorSN_img1,
                    blur_img
                )
            ));
        }

        // end stroke based on length
        if (this.distanceMoved > this.lineLength) {
            this.endLine()
        }

        // end stroke on sharp turns
        if (this.distanceMoved > 100 && abs((degrees(this.heading) + 720) - (degrees(this.lastHeading) + 720)) > 60) {
            this.endLine()
        }

        // set state for next frame
        this.lastSize = size;
        this.lastHeading = this.heading;
        this.upper.set(newUpperX, newUpperY);
        this.lower.set(newLowerX, newLowerY);
        this.last.set(this.new);
    };

    this.renderLine = function(history) {
        colorMode(HSB);
        let lerpBrightness;

        for (let i = 0; i < history.length - 1; i++) {
            let cur = history[i];
            let next = history[i + 1];
            if (i === 0) {
                lerpBrightness = cur.brightness;
            }
            if (CHEATING) {
                colorMode(RGB, 255);
                brightness = lerpColor(color(lerpBrightness), color(next.brightness), viscosity);
                mainCanvas.stroke(brightness);
            } else {
                brightness = lerp(lerpBrightness, next.brightness, viscosity);
                mainCanvas.stroke(color(cur.stroke[0], cur.stroke[1], brightness));
            }
            mainCanvas.strokeWeight(cur.weight);
            mainCanvas.line(cur.x, cur.y, next.x, next.y);
            lerpBrightness = brightness;
        }
    }

    this.endLine = function() {
        this.drawing = false;
        this.distanceMoved = 0;
        this.upperHistory = [];
        this.lowerHistory = [];
    }

    this.mapWeight = function(distance) {
        return map(distance, 0, 30, 6 * STROKE_WIDTH_FACTOR, 12 * STROKE_WIDTH_FACTOR);
    }

    this.mapDistance = function(distance) {
        return map(distance, 0, 36, 2 * STROKE_DISTANCE_FACTOR, 15 * STROKE_DISTANCE_FACTOR);
    }

    this.render = function() {
        this.renderLine(this.upperHistory);
        this.renderLine(this.lowerHistory);
    }
}


function rectObj(x, y, w, h, color, others, grid_settings, sessionId) {
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
    this.grid_settings = grid_settings;

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

    this.snapTo = function() {
        let grid_rows = grid_settings.grid_rows;
        let grid_cols = grid_settings.grid_cols;
        let col_width = grid_settings.col_width;
        let row_height = grid_settings.row_height;

        let found = false;
        for (let col = 0; col < grid_cols; col++) {
            for (let row = 0; row < grid_rows; row++) {
                let grid_x = col * col_width;
                let grid_y = row * row_height;
                if (grid_x > mouseX && grid_y > mouseY) {
                    fill(255, 120, 80);
                    rect(grid_x - col_width, grid_y - row_height, 4, 4);
                    found = true;
                    this.x = grid_x - col_width;
                    this.y = grid_y - row_height;
                    break;
                }
            }
            if (found) {
                break;
            }
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
                this.snapTo();
                this.rest_posx = this.x;
                this.rest_posy = this.y;
            }
        }
    }
}


function drawMap() {
    // loop over each cell
    for (let col = 0; col < grid_cols; col++) {
        for (let row = 0; row < grid_rows; row++) {

            // check the state of the cell
            let cellIsSet = sampleGrid(col, row);
            if (cellIsSet) {
                blendMode(NORMAL);
                fill(0, 0, 0, alpha);
                noStroke();
                let x = col * col_width;
                let y = row * row_height;
                rect(x, y, col_width, row_height);
                blendMode(NORMAL);
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
