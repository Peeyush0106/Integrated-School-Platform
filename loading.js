// Setting
var canvas;
var point_positions = [];
var loadBallsSpeed = 3;
var point_last_movements_bool = [false, false, false, false, false];
var stoppedEllipses = [];
var stopping_pos;
var noOfBalls = 4;
var pointColors;

function setup() {
	canvas = createCanvas(windowWidth, 30);
	setPointPos();
	stopping_pos = canvas.width / 2;
}

function draw() {
	clear();
	if (loading_show) {
		showLoadingAnim();
		canvas.elt.style.display = "block";
	}
	else canvas.elt.style.display = "none";
}

function setPointPos() {
	for (var i = -200; i < -200 + (40 * noOfBalls); i += 40) {
		point_positions.push({ x: i, y: 15 });
	}
}

function showLoadingAnim() {
	for (var j = 0; j < point_positions.length; j++) {
		if (point_positions[j] !== null) {
			fill("blue");
			noStroke();
			ellipse(point_positions[j].x, point_positions[j].y, 12.5);
			point_positions[j].x += ((j + 10) * 4) * loadBallsSpeed / 10;
		}
		if (point_positions[j] !== null) {
			if (point_positions[j].x >= stopping_pos) {
				stoppedEllipses.push(point_positions[j]);
				point_positions[j] = null;
			}
		}
		else if (stoppedEllipses.length === noOfBalls) {
			displayStoppedEllipses("white");
			runStoppedEllipses();
		}
		else {
			displayStoppedEllipses("white");
		}
	}
	if (stoppedEllipses[0] !== undefined && stoppedEllipses[0].x >= canvas.width) {
		stoppedEllipses = [];
		point_positions = [];
		setPointPos();
	}
}

function isTouching(x1, x2, y1, y2, radius) {
	return (x1 - x2 < (radius + radius) / 2 &&
		x2 - x1 < (radius + radius) / 2 &&
		y1 - y2 < (radius + radius) / 2 &&
		y2 - y1 < (radius + radius) / 2)
}

function runStoppedEllipses() {
	for (var k = 0; k < stoppedEllipses.length; k++) {
		stoppedEllipses[k].x += ((k + 1) * 20) * loadBallsSpeed / 30;
	}
}

function displayStoppedEllipses(color) {
	for (var k = 0; k < stoppedEllipses.length; k++) {
		fill(color);
		noStroke();
		ellipse(stoppedEllipses[k].x, stoppedEllipses[k].y, 12.5);
	}
}