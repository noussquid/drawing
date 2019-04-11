let sessionId = io.socket.sessionid;
console.log(sessionId);

var myRec = new p5.SpeechRec(); // new P5.SpeechRec object
myRec.continuous = true; // do continuous recognition
myRec.interimResults = true; // allow partial recognition (faster, less accurate)

let systems;
let x, y;
let dx, dy;

let swan_files = [ '51426743-1.png',
  '51426743-10.png',
  '51426743-11.png',
  '51426743-12.png',
  '51426743-13.png',
  '51426743-14.png',
  '51426743-15.png',
  '51426743-16.png',
  '51426743-17.png',
  '51426743-18.png',
  '51426743-19.png',
  '51426743-2.png',
  '51426743-20.png',
  '51426743-3.png',
  '51426743-4.png',
  '51426743-5.png',
  '51426743-6.png',
  '51426743-7.png',
  '51426743-8.png',
  '51426743-9.png',
  'swan-21.png',
  'swan-22.png',
  'swan-23.png',
  'swan-24.png',
  'swan-25.png',
  'swan-26.png',
  'swan-27.png',
  'swan-28.png',
  'swan-29.png',
  'swan-30.png',
  'swan-31.png',
  'swan-32.png',
  'swan-33.jpg',
  'swan-33.png',
  'swan-35.png' ];

let swans = [];
let drawn_swans = [];
let drawn_text = [];
let img;

let paths = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
  systems = [];
	
	paths = {};

	x = width/2
	y = height/2
	dx = 0;
	dy = 0;

  textSize(32);
  textAlign(CENTER);
  text("say something", width/2, height/2);

  myRec.onResult = showResult;
  myRec.start();

  io.on('swan', function(data) {
		drawn_swans.push(data);
	});

	io.on('text', function(data) {
		drawn_text.push(data);
		text(data.word, data.coord_x, data.coord_y);

		if (data.word.indexOf('clear') !== -1) {
			background(255);
		}	
	});

	for (i = 0; i < swan_files.length; i++) {
		img = loadImage('images/' + swan_files[i]);
		swans.push(img);
	}	
}

function draw() {	
	if (drawn_swans != undefined) {
		for ( var i = 0; i < drawn_swans.length; i++ ) {
			img = swans[drawn_swans[i].image_num];
			coord_x = drawn_swans[i].coord_x;
			coord_y = drawn_swans[i].coord_y;
			image(img, coord_x, coord_y);
			drawn_swans.pop(drawn_swans[i].image_num);
		}
	}
	
	if (drawn_text != undefined) {
		for ( var i = 0; i < drawn_text.length; i++) {
			text(drawn_text[i].word, drawn_text[i].coord_x, drawn_text[i].coord_y);	
			drawn_text.pop(drawn_text[i]);
		}
	}

		ellipse(x, y, 5, 5);
		x+=dx;
		y+=dy;
		if(x<0) x = width;
		if(y<0) y = height;
		if(x>width) x = 0;
		if(y>height) y = 0;
}



function showResult() {
  if (myRec.resultValue == true) {
    console.log(myRec.resultString);
			
		coord_x = random(0, width);
		coord_y = random(0, height);

		var mostrecentword =  myRec.resultString.split(' ').pop();

		if ( mostrecentword.indexOf("clear") !== -1) {
			background(255);
			emit('text', { word:'clear', coord_x:0, coord_y:0 });
		} else if ( mostrecentword.indexOf("right") !== -1 ) {
			dx = 1;
			dy =0;
			emit('text', { word:'right', coord_x:x, coord_y:y, coord_dx:1, coord_dy:0 }, sessionId );
		} else if ( mostrecentword.indexOf("left") !== -1) {
			dx = -1;
			dy = 0;
			emit('text', { word:'left', coord_x:x, coord_y:y, coord_dx:-1, coord_dy:0 }, sessionId);
		} else if ( mostrecentword.indexOf("up") !== -1) {
			dx = 0;
			dy = -1;
			emit('text', { word:'up', coord_x:x, coord_y:y, coord_dx:0, coord_dy:1 }, sessionId);
		} else if ( mostrecentword.indexOf("down") !== -1) {
			dx = 0;
			dy = 1;
			emit('', { word:'down', coord_x:x, coord_y:y, coord_dx:0, coord_dy:-1 }, sessionId);
		}

		//if (myRec.resultString == 'swan' || myRec.resultString == 'Swan') {
		if ( myRec.resultString.includes('swan') || myRec.resultString.includes('Swan')) {
			console.log("swan was included: " + myRec.resultString);
			var image_num = Math.floor(random(0, 35));
			drawn_swans.push({ image_num: image_num, coord_x: coord_x, coord_y: coord_y});
			emit('swan', { image_num: image_num, coord_x: coord_x, coord_y: coord_y });
		} else { 
			console.log("swan was not found: " + myRec.resultString);
			drawn_text.push( { word: myRec.resultString, coord_x: coord_x, coord_y: coord_y });
			emit('text', { word: myRec.resultString, coord_x: coord_x, coord_y: coord_y });
		}
	}
}


