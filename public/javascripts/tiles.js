// borrowed heavily from: http://compform.net/tiles/
// trying multi user

// 1. Generate a grid
// 2. Toggle tiles on grid local/remote
// 3. Where mouse hovers creat a hot region overlay on other end

let sessionId = io.socket.sessionId;
console.log(sessionId);
let sessions = [];

let grid_cols = 36;
let grid_rows = 24;
let row_height = 32;
let col_width = 32;

let canvas_height = grid_rows * row_height;
let canvas_width = grid_cols * col_width;

let grid;
let road_set;
let overlay_checkbox, road_checkbox;
let region_checkbox;

function preload() {
    road_set = loadImage("images/road.png");
}

function setup() {

    console.log('screen height, screen width ', height, width);

    // create the ui
    road_checkbox = createCheckbox("Draw Road", true);
    overlay_checkbox = createCheckbox("Draw Grid Overlay", false);
    region_checkbox = createCheckbox("Draw Ghosts", true);

    //createCanvas(grid_cols * col_width, grid_rows * row_height);
    createCanvas(canvas_width, canvas_height);
    // create the drawing layer for the brush
    mainCanvas = createGraphics(1493, 1200);
    mainCanvas_img = mainCanvas.loadImage('outline.png');

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

    io.on('mouse', function(data) {
        // demonstrate tile interractivity
        toggleTile(data.x, data.y);
        //highLightRegion(data.x, data.y);
    });
}


function toggleTile(mouseX, mouseY) {
    // find the grid location of the click
    let grid_x = floor(mouseX / col_width);
    let grid_y = floor(mouseY / col_width);

    console.log('grid_x, grid_y ', grid_x, grid_y);

    // toggle the cell state
    grid[grid_x][grid_y] = !grid[grid_x][grid_y];

    redraw();
}

// load an image of van_gogh 
// partition overlay into a grid
// set transparency to 0
// each tile correctly flipped increases transparency to reveal the layer below

function highLightRegion(x, y) {

    // find cell where user is 
    // outilne that cell
    // + 3 in up direction 
    // + 3 in down direction
    // + 3 in left direction
    // + 3 in right direction 
    if (region_checkbox.checked()) {
        blendMode(MULTIPLY);
        fill(255, 0, 0);
        noStroke();
        let x = col * col_width;
        let y = row * row_height;
        rect(x, y, col_width * 5, row_height * 5);
        blendMode(NORMAL);
    }
}


function mouseClicked() {
    toggleTile(mouseX, mouseY);
    let data = {
        x: mouseX,
        y: mouseY
    };

    emit('mouse', data);
}

function emit(eventName, data) {
    io.emit(eventName, data, sessionId);
}

function draw() {
    background("#333333");

    drawMap();
    drawGrid();

    noLoop();
}


/*function {
    for (let col = 0; col < grid_cols; col++) {
        for (let row = 0; row < grid_rows; row++) {
	
	}
    }
}*/

function drawMap() {
    // loop over each cell
    for (let col = 0; col < grid_cols; col++) {
        for (let row = 0; row < grid_rows; row++) {

            // check the state of the cell
            let cellIsSet = sampleGrid(col, row);
            if (cellIsSet) {

                // draw the road
                if (road_checkbox.checked()) {
                    let score = getScore(col, row);
                    drawRoadTile(score, col, row);
                }

                // draw the overlay
                if (overlay_checkbox.checked()) {
                    blendMode(MULTIPLY);
                    fill(255, 0, 0);
                    noStroke();
                    let x = col * col_width;
                    let y = row * row_height;
                    rect(x, y, col_width, row_height);
                    blendMode(NORMAL);
                    emit('mouse', {
                        x: x,
                        y: y
                    });
                }
            }
        }
    }
}


// draw grid lines
function drawGrid() {
    stroke(255, 255, 255, 20);
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
