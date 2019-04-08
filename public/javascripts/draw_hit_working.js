var sessionId = io.socket.sessionid;

var values = {
	paths: 50,
	minPoints: 5,
	maxPoints: 15,
	minRadius: 30,
	maxRadius: 90
};

var hitOptions = {
	segments: true,
	stroke: true,
	fill: true,
	tolerance: 5
};

var radii = [73.8324583372208,53.93318802188837,64.10351733362965,46.68417998949975,48.24188811745783,50.61704400916256,47.67185108419274,88.5712519636397,45.43888736864359,67.92200797321112,44.824433936263155,73.98101554035739,50.37186874896477,46.38959214305841,55.3482714664834,61.711816620565706,80.92857468509672,81.4945182779719,44.24208653681608,87.35300365846597,40.418289870068214,69.08675039938586,83.44141831783256,62.6295355234162,31.25077488026635,75.30975496703988,72.30438280504745,68.49951303918402,66.25160653023356,40.85747450807248,43.199687173766115,77.15018433720716,39.20831177683625,39.148535777752556,63.3572506496244,61.640571475997156,65.31269040342637,55.124600259491885,54.40402264601873,55.69893824666013,48.97016090360543,78.70011363913218,40.33880459410709,65.72827861740605,89.4716090996219,45.938771350052406,74.2380245807471,72.94974855382782,60.86002783360395,53.17865376648076];

var segments = [8,13,7,7,12,7,7,10,8,9,6,10,10,14,8,10,8,13,12,9,10,13,5,6,7,9,12,8,13,12,14,10,5,7,11,7,13,11,9,11,9,8,7,6,5,6,7,5,5,12];

var centers = [{ width: 283.94335, height: 429.19216 },{ width: 471.90764, height: 238.47089 },{ width: 876.74795, height: 49.50166 },{ width: 768.59962, height: 325.78968 },{ width: 487.93201, height: 69.66601 },{ width: 289.62019, height: 174.91139 },{ width: 94.33487, height: 396.91674 },{ width: 792.80726, height: 299.68825 },{ width: 475.86005, height: 345.39218 },{ width: 754.56432, height: 478.53773 },{ width: 782.72446, height: 278.94287 },{ width: 657.93984, height: 43.93306 },{ width: 422.03172, height: 275.33151 },{ width: 860.46313, height: 451.07608 },{ width: 927.32485, height: 296.58745 },{ width: 836.15928, height: 159.02452 },{ width: 108.51113, height: 215.87086 },{ width: 257.06608, height: 292.26087 },{ width: 356.33871, height: 96.02754 },{ width: 23.47607, height: 373.26473 },{ width: 441.26362, height: 404.24515 },{ width: 750.5376, height: 47.69646 },{ width: 534.93912, height: 108.26804 },{ width: 570.97641, height: 78.12686 },{ width: 418.70216, height: 6.18083 },{ width: 424.20418, height: 292.95813 },{ width: 805.06587, height: 410.58702 },{ width: 131.07734, height: 7.66751 },{ width: 342.79009, height: 379.78674 },{ width: 278.37977, height: 128.5589 },{ width: 778.52087, height: 350.17907 },{ width: 132.65859, height: 124.61474 },{ width: 513.20434, height: 245.52518 },{ width: 807.41106, height: 335.76426 },{ width: 601.06039, height: 457.0141 },{ width: 457.72257, height: 513.86991 },{ width: 730.20199, height: 511.52776 },{ width: 390.82719, height: 375.47476 },{ width: 367.4906, height: 241.29596 },{ width: 112.71742, height: 187.98413 },{ width: 182.63948, height: 442.51772 },{ width: 345.87273, height: 179.22117 },{ width: 863.74807, height: 440.96764 },{ width: 102.31884, height: 280.46936 },{ width: 407.48976, height: 354.99915 },{ width: 22.47595, height: 104.47891 },{ width: 130.69006, height: 492.65816 },{ width: 123.38906, height: 421.11956 },{ width: 823.79957, height: 32.38572 },{ width: 212.77327, height: 172.53523 }];

