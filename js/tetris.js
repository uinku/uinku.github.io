/**
	* James Winkler
	* 2015/03/21
	* Tetris
	*
	* Move Left: LEFT
	* Move Right: RIGHT
	* Move Down: DOWN
	* Drop: UP
	* Rotate Left: Z
	* Rotate Right: X
	* Hold/Swap Hold Block: SHIFT
	* Pause: ENTER
	* F1: show controls
	*
	* Alternate keys below.
	*
	* No bonus for twists.
**/

/**
	* This work by James Winkler is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
	* http://creativecommons.org/licenses/by-nc-sa/4.0/
	* This work is not an official Tetris product nor does it have any affiliation with The Tetris Company.
**/

// Global variables
var c = document.getElementById("myCanvas");
var ctx = c.getContext('2d');
var width = c.width;
var height = c.height;

// Input Keys
var moveLeftKeys = [LEFT, "A", 100 /* Num4 */ ];
var moveRightKeys = [RIGHT, "D", 102 /* Num6 */ ];
var moveDownKeys = [DOWN, "S", 101 /* Num5 */ ];
var dropKeys = [UP, "W", 104 /* Num8 */ ];
var rotateLeftKeys = ["Z", "J", 96 /* Num0 */ ];
var rotateRightKeys = ["X", "K", 107 /* Num+ */ ];
var holdKeys = [16 /* SHIFT */ , "L", 98 /* Num2 */ ];
var pauseKeys = [ENTER, "P", ESC];

/** Game Variables ***/

var GameStates = {
	title: 0,
	controls: 1,
	play: 2
};
var gameState = GameStates.title;
var gameStateManager;

var elapsedTime = 0;
var startTime = millis();
var lastTime = startTime;
var lastMousePressed = mousePressed;
var isPaused = false;

var board;
var rows = 22;
var columns = 10;
var nextBlockCount = 3;
var blockSize = round(height / (rows + 2));
var uiTextSize = 14;

var textColor = color(237, 241, 242);
var gridFillColor = color(3, 11, 36);
var gridStrokeColor = color(14, 36, 74);
var gridOutlineColor = color(199, 210, 214);
var playerStrokeColor = color(224, 222, 217);
var ghostStrokeColor = color(1, 5, 18, 100);
var black = color(0);
var white = color(255);

strokeCap(SQUARE);

/** String Format Helper **/

if (!String.Format) {
	String.Format = function (format) {
		var args = Array.prototype.slice.call(arguments, 1);
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] !== undefined ? args[number] : match;
		});
	};
}

/** InputHelper **/

// key event listeners
var keyState = [];
var lastKeyState = [];
var heldKeyTimes = [];
void keyPressed() {
	keyState[keyCode] = true;
	if (heldKeyTimes[keyCode] === undefined) {
		heldKeyTimes[keyCode] = 0;
	}
};
void keyReleased() {
	keyState[keyCode] = false;
	heldKeyTimes[keyCode] = 0;
};
var lastMouseDownPosition = {
	x: -1,
	y: -1
};
void mousePressed() {
	lastMouseDownPosition = {
		x: mouseX,
		y: mouseY
	};
};

var Input = function () {};
Input.Keys = {
	moveLeft: 0,
	moveRight: 1,
	moveDown: 2,
	drop: 3,
	rotateLeft: 4,
	rotateRight: 5,
	hold: 6,
	pause: 7
};
Input.SetLastKeyState = function () {
	for (var i = 0; i < keyState.length; i++) {
		lastKeyState[i] = keyState[i];
	}
};

