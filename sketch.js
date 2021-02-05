var camera;
var prevImg;
var currImg;
var diffImg;
var threshold;
var grid;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    camera = createCapture(VIDEO);
    camera.hide();
    threshold = 0.08;
    grid = new Grid(640, 480);
}

function draw() {
    background(120);
    image(camera, 0, 0);
    camera.loadPixels();

    var smallW = camera.width / 4;
    var smallH = camera.height / 4;

    currImg = createImage(smallW, smallH);
    currImg.copy(camera, 0, 0, camera.width, camera.height, 0, 0, smallW, smallH); // save current frame

    currImg.filter(GRAY);
    currImg.filter(BLUR, 3);

    diffImg = createImage(currImg.width, currImg.height);

    if (typeof prevImg !== 'undefined') {

        currImg.loadPixels();
        prevImg.loadPixels();
        diffImg.loadPixels();

        for (var x = 0; x < currImg.width; x += 1) {
            for (var y = 0; y < currImg.height; y += 1) {
                //magic happens here
                var index = (x + y * currImg.width) * 4;

                var redCurr = currImg.pixels[index];
                var redPrev = prevImg.pixels[index];
                var redDiff = Math.abs(redCurr - redPrev);

                diffImg.pixels[index] = redDiff;
                diffImg.pixels[index + 1] = redDiff;
                diffImg.pixels[index + 2] = redDiff;
                diffImg.pixels[index + 3] = 255;
            }

        }
        diffImg.updatePixels();

    }
    prevImg = createImage(currImg.width, currImg.height);
    prevImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, currImg.width, currImg.height);

    diffImg.filter(THRESHOLD, threshold);

    image(currImg, 640, 0);
    image(diffImg, 640 + smallW, 0);

    grid.update(diffImg);

}

function mousePressed() {

    threshold = map(mouseX, 0, camera.width, 1, 0); //controlling the threshold

}

var Grid = function (_w, _h) {
    this.diffImg = 0;
    this.noteWidth = 40;
    this.worldWidth = _w;
    this.worldHeight = _h;
    this.numOfNotesX = int(this.worldWidth / this.noteWidth);
    this.numOfNotesY = int(this.worldHeight / this.noteWidth);
    this.arrayLength = this.numOfNotesX * this.numOfNotesY;
    this.noteStates = [];
    this.noteStates = new Array(this.arrayLength).fill(0);
    this.colorArray = [];
    console.log(this);
    console.log(_w, _h);

    // set the original colors of the notes
    for (var i = 0; i < this.arrayLength; i++) {
        this.colorArray.push(color(random(170, 255), random(170, 255), random(170, 255), 150));

    }

    this.update = function (_img) {
        this.diffImg = _img;
        this.diffImg.loadPixels();
        for (var x = 0; x < this.diffImg.width; x += 1) {
            for (var y = 0; y < this.diffImg.height; y += 1) {
                var index = (x + (y * this.diffImg.width)) * 4;
                var state = diffImg.pixels[index + 0];
                if (state == 255) {
                    var screenX = map(x, 0, this.diffImg.width, 0, this.worldWidth);
                    var screenY = map(y, 0, this.diffImg.height, 0, this.worldHeight);
                    var noteIndexX = int(screenX / this.noteWidth);
                    var noteIndexY = int(screenY / this.noteWidth);
                    var noteIndex = noteIndexX + noteIndexY * this.numOfNotesX;
                    this.noteStates[noteIndex] = 1;
                }
            }
        }

        //aging the notes so things can change as time goes by
        for (var i = 0; i < this.arrayLength; i++) {
            this.noteStates[i] -= 0.05;
            this.noteStates[i] = constrain(this.noteStates[i], 0, 1);
        }

        this.draw();
    };

    // this is where each note is drawn
    // after that region has been activated
    this.draw = function () {
        push();
        noStroke();
        for (var x = 0; x < this.numOfNotesX; x++) {
            for (var y = 0; y < this.numOfNotesY; y++) {
                var posX = this.noteWidth / 2 + x * this.noteWidth;
                var posY = this.noteWidth / 2 + y * this.noteWidth;
                var noteIndex = x + (y * this.numOfNotesX);
                if (this.noteStates[noteIndex] > 0) {
                    fill(this.colorArray[noteIndex]);
                    rect(posX - 17, posY - 12, this.noteWidth / 1.5, this.noteWidth / 1.5);
                }
            }
        }
        pop();
    }
};
