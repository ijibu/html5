
var canvas = document.getElementById("canvas");
var touchable = 'createTouch' in document;
if (touchable) {
    canvas.addEventListener('touchstart', onTouchStart, false);
    canvas.addEventListener('touchmove', onTouchMove, false);
    canvas.addEventListener('touchend', onTouchEnd, false);
}
var canvasContext = canvas.getContext("2d");
var lastX, lastY;
var lastX2, lastY2;
canvasContext.lineWidth = 50;
canvasContext.lineCap = 'round';

function onTouchStart(event) {
    //do stuff
}

function onTouchMove(event) {
    // Prevent the browser from doing its default thing (scroll, zoom)
    //e.preventDefault();
    event.preventDefault();
    canvasContext.clearRect(lastX - 25, lastY - 25, 50, 50);
    canvasContext.clearRect(lastX2 - 25, lastY2 - 25, 50, 50);

    if (event.touches.length == 1) {
        canvasContext.strokeStyle = 'rgba(255, 127, 0, 1)';
        canvasContext.beginPath();
        canvasContext.moveTo(event.touches[0].clientX, event.touches[0].clientY);
        canvasContext.lineTo(event.touches[0].clientX, event.touches[0].clientY);
        canvasContext.stroke();
    }
    else if (event.touches.length == 2) {
        canvasContext.strokeStyle = 'rgba(255, 127, 0, 1)';
        canvasContext.beginPath();
        canvasContext.moveTo(event.touches[0].clientX, event.touches[0].clientY);
        canvasContext.lineTo(event.touches[0].clientX, event.touches[0].clientY);
        canvasContext.stroke();

        canvasContext.strokeStyle = 'rgba(0, 298, 168, 1)';
        canvasContext.beginPath();
        canvasContext.moveTo(event.touches[1].clientX, event.touches[1].clientY);
        canvasContext.lineTo(event.touches[1].clientX, event.touches[1].clientY);
        canvasContext.stroke();
        lastX2 = event.touches[1].clientX;
        lastY2 = event.touches[1].clientY;
    }
    lastX = event.touches[0].clientX;
    lastY = event.touches[0].clientY;
}

function onTouchEnd(event) {
    //do stuff
}