var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");

var console = document.getElementById("console").innerHTML;

var earthRadius = 6371000;
var mountainHeight = earthRadius * 0.165;
var newtonG = 6.67e-11;
var earthMass = 5.97e24;
var dt = 1;

var x = 0;
var y = (earthRadius + mountainHeight)/3;
var vx = 8000;
var vy = 0;

canvasWidth = theCanvas.width;
var metersPerPixel = earthRadius / (0.355 * canvasWidth)
pixelX = 0;
pixelY = 0;

function propagateParticle() {
    for (let i = 0; i < 10; i++){
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

function updatePixelPosition() {
    pixelX = theCanvas.width/2 + x/metersPerPixel;
    pixelY = theCanvas.height/2 - y/metersPerPixel;
}

function drawProjectile() {
    theContext.clearRect(0, 0, theCanvas.width, theCanvas.height)
    theContext.beginPath();
    theContext.arc(pixelX, pixelY, 5, 0, 2*Math.PI);
    theContext.fillStyle = "red";
    theContext.fill();
}
    

function moveProjectile() {
    var console = document.getElementById("console").innerHTML = `${y}, \n ${pixelY}`;
    propagateParticle();
    updatePixelPosition();
    drawProjectile();
    window.setTimeout(moveProjectile, 1000/30);
}

moveProjectile();