function getRandomCoordinates() {

}

function parseResult(mostrecentword) {
		// recognition system will often append words into phrases.
		// so hack here is to only use the last word:
		var mostrecentword = myRec.resultString.split(' ').pop();
		if(mostrecentword.indexOf("left")!==-1) { dx=-1;dy=0; }
		else if(mostrecentword.indexOf("right")!==-1) { dx=1;dy=0; }
		else if(mostrecentword.indexOf("up")!==-1) { dx=0;dy=-1; }
		else if(mostrecentword.indexOf("down")!==-1) { dx=0;dy=1; }
		else if(mostrecentword.indexOf("clear")!==-1) { background(255); }
		console.log(mostrecentword);
}

function mousePressed() {
//  this.p = new ParticleSystem(createVector(mouseX, mouseY));
//  systems.push(p);
  let data = {
    x: mouseX, 
    y: mouseY
  };

  emit('mouse', data);
}

function emit(eventName, data) {
  io.emit(eventName, data, sessionId);
}

let Particle = function(position) {
  this.acceleration = createVector(0, 0.05);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 255.0;
};

Particle.prototype.run = function() {
  this.update();
  this.display();
};

// Method to update position
Particle.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function () {
  stroke(200, this.lifespan);
  strokeWeight(2);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function () {
  if (this.lifespan < 0) {
    return true;
  } else {
    return false;
  }
};

let ParticleSystem = function (position) {
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function () {
  // Add either a Particle or CrazyParticle to the system
  if (int(random(0, 2)) == 0) {
    p = new Particle(this.origin);
  }
  else {
    p = new CrazyParticle(this.origin);
  }
  this.particles.push(p);
};

ParticleSystem.prototype.run = function () {
  for (let i = this.particles.length - 1; i >= 0; i--) {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) {
      this.particles.splice(i, 1);
    }
  }
};

// A subclass of Particle

function CrazyParticle(origin) {
  // Call the parent constructor, making sure (using Function#call)
  // that "this" is set correctly during the call
  Particle.call(this, origin);

  // Initialize our added properties
  this.theta = 0.0;
};

// Create a Crazy.prototype object that inherits from Particle.prototype.
// Note: A common error here is to use "new Particle()" to create the
// Crazy.prototype. That's incorrect for several reasons, not least
// that we don't have anything to give Particle for the "origin"
// argument. The correct place to call Particle is above, where we call
// it from Crazy.
CrazyParticle.prototype = Object.create(Particle.prototype); // See note below

// Set the "constructor" property to refer to CrazyParticle
CrazyParticle.prototype.constructor = CrazyParticle;

// Notice we don't have the method run() here; it is inherited from Particle

// This update() method overrides the parent class update() method
CrazyParticle.prototype.update=function() {
  Particle.prototype.update.call(this);
  // Increment rotation based on horizontal velocity
  this.theta += (this.velocity.x * this.velocity.mag()) / 10.0;
}

// This display() method overrides the parent class display() method
CrazyParticle.prototype.display=function() {
  // Render the ellipse just like in a regular particle
  Particle.prototype.display.call(this);
  // Then add a rotating line
  push();
  translate(this.position.x, this.position.y);
  rotate(this.theta);
  stroke(255, this.lifespan);
  line(0, 0, 25, 0);
  pop();
}
