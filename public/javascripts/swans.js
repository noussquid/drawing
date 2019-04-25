let sessionId = io.socket.sessionid;
console.log(sessionId);


va = [];
let yvals = [];
let bvals = [];


myRec = new p5.SpeechRec();
let systems;

$.get('http://localhost/maindir/somedir', (data) => {
    console.log(data);
    let listing = parseDirectoryListing(data);
    console.log(listing);
});

function setup() {
    createCanvas(710, 400);
    systems = [];

    textSize(32);
    textAlign(CENTER);
    text("say something", width / 2, height / 2);

    myRec.onResult = showResult;
    myRec.start()
    io.on('mouse', function(data) {
        p = new ParticleSystem(createVector(data.x, data.y));
        systems.push(p);
    });
}

function draw() {
    background(237, 34, 93);

    for (let i = 1; i < width; i++) {
        xvals[i - 1] = xvals[i];
        yvals[i - 1] = yvals[i];
        bvals[i - 1] = bvals[i];
    }
    // Add the new values to the end of the array
    xvals[width - 1] = mouseX;
    yvals[width - 1] = mouseY;

    if (mouseIsPressed) {
        bvals[width - 1] = 0;
    } else {
        bvals[width - 1] = 255;
    }

    fill(255);
    noStroke();
    rect(0, height / 3, width, height / 3 + 1);

    for (let i = 1; i < width; i++) {
        stroke(255);
        point(i, xvals[i] / 3);
        stroke(0);
        point(i, height / 3 + yvals[i] / 3);
        stroke(255);
        line(
            i,
            (2 * height) / 3 + bvals[i] / 3,
            i,
            (2 * height) / 3 + bvals[i - 1] / 3
        );
    }
}

function showResult() {
    if (myRec.resultValue == true) {
        background(192, 255, 192);
        text(myRec.resultString, width / 2, height / 2);
        console.log(myRec.resultString);
    }
}

function mousePressed() {
    this.p = new ParticleSystem(createVector(mouseX, mouseY));
    systems.push(p);
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
Particle.prototype.update = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 2;
};

// Method to display
Particle.prototype.display = function() {
    stroke(200, this.lifespan);
    strokeWeight(2);
    fill(127, this.lifespan);
    ellipse(this.position.x, this.position.y, 12, 12);
};

// Is the particle still useful?
Particle.prototype.isDead = function() {
    if (this.lifespan < 0) {
        return true;
    } else {
        return false;
    }
};

let ParticleSystem = function(position) {
    this.origin = position.copy();
    this.particles = [];
};

ParticleSystem.prototype.addParticle = function() {
    // Add either a Particle or CrazyParticle to the system
    if (int(random(0, 2)) == 0) {
        p = new Particle(this.origin);
    } else {
        p = new CrazyParticle(this.origin);
    }
    this.particles.push(p);
};

ParticleSystem.prototype.run = function() {
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
CrazyParticle.prototype.update = function() {
    Particle.prototype.update.call(this);
    // Increment rotation based on horizontal velocity
    this.theta += (this.velocity.x * this.velocity.mag()) / 10.0;
}

// This display() method overrides the parent class display() method
CrazyParticle.prototype.display = function() {
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
