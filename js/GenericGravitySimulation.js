var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");

var earthRadius = 6371000;
var mountainHeight = earthRadius * 0.165;
var newtonG = 6.67e-11;
var earthMass = 5.97e24;
var dt = 1;

Particle = {
    x: Number,
    y: Number,
    vx: Number,
    vy: Number,
}

listOfParticles = new Array(0);

canvasWidth = theCanvas.width;
var metersPerPixel = earthRadius / (0.355 * canvasWidth)

function setupCanvas() {
    theContext.beginPath();
    theContext.arc(canvasWidth/2, canvasWidth/2, 5, 0, 2*Math.PI);
    theContext.fillStyle = "red";
    theContext.fill();
}

function propagateParticle(particle) {
    for (let i = 0; i < 10; i++){
        x = particle.x
        y = particle.y
        vx = particle.vx;
        vy = particle.vy;

        var r = Math.sqrt(x*x + y*y);
        var accel = newtonG * earthMass / (r * r);
        var ax = -accel * x / r;
        var ay = -accel * y / r;
        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;
    }
}

function drawProjectile(particle) {
    x = particle.x
    y = particle.y
    vx = particle.vx;
    vy = particle.vy;

    var pixelX = theCanvas.width/2 + x/metersPerPixel;
    var pixelY = theCanvas.height/2 - y/metersPerPixel;

   

    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height)
    theContext.beginPath();
    theContext.arc(pixelX, pixelY, 5, 0, 2*Math.PI);
    theContext.fillStyle = "red";
    theContext.fill();
}

function addParticle(xPos, yPos) {
    
    newParticle = {
        x: xPos,
        y: yPos,
        vx: 6000,
        vy: 0,
    }
    listOfParticles.push(newParticle);
};

theCanvas.onmousedown = (e) => {
    var rect = theCanvas.getBoundingClientRect();

    var canvasX = e.clientX - rect.x;
    var canvasY = e.clientY - rect.y;

    var x = (canvasX - theCanvas.width/2) * metersPerPixel;
    var y = - (canvasY - theCanvas.height/2) * metersPerPixel;

    addParticle(x, y)
}

function moveProjectiles() {
    for (let p = 0; p < listOfParticles.length; p++) {        
        propagateParticle(listOfParticles[p]);
        drawProjectile(listOfParticles[p]);
    }
    window.setTimeout(moveProjectiles, 1000/30);
}

setupCanvas();
addParticle(200, 200);
moveProjectiles();