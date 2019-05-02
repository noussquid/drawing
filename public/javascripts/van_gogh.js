let sessionId = io.socket.sessionid;

// canvas settings
let canvas_width = 1493;
let canvas_height = 1200;


// grid settings
let grid;
let grid_cols = 47;
let grid_rows = 38;
let row_height = 32;
let col_width = 32;
let grid_settings = {};

// tile size 
let boxSize = 128;

let mainCanvas;
let gridCanvas;

let my_tile;
// An array of five colors, one for each finger
let colors;

let friends_tiles = [];
let friends_ellipses = [];
let friends_colors = [];

function preload() {
    sessionId = io.socket.sessionid;
    console.log(sessionId);
}

function setup() {
    console.log('we are in setup');

    if (this.sessonId == undefined) {
        sessionId = io.socket.sessionid;
        console.log(sessionId);
    }
    // Make the canvas the size of the mobile device screen
    mainCanvas = createCanvas(canvas_width, canvas_height);
    mainCanvas.parent('mainCanvas-div');
    mainCanvas.style('display', 'block');

    // An array of five colors, one for each finger
    colors = [color(255, 0, 0, 255), color(0, 255, 0, 255), color(0, 0, 255, 255), color(255, 255, 0, 255), color(0, 255, 255, 255)];



    // create a new Layer to load these Images onto
    gridCanvas = createGraphics(canvas_width, canvas_height);
    // generate a 2D array to hold the state of each grid cell
    grid = create2DArray(grid_cols, grid_rows, false);

    drawGrid();

    my_tile = createTile(sessionId);
    my_tile.position(this.screen.width / 2, this.screen.height / 2)
    my_tile.size(boxSize, boxSize);

    el = document.getElementById(sessionId);

    var mc_el = new Hammer.Manager(el);

    mc_el.add(new Hammer.Pan({
        threshold: 0,
        pointers: 0
    }));

    mc_el.add(new Hammer.Swipe()).recognizeWith(mc_el.get('pan'));
    mc_el.add(new Hammer.Rotate({
        threshold: 0
    })).recognizeWith(mc_el.get('pan'));

    mc_el.add(new Hammer.Pinch({
        threshold: 0
    })).recognizeWith([mc_el.get('pan'), mc_el.get('rotate')]);

    mc_el.add(new Hammer.Tap({
        event: 'doubletap',
        taps: 2
    }));

    mc_el.add(new Hammer.Tap());
    mc_el.on("panstart panmove panend", function(ev) {

        let grid_x;
        let grid_y;
        let found = false;
        console.log('pan ', ev);

        for (let col = 0; col < grid_cols; col++) {
            for (let row = 0; row < grid_rows; row++) {
                grid_x = col * col_width;
                grid_y = row * row_height;
                if (grid_x > ev.center.x && grid_y > ev.center.y) {
                    found = true;
                    grid_x = grid_x - col_width;
                    grid_y = grid_y - row_height;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        my_tile.elt.innerText = ev.type;
        my_tile.position(grid_x, grid_y);

        let data = {
            type: ev.type,
            x: grid_x,
            y: grid_y,
            w: 128,
            h: 128,
            id: sessionId
        };
        if (ev.type == 'panend') {
            console.log('panend data and sessionId sending data to friends', data, sessionId);

            emit('mouse', data, sessionId);

            /* emit('mouse', {
                type: ev.type,
                x: grid_x,
                y: grid_y,
                h: boxSize,
                w: boxSize,
                id: sessionId
            }, sessionId);*/
        }
    });

    mc_el.on("rotatestart rotatemove", function(ev) {
        console.log('rotatestart rotatemove ', ev);
        my_tile.elt.innerText = ev.type;

    });

    mc_el.on("pinchstart pinchmove", function(ev) {
        console.log('pinchstart pinchmove', ev);
        my_tile.elt.innerText = ev.type;

    });

    mc_el.on("tap", function(ev) {
        console.log('tap', ev);
        console.log(my_tile);

        my_tile.elt.innerText = ev.type;
        my_tile.style('color', 'blue');

        for (var i = 0; i < touches.length; i++) {

            txt.elt.innerText = txt.elt.innerText + touches[i].x + ' ' + touches[i].y;
            noStroke();
            // One color per finger
            fill(colors[i]);
            // Draw a circle at each finger
            ellipse(touches[i].x, touches[i].y, 24, 24);

            emit('mouse', {
                type: ev.type,
                x: touches[i].x,
                y: touches[i].y,
                w: 12,
                h: 12,
                color: colors[i],
                id: sessionId
            }, sessionId);
        }


    });

    mc_el.on("doubletap", function(ev) {
        my_tile.elt.innerText = ev.type;

    });

    mc_el.on("hammer.input", function(ev) {
        if (ev.isFinal) {
            console.log('ev is final...');
        }
    });

    myElement = document.getElementById('mainCanvas-div');

    // create a simple instance
    // by default, it only adds horizontal recognizers
    var mc = new Hammer(myElement);

    // Tap recognizer with minimal 2 taps
    mc.get('doubletap').set({
        enable: true
    });

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    mc.get('pan').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.get('pinch').set({
        enable: true
    });

    mc.get('rotate').set({
        enable: true
    });

    let txt;

    // crate tile
    mc.on("doubletap panleft panright panup pandown tap press pinch rotate", function(ev) {
        if (txt == undefined)
            txt = createDiv(ev.type + " gesture detected.");
        else
            txt.elt.innerText = ev.type + " gesture detected."

        txt.position(touches[touches.length - 1].x, touches[touches.length - 1].y);
    });

    io.on('mouse', function(data, sessionId) {
        console.log('received mouse data from friends! ', data);

        let updated = false;

        if (data.color != undefined) {
            data.color.rgba[3] = 120;
            friends_ellipses.push(ellipse(data.x, data.y, data.w, data.h));
            friends_colors.push(color(data.color.rgba));


            for (var i = 0; i < friends_ellipses.length; i++) {
                // One color per finger
                fill(friends_colors[i]);
                // Draw a circle at each finger
                friends_ellipses[i];
            }
        }

        let tile;
        if (data.type != 'tap') {
            console.log('not a tap!');
            console.log('data friends trying updating', data, friends_tiles, updated);
            console.log('data.id sessionId ', data.id, sessionId);


            for (var i = 0; i < friends_tiles.length; i++) {
                if (data.id != my_tile.id) {
                    // if a div for this sessionId exists
                    // update it
                    tile = document.getElementById(data.id);
                    console.log('friends tile is ', tile);
                    if (tile != undefined) {
                        console.log('updating friends tile ');
                        friends_tiles[i].position(data.x, data.y);
                        friends_tiles[i].size(data.w, data.h);
                        updated = true;
                        break;
                    }
                }

                if (updated)
                    break;
            }

            if (!updated) {
                console.log('creating a new friends tile');
                tile = createTile(sessionId);
                tile.position(data.x, data.y);
                tile.size(data.w, data.h);
                tile.innerText = 'friend!';
                tile.style("stroke", "red");
                tile.style("fill", "blue");
                tile.style("outline-color", "blue");
                tile.style("outline-width", 2);
                tile.style("outline-style", "solid");
                friends_tiles.push(tile);
            }
        }
    });
}


function createTile(id) {
    let tile = createDiv();
    tile.parent('mainCanvas-div');
    tile.elt.id = id;
    tile.style("stroke", "red");
    tile.style("fill", "blue");
    tile.textContent = ' Do Something ';
    tile.style("outline-color", "pink");
    tile.style("outline-width", 2);
    tile.style("outline-style", "solid");
    return tile;
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

function emit(eventName, data) {
    io.emit(eventName, data, sessionId);
}
