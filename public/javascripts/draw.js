// -----------
// // Setup
// // -----------
//
var voronoi =  new Voronoi();

var sites = generateBeeHivePoints(view.size / 200, true);
var bbox, diagram;
var oldSize = view.size;
var spotColor = new Color('red');
var mousePos = view.center;
var selected = false;
var firstTime = true;

var selectedColor = randomColor();
console.log("randomColor: " + selectedColor);

// 
// -----------
// Setup
// -----------


// The faster the user moves their mouse
// the larger the circle will be
// We dont want it to be larger/smaller than this
tool.maxDistance = 2;
tool.maxDistance = 80;

// Each user has a unique session ID
// We'll use this to keep track of paths
var sessionId = io.socket.sessionid;

// Returns an object specifying a semi-random color
function randomColor() {
  
  return {
    hue: Math.random() * 360,
    saturation: 0.8,
    brightness: 0.8,
    alpha: 0.5
  };

}

// An object to keep track of each users paths
// We'll use session ID's as keys
paths = {};


onResize();

// -----------
// User Events
// -----------

// The user started a path
function onMouseDown(event) {
  // Create the new path
  var point = event.point;
  point.color = selectedColor; 
  sites.push( point);
  console.log("onMouseDown: " + point );
  console.log("onMouseDown point color: " + point.color);
  startPath( point, sessionId );

  // Inform the backend
  emit("startPath", {point: point }, sessionId);

}

function onMouseDrag(event) {
  var step        = event.delta / 2;
  step.angle     += 90; 
  var top         = event.middlePoint + step;
  var bottom      = event.middlePoint - step;

  continuePath( top, bottom, sessionId );

  // Inform the backend
  emit("continuePath", {top: top, bottom: bottom}, sessionId);

}

function onMouseUp(event) {
  endPath(event.point, sessionId);

  // Inform the backend
  emit("endPath", {point: event.point}, sessionId);

}


// -----------------
// Drawing functions
// Use to draw multiple users paths
// -----------------
function renderDiagram() {
     
      project.activeLayer.children = [];
      var diagram = voronoi.compute(sites, bbox);
      
      if (diagram) {
        for (var i = 0, l = sites.length; i < l; i++) {
            // using the index from the sites
            // get me a cell from the diagram
            var cell = diagram.cells[sites[i].voronoiId];
            
            if (cell) {
                var halfedges = cell.halfedges,
                length = halfedges.length;
                
                if (length > 2) {
                    var points = [];
                    if (sites[i].color == undefined) 
                        sites[i].color = spotColor;

                    points.color = sites[i].color;
                    for (var j = 0; j < length; j++) {
                        v = halfedges[j].getEndpoint();
                        v.color = sites[i].color;
                        points.push(new Point(v));
                    }

                    createPath(points, sites[i]);
                }
            }
        }   
     }
}

function removeSmallBits(path) {
      var averageLength = path.length / path.segments.length;
      var min = path.length / 50;

      for(var i = path.segments.length - 1; i >= 0; i--) {
              var segment = path.segments[i];
              var cur = segment.point;
              var nextSegment = segment.next;
              var next = nextSegment.point + nextSegment.handleIn;
              if (cur.getDistance(next) < min) {
                        segment.remove();
              }
            }
}

function generateBeeHivePoints(size, loose) {
    var points = [];
    var col = view.size / size;
      
    for(var i = -1; i < size.width + 1; i++) {
              
        for(var j = -1; j < size.height + 1; j++) {
                
            var point = new Point(i, j) / new Point(size) * view.size + col / 2;
            point.color = spotColor;

            if(j % 2)
                point += new Point(col.width / 2, 0);
                
            if (loose)
                point += (col / 4) * Point.random() - col / 4;
            points.push(point);
        }
    }
    return points;
}

function onResize() {
      var margin = 20;
      bbox = {
              xl: margin,
              xr: view.bounds.width - margin,
              yt: margin,
              yb: view.bounds.height - margin
            };

      for (var i = 0, l = sites.length; i < l; i++) {
              sites[i] = sites[i] * view.size / oldSize;
            }
      oldSize = view.size;
      renderDiagram();
}


function createPath(points, center) {
     
     
     path = new Path();
     path.fillColor = points.color;

     path.closed = true;

     for (var i = 0, l = points.length; i < l; i++) {
            var point = points[i];
            var next = points[(i + 1) == points.length ? 0 : i + 1];
            var vector = (next - point) / 2;
            path.add({
                point: point + vector,
                handleIn: -vector,
                handleOut: vector
             });
    }
    path.scale(0.95);
    removeSmallBits(path);
    return path;
}

function startPath( point, sessionId ) {
  console.log("startPath color: " + point);
  paths[sessionId] = new Path();
  paths[sessionId].add(point);
  sites.push(point);
  renderDiagram();
}

function continuePath(top, bottom, sessionId) {

  var path    = paths[sessionId];
  
  path.add(top);
  path.insert(0, bottom);

}


function endPath(point, sessionId) {
  var path = paths[sessionId];

  path.add(point);
  path.closed = true;
  path.smooth();

  
  delete paths[sessionId]

}



// -----------------
// Emit
// Use to inform the server of user events
// -----------------


function emit(eventName, data) {

  io.emit(eventName, data, sessionId);

}



// -----------------
// On
// Draw other users paths
// -----------------



io.on( 'startPath', function( data, sessionId ) {
  console.log("startPath");
  startPath(data.point, sessionId);
  
})


io.on( 'continuePath', function( data, sessionId ) {
  console.log("continuePath");
  continuePath(data.top, data.bottom, sessionId);
  view.draw();
  
})


io.on( 'endPath', function( data, sessionId ) {
  console.log("endPath");
  endPath(data.point, sessionId);
  view.draw();
  
})