Input.SetLastKeyState();
Input.GetKeyCode = function (key) {
	//println(typeof key);
	var code;
	if (typeof key === "number") {
		code = key;
		} else if (typeof key === "string") {
		code = key.charCodeAt();
		} else {
		return false;
	}
	return code;
};
Input.WasAnyKeyPressed = function () {
	for (var i = 0; i < keyState.length; i++) {
		if (!lastKeyState[i] && keyState[i]) {
			return true;
		}
	}
	return false;
};
Input.CheckKeyWasPressed = function (key) {
	var code = Input.GetKeyCode(key);
	if (!lastKeyState[code] && keyState[code]) {
		return true;
	}
	return false;
};
Input.CheckKeyDown = function (key) {
	var code = Input.GetKeyCode(key);
	if (keyState[code]) {
		return true;
	}
	return false;
};
// returns true if any key in key index array was pressed
Input.WasKeyPressed = function (keyIndex) {
	if (keyIndex === Input.Keys.moveLeft) {
		for (var i = 0; i < moveLeftKeys.length; i++) {
			if (Input.CheckKeyWasPressed(moveLeftKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.moveRight) {
		for (var i = 0; i < moveRightKeys.length; i++) {
			if (Input.CheckKeyWasPressed(moveRightKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.moveDown) {
		for (var i = 0; i < moveDownKeys.length; i++) {
			if (Input.CheckKeyWasPressed(moveDownKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.drop) {
		for (var i = 0; i < dropKeys.length; i++) {
			if (Input.CheckKeyWasPressed(dropKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.rotateLeft) {
		for (var i = 0; i < rotateLeftKeys.length; i++) {
			if (Input.CheckKeyWasPressed(rotateLeftKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.rotateRight) {
		for (var i = 0; i < rotateRightKeys.length; i++) {
			if (Input.CheckKeyWasPressed(rotateRightKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.hold) {
		for (var i = 0; i < holdKeys.length; i++) {
			if (Input.CheckKeyWasPressed(holdKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.pause) {
		for (var i = 0; i < pauseKeys.length; i++) {
			if (Input.CheckKeyWasPressed(pauseKeys[i])) {
				return true;
			}
		}
		return false;
	}
};
Input.IsKeyDown = function (keyIndex) {
	if (keyIndex === Input.Keys.moveLeft) {
		for (var i = 0; i < moveLeftKeys.length; i++) {
			if (Input.CheckKeyDown(moveLeftKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.moveRight) {
		for (var i = 0; i < moveRightKeys.length; i++) {
			if (Input.CheckKeyDown(moveRightKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.moveDown) {
		for (var i = 0; i < moveDownKeys.length; i++) {
			if (Input.CheckKeyDown(moveDownKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.drop) {
		for (var i = 0; i < dropKeys.length; i++) {
			if (Input.CheckKeyDown(dropKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.rotateLeft) {
		for (var i = 0; i < rotateLeftKeys.length; i++) {
			if (Input.CheckKeyDown(rotateLeftKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.rotateRight) {
		for (var i = 0; i < rotateRightKeys.length; i++) {
			if (Input.CheckKeyDown(rotateRightKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.hold) {
		for (var i = 0; i < holdKeys.length; i++) {
			if (Input.CheckKeyDown(holdKeys[i])) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.pause) {
		for (var i = 0; i < pauseKeys.length; i++) {
			if (Input.CheckKeyDown(pauseKeys[i])) {
				return true;
			}
		}
		return false;
	}
};
Input.UpdateHeldKeyTimes = function (elapsedTime) {
	for (var i = 0; i < keyState.length; i++) {
		if (keyState[i] && i < lastKeyState.length && lastKeyState[i]) {
			heldKeyTimes[i] += elapsedTime;
		}
	}
};
// returns true if key was reset, not all keys needed/implemented
Input.ResetHeldKeyTime = function (keyIndex) {
	if (keyIndex === Input.Keys.moveLeft) {
		for (var i = 0; i < moveLeftKeys.length; i++) {
			heldKeyTimes[moveLeftKeys[i]] = 0;
		}
		return true;
		} else if (keyIndex === Input.Keys.moveRight) {
		for (var i = 0; i < moveRightKeys.length; i++) {
			heldKeyTimes[Input.GetKeyCode(moveRightKeys[i])] = 0;
		}
		return true;
		} else if (keyIndex === Input.Keys.moveDown) {
		for (var i = 0; i < moveDownKeys.length; i++) {
			heldKeyTimes[Input.GetKeyCode(moveDownKeys[i])] = 0;
		}
		return true;
		} else if (keyIndex === Input.Keys.rotateLeft) {
		for (var i = 0; i < rotateLeftKeys.length; i++) {
			heldKeyTimes[Input.GetKeyCode(rotateLeftKeys[i])] = 0;
		}
		return true;
		} else if (keyIndex === Input.Keys.rotateRight) {
		for (var i = 0; i < rotateRightKeys.length; i++) {
			heldKeyTimes[Input.GetKeyCode(rotateRightKeys[i])] = 0;
		}
		return true;
	}
	return false;
};
// returns true if held key time is greater or equal to time, not all keys needed/implemented
Input.IsKeyHeldForTime = function (keyIndex, time) {
	if (keyIndex === Input.Keys.moveLeft) {
		for (var i = 0; i < moveLeftKeys.length; i++) {
			if (heldKeyTimes[Input.GetKeyCode(moveLeftKeys[i])] >= time) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.moveRight) {
		for (var i = 0; i < moveRightKeys.length; i++) {
			if (heldKeyTimes[Input.GetKeyCode(moveRightKeys[i])] >= time) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.moveDown) {
		for (var i = 0; i < moveDownKeys.length; i++) {
			if (heldKeyTimes[Input.GetKeyCode(moveDownKeys[i])] >= time) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.rotateLeft) {
		for (var i = 0; i < rotateLeftKeys.length; i++) {
			if (heldKeyTimes[Input.GetKeyCode(rotateLeftKeys[i])] >= time) {
				return true;
			}
		}
		return false;
		} else if (keyIndex === Input.Keys.rotateRight) {
		for (var i = 0; i < rotateRightKeys.length; i++) {
			if (heldKeyTimes[Input.GetKeyCode(rotateRightKeys[i])] >= time) {
				return true;
			}
		}
		return false;
	}
};
// update all last states
Input.LateUpdate = function (elapsedTime) {
	Input.UpdateHeldKeyTimes(elapsedTime);
	Input.SetLastKeyState();
	lastMousePressed = mousePressed;
};

/** Random Int Helper **/

/// single arg returns random int between 0 and number
/// two args returns random int between numbers
/// both sets are n1 inclusive n2 exclusive
var GetRandomInt = function () {
	if (arguments === undefined) {
		return null;
	}
	if ((typeof arguments[0]) !== "number") {
		return null;
	}
	if (arguments.length === 1) {
		return floor(random(arguments[0]));
	}
	if ((typeof arguments[1]) !== "number") {
		return null;
	}
	return floor(random(arguments[0], arguments[1]));
};

/** Vector2 **/

var Vector2 = function (x, y) {
	this.x = x;
	this.y = y;
};
Vector2.prototype.Add = function (vector2) {
	this.x += vector2.x;
	this.y += vector2.y;
	return this;
};
Vector2.prototype.Sub = function (vector2) {
	this.x -= vector2.x;
	this.y -= vector2.y;
	return this;
};
Vector2.prototype.Scale = function (constant) {
	this.x *= constant;
	this.y *= constant;
	return this;
};
Vector2.prototype.Div = function (constant) {
	this.x /= constant;
	this.y /= constant;
	return this;
};

Vector2.prototype.Normalize = function () {
	// cannot normalize zero vector
	if (this.x === 0 && this.y === 0) {
		return null;
	}
	var hyp = sqrt(pow(this.x, 2) + pow(this.y, 2));
	hyp = 1 / hyp;
	
	this.x *= hyp;
	this.y *= hyp;
	return this;
};
Vector2.prototype.GetLength = function () {
	return sqrt(pow(this.x, 2) + pow(this.y, 2));
};
Vector2.prototype.GetDistance = function (vector2) {
	var a = new Vector2(this.x, this.y);
	a.Sub(vector2);
	return a.GetLength();
};
Vector2.prototype.GetDistanceSquared = function (vector2) {
	return pow(vector2.x - this.x, 2) + pow(vector2.y - this.y, 2);
};
Vector2.prototype.Clone = function () {
	return new Vector2(this.x, this.y);
};
Vector2.prototype.Equals = function (vector2) {
	return this.x === vector2.x && this.y === vector2.y;
};
Vector2.prototype.Zero = function () {
	return new Vector2(0, 0);
};
Vector2.prototype.Dot = function (v) {
	return this.x * v.x + this.y * v.y;
};
Vector2.prototype.GetAngle = function (v) {
	var dp = this.Dot(v);
	var mag = this.GetLength() * v.GetLength();
	return acos(dp / mag);
};
Vector2.prototype.toString = function (v) {
	return "x:" + this.x + " y:" + this.y;
};
Vector2.Plus = function (v1, v2) {
	return new Vector2(v1.x + v2.x, v1.y + v2.y);
};
Vector2.Minus = function (v1, v2) {
	return new Vector2(v1.x - v2.x, v1.y - v2.y);
};
Vector2.Times = function (v1, v2) {
	return new Vector2(v1.x * v2.x, v1.y * v2.y);
};
Vector2.Divide = function (v1, v2) {
	return new Vector2(v1.x / v2.x, v1.y / v2.y);
};
Vector2.Project = function (v1, v2) {
	var a = v1.Clone();
	var b = v2.Clone().Normalize();
	var s = a.Dot(b);
	return b.Scale(s);
};

/** Block Info **/

var I = [
[0, 0, 0, 0],
[1, 1, 1, 1],
[0, 0, 0, 0],
[0, 0, 0, 0]
];

var O = [
[1, 1],
[1, 1]
];

var T = [
[0, 1, 0],
[1, 1, 1],
[0, 0, 0], ];

var L = [
[0, 0, 1],
[1, 1, 1],
[0, 0, 0]
];

var J = [
[1, 0, 0],
[1, 1, 1],
[0, 0, 0]
];

var S = [
[0, 1, 1],
[1, 1, 0],
[0, 0, 0]
];

var Z = [
[1, 1, 0],
[0, 1, 1],
[0, 0, 0]
];

var blockShapes = [I, T, L, J, O, S, Z];
var startingBlockShapes = [I, T, L, J];
var blockColors = [
color(12, 196, 242), // I
color(175, 25, 250), // T
color(255, 128, 0), // L
color(81, 65, 252), // J
color(255, 217, 0), // O
color(165, 230, 0), // S
color(255, 0, 0) // Z
];

// returns a new matrix rotated counterclockwise
var RotateBlockLeft = function (shape) {
	var newShape = [];
	for (var x = 0; x < shape[0].length; x++) {
		newShape[x] = [];
		for (var y = 0; y < shape.length; y++) {
			newShape[x][y] = shape[y][x];
		}
	}
	newShape.reverse();
	return newShape;
};

// returns a new matrix rotated clockwise
var RotateBlockRight = function (shape) {
	var newShape = [];
	for (var x = 0; x < shape[0].length; x++) {
		newShape[x] = [];
		for (var y = 0; y < shape.length; y++) {
			newShape[x][y] = shape[y][x];
		}
		newShape[x].reverse();
	}
	return newShape;
};

// draw the time and level info
var DrawLevelInfo = function (millis, lines) {
	textSize(uiTextSize);
	fill(textColor);
	var milliseconds = parseInt((millis % 1000) / 10, 10),
	seconds = parseInt((millis / 1000) % 60, 10),
	minutes = parseInt((millis / (1000 * 60)) % 60, 10),
	hours = parseInt((millis / (1000 * 60 * 60)) % 24, 10);
	
	milliseconds = (milliseconds < 10) ? "0" + milliseconds : milliseconds;
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	
	var time = "Time:\n" + minutes + ":" + seconds + "." + milliseconds;
	var lines = "Lines:\n" + lines.toString();
	var x = blockSize * 1;
	var y = blockSize * 3;
	text(time, x, y);
	y += 45;
	text(lines, x, y);
};

var boxLabelOffset = -12;
// scaled tile size used in drawing next and hold blocks
var scaledSize = floor(blockSize * 0.8);
var boxMarginX = floor(scaledSize * 1.5);

// draw the next blocks in the queue
var DrawNextBlocks = function (blockList) {
	//var scaledSize = floor(blockSize * 0.8);
	var boxWidth = scaledSize * 6; // max shape width - 4 + 2
	var boxHeight = scaledSize * 14; // max shape height - 4 * 3 + 2
	var marginY = floor(blockSize * 3.5);
	var x = width * 0.5 + columns * blockSize * 0.5 + boxMarginX;
	var y = height - boxHeight - marginY;
	
	pushMatrix();
	translate(x, y);
	
	// text
	var txt = "Next";
	textSize(uiTextSize);
	fill(textColor);
	text(txt, (boxWidth - textWidth(txt)) * 0.5, boxLabelOffset);
	
	// box
	strokeCap(ROUND);
	strokeWeight(2);
	stroke(gridOutlineColor);
	fill(gridFillColor);
	rect(0, 0, boxWidth, boxHeight);
	
	// blocks
	noStroke();
	var l = blockList.length >= nextBlockCount ? nextBlockCount : blockList.length;
	var offsetY = scaledSize * -3;
	for (var k = 0; k < l; k++) {
		var index = blockList[k];
		var c = blockColors[index];
		fill(color(red(c), green(c), blue(c), 255 - 80 * k)); // 80 opacity reduction
		var shape = blockShapes[index];
		for (var j = 0; j < shape.length; j++) {
			var offsetX = floor(scaledSize * (6 - shape[j].length) * 0.5);
			for (var i = 0; i < shape[j].length; i++) {
				if (shape[j][i] === 0) {
					continue;
				}
				rect(i * scaledSize + offsetX, 4 * (l - k) * scaledSize + (j + 1) * scaledSize + offsetY, scaledSize, scaledSize);
			}
		}
	}
	
	popMatrix();
};

var DrawHoldBlock = function (block) {
	var s = 6; // max shape width - 4 + 2
	var boxWidth = scaledSize * s;
	var boxHeight = scaledSize * s;
	var marginY = floor(blockSize * 5.5);
	var x = width * 0.5 - columns * blockSize * 0.5 - boxWidth - boxMarginX;
	var y = height - boxHeight - marginY;
	
	pushMatrix();
	translate(x, y);
	
	// text
	var txt = "Hold";
	textSize(uiTextSize);
	fill(textColor);
	text(txt, (boxWidth - textWidth(txt)) * 0.5, boxLabelOffset);
	
	// box
	strokeCap(ROUND);
	strokeWeight(2);
	stroke(gridOutlineColor);
	fill(gridFillColor);
	rect(0, 0, boxWidth, boxHeight);
	
	// draw block
	noStroke();
	if (block !== null) {
		translate(floor(scaledSize * (s - block.shape[0].length) * 0.5), floor(scaledSize * (s - block.shape.length) * 0.5));
		strokeWeight(1);
		stroke(block.color);
		fill(block.color);
		for (var j = 0; j < block.shape.length; j++) {
			for (var i = 0; i < block.shape[j].length; i++) {
				if (block.shape[j][i] !== 0) {
					rect(i * scaledSize, j * scaledSize, scaledSize, scaledSize);
				}
			}
		}
	}
	
	popMatrix();
};

var halfBlockSize = floor(blockSize * 0.5);
var innerBlockSize = ceil(blockSize * 0.6);
var innerBlockOffset = floor((blockSize - innerBlockSize) / 2);

var LerpWhite = function (inputColor, percent) {
	return lerpColor(inputColor, white, percent);
};

var LerpBlack = function (inputColor, percent) {
	return lerpColor(inputColor, black, percent);
};

// used to draw block shading
var blockColorsVariants = [
[color(126, 231, 252), color(65, 215, 252), color(0, 143, 204), color(0, 105, 186)],
[color(209, 117, 255), color(195, 81, 252), color(138, 0, 207), color(90, 0, 135)],
[color(252, 199, 65), color(255, 172, 38), color(222, 84, 24), color(191, 38, 0)],
[color(107, 139, 255), color(81, 104, 252), color(27, 15, 196), color(42, 2, 135)],
[color(255, 244, 140), color(255, 236, 69), color(245, 159, 0), color(255, 128, 0)],
[color(235, 255, 56), color(207, 250, 50), color(111, 201, 0), color(81, 173, 0)],
[color(255, 139, 107), color(255, 74, 54), color(207, 0, 45), color(194, 0, 71)], ];

// draws a block square with four directional shading
var DrawBlockSquare = function (x, y, color, strkColor) {
	var index = blockColors.indexOf(color);
	pushMatrix();
	translate(x, y);
	// backing square
	if (strkColor !== undefined) {
		strokeWeight(2);
		stroke(strkColor);
		} else {
		noStroke();
	}
	fill(color);
	rect(0, 0, blockSize, blockSize);
	// triangles
	noStroke();
	fill(blockColorsVariants[index][0]);
	triangle(0, 0, blockSize, 0, halfBlockSize, halfBlockSize);
	fill(blockColorsVariants[index][2]);
	triangle(blockSize, 0, blockSize, blockSize, halfBlockSize, halfBlockSize);
	fill(blockColorsVariants[index][3]);
	triangle(blockSize, blockSize, 0, blockSize, halfBlockSize, halfBlockSize);
	fill(blockColorsVariants[index][1]);
	triangle(0, blockSize, 0, 0, halfBlockSize, halfBlockSize);
	// inner square
	fill(color);
	rect(innerBlockOffset, innerBlockOffset, innerBlockSize, innerBlockSize);
	popMatrix();
};

/** Block **/

var Block = function (position, shapeIndex) {
	this.position = position;
	this.shapeIndex = shapeIndex;
	this.shape = blockShapes[shapeIndex].slice();
	this.color = blockColors[shapeIndex];
	this.canFloorKick = true;
	
	// set shape and color
	this.SetBlockType = function (shapeIndex) {
		this.shapeIndex = shapeIndex;
		this.shape = blockShapes[shapeIndex].slice();
		this.color = blockColors[shapeIndex];
	};
	
	this.RotateLeft = function () {
		this.shape = RotateBlockLeft(this.shape);
	};
	
	this.RotateRight = function () {
		this.shape = RotateBlockRight(this.shape);
	};
	
	this.MoveLeft = function () {
		this.position.x--;
	};
	
	this.MoveRight = function () {
		this.position.x++;
	};
	
	this.MoveDown = function () {
		this.position.y--;
	};
	
	this.Update = function () {};
};

/** Board **/

var Board = function () {
	this.grid = [];
	this.emptyRow = [];
	this.Offset = new Vector2();
	this.failStateReached = false;
	this.bottomMargin = height / 15;
	this.hiddenRows = 2;
	
	this.blockList = [];
	this.player = new Block(new Vector2(), 0);
	this.ghostBlock = new Block(new Vector2(), 0);
	this.ghostBlockOpacity = 95;
	this.ghostBlockStroke = color(0, 0, 0, this.ghostBlockOpacity);
	this.holdBlock = null;
	this.canHoldBlock = true;
	
	this.time = 0;
	this.level = 0;
	this.moveDownTimer = 0;
	this.moveDownTimes = [1000];
	this.moveDownTime = this.moveDownTimes[this.level];
	this.moveDownScale = 0.975;
	this.minMoveDownTime = 0.1;
	this.failStateTimer = 0;
	
	this.lightRadius = 5;
	this.lightColor = color(168, 222, 255);
	this.maxLightOpacity = 90;
	
	this.moveDelayTime = 100; // move delay
	this.rotateDelayTime = 250; // rotate delay
	
	// generates a randomized order of all blocks
	this.GenerateBlockList = function (isFirstList) {
		var availableBlockIndices = [];
		for (var i = 0; i < blockShapes.length; i++) {
			availableBlockIndices[i] = i;
		}
		
		// only allow starting blocks for first block if this is the first list generated
		if (isFirstList) {
			var index = GetRandomInt(startingBlockShapes.length);
			this.blockList.push(availableBlockIndices.splice(index, 1));
		}
		
		// loop through remaining available block and randomly add them to blockList
		while (availableBlockIndices.length > 0) {
			var index = GetRandomInt(availableBlockIndices.length);
			this.blockList.push(availableBlockIndices.splice(index, 1));
		}
	};
	
	// sets all grid squares to empty
	this.ClearGrid = function () {
		for (var j = 0; j < this.grid.length; j++) {
			for (var i = 0; i < this.grid[0].length; i++) {
				this.grid[j][i] = -1;
			}
		}
	};
	
	this.Reset = function () {
		this.failStateReached = false;
		this.ClearGrid();
		
		this.blockList = [];
		this.time = 0;
		this.level = 0;
		this.moveDownTimer = 0;
		this.moveDownTime = this.moveDownTimes[this.level];
		this.SetNewPlayerBlock();
		this.SetGhostBlock();
		this.holdBlock = null;
		this.canHoldBlock = true;
		this.failStateTimer = 0;
	};
	
	this.ResetMoveTimer = function () {
		this.moveDownTimer = 0;
	};
	
	// called when a spawned block overlaps a grid block or lock happens offscreen
	this.FailStateReached = function () {
		this.failStateReached = true;
	};
	
	// returns true if block does not overlap any filled grid squares
	this.IsValidPosition = function (position, shape) {
		var worldX, worldY;
		for (var j = 0; j < shape.length; j++) {
			worldY = position.y - j;
			if (worldY >= rows) {
				continue;
			}
			for (var i = 0; i < shape[j].length; i++) {
				worldX = position.x + i;
				if (shape[j][i] !== 0) {
					if (worldX < 0 || worldX >= columns) {
						return false;
					}
					if (worldY < 0) {
						return false;
					}
					if (this.grid[worldY][worldX] !== -1) {
						return false;
					}
				}
			}
		}
		return true;
	};
	
	// returns false if all block squares are offscreen
	this.IsValidLockedPosition = function (position, shape) {
		if (position.y > rows - this.hiddenRows) {
			return false;
		}
		var worldX, worldY;
		var squaresOOB = 0;
		var filledSquares = 0;
		for (var j = 0; j < shape.length; j++) {
			worldY = position.y - j;
			for (var i = 0; i < shape[j].length; i++) {
				worldX = position.x + i;
				if (shape[j][i] !== 0) {
					filledSquares++;
					if (worldY >= rows - this.hiddenRows) {
						squaresOOB++;
					}
				}
			}
		}
		return squaresOOB !== filledSquares;
	};
	
	// returns true if spawn position does not overlap any filled grid squares
	this.SetNewPlayerBlock = function () {
		// get next block in block list, if list is empty generate new list
		if (this.blockList.length <= nextBlockCount) {
			this.GenerateBlockList();
		}
		var shapeIndex = this.blockList.shift();
		
		this.player.SetBlockType(shapeIndex);
		this.player.position.x = floor((columns - this.player.shape[0].length) / 2);
		this.player.position.y = this.grid.length - 1;
		this.player.canFloorKick = true;
		
		this.SetGhostBlock();
		
		if (this.IsValidPosition(this.player.position, this.player.shape)) {
			return true;
		}
		return false;
	};
	
	// sets ghost block to player's position, shape, and lower opacity color
	this.SetGhostBlock = function () {
		this.ghostBlock = new Block(this.player.position.Clone(), this.player.shapeIndex);
		var c = this.ghostBlock.color;
		this.ghostBlock.color = color(red(c), green(c), blue(c), this.ghostBlockOpacity);
	};
	
	// updates ghost block to player's position and shape, drops down
	this.UpdateGhostBlock = function () {
		this.ghostBlock.position = this.player.position.Clone();
		this.ghostBlock.shape = this.player.shape.slice();
		while (this.CanBlockMoveDown(this.ghostBlock)) {
			this.ghostBlock.MoveDown();
		}
	};
	
	// sets the player block to a specified index and sets the ghost block
	this.SetPlayerBlockType = function (index) {
		this.player.SetBlockType(index);
		this.SetGhostBlock();
	};
	
	// initializes grid, player, and block list
	this.Initialize = function () {
		// initialize grid
		for (var j = 0; j < rows; j++) {
			this.grid[j] = [];
			for (var i = 0; i < columns; i++) {
				this.grid[j][i] = -1;
			}
		}
		// create empty row used in clearing lines
		this.emptyRow = this.grid[0].slice();
		
		this.GenerateBlockList(true);
		this.SetNewPlayerBlock();
	};
	
	// returns true if all squares in row are filled
	this.IsRowFull = function (index) {
		var l = this.grid[index].length;
		var filledSquares = 0;
		for (var i = 0; i < l; i++) {
			if (this.grid[index][i] !== -1) {
				filledSquares++;
			}
		}
		return filledSquares === l;
	};
	
	// removes line, moves all other rows down
	this.RemoveClearedLine = function (index) {
		this.grid.splice(index, 1);
		this.grid.push(this.emptyRow.slice());
	};
	
	// checks for cleared lines and removes them, updates level and move down timer
	this.CheckLineClears = function () {
		var clearedLines = [];
		
		// check cleared lines, add cleared lines to list
		for (var i = this.grid.length - 1; i >= 0; i--) {
			if (this.IsRowFull(i)) {
				clearedLines.push(i);
			}
		}
		var lines = clearedLines.length;
		
		// reset timer
		if (lines > 0) {
			this.ResetMoveTimer();
		}
		// remove all cleared lines
		for (var i = 0; i < lines; i++) {
			this.RemoveClearedLine(clearedLines[i]);
		}
		
		// update level
		this.level += lines;
		
		// update move down time
		for (var i = 0; i < lines; i++) {
			this.moveDownTime *= this.moveDownScale;
		}
		if (this.moveDownTime < this.minMoveDownTime) {
			this.moveDownTime = this.minMoveDownTime;
		}
	};
	
	// adds the player block squares to the grid and sets can hold block to true
	this.LockPlayerBlock = function () {
		this.canHoldBlock = true;
		var px = this.player.position.x;
		var py = this.player.position.y;
		for (var y = 0; y < this.player.shape.length; y++) {
			for (var x = 0; x < this.player.shape[y].length; x++) {
				if (this.player.shape[y][x] === 1) {
					this.grid[py - y][px + x] = this.player.shapeIndex;
				}
			}
		}
	};
	
	// returns true if can move left
	this.CanPlayerMoveLeft = function () {
		var pos = this.player.position.Clone();
		pos.x--;
		return this.IsValidPosition(pos, this.player.shape);
	};
	
	// returns true if can move right
	this.CanPlayerMoveRight = function () {
		var pos = this.player.position.Clone();
		pos.x++;
		return this.IsValidPosition(pos, this.player.shape);
	};
	
	// returns true if can move down
	this.CanBlockMoveDown = function (block) {
		var pos = block.position.Clone();
		pos.y--;
		return this.IsValidPosition(pos, this.player.shape);
	};
	
	// tries to move the player down
	// locks the player block if false and resets player
	this.MovePlayerDown = function () {
		if (this.CanBlockMoveDown(this.player)) {
			this.player.MoveDown();
		}
		// lock player block if cannot move down
		else {
			this.LockPlayerBlock();
			if (!this.IsValidLockedPosition(this.player.position, this.player.shape)) {
				this.FailStateReached();
				return false;
			}
			this.CheckLineClears();
			if (!this.SetNewPlayerBlock()) {
				this.FailStateReached();
				return false;
			}
		}
		this.ResetMoveTimer();
		return true;
	};
	
	// if cannot move down further, locks player block
	// else drops the player until adajacent to filled grid square below
	this.DropPlayer = function () {
		if (!this.CanBlockMoveDown(this.player)) {
			this.MovePlayerDown();
			} else {
			while (this.CanBlockMoveDown(this.player)) {
				this.player.MoveDown();
			}
		}
		this.ResetMoveTimer();
	};
	
	// returns true if new position is valid
	this.IsValidRotationWithNewPosition = function (position, shape) {
		if (this.IsValidPosition(position, shape)) {
			this.player.position = position;
			this.player.shape = shape;
			return true;
		}
		return false;
	};
	
	this.TryRotationWithNewPositions = function (newShape) {
		var newPosition;
		// set number of tries to
		var l = ceil(newShape.length * 0.5) + 1;
		for (var i = 1; i < l; i++) {
			// try right
			newPosition = new Vector2(this.player.position.x + i, this.player.position.y);
			if (this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				return true;
			}
			// try left
			newPosition = new Vector2(this.player.position.x - i, this.player.position.y);
			if (this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				return true;
			}
			// try down
			newPosition = new Vector2(this.player.position.x, this.player.position.y - i);
			if (this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				return true;
			}
			// try up only if player has not floor kicked with current block
			newPosition = new Vector2(this.player.position.x, this.player.position.y + i);
			if (this.player.canFloorKick && this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				this.player.canFloorKick = false;
				return true;
			}
			// try right down
			newPosition = new Vector2(this.player.position.x + i, this.player.position.y - 1);
			if (this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				return true;
			}
			// try left down
			newPosition = new Vector2(this.player.position.x - i, this.player.position.y - 1);
			if (this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				return true;
			}
			// try right up
			newPosition = new Vector2(this.player.position.x + 1, this.player.position.y + i);
			if (this.player.canFloorKick && this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				return true;
			}
			// try down up
			newPosition = new Vector2(this.player.position.x - 1, this.player.position.y + i);
			if (this.player.canFloorKick && this.IsValidRotationWithNewPosition(newPosition, newShape)) {
				this.player.canFloorKick = false;
				return true;
			}
		}
		return false;
	};
	
	// only called after swapping with hold block
	// tries to find a valid location for swapped block and swaps if it can
	this.FindValidPlayerPosition = function () {
		var shape = this.player.shape;
		if (this.IsValidPosition(this.player.position, shape)) {
			return true;
		}
		// try other rotations
		for (var i = 0; i < 3; i++) {
			shape = RotateBlockRight(shape);
			if (this.TryRotationWithNewPositions(shape)) {
				return true;
			}
		}
		return false;
	};
	
	// sets hold block if null, else if can swap, swaps current block with hold block
	this.SwapHoldBlock = function (index) {
		if (this.holdBlock === null) {
			this.holdBlock = new Block(new Vector2(), this.player.shapeIndex);
			this.SetNewPlayerBlock();
			this.ResetMoveTimer();
			} else if (this.canHoldBlock) {
			var playerShapeIndex = this.player.shapeIndex;
			var originalPlayerShape = this.player.shape;
			this.SetPlayerBlockType(this.holdBlock.shapeIndex);
			this.holdBlock.SetBlockType(playerShapeIndex);
			// can find valid position for swapped hold block
			if (this.FindValidPlayerPosition()) {
				this.ResetMoveTimer();
			}
			// cannot find valid postion for hold block, switch back
			else {
				playerShapeIndex = this.player.shapeIndex;
				this.SetPlayerBlockType(this.holdBlock.shapeIndex);
				this.player.shape = originalPlayerShape;
				this.holdBlock.SetBlockType(playerShapeIndex);
			}
			this.canHoldBlock = false;
		}
	};
	
	// tries to rotate the player block counter clockwise
	this.RotatePlayerLeft = function () {
		var newShape = RotateBlockLeft(this.player.shape);
		if (this.IsValidPosition(this.player.position, newShape)) {
			this.player.shape = newShape;
			return;
		}
		this.TryRotationWithNewPositions(newShape);
	};
	
	// tries to rotate the player block clockwise
	this.RotatePlayerRight = function () {
		var newShape = RotateBlockRight(this.player.shape);
		if (this.IsValidPosition(this.player.position, newShape)) {
			this.player.shape = newShape;
			return;
		}
		this.TryRotationWithNewPositions(newShape);
	};
	
	this.ProcessPlayerInput = function () {
		// rotate
		if (Input.WasKeyPressed(Input.Keys.rotateLeft) || Input.IsKeyHeldForTime(Input.Keys.rotateLeft, this.rotateDelayTime)) {
			this.RotatePlayerLeft();
			Input.ResetHeldKeyTime(Input.Keys.rotateLeft);
		}
		if (Input.WasKeyPressed(Input.Keys.rotateRight) || Input.IsKeyHeldForTime(Input.Keys.rotateRight, this.rotateDelayTime)) {
			this.RotatePlayerRight();
			Input.ResetHeldKeyTime(Input.Keys.rotateRight);
		}
		// move
		if (Input.WasKeyPressed(Input.Keys.moveLeft) || Input.IsKeyHeldForTime(Input.Keys.moveLeft, this.moveDelayTime)) {
			if (this.CanPlayerMoveLeft()) {
				this.player.MoveLeft();
			}
			Input.ResetHeldKeyTime(Input.Keys.moveLeft);
		}
		if (Input.WasKeyPressed(Input.Keys.moveRight) || Input.IsKeyHeldForTime(Input.Keys.moveRight, this.moveDelayTime)) {
			if (this.CanPlayerMoveRight()) {
				this.player.MoveRight();
			}
			Input.ResetHeldKeyTime(Input.Keys.moveRight);
		}
		if (Input.WasKeyPressed(Input.Keys.moveDown) || Input.IsKeyHeldForTime(Input.Keys.moveDown, this.moveDelayTime)) {
			this.MovePlayerDown();
			Input.ResetHeldKeyTime(Input.Keys.moveDown);
		}
		if (Input.WasKeyPressed(Input.Keys.drop)) {
			this.DropPlayer();
		}
		if (Input.WasKeyPressed(Input.Keys.hold)) {
			this.SwapHoldBlock();
		}
	};
	
	this.Update = function (elapsedTime) {
		// check fail state
		if (this.failStateReached === true) {
			this.failStateTimer += elapsedTime;
			// 0.75 second timer after fail state reached before allowing a reset
			if (this.failStateTimer >= 750 && Input.WasAnyKeyPressed() || !lastMousePressed && mousePressed) {
				this.Reset();
			}
			return;
		}
		this.time += elapsedTime;
		this.ProcessPlayerInput();
		
		// update level timer
		this.moveDownTimer += elapsedTime;
		if (this.moveDownTimer >= this.moveDownTime) {
			this.ResetMoveTimer();
			this.MovePlayerDown();
		}
		
		this.UpdateGhostBlock();
	};
	
	this.DrawGrid = function (w, h) {
		// rect
		noFill();
		strokeCap(ROUND);
		strokeWeight(5);
		stroke(gridOutlineColor);
		rect(0, 0, w, h);
		
		// draw rows starting with zero index at the bottom
		strokeCap(SQUARE);
		var gridColumns = this.grid.length - this.hiddenRows;
		for (var j = 0; j < gridColumns; j++) {
			var row = this.grid[j];
			var y = h - (j + 1) * blockSize;
			// draw rows
			for (var i = 0; i < row.length; i++) {
				var c;
				// draw squares
				if (row[i] === -1) {
					strokeWeight(1);
					stroke(gridStrokeColor);
					fill(gridFillColor);
					rect(i * blockSize, y, blockSize, blockSize);
				} else {
					DrawBlockSquare(i * blockSize, y, blockColors[this.grid[j][i]]);
				}
			}
		}
	};
	
	this.DrawPlayer = function () {
		// draw player
		// outline
		strokeCap(SQUARE);
		strokeWeight(2);
		stroke(playerStrokeColor);
		noFill();
		for (var j = 0; j < this.player.shape.length; j++) {
			var y = rows - this.hiddenRows - this.player.position.y + j - 1;
			// don't draw offscreen player squares
			if (this.player.position.y - j >= rows - this.hiddenRows) {
				continue;
			}
			// if row is offscreen, skip row
			for (var i = 0; i < this.player.shape[j].length; i++) {
				// draw block
				if (this.player.shape[j][i] !== 0) {
					rect((this.player.position.x + i) * blockSize, y * blockSize, blockSize, blockSize);
				}
			}
		}
		// block
		for (var j = 0; j < this.player.shape.length; j++) {
			var y = rows - this.hiddenRows - this.player.position.y + j - 1;
			// don't draw offscreen player squares
			if (this.player.position.y - j >= rows - this.hiddenRows) {
				continue;
			}
			// if row is offscreen, skip row
			for (var i = 0; i < this.player.shape[j].length; i++) {
				// draw block
				if (this.player.shape[j][i] !== 0) {
					DrawBlockSquare((this.player.position.x + i) * blockSize, y * blockSize, this.player.color);
				}
			}
		}
	};
	
	this.DrawGhostBlock = function () {
		var y;
		strokeCap(SQUARE);
		stroke(this.ghostBlockStroke);
		for (var j = 0; j < this.ghostBlock.shape.length; j++) {
			if (this.ghostBlock.position.y - j >= rows - this.hiddenRows) {
				continue;
			}
			var y = rows - this.hiddenRows - this.ghostBlock.position.y + j - 1;
			for (var i = 0; i < this.player.shape[j].length; i++) {
				// draw block
				if (this.ghostBlock.shape[j][i] !== 0) {
					fill(this.ghostBlock.color);
					rect((this.ghostBlock.position.x + i) * blockSize, y * blockSize, blockSize, blockSize);
				}
			}
		}
	};
	
	this.DrawLight = function () {
		var x0 = this.player.position.x + ceil(this.player.shape[0].length / 2) - 1;
		var y0 = this.player.position.y - ceil(this.player.shape.length / 2) + 1;
		
		noStroke();
		for (var j = -this.lightRadius; j < this.lightRadius; j++) {
			var y = y0 + j;
			if (y < 0 || y >= rows - this.hiddenRows) {
				continue;
			}
			for (var i = -this.lightRadius; i < this.lightRadius; i++) {
				var x = x0 + i;
				if (x < 0 || x >= columns) {
					continue;
				}
				if (this.grid[y][x] !== -1) {
					continue;
				}
				var dist = new Vector2(x0, y0).Sub(new Vector2(x, y)).GetLength();
				var opacity = map(dist, 0, this.lightRadius, this.maxLightOpacity, 0);
				//opacity = 255;
				var c = color(red(this.lightColor), green(this.lightColor), blue(this.lightColor), opacity);
				fill(c);
				rect(x * blockSize, (rows - this.hiddenRows - y - 1) * blockSize, blockSize, blockSize);
			}
		}
	};
	
	this.Draw = function () {
		pushMatrix(); // 10 px buffer
		var w = this.grid[0].length * blockSize;
		var h = (this.grid.length - 2) * blockSize;
		translate((width - w) * 0.5, height - h - this.bottomMargin);
		
		this.DrawGrid(w, h);
		this.DrawLight();
		this.DrawGhostBlock();
		this.DrawPlayer();
		popMatrix();
		
		// draw UI
		DrawLevelInfo(this.time, this.level, this.linesToNextLevel);
		DrawNextBlocks(this.blockList);
		DrawHoldBlock(this.holdBlock);
		
		// try again
		if (this.failStateReached === true) {
			var size = 46;
			textSize(size);
			var lost = "Try Again";
			var tWidth = textWidth(lost);
			fill(0);
			stroke(255);
			strokeWeight(2);
			rect((width - tWidth - size) * 0.5, (height - size * 2.25) * 0.5, tWidth + size, size * 1.6);
			fill(255);
			text(lost, (width - tWidth) * 0.5, height * 0.5);
		}
	};
};

/** Clickable Button **/

// optional parameters:  textHighlightColor, fillHighlightColor, strokeHighlightColor
var Button = function (callback, txt, centerX, centerY, w, h, textColor, fillColor, strokeColor, strokeWgt, textHighlightColor, fillHighlightColor, strokeHighlightColor) {
	this.callback = callback;
	this.txt = txt;
	this.x = centerX;
	this.y = centerY;
	this.w = w;
	this.h = h;
	this.textColor = textColor;
	this.fillColor = fillColor;
	this.strokeColor = strokeColor;
	this.strokeWgt = strokeWgt;
	this.textHighlightColor = textHighlightColor !== undefined ? textHighlightColor : textColor;
	this.fillHighlightColor = fillHighlightColor !== undefined ? fillHighlightColor : fillColor;
	this.strokeHighlightColor = strokeHighlightColor !== undefined ? strokeHighlightColor : strokeColor;
	
	this.isHighlighted = false;
	this.halfWidth = this.w / 2;
	this.halfHeight = this.h / 2;
	
	this.DoesContainPoint = function (px, py) {
		if (this.x - this.halfWidth <= px && this.x + this.halfWidth > px && this.y - this.halfHeight <= py && this.y + this.halfHeight > py) {
			return true;
		}
		return false;
	};
	
	this.WasClicked = function () {
		if (this.DoesContainPoint(mouseX, mouseY) && this.DoesContainPoint(lastMouseDownPosition.x, lastMouseDownPosition.y) && !mousePressed && lastMousePressed) {
			return true;
		}
		return false;
	};
	
	this.Update = function () {
		// check is highlighted
		if (this.DoesContainPoint(mouseX, mouseY)) {
			this.isHighlighted = true;
			cursor(HAND);
			} else {
			this.isHighlighted = false;
		}
		
		// callback
		if (this.WasClicked()) {
			this.callback.call();
		}
	};
	
	this.Draw = function () {
		pushMatrix();
		translate(this.x, this.y);
		
		// rect
		var fc = this.isHighlighted ? this.fillHighlightColor : this.fillColor;
		fill(fc);
		strokeWeight(this.strokeWgt);
		var sc = this.isHighlighted ? this.strokeHighlightColor : this.strokeColor;
		stroke(sc);
		rect(-this.halfWidth, -this.halfHeight, this.w, this.h);
		
		// text
		textSize(this.h);
		var txtWidth = textWidth(this.txt);
		var tc = this.isHighlighted ? this.textHighlightColor : this.textColor;
		fill(tc);
		var s = this.w / txtWidth * 0.85;
		scale(s, s);
		text(this.txt, txtWidth * -0.5, h * -0.42, this.w / s, this.h / s);
		
		popMatrix();
	};
};

/** Bounded Radial Gradient **/
// draws a radial gradient that fills a bounded rect
// default rect is screen width and height
var DrawBoundedRadialGradient = function (colorOuter, colorInner, center, minX, minY, maxX, maxY) {
	var points = [
	new Vector2(minX === undefined ? 0 : minX, minY === undefined ? 0 : minY),
	new Vector2(maxX === undefined ? width : maxX, minY === undefined ? 0 : minY),
	new Vector2(maxX === undefined ? width : maxX, maxY === undefined ? height : maxY),
	new Vector2(minX === undefined ? 0 : minX, maxY === undefined ? height : maxY)];
	
	// set radius equal to longest distance to a corner
	var d, radius = 0;
	for (var i = 0; i < points.length; i++) {
		d = center.GetDistance(points[i]);
		if (radius < d) {
			radius = d;
		}
	}
	// draw concentric circles
	noStroke();
	for (var i = radius; i >= 1; i--) {
		fill(lerpColor(colorInner, colorOuter, i / radius));
		ellipse(center.x, center.y, i * 2, i * 2);
	}
	
	// draw containing rect
	noFill();
	stroke(0);
	rect(minX, minY, maxX - minX, maxY - minY);
};

/** Logo **/

var LerpOutline = function (inputColor) {
	return lerpColor(inputColor, white, 0.3);
};

var DrawT = function (w, h, color) {
	stroke(LerpOutline(color));
	fill(color);
	var midInner = 0.325;
	var midOuter = 1 - midInner;
	var high = (h * 0.2);
	beginShape();
	vertex(0, 0);
	vertex(w, 0);
	vertex(w, high);
	vertex(midOuter * w, high);
	vertex(midOuter * w, h);
	vertex(midInner * w, h);
	vertex(midInner * w, high);
	vertex(0, high);
	endShape(CLOSE);
};

var DrawE = function (w, h, color) {
	stroke(LerpOutline(color));
	fill(color);
	var midInner = 0.325 * w;
	var high = h * 0.2;
	var midHigh = h * 0.35;
	var low = h * 0.84;
	beginShape();
	vertex(0, 0);
	vertex(w, 0);
	vertex(w * 0.8, high);
	vertex(midInner, high);
	vertex(midInner, midHigh);
	vertex(w * 0.85, midHigh);
	vertex(w * 0.7, h * 0.5);
	vertex(midInner, h * 0.5);
	vertex(midInner, low);
	vertex(w * 1.05, low);
	vertex(w * 1.3, h);
	vertex(0, h);
	
	endShape(CLOSE);
};

var DrawR = function (w, h, color) {
	stroke(LerpOutline(color));
	fill(color);
	var high = h * 0.155;
	var midInner = w * 0.325;
	var midHigh = h * 0.35;
	beginShape();
	vertex(0, 0);
	vertex(w, 0);
	vertex(w * 0.6, midHigh);
	vertex(w * 0.8, midHigh);
	vertex(w * 1.5, h);
	vertex(w * 1.0, h);
	vertex(midInner, midHigh);
	vertex(w * 0.55, high);
	vertex(midInner, high);
	vertex(midInner, h);
	vertex(0, h);
	endShape(CLOSE);
};

var DrawI = function (w, h, color) {
	stroke(LerpOutline(color));
	fill(color);
	var high = h * 0.2;
	var low = h * 0.27;
	beginShape();
	vertex(0, 0);
	vertex(w, 0);
	vertex(w, high);
	vertex(0, high);
	endShape(CLOSE);
	
	beginShape();
	vertex(0, low);
	vertex(w, low);
	vertex(w, h);
	vertex(0, h);
	endShape(CLOSE);
};

var DrawS = function (w, h, color) {
	stroke(LerpOutline(color));
	fill(color);
	beginShape();
	var high = h * 0.155;
	var low = h * 0.83;
	var midInner = 0.325 * w;
	vertex(0, 0);
	vertex(w, 0);
	vertex(w * 0.94, high);
	vertex(midInner, high);
	vertex(w, h * 0.75);
	vertex(w, h);
	vertex(0, h);
	vertex(0, low);
	vertex(w - midInner, low);
	vertex(0, h * 0.2);
	
	endShape(CLOSE);
};

var DrawOutline = function (w, h) {
	var midInner = 0.325;
	var midOuter = 1 - midInner;
	strokeWeight(w / 60);
	strokeCap(PROJECT);
	stroke(252, 250, 242);
	fill(0, 14, 64);
	beginShape();
	vertex(0, 0);
	vertex(w, 0);
	vertex(w, h * 0.5);
	vertex(w * midOuter, h * 0.5);
	vertex(w * midOuter, h);
	vertex(w * midInner, h);
	vertex(w * midInner, h * 0.5);
	vertex(0, h * 0.5);
	vertex(0, 0);
	endShape(CLOSE);
};

var DrawLogo = function (w, xOffset, yOffset) {
	var h = w / 3 * 2;
	var blockSize = w / 3;
	var margin = blockSize / 10;
	var letterHeight = blockSize - margin * 2;
	var tWidth = blockSize * 1.6 / 3;
	var rWidth = tWidth * 1.03;
	var iWidth = blockSize * 0.17;
	var sWidth = blockSize * 0.5;
	var letterStrokeWgt = w / 100;
	
	pushMatrix();
	
	// draw outlien
	translate(xOffset - w * 0.5, yOffset - h * 0.5);
	DrawOutline(blockSize * 3, blockSize * 2);
	
	// draw letters
	pushMatrix();
	//noStroke();
	strokeWeight(letterStrokeWgt);
	translate(margin, margin);
	DrawT(tWidth - margin, letterHeight, blockColors[6]);
	translate(tWidth, 0);
	DrawE(tWidth - margin, letterHeight, blockColors[2]);
	translate(tWidth, 0);
	DrawT(tWidth - margin, letterHeight, blockColors[4]);
	popMatrix();
	
	pushMatrix();
	strokeWeight(letterStrokeWgt);
	translate(blockSize * 3 - sWidth, margin);
	DrawS(sWidth - margin, letterHeight, blockColors[1]);
	translate(-iWidth - margin, 0);
	DrawI(iWidth, letterHeight, blockColors[0]);
	popMatrix();
	
	strokeWeight(letterStrokeWgt);
	translate(tWidth * 3 + margin, margin);
	DrawR(rWidth - margin, letterHeight, blockColors[5]);
	
	popMatrix();
};

var DrawStartScreen = function () {
	var outerColor = color(0, 44, 94);
	var innerColor = color(0, 108, 196);
	var center = new Vector2(width * 0.5, height * 0.5);
	DrawBoundedRadialGradient(outerColor, innerColor, center);
	var l = width > height ? height : width;
	DrawLogo(l * 0.85, width * 0.5, height * 0.425);
	
	// press any key
	fill(252, 250, 242);
	textSize(28);
	var txt = "Press Any Key";
	text(txt, (width - textWidth(txt)) * 0.5, height - 60);
};

/** Javascript Keycode Mapping **/

var JavascriptKeyCodeToString = function (keyCode) {
	var s = null;
	// a - z
	if (keyCode >= 65 && keyCode <= 90) {
		s = String.fromCharCode(keyCode);
	}
	// numbers
	else if (keyCode >= 48 && keyCode <= 57) {
		s = keyCode - 48;
	}
	// numPad
	else if (keyCode >= 96 && keyCode <= 105) {
		s = "num" + String.fromCharCode(keyCode - 48);
	}
	// num pad etc
	else if (keyCode >= 106 && keyCode <= 111) {
		s = "num";
		switch (keyCode) {
			case 106:
			s += "*";
			break;
			case 107:
			s += "+";
			break;
			case 109:
			s += "-";
			break;
			case 110:
			s += ".";
			break;
			case 111:
			s += "/";
			break;
		}
	}
	// arrow keys
	else if (keyCode >= 37 && keyCode <= 40) {
		switch (keyCode) {
			case 37:
			s = "LEFT";
			break;
			case 38:
			s = "UP";
			break;
			case 39:
			s = "RIGHT";
			break;
			case 40:
			s = "DOWN";
			break;
		}
		} else if (keyCode === 8) {
		s = "BACKSPACE";
		} else if (keyCode === 9) {
		s = "TAB";
		} else if (keyCode === 10) {
		s = "ENTER";
		} else if (keyCode >= 16 && keyCode <= 18) {
		switch (keyCode) {
			case 16:
			s = "SHIFT";
			break;
			case 17:
			s = "CTRL";
			break;
			case 18:
			s = "ALT";
			break;
		}
		} else if (keyCode === 20) {
		s = "CAPS";
		} else if (keyCode === 27) {
		s = "ESCAPE";
		} else if (keyCode === 32) {
		s = "SPACE";
		} else if (keyCode >= 33 && keyCode <= 36) {
		switch (keyCode) {
			case 33:
			s = "PageUp";
			break;
			case 34:
			s = "PageDown";
			break;
			case 35:
			s = "END";
			break;
			case 36:
			s = "HOME";
			break;
		}
		} else if (keyCode === 127) {
		s = "DELETE";
	}
	// function keys
	else if (keyCode >= 112 && keyCode <= 123) {
		s = "F" + (keyCode - 111);
	}
	// misc
	else {
		switch (keyCode) {
			case 19:
			s = "PauseBreak";
			break;
			case 59:
			s = ";";
			break;
			case 61:
			s = "=";
			break;
			case 144:
			s = "NumLock";
			break;
			case 145:
			s = "ScrollLock";
			break;
			case 155:
			s = "INSERT";
			break;
			case 173:
			s = "-";
			break;
			case 188:
			s = ",";
			break;
			case 190:
			s = ".";
			break;
			case 191:
			s = "/";
			break;
			case 192:
			s = "`";
			break;
			case 219:
			s = "[";
			break;
			case 220:
			s = "\\";
			break;
			case 221:
			s = "]";
			break;
			case 222:
			s = "\'";
			break;
		}
	}
	return s;
};

var KeyToString = function (key) {
	var s;
	if (typeof key === "number") {
		s = JavascriptKeyCodeToString(key);
		} else if (typeof key === "string") {
		s = key;
		} else {
		return null;
	}
	return s;
};

/** Controls Screen **/

var ShowControlScreen = function () {
	gameState = GameStates.controls;
};

var w = 80;
var h = 30;
var s = 0.02;
var offset = width >= height ? height * s : width * s;
var x = width - offset - w / 2;
var y = height - offset - h / 2;
var controlsButton = new Button(ShowControlScreen, "Controls", x, y, w, h, color(255), color(0), color(255), 2, color(0), color(255), color(0));

var controlScreenTileTextSize = floor(height * 0.082);
var controlScreenTextSize = floor(height * 0.048);

var DrawControlsScreen = function () {
	// background
	var outerColor = color(0, 44, 94);
	var innerColor = color(0, 108, 196);
	var center = new Vector2(width * 0.5, height * 0.5);
	DrawBoundedRadialGradient(outerColor, innerColor, center);
	
	// title
	textSize(controlScreenTileTextSize);
	fill(255);
	var txt = "Controls";
	var x = (width - textWidth(txt)) * 0.5;
	var y = controlScreenTileTextSize * 1.75;
	text(txt, x, y);
	
	// key listings
	var lineSpacing = controlScreenTextSize * 1.25;
	var lineSkipSize = controlScreenTextSize * 0.80;
	textSize(controlScreenTextSize);
	// move left
	x = (width / 2 - 200) + controlScreenTextSize * 1.75;
	y += controlScreenTileTextSize * 1.15;
	txt = "Move Left:  ";
	for (var i = 0; i < moveLeftKeys.length; i++) {
		txt += KeyToString(moveLeftKeys[i]);
		if (i < moveLeftKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	// move right
	y += lineSpacing;
	txt = "Move Right:  ";
	for (var i = 0; i < moveRightKeys.length; i++) {
		txt += KeyToString(moveRightKeys[i]);
		if (i < moveRightKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	
	// move down
	y += lineSpacing;
	txt = "Move Down:  ";
	for (var i = 0; i < moveDownKeys.length; i++) {
		txt += KeyToString(moveDownKeys[i]);
		if (i < moveDownKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	
	// drop
	y += lineSpacing + lineSkipSize;
	txt = "Drop:  ";
	for (var i = 0; i < dropKeys.length; i++) {
		txt += KeyToString(dropKeys[i]);
		if (i < dropKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	
	// rotate left
	y += lineSpacing + lineSkipSize;
	txt = "Rotate Left:  ";
	for (var i = 0; i < rotateLeftKeys.length; i++) {
		txt += KeyToString(rotateLeftKeys[i]);
		if (i < rotateLeftKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	
	// rotate right
	y += lineSpacing;
	txt = "Rotate Right:  ";
	for (var i = 0; i < rotateRightKeys.length; i++) {
		txt += KeyToString(rotateRightKeys[i]);
		if (i < rotateRightKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	
	// hold
	y += lineSpacing + lineSkipSize;
	txt = "Hold:  ";
	for (var i = 0; i < holdKeys.length; i++) {
		txt += KeyToString(holdKeys[i]);
		if (i < holdKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	
	// pause
	y += lineSpacing + lineSkipSize;
	txt = "Pause:  ";
	for (var i = 0; i < pauseKeys.length; i++) {
		txt += KeyToString(pauseKeys[i]);
		if (i < pauseKeys.length - 1) {
			txt += ", ";
		}
	}
	text(txt, x, y);
	
	// press any key
	fill(252, 250, 242);
	var ts = height * 0.06;
	textSize(ts);
	var txt = "Press Any Key";
	text(txt, (width - textWidth(txt)) * 0.5, height - ts * 1.2);
};

/** Game State Manager **/

var GameStateManager = function () {
	this.Update = function () {
		// title screen
		if (gameState === GameStates.title) {
			controlsButton.Update();
			// F1 to show controls
			if (Input.CheckKeyWasPressed(112)) {
				gameState = GameStates.controls;
				return;
			}
			// press any key to play
			else if (Input.WasAnyKeyPressed()) {
				gameState = GameStates.play;
				return;
			}
		}
		// controls screen
		else if (gameState === GameStates.controls) {
			if (Input.WasAnyKeyPressed()) {
				gameState = GameStates.play;
				return;
			}
		}
		// playing screen
		else if (gameState === GameStates.play) {
			// auto pause on loss of focus
			if (!focused) {
				isPaused = true;
			}
			// toggle pause
			else if (Input.WasKeyPressed(Input.Keys.pause)) {
				isPaused = !isPaused;
			}
			// F1 to show controls
			if (Input.CheckKeyWasPressed(112)) {
				gameState = GameStates.controls;
				return;
			}
			// return if paused
			if (isPaused) {
				controlsButton.Update();
				return;
			}
			// play screen
			board.Update(elapsedTime);
		}
	};
	
	this.Draw = function () {
		// title screen
		if (gameState === GameStates.title) {
			DrawStartScreen();
			controlsButton.Draw();
		}
		// controls screen
		else if (gameState === GameStates.controls) {
			DrawControlsScreen();
		}
		// playing screen
		else if (gameState === GameStates.play) {
			// pause screen
			if (isPaused) {
				background(black);
				
				// paused text
				textSize(35);
				fill(white);
				var txt = "Paused";
				text(txt, (width - textWidth(txt)) * 0.5, height * 0.5);
				
				controlsButton.Draw();
			}
			// play screen
			else {
				DrawBoundedRadialGradient(gridFillColor, gridStrokeColor, new Vector2(width * 0.5, height * 0.5));
				board.Draw();
			}
		}
	};
};

/** Initialize **/


void setup() {
	size(width, height);
	angleMode = "radians";
	frameRate(60);
	
	// Initialize
	board = new Board();
	board.Initialize();
	gameStateManager = new GameStateManager();
}

/** Draw **/

void draw() {
	// update time
	elapsedTime = millis() - lastTime;
	lastTime = millis();
	
	cursor(ARROW);
	
	gameStateManager.Update();
	gameStateManager.Draw();
	
	Input.LateUpdate(elapsedTime);
};