// numbers to generate blob shapes and blob colors 
var seeds = [0.663013623365188,0.97172460894149,0.4372664493172371,0.3416947223092619,0.39325101628203385,0.4035313154315733,0.4258624573076266,0.7441388520641284,0.04877665167957035,0.4735253944156853,0.7490481575508631,0.08800248816204925,0.007363575606452288,0.8255870621850339,0.2276180902153927,0.970400410772621,0.31250939084092255,0.1681244657193417,0.9655155764836704,0.5167517220021941,0.050458085422850574,0.4750438834099946,0.4663155688022206,0.9473274569926874,0.8829227626303195,0.7543626913718419,0.06401989320984414,0.7601816379612898,0.3819362165358622,0.6372022206568592,0.9549842554578994,0.04173298606377296,0.602049728657848,0.09875680891620375,0.5046576386300649,0.5313315113160645,0.278244630073088,0.3257053500119671,0.44288894353178443,0.06361440754591119,0.15217327553382898,0.0655349178576009,0.4697825432399091,0.6270862989897072,0.729298916564714,0.7712297486124507,0.48237919526610884,0.6739106831650528,0.9403281916986181,0.2914149160648424]
createPaths();

function createPaths() {
	console.log("createPath");

	for (var i = 0; i < values.paths; i++) {
		point = new Point(centers[i]);
		var path = createBlob(point, radii[i], segments[i]);
		var lightness = (seeds[i] - 0.5) * 0.4 + 0.4;
		var hue = seeds[i] * 360;
		
		path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
		path.strokeColor = 'black';

	};
	console.log("end createPath");
}

function createBlob(center, maxRadius, points) {
	var path = new Path();
	path.closed = true;
	
	for (var i = 0; i < points; i++) {
		var delta = new Point({
			length: (maxRadius * 0.5) + (seeds[i] * maxRadius * 0.5),
			angle: (360 / points) * i
		});
		path.add(center + delta);
	}
	path.smooth();
	return path;
}
var paths = {};

var segment, path;
var movePath = false;

function onMouseDown(event) {
	startPath( event.point, "red", sessionId);
	emit("startPath", { point: event.point, color: "red" }, sessionId);
	
	/*segment = path = null;
	var hitResult = project.hitTest(event.point, hitOptions);
	
	if (!hitResult)
		return;


	if (hitResult) {
		path = hitResult.item;
		if (hitResult.type == 'segment') {
			segment = hitResult.segment;
		} else if (hitResult.type == 'stroke') {
			var location = hitResult.location;
			segment = path.insert(location.index + 1, event.point);
			path.smooth();
		}
	}
	movePath = hitResult.type == 'fill';
	if (movePath)
		project.activeLayer.addChild(hitResult.item);*/

	
}

function onMouseMove(event) {
	project.activeLayer.selected = false;
	if (event.item)
		event.item.selected = true;
}

function onMouseDrag(event) {
	console.log("continuePath");
	emit("continuePath", event.delta, sessionId);

	if (segment) {
		segment.point += event.delta;
		path.smooth();
	} else if (path) {
		path.position += event.delta;
	}
}

// -----------------
// Drawing functions
// Use to draw multiple users paths
// -----------------
function startPath( point, color, sessionId ) {
	console.log("startPath");
	
	segment = path = null;
	var hitResult = project.hitTest(point, hitOptions);
	
	if (!hitResult)
		return;


	if (hitResult) {
		console.log("we clicked on a blob");
		path = hitResult.item;
		paths[sessionId] = path;

		if (hitResult.type == 'segment') {
			console.log("clicking on a segment");
			segment = hitResult.segment;
		} else if (hitResult.type == 'stroke') {
			console.log("stroke");
			var location = hitResult.location;
			segment = paths[sessionId].insert(location.index + 1, point);
			paths[sessionId].smooth();
		}

		console.log("sessions");
		console.log(paths[sessionId]);
	}

	movePath = hitResult.type == 'fill';
	if (movePath)
		project.activeLayer.addChild(hitResult.item);

}

function continuePath(delta, sessionId) {

  var path = paths[sessionId];

	if (segment) {
		segment.point += delta;
		path.smooth();
	} else if (path) {
		path.position += delta;
  }
}

function endPath(point, sessionId) {

  var path = paths[sessionId];

  path.add(point);
  path.closed = true;
  path.smooth();

  delete paths[sessionId]

}


// Use to inform the server of user events
// -----------------
function emit(eventName, data) {

  io.emit(eventName, data, sessionId);

}


// On
// Draw other users paths
// -----------------
io.on( 'startPath', function( data, sessionId ) {

  startPath(data.point, data.color, sessionId);

})


io.on( 'continuePath', function( data, sessionId ) {

  continuePath(data, sessionId);
  view.draw();

})


io.on( 'endPath', function( data, sessionId ) {

  endPath(data.point, sessionId);
  view.draw();

})

