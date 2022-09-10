var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
var pauseButton = document.getElementById("pauseButton");
var resetButton = document.getElementById("resetButton");
var addTestParticleButton = document.getElementById("testParticle");
var addgravityObjectButton = document.getElementById("gravityObject");
var addReuplsiveObjectButton = document.getElementById("repulsiveObject");
var add10TestParticlesButton = document.getElementById("10testParticles");
var add100TestParticlesButton = document.getElementById("100testParticles");
var forceFieldGridEnnabledButton = document.getElementById("forceFieldButton")
var removeFastParticlesButton = document.getElementById("removeFastParticles");

var earthRadius = 1; // 6371000;
// var mountainHeight = earthRadius * 0.165;
var newtonG = 1; // 6.67e-11;
var earthMass = 10; // 5.97e24;
var dt = 0.1;

var listOfParticles = [];
var listOfForceObjects = [];
var forceFieldGrid = [];
var forceFieldGridMagnitude = [];


canvasWidth = theCanvas.width;
var metersPerPixel = 1; // earthRadius / (0.355 * canvasWidth);

var currentAddMode = "testParticle";
var forceFieldGridEnnabled = true;
var removeFastParticlesEnabled = false;

const gridSize = 12;

function updateCanvas() {
    for (let g = 0; g < listOfForceObjects.length; g++) {
        const {x, y, attractive} = listOfForceObjects[g];

        const pixelX = theCanvas.width/2 + x/metersPerPixel;
        const pixelY = theCanvas.height/2 - y/metersPerPixel;

        theContext.beginPath();
        theContext.arc(pixelX, pixelY, 10, 0, 2*Math.PI);
        if (attractive == +1) {theContext.fillStyle = "white"}
        else if (attractive == -1) {theContext.fillStyle = "black"}
        theContext.fill();
    }
    if (forceFieldGridEnnabled) {
        forceFieldGrid.length = 0;
        for (let i = 1; i < gridSize; i++) {
            var rowGrid = [];
            for (let j = gridSize -1 ; j > 0; j--) {
                var xGrid = -canvasWidth/2 + i * (canvasWidth/gridSize);
                var yGrid = -canvasWidth/2 + j * (canvasWidth/gridSize);
                var {ax, ay} = calculateAcceleration(xGrid, yGrid);
                rowGrid.push([ax, ay]);
            }
            forceFieldGrid.push(rowGrid)
        }
        forceFieldGridMagnitude = forceFieldGrid.map( 
            (row) => { 
                return row.map( 
                    ([ax,ay]) => {
                        return Math.sqrt(ax*ax + ay*ay) 
                    }   
                )
            }
        )
            
        var largestForce = Math.max(...[].concat(...forceFieldGridMagnitude))
        if (largestForce != 0) {
            var scaledForceFieldGrid = forceFieldGrid.map( 
                (row) => { 
                    return row.map(
                        ([ax,ay]) => {
                            return [50*ax/largestForce, 50*ay/largestForce] 
                        }
                    )
                }
            )
            theContext.beginPath();
            for (let i = 1; i < gridSize; i++) {
                for (let j = 1; j < gridSize; j++) {
                    var xGrid = i * (canvasWidth/gridSize);
                    var yGrid = j * (canvasWidth/gridSize);
                    var xFin = xGrid + scaledForceFieldGrid[i-1][j-1][0];
                    var yFin = yGrid - scaledForceFieldGrid[i-1][j-1][1];
                    canvas_arrow(theContext, xGrid, yGrid, xFin, yFin);
                }
            }
            theContext.stroke();
        }
    }
}

function calculateAcceleration(x, y) {
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

function propagateParticleEuler(particle) {
    for (let i = 0; i < 100; i++){
        if (particle.x > canvasWidth/2 || particle.x < -canvasWidth/2) {
            particle.vx = - particle.vx
        }
        if (particle.y > canvasWidth/2 || particle.y < -canvasWidth/2) {
            particle.vy = - particle.vy
        }

        const {x, y, vx, vy} = particle;
        const {ax, ay} = calculateAcceleration(particle.x, particle.y);
        particle.vx += ax * dt;
        particle.vy += ay * dt;
        particle.x += vx * dt;
        particle.y += vy * dt;
    }
}

function propagateParticleRungeKutta(particle) {
    for (let i = 0; i < 10; i++){
        const {x, y, vx, vy} = particle;

        var {deltaVx, deltaVy} = calculateChangeRungeKutta(vx, vy); 
        particle.vx += deltaVx;
        particle.vy += deltaVy;

        var {deltaX, deltaY} = calculateChangeRungeKutta(x, y);
        particle.x += deltaX;
        particle.y += deltaY;
    }
}

function calculateDeltaVxRungeKutta(x, y) {
    var {k1x, k1y} = calculateAcceleration(x, y);
    var {k2x, k2y} = calculateAcceleration(x + (k1x*dt/2), y + (k1y*dt/2));
    var {k3x, k3y} = calculateAcceleration(x + (k2x*dt/2), y + (k2y*dt/2));
    var {k4x, k4y} = calculateAcceleration(x + k3x*dt, y + k3y*dt);
    var deltaX = (k1x + 2*k2x + 2*k3x + k4x) * dt/6;
    var deltaY = (k1y + 2*k2y + 2*k3y + k4y) * dt/6;
    return {deltaX, deltaY};
}

function calculateDeltaXRungeKutta(x, y) {
    var {k1x, k1y} = calculateAcceleration(x, y);
    var {k2x, k2y} = calculateAcceleration(x + (k1x*dt/2), y + (k1y*dt/2));
    var {k3x, k3y} = calculateAcceleration(x + (k2x*dt/2), y + (k2y*dt/2));
    var {k4x, k4y} = calculateAcceleration(x + k3x*dt, y + k3y*dt);
    var deltaX = (k1x + 2*k2x + 2*k3x + k4x) * dt/6;
    var deltaY = (k1y + 2*k2y + 2*k3y + k4y) * dt/6;
    return {deltaX, deltaY};
}

function checkAndRemoveFastParticles(index) {
    const particle = listOfParticles[index]
    const speed = Math.sqrt(particle.vx*particle.vx + particle.vy*particle.vy);
    console.log(speed);
    if (speed > 3) { listOfParticles.splice(index, 1) }
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
        for (let p = 0; p<listOfParticles.length; p++) {    
            propagateParticleEuler(listOfParticles[p]);
            drawProjectile(listOfParticles[p]);
        }
        if (removeFastParticlesEnabled) {
            for (let p=0; p<listOfParticles.length; p++) {
                checkAndRemoveFastParticles(p);
            }
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

function addParticleBundle(num) {
    for (let i=0; i<num; i++){
        listOfParticles.push(
            {
                x: Math.random()*500 - 250,
                y: Math.random()*500 - 250,
                vx: Math.random() - 0.5,
                vy: Math.random() - 0.5,
            }
        );
    }
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

add10TestParticlesButton.onmouseup = () => {
    addParticleBundle(10);
}

add100TestParticlesButton.onmouseup = () => {
    addParticleBundle(100);
}

forceFieldGridEnnabledButton.onmouseup = () => {
    if (forceFieldGridEnnabled) { forceFieldGridEnnabled = false }
    else { forceFieldGridEnnabled = true }
}

removeFastParticles.onmouseup = () => {
    if (removeFastParticlesEnabled) { removeFastParticlesEnabled = false }
    else { removeFastParticlesEnabled = true }
}

moveProjectiles();


function canvas_arrow(context, fromx, fromy, tox, toy) {
  var headlen = 5; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}