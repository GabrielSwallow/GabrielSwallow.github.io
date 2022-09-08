var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
var pauseButton = document.getElementById("pauseButton");
var resetButton = document.getElementById("resetButton");

var earthRadius = 6371000;
var mountainHeight = earthRadius * 0.165;
var newtonG = 6.67e-11;
var earthMass = 5.97e24;
var dt = 1;

listOfParticles = new Array(0);

canvasWidth = theCanvas.width;
var metersPerPixel = earthRadius / (0.355 * canvasWidth)

function setupCanvas() {
    theContext.beginPath();
    theContext.arc(canvasWidth/2, canvasWidth/2, 10, 0, 2*Math.PI);
    theContext.fillStyle = "black";
    theContext.fill();
}

function propagateParticle(particle) {
    for (let i = 0; i < 10; i++){
        var x = particle.x;
        var y = particle.y;
        var vx = particle.vx;
        var vy = particle.vy;

        var r = Math.sqrt(x*x + y*y);
        var accel = newtonG * earthMass / (r * r);
        var ax = -accel * x / r;
        var ay = -accel * y / r;
        particle.vx += ax * dt;
        particle.vy += ay * dt;
        particle.x += vx * dt;
        particle.y += vy * dt;
    }
}

function drawProjectile(particle) {
    var x = particle.x
    var y = particle.y
    var vx = particle.vx;
    var vy = particle.vy;

    var pixelX = theCanvas.width/2 + x/metersPerPixel;
    var pixelY = theCanvas.height/2 - y/metersPerPixel;

    theContext.beginPath();
    theContext.arc(pixelX, pixelY, 5, 0, 2*Math.PI);
    theContext.fillStyle = "red";
    theContext.fill();
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

var initialX = 0;
var initialY = 0;

theCanvas.onmousedown = (e) => {
    var rect = theCanvas.getBoundingClientRect();
    var canvasX = e.clientX - rect.x;
    var canvasY = e.clientY - rect.y;

    console.log(canvasX)

    initialX = (canvasX - theCanvas.width/2) * metersPerPixel;
    initialY = - (canvasY - theCanvas.height/2) * metersPerPixel;
}

theCanvas.onmouseup = (e) => {
    var rect = theCanvas.getBoundingClientRect();
    var canvasX = e.clientX - rect.x;
    var canvasY = e.clientY - rect.y;

    firedX = (canvasX - theCanvas.width/2) * metersPerPixel;
    firedY = - (canvasY - theCanvas.height/2) * metersPerPixel;

    var initialVx = (initialX - firedX)/300;
    var initialVy = (initialY - firedY)/300;

    console.log(initialVx);

    addParticle(firedX, firedY, initialVx, initialVy)
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
    setupCanvas();
    listOfParticles.length = 0;
}

function moveProjectiles() {
    if (!paused) {
        theContext.clearRect(0, 0, theCanvas.width, theCanvas.height);
        setupCanvas();
        for (let p = 0; p < listOfParticles.length; p++) {        
            propagateParticle(listOfParticles[p]);
            drawProjectile(listOfParticles[p]);
        }
        window.setTimeout(moveProjectiles, 1000/60);
    }
}

setupCanvas();
addParticle(5000, 0);
moveProjectiles();