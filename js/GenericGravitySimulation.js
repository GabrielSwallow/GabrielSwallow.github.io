var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
var pauseButton = document.getElementById("pauseButton");
var resetButton = document.getElementById("resetButton");
var addTestParticleButton = document.getElementById("testParticle");
var addgravityObjectButton = document.getElementById("gravityObject");
var addReuplsiveObjectButton = document.getElementById("repulsiveObject");

var earthRadius = 6371000;
var mountainHeight = earthRadius * 0.165;
var newtonG = 6.67e-11;
var earthMass = 5.97e24;
var dt = 1;

var listOfParticles = [];
var listOfForceObjects = [];

canvasWidth = theCanvas.width;
var metersPerPixel = earthRadius / (0.355 * canvasWidth);

var currentAddMode = "testParticle"; 

function updateCanvas() {
    for (let g = 0; g < listOfForceObjects.length; g++) {
        var {x, y, attractive} = listOfForceObjects[g];

        var pixelX = theCanvas.width/2 + x/metersPerPixel;
        var pixelY = theCanvas.height/2 - y/metersPerPixel;

        theContext.beginPath();
        theContext.arc(pixelX, pixelY, 10, 0, 2*Math.PI);
        if (attractive == +1) {theContext.fillStyle = "white"}
        else if (attractive == -1) {theContext.fillStyle = "black"}
        theContext.fill();
    }
    
}

function calculateAcceleration(particle) {
    // console.log(particle);
    const {x, y, vx, vy} = particle;
    const particleX = x;
    const particleY = y;

    var ax = 0;
    var ay = 0;

    for (let g = 0; g < listOfForceObjects.length; g++) {
        const {x, y, attractive} = listOfForceObjects[g];
        const gravX = x;
        const gravY = y;
        const xDiff = gravX - particleX;
        const yDiff = gravY - particleY;
        var r = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
        var accel = newtonG * earthMass / (r * r);
        ax += - attractive * accel * xDiff / r;
        ay += - attractive * accel * yDiff / r;
    }
    return {ax, ay};
}

function propagateParticle(particle) {
    for (let i = 0; i < 10; i++){
        const {x, y, vx, vy} = particle;
        const {ax, ay} = calculateAcceleration(particle);
        particle.vx += ax * dt;
        particle.vy += ay * dt;
        particle.x += vx * dt;
        particle.y += vy * dt;
    }
}

function drawProjectile(particle) {
    var {x, y, vx, vy} = particle;
    var pixelX = theCanvas.width/2 + x/metersPerPixel;
    var pixelY = theCanvas.height/2 - y/metersPerPixel;

    theContext.beginPath();
    theContext.arc(pixelX, pixelY, 5, 0, 2*Math.PI);
    theContext.fillStyle = "red";
    theContext.fill();
}

function moveProjectiles() {
    if (!paused) {
        theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
        updateCanvas(); 
        for (let p = 0; p < listOfParticles.length; p++) {    
            propagateParticle(listOfParticles[p]);
            drawProjectile(listOfParticles[p]);
        }
        window.setTimeout(moveProjectiles, 1000/60);
    }
}

function addParticle(x, y, vx, vy) {
    listOfParticles.push(
        {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
        }
    );
};

function addGravityObject(x, y) {
    if (currentAddMode == "gravityObject") {
        attractive = -1;
    } else if (currentAddMode == "repulsiveObject") {
        attractive = +1;
    }

    listOfForceObjects.push(
        {
            x: x,
            y: y,
            attractive: attractive,
        }
    )
}


var initialX = 0;
var initialY = 0;

theCanvas.onmousedown = (e) => {
    if (currentAddMode == "testParticle") {
        var rect = theCanvas.getBoundingClientRect();
        var canvasX = e.clientX - rect.x;
        var canvasY = e.clientY - rect.y;
        initialX = (canvasX - theCanvas.width/2) * metersPerPixel;
        initialY = - (canvasY - theCanvas.height/2) * metersPerPixel;
    }
}

theCanvas.onmouseup = (e) => {
    console.log("mouse up");
    if (currentAddMode == "testParticle") {
        var rect = theCanvas.getBoundingClientRect();
        var canvasX = e.clientX - rect.x;
        var canvasY = e.clientY - rect.y;

        var firedX = (canvasX - theCanvas.width/2) * metersPerPixel;
        var firedY = - (canvasY - theCanvas.height/2) * metersPerPixel;

        var initialVx = (initialX - firedX)/300;
        var initialVy = (initialY - firedY)/300;

        addParticle(firedX, firedY, initialVx, initialVy);

    } else {
        var rect = theCanvas.getBoundingClientRect();
        var canvasX = e.clientX - rect.x;
        var canvasY = e.clientY - rect.y;

        var x = (canvasX - theCanvas.width/2) * metersPerPixel;
        var y = - (canvasY - theCanvas.height/2) * metersPerPixel;

        addGravityObject(x, y);
    };
}

var paused = false;

pauseButton.onmouseup = () => {
    if (paused) {
        paused = false;
        moveProjectiles();
    } else {
        paused = true;
    }
}

resetButton.onmouseup = () => {
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
    updateCanvas();
    listOfParticles.length = 0;
    listOfForceObjects.length = 0;
}

addTestParticleButton.onmouseup = () => {
    currentAddMode = "testParticle";
}

addgravityObjectButton.onmouseup = () => {
    currentAddMode = "gravityObject";
}

addReuplsiveObjectButton.onmouseup = () => {
    currentAddMode = "repulsiveObject";
}

moveProjectiles();