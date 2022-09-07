var theCanvas = document.getElementById("theCanvas");
var theContext = theCanvas.getContext("2d");
theContext.beginPath();
theContext.arc(300, 50, 5, 0, 2*Math.PI);
theContext.fillStyle = "red";
theContext.fill();