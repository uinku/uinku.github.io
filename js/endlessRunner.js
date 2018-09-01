// JavaScript Document
/**
 * 2013/07/18
 * James Winkler
 * Based on the game Bit.Trip Runner.
 * Jump, slide, kick, and launch. (rebindable controls)
 * Collect gold for more points.
 **/

// Global variables
var c = document.getElementById("myCanvas");
var ctx = c.getContext('2d');
var screenWidth = 400;
var screenHeight = 400;
var scoreTextSize = 22;
var black = color(16, 9, 20);
var bgColor = color(174, 231, 245);
var ground = [];
var groundHeight = round(screenHeight / 4 * 3);
var GameStates = {
    menu: "menu",
    playing: "playing",
    loss: "loss"
};
var gameState;
var startButton;
var ctrlTextSize = 18;
var bgText;
var fancyGraphics = true;

// loss
var lossTimer = 0;
var lossTimerMax = 60;
var flashes = 4;

// score
var score = 0;
var highScore = 0;
var scoreIncrement = 1 / 50;

// commander video
var cmndrVideo;
var cmndrSize = 150; // 150
var blockSize = cmndrSize / 15;
var colors = [color(255, 204, 0), color(240, 142, 29), color(58, 186, 169), color(230, 97, 139), color(95, 44, 189)];

// movement
var moveSpeedX = 8;
var g = blockSize * 0.245;
var jumpVelocity = -blockSize * 2.06;
var jumpScale = 0.080;
var launchVelocityY = -blockSize * 1.35;
var launchScale = 0.137;

// particles
var pSys;
var pLife = 10 / moveSpeedX;
var psSize = cmndrSize;

// obstacles
var obstacleTypes = ["jump", "kick", "slide", "launch"];
var obstacles = [];
var obstacleTimer = 0;
var obstacleSpawnMax = 70; // starting level
var obstacleSpawnMin = 22; // end level
var obstacleSpawnInterval = obstacleSpawnMax;
var obstacleColors = [color(224, 42, 18), color(191, 61, 224), color(22, 88, 196), color(255, 105, 173)];
var launchTimer = 0; // used for gaps after launch pads
var launchTimerMax = 40;

// gold
var gold;
var goldPoints = 100;

// key event listeners
var keyState = [];
var lastKeyState = [];
var SetLastKeyState = function () {
    for (var i = 0; i < keyState.length; i++) {
        lastKeyState[i] = keyState[i];
    }
};
var keyPressed() {
    keyState[keyCode] = true;
};
var keyReleased() {
    keyState[keyCode] = false;
};

// Setup the Processing Canvas
void setup() {
    size(400, 400);
    strokeWeight(10);
    frameRate(35);
    strokeCap(SQUARE);
    cursor();
    angleMode = "radians";

    InitializeGame();

    console.log("setup complete");
}

var controls = {
    jump: "SPACE",
    kick: "a",
    slide: "s",
    launch: "w"
};
var controls2 = {
    jump: 101,
    kick: 100,
    slide: 98,
    launch: 104
};

// controls helper function
var GetKeyCode = function (key) {
    if (typeof key === "string") {
        if (key === "SPACE") {
            return " ".charCodeAt();
        } else {
            return key.toUpperCase().charCodeAt();
        }
    } else if (typeof key === "number") {
        return key;
    }
};

// control keys helper function
var IsKeyPressed = function (key) {
    if (key === "jump") {
        return keyState[GetKeyCode(controls.jump)] && !lastKeyState[GetKeyCode(controls.jump)] || keyState[GetKeyCode(controls2.jump)] && !lastKeyState[GetKeyCode(controls2.jump)];
    } else if (key === "slide") {
        return keyState[GetKeyCode(controls.slide)] && !lastKeyState[GetKeyCode(controls.slide)] || keyState[GetKeyCode(controls2.slide)] && !lastKeyState[GetKeyCode(controls2.slide)];
    } else if (key === "kick") {
        return keyState[GetKeyCode(controls.kick)] && !lastKeyState[GetKeyCode(controls.kick)] || keyState[GetKeyCode(controls2.kick)] && !lastKeyState[GetKeyCode(controls2.kick)];
    } else if (key === "launch") {
        return keyState[GetKeyCode(controls.launch)] && !lastKeyState[GetKeyCode(controls.launch)] || keyState[GetKeyCode(controls2.launch)] && !lastKeyState[GetKeyCode(controls2.launch)];
    } else {
        return false;
    }
};

// control keys helper function
var IsKeyDown = function (key) {
    if (key === "jump") {
        return keyState[GetKeyCode(controls.jump)] || keyState[GetKeyCode(controls2.jump)];
    } else if (key === "slide") {
        return keyState[GetKeyCode(controls.slide)] || keyState[GetKeyCode(controls2.slide)];
    } else if (key === "kick") {
        return keyState[GetKeyCode(controls.kick)] || keyState[GetKeyCode(controls2.kick)];
    } else if (key === "launch") {
        return keyState[GetKeyCode(controls.launch)] || keyState[GetKeyCode(controls2.launch)];
    } else {
        return false;
    }
};

var Capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

var Clamp = function (value, mi, ma) {
    return min(max(value, mi), ma);
};

var Vector2 = function (x, y) {
    this.x = x;
    this.y = y;
};
Vector2.prototype.Add = function (vector2) {
    this.x += vector2.x;
    this.y += vector2.y;
};
Vector2.prototype.Sub = function (vector2) {
    this.x -= vector2.x;
    this.y -= vector2.y;
};
Vector2.prototype.Scale = function (constant) {
    this.x *= constant;
    this.y *= constant;
};
Vector2.prototype.Normalize = function () {
    // cannot normalize zero vector
    if (this.x === 0 && this.y === 0) {
        return;
    }
    var hyp = sqrt(pow(this.x, 2) + pow(this.y, 2));
    hyp = 1 / hyp;
    this.x *= hyp;
    this.y *= hyp;
};
Vector2.prototype.GetLength = function () {
    return sqrt(pow(this.x, 2) + pow(this.y, 2));
};
Vector2.prototype.GetDistance = function (v) {
    var a = new Vector2(this.x, this.y);
    a.Sub(v);
    return a.GetLength();
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

// returns true if objects overlap, false if they do not
var Overlap = function (obj1, obj2) {
    if (obj1.position.x < obj2.position.x + obj2.width && obj1.position.x + obj1.width > obj2.position.x && obj1.position.y < obj2.position.y + obj2.height && obj1.position.y + obj1.height > obj2.position.y) {
        return true;
    }
    return false;
};

var Collide = function (obj1, obj2) {
    var overlapX = 0;
    var overlapY = 0;
    if (obj1.lastPosition.x < obj2.lastPosition.x) {
        overlapX = obj1.position.x + obj1.width - obj2.position.x;
    } else {
        overlapX = obj2.position.x + obj2.width - obj1.position.x;
    }
    if (obj1.lastPosition.y < obj2.lastPosition.y) {
        overlapY = obj1.position.y + obj1.height - obj2.position.y;
    } else {
        overlapY = obj2.position.y + obj2.height - obj1.position.y;
    }

    if (overlapX < overlapY) {
        // obj1 right of obj2
        if (obj2.lastPosition.x + obj2.width <= obj1.lastPosition.x && obj2.position.x + obj2.width > obj1.position.x) {
            obj1.position.x += overlapX;
            //println("left");
        }
        // obj1 left of obj2
        if (obj1.lastPosition.x + obj1.width <= obj2.lastPosition.x && obj1.position.x + obj1.width > obj2.position.x) {
            obj1.position.x -= overlapX;
            //println("right");
        }
    } else {
        // obj1 above obj2
        if (obj1.lastPosition.y + obj1.height <= obj2.lastPosition.y && obj1.position.y + obj1.height > obj2.position.y) {
            obj1.position.y -= overlapY;
            obj1.isTouchingBottom = true;
            //println("bottom");
        }
        // obj1 below obj2
        if (obj2.lastPosition.y + obj2.height <= obj1.lastPosition.y && obj2.position.y + obj2.height > obj1.position.y) {
            obj1.position.y += overlapY;
            //println("top");
        }
    }
};

// returns true if out of bounds
var CheckBounds = function (obj) {
    if (obj.position.x + obj.width < 0 || obj.position.x > screenWidth || obj.position.y + obj.height < 0 || obj.position.y > screenHeight) {
        return true;
    }
    return false;
};

// ground
var Ground = function (x, width) {
    this.position = new Vector2(x, groundHeight);
    this.lastPosition = this.position.Clone();
    this.width = width;
    this.height = screenHeight - this.position.y;

    this.Update = function () {
        this.lastPosition = this.position.Clone();
        this.position.x -= moveSpeedX;
    };

    this.Draw = function () {
        noStroke();
        fill(black);
        rect(this.position.x, this.position.y, this.width, this.height);
        fill(color(117, 117, 117));
        rect(this.position.x, this.position.y, this.width, this.height * 0.05);
        fill(color(171, 171, 171));
        rect(this.position.x, this.position.y, this.width, this.height * 0.015);
    };
};

var InitializeGround = function () {
    ground = [new Ground(0, screenWidth + obstacleSpawnInterval * moveSpeedX)];
    //println(ground[0].width);
};

var UpdateGround = function () {
    for (var i = ground.length - 1; i >= 0; i--) {
        var g = ground[i];
        g.Update();
        // remove offscreen
        if (g.position.x + g.width < 0) {
            ground.splice(i, 1);
        }
    }
};

var DrawGround = function () {
    for (var i = 0; i < ground.length; i++) {
        ground[i].Draw();
    }
};

var CheckGroundCollision = function () {
    for (var i = 0; i < ground.length; i++) {
        var grnd = ground[i];
        if (Overlap(cmndrVideo, grnd)) {
            Collide(cmndrVideo, grnd);
            cmndrVideo.GroundCollision();
        }
    }
};

var LoseGame = function () {
    cmndrVideo.Kill();
    highScore = score > highScore ? score : highScore;
    gameState = GameStates.loss;
};

var ResetGame = function () {
    noCursor();
    score = 0;
    lossTimer = 0;
    launchTimer = 0;
    gold.Reset();
    obstacles.Reset();
    obstacleTimer = 0;
    obstacleSpawnInterval = obstacleSpawnMax; // start at lowest level
    //obstacleSpawnInterval = obstacleSpawnMin; // start at highest level
    cmndrVideo.Reset();
    pSys.Reset();
    InitializeGround();
    bgText.Reset();
    gameState = GameStates.playing;
};

// returns the color with the alpha value
var ColorWithAlpha = function (c, a) {
    var r = red(c);
    var g = green(c);
    var b = blue(c);
    return color(r, g, b, a);
};

var StartButton = function (x, y) {
    this.position = new Vector2(x, y);
    this.width = 90;
    this.height = 50;
    this.originX = this.width / 2;
    this.originY = this.height / 2;
    this.fillColor = color(255, 0, 0);
    this.strokeColor = color(255, 0, 0);

    this.Update = function () {
        if (mouseX >= this.position.x - this.originX && mouseX < this.position.x + this.width - this.originX && mouseY >= this.position.y - this.originY && mouseY < this.position.y + this.height - this.originY) {
            this.fillColor = black;
            this.strokeColor = color(255, 255, 255);
            if (mousePressed) {
                ResetGame();
            }
        } else if (keyState[ENTER] || keyState[RETURN]) { // enter
            ResetGame();
        } else {
            this.fillColor = color(255, 255, 255);
            this.strokeColor = black;
        }
    };

    this.Draw = function () {
        ctx.save();
        stroke(this.strokeColor);
        strokeWeight(8);
        fill(this.fillColor);
        rect(this.position.x - this.originX, this.position.y - this.originY, this.width, this.height);
        fill(this.strokeColor);
        textSize(30);
        textAlign(CENTER, CENTER);
        text("Start", this.position.x, this.position.y);
        ctx.restore();
    };
};

var LinearDodge = function (p1, p2) {
    var temp = p1 + p2;
    if (temp > 255) {
        temp = 255;
    }
    return temp;
};

// variables: filter function, screen region, filter color
var FilterCanvas = function (func, x, y, w, h, c) {
    var x1 = Clamp(x, 0, width);
    var y1 = Clamp(y, 0, height);
    w -= abs(x - x1);
    h -= abs(y - y1);
    var r = red(c);
    var g = green(c);
    var b = blue(c);
    var cData = ctx.getImageData(x1, y1, w, h);
    for (var i = 0; i < cData.width * cData.height; i++) {
        cData.data[i * 4 + 0] = func(cData.data[i * 4 + 0], r);
        cData.data[i * 4 + 1] = func(cData.data[i * 4 + 1], g);
        cData.data[i * 4 + 2] = func(cData.data[i * 4 + 2], b);
    }
    ctx.putImageData(cData, x1, y1);
};

var CommanderVideo = function () {
    this.position = new Vector2(screenWidth / 2 - 25, groundHeight - cmndrSize);
    this.lastPosition = this.position.Clone();
    this.width = blockSize * 4;
    this.height = cmndrSize;
    this.velocityY = 0;
    this.isVisible = true;
    this.isJumping = false;
    this.jumpFrame = 0;
    this.isSliding = false;
    this.lastSliding = this.isSliding;
    this.slideHeight = round(blockSize * 4.5);
    this.isKicking = false;
    this.kickTimer = 0;
    this.kickTimerMax = obstacleSpawnMin * 0.75;
    this.kickKeyHeld = false;
    this.isLaunching = false;
    this.testColor = color(255, 0, 0);
    this.heightScale = 11 / 15; // pct of height that is body
    this.runFrame = 0;
    this.totalRunFrames = 7;
    this.runFrameTimer = 0;
    this.runFrameIncrement = 1;
    this.runFrameTimerMax = 2;
    this.isTouchingBottom = true;
    this.isAlive = true;
    this.attractMode = false;

    this.CollisionRect = function () {
        var r = {
            position: new Vector2(this.position.x, this.position.y),
            width: this.width,
            height: this.height
        };
        return r;
    };

    this.KickRect = function () {
        var r = {
            position: new Vector2(this.position.x + this.width, this.position.y + blockSize * 9),
            width: blockSize * 5,
            height: blockSize * 2
        };
        return r;
    };

    this.Reset = function () {
        this.height = cmndrSize;
        this.position = new Vector2(screenWidth / 2 - 25, groundHeight - this.height);
        this.velocityY = 0;
        this.isVisible = true;
        this.isJumping = false;
        this.isSliding = false;
        this.lastSliding = false;
        this.isKicking = false;
        this.kickKeyHeld = false;
        this.isLaunching = false;
        this.runFrame = 0;
        this.runFrameTimer = 0;
        this.isTouchingBottom = false;
        this.isAlive = true;
    };

    this.IsRunning = function () {
        return !this.isJumping && !this.isSliding && !this.isKicking && !this.isLaunching;
    };

    this.UpdateRunFrame = function () {
        if (!this.IsRunning) {
            this.runFrame = 0;
            return;
        }

        this.runFrameTimer += this.runFrameIncrement;
        if (this.runFrameTimer >= this.runFrameTimerMax) {
            this.runFrameTimer = 0;
            this.runFrame = (++this.runFrame) % this.totalRunFrames;
        }
    };

    this.GroundCollision = function () {
        if (this.isTouchingBottom) {
            this.velocityY = 0;
            this.jumpTimer = 0;
            this.isJumping = false;
            this.isLaunching = false;
        }
    };

    this.Launch = function () {
        this.isTouchingBottom = false;
        this.velocityY = launchVelocityY;
        this.isLaunching = true;
        this.position.y = groundHeight - this.height; // debug, ?cause
        //println("launch");
    };

    this.CanLaunch = function () {
        return IsKeyPressed("launch") && !this.isLaunching && this.isTouchingBottom;
    };

    this.UpdateKickTimer = function () {
        if (this.kickTimer > 0) {
            this.kickTimer--;
            if (this.kickTimer <= 0) {
                this.isKicking = false;
            }
        }
    };

    this.Kill = function () {
        this.isAlive = false;
        this.ResetSlidePosition();
    };

    this.ResetSlidePosition = function () {
        if (this.isSliding) {
            //this.position.x += this.width/2;
            this.position.y -= cmndrSize - this.slideHeight + g; // ?add g
            this.height = cmndrSize;
        }
    };

    this.Update = function () {
        //println('cmndr update');

        this.lastPosition = this.position.Clone();
        this.lastSliding = this.isSliding;
        if (!IsKeyDown("kick") && !this.isKicking) {
            this.kickKeyHeld = false;
        }

        // launch, additional air time
        if (this.isLaunching) {
            this.velocityY += launchVelocityY * launchScale;
        }

        // jump
        if (IsKeyPressed("jump") && this.isTouchingBottom) {
            this.jumpFrame = 0;
            this.isTouchingBottom = false;
            this.velocityY = jumpVelocity;
            this.isJumping = true;
        }
        // additional air time on held jump descent
        if (IsKeyDown("jump") && this.velocityY > -g && this.isJumping && !this.isLaunching) {
            this.jumpFrame = 1;
            this.velocityY += jumpVelocity * jumpScale;
        } else if (this.isJumping && !IsKeyPressed("jump")) {
            this.jumpFrame = 0;
        }

        // slide
        if (IsKeyDown("slide") && this.isTouchingBottom) {
            this.isSliding = true;
            if (this.isKicking) {
                this.isKicking = false;
            }
        } else {
            this.isSliding = false;
        }

        // kick
        if (IsKeyDown("kick") && !this.isSliding && this.kickTimer <= 0 && !this.kickKeyHeld) {
            this.isKicking = true;
            this.kickTimer = this.kickTimerMax;
            this.kickKeyHeld = true;
        }

        this.UpdateRunFrame();

        // gravity   
        this.velocityY += g;
        this.position.y += this.velocityY;

        // slide position correction
        if (this.isSliding && !this.lastSliding) {
            //this.position.x -= this.width/2;
            this.position.y += this.height - this.slideHeight;
            this.height = this.slideHeight;
        } else if (!this.isSliding && this.lastSliding) {
            //this.position.x += this.width/2;
            this.position.y -= cmndrSize - this.slideHeight + g; // ?add g
            this.height = cmndrSize;
        }

        // fell off the bottom of the screen, loss
        if (this.position.y + this.height / 2 > screenHeight) {
            LoseGame();
        }

        this.isTouchingBottom = false;

        this.UpdateKickTimer();
        CheckGroundCollision();

        if (keyState[119] && !lastKeyState[119]) { // f8
            this.attractMode = !this.attractMode;
        }
        if (this.attractMode && gameState === GameStates.menu) {
            this.runFrame = 4;
        }

        // debug
        /*this.isJumping = true;
        this.jumpFrame = 1;
        this.velocityY = 0;
        this.position.y = groundHeight - this.height - 20;*/
        /*this.position.x = mouseX;
        this.position.y = mouseY;*/
        //this.isAlive = false;
    };

    // debug drawing
    this.DrawCollisionRects = function () {
        // collision rect
        var cr = this.CollisionRect();
        var testColor = color(255, 0, 0, 125);
        for (var i = 0; i < obstacles.length; i++) {
            if (Overlap(cr, obstacles[i])) {
                testColor = color(0, 255, 0, 125);
            }
        }
        fill(testColor);
        rect(cr.position.x, cr.position.y, cr.width, cr.height);

        // kick rect
        if (this.isKicking) {
            var kr = this.KickRect();
            testColor = color(255, 0, 0, 125);
            for (var i = 0; i < obstacles.length; i++) {
                if (Overlap(kr, obstacles[i])) {
                    testColor = color(0, 255, 0, 125);
                }
            }
            fill(testColor);
            rect(kr.position.x, kr.position.y, kr.width, kr.height);
        }
    };

    this.DrawEyeSlot = function () {
        fill(255, 255, 255);
        var x = this.position.x + blockSize * 2;
        var y = this.position.y + blockSize * 1;
        rect(x, y, blockSize * 2, blockSize);
    };

    this.Draw = function () {
        if (!this.isVisible) {
            return;
        }

        noStroke();
        fill(black);
        var h = this.height * this.heightScale;
        //var w = this.width;
        var w2, h2, x, y;

        if (!this.isAlive) {
            // left arm
            x = this.position.x - blockSize;
            y = this.position.y + blockSize * 8;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);

            // right arm
            x = this.position.x + this.width;
            y = this.position.y + blockSize * 8;
            rect(x, y, blockSize, blockSize);
            x += blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize * 2);

            // left leg
            x = this.position.x + blockSize;
            y = this.position.y + h;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            y += blockSize;
            rect(x, y, blockSize * 2, blockSize);

            // right leg
            x = this.position.x + this.width - blockSize * 2;
            y = this.position.y + h;
            rect(x, y, blockSize, blockSize);
            x += blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x += blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize * 2, blockSize);

            // body
            rect(this.position.x, this.position.y, this.width, h);

            // eye slot
            this.DrawEyeSlot();
        } else if (this.isSliding) {
            w2 = blockSize * 5;
            h2 = this.height - blockSize * 2;
            // left arm
            x = this.position.x - blockSize;
            y = this.position.y + this.height - blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y -= blockSize * 2;
            rect(x, y, blockSize, blockSize * 2);

            // right arm
            x = this.position.x + this.width + blockSize * 2;
            y = this.position.y;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);

            // head
            y = this.position.y;
            rect(this.position.x, y, this.width, this.height);

            // body
            x = this.position.x + this.width;
            y = this.position.y + this.height - h2;
            rect(x, y, w2, h2);

            // left leg (upper)
            x = this.position.x + this.width + w2;
            y = this.position.y + this.height - h2 - blockSize;
            rect(x, y, blockSize * 3, blockSize);
            x += blockSize * 2;
            y -= blockSize;
            rect(x, y, blockSize, blockSize);

            // right leg
            x = this.position.x + this.width + w2;
            y = this.position.y + this.height - blockSize;
            rect(x, y, blockSize * 5, blockSize);
            x += blockSize * 4;
            y -= blockSize;
            rect(x, y, blockSize, blockSize);

            // eye slot
            this.DrawEyeSlot();
        } else if (this.isKicking) {
            // left arm
            x = this.position.x - blockSize * 3;
            y = this.position.y + blockSize * 6;
            rect(x, y, blockSize, blockSize);
            x += blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x += blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);

            // right arm
            x += this.width + blockSize;
            rect(x, y, blockSize * 2, blockSize);

            // left leg
            x = this.position.x;
            y = this.position.y + h;
            rect(x, y, blockSize, blockSize);
            y += blockSize;
            rect(x, y, blockSize * 3, blockSize);

            // right leg
            x = this.position.x + this.width;
            y = this.position.y + h - blockSize;
            rect(x, y, blockSize * 5, blockSize);
            x += blockSize * 4;
            y -= blockSize;
            rect(x, y, blockSize, blockSize);

            // body
            rect(this.position.x, this.position.y, this.width, h);

            // eye slot
            this.DrawEyeSlot();
        } else if (this.isLaunching) {
            // left arm
            x = this.position.x - blockSize;
            y = this.position.y + this.height - blockSize * 9;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);

            // right arm
            x = this.position.x + this.width;
            y = this.position.y + this.height - blockSize * 12;
            rect(x, y, blockSize, blockSize);
            x += blockSize;
            y -= blockSize;
            rect(x, y, blockSize, blockSize);
            x += blockSize;
            y -= blockSize;
            rect(x, y, blockSize, blockSize);

            // left leg
            x = this.position.x - blockSize;
            y = this.position.y + h;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);

            // right leg
            x = this.position.x + this.width - blockSize * 2;
            y = this.position.y + h;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);
            x -= blockSize;
            y += blockSize;
            rect(x, y, blockSize, blockSize);

            // body
            rect(this.position.x, this.position.y, this.width, h);

            // eye slot
            this.DrawEyeSlot();
        } else if (this.isJumping) {
            switch (this.jumpFrame) {
                case 0:
                    // left arm
                    x = this.position.x - blockSize * 3;
                    y = this.position.y + this.height - blockSize * 8;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // right arm
                    x += this.width + blockSize * 2;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // left leg
                    x = this.position.x;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize * 3);
                    x -= blockSize;
                    y += blockSize * 3;
                    rect(x, y, blockSize, blockSize);

                    // right leg
                    x = this.position.x + this.width - blockSize;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize * 3);
                    x -= blockSize;
                    y += blockSize * 3;
                    rect(x, y, blockSize, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
                case 1:
                    // left arm
                    x = this.position.x - blockSize * 3;
                    y = this.position.y + this.height - blockSize * 11;
                    rect(x, y, blockSize * 2, blockSize);
                    x += blockSize * 2;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right arm
                    x += this.width + blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // left leg
                    x = this.position.x + blockSize;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize * 3);

                    // right leg
                    x = this.position.x + this.width - blockSize;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize * 2);
                    x += blockSize;
                    y += blockSize * 2;
                    rect(x, y, blockSize, blockSize * 2);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
            }
        } else if (this.IsRunning()) {
            //this.runFrame = 0; // debug frame
            switch (this.runFrame) {
                case 0:
                    // right arm
                    x = this.position.x + this.width;
                    y = this.position.y + this.height - blockSize * 6;
                    rect(x, y, blockSize, blockSize);

                    // left leg
                    x = this.position.x + blockSize * 1;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize * 2);
                    x -= blockSize;
                    y += blockSize * 2;
                    rect(x, y, blockSize, blockSize * 2);

                    // right leg
                    x = this.position.x + this.width - blockSize * 2;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize * 4);
                    x += blockSize;
                    y += blockSize * 3;
                    rect(x, y, blockSize, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
                case 1:
                    // left arm
                    x = this.position.x - blockSize;
                    y = this.position.y + blockSize * 5;
                    rect(x, y, blockSize, blockSize);

                    // left leg
                    x = this.position.x + blockSize;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize * 2;
                    y += blockSize;
                    rect(x, y, blockSize * 2, blockSize);
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right leg
                    x = this.position.x + this.width - blockSize;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize * 2;
                    y += blockSize;
                    rect(x, y, blockSize * 2, blockSize);
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
                case 2:
                    // left arm
                    x = this.position.x - blockSize;
                    y = this.position.y + blockSize * 4;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right arm
                    x = this.position.x + this.width;
                    y += blockSize * 2;
                    rect(x, y, blockSize, blockSize);

                    // left leg
                    x = this.position.x - blockSize;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right leg
                    x = this.position.x + this.width;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    y += blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
                case 3:
                    // left arm
                    x = this.position.x - blockSize;
                    y = this.position.y + blockSize * 2;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right arm
                    x = this.position.x + this.width;
                    y = this.position.y + blockSize * 6;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize, blockSize);

                    // left leg
                    x = this.position.x - blockSize * 3;
                    y = this.position.y + h - blockSize;
                    rect(x, y, blockSize * 3, blockSize);
                    x -= blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right leg
                    x = this.position.x + this.width;
                    y -= blockSize;
                    rect(x, y, blockSize * 3, blockSize);
                    x += blockSize * 3;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
                case 4:
                    // left arm
                    x = this.position.x - blockSize * 3;
                    y = this.position.y + blockSize * 4;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // right arm
                    x = this.position.x + this.width;
                    y = this.position.y + h - blockSize * 4;
                    rect(x, y, blockSize * 2, blockSize);
                    x += blockSize * 2;
                    y -= blockSize;
                    rect(x, y, blockSize, blockSize);

                    // left leg
                    x = this.position.x - blockSize;
                    y = this.position.y + h - blockSize;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // right leg
                    x = this.position.x + this.width;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
                case 5:
                    // left arm
                    x = this.position.x - blockSize * 2;
                    y = this.position.y + blockSize * 4;
                    rect(x, y, blockSize, blockSize * 2);
                    x += blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right arm
                    x = this.position.x + this.width;
                    y = this.position.y + h - blockSize * 4;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // left leg
                    x = this.position.x - blockSize * 2;
                    y = this.position.y + h;
                    rect(x, y, blockSize * 2, blockSize);
                    x -= blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize;
                    y -= blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // right leg
                    x = this.position.x + this.width - blockSize;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);
                    y += blockSize;
                    rect(x, y, blockSize * 2, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
                case 6:
                    // left arm
                    x = this.position.x - blockSize;
                    y = this.position.y + blockSize * 4;
                    rect(x, y, blockSize, blockSize * 3);

                    // right arm
                    x = this.position.x + this.width;
                    y += blockSize * 4;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // left leg
                    x = this.position.x;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x -= blockSize * 3;
                    y += blockSize;
                    rect(x, y, blockSize * 3, blockSize);
                    y += blockSize;
                    rect(x, y, blockSize, blockSize);

                    // right leg
                    x = this.position.x + this.width - blockSize * 2;
                    y = this.position.y + h;
                    rect(x, y, blockSize, blockSize);
                    x += blockSize;
                    y += blockSize;
                    rect(x, y, blockSize, blockSize * 2);
                    y += blockSize * 2;
                    rect(x, y, blockSize * 2, blockSize);

                    // body
                    rect(this.position.x, this.position.y, this.width, h);

                    // eye slot
                    this.DrawEyeSlot();
                    break;
            }
        }

        //this.DrawCollisionRects();
    };
};

var Particle = function (x, y, width, height, clr, life) {
    this.position = new Vector2(x, y);
    this.width = width;
    this.height = height;
    this.color = clr;
    this.life = max(1, life);

    this.Update = function () {
        this.life -= 0.04;
        this.position.x -= moveSpeedX;
    };

    this.Draw = function (totalLife) {
        var c = ColorWithAlpha(this.color, round((this.life / totalLife) * 205) + 50);
        fill(c);
        noStroke();
        rect(this.position.x, this.position.y, this.width, this.height);
    };
};

var ParticleSystem = function (parent, x, y, size, pColors, pLife) {
    this.parent = parent;
    this.particles = [];
    this.position = new Vector2(x, y);
    this.size = size;
    this.pColors = pColors;
    this.pLife = pLife;
    this.trailLength = ceil(this.position.x / moveSpeedX);

    this.Reset = function () {
        // initialize particles
        for (var i = 0; i < pColors.length; i++) {
            this.particles[i] = [];
        }
    };
    this.Reset();

    this.Update = function (x, y, size) {
        var growth = blockSize * 4;
        if (this.size < this.parent.height) {
            this.size += growth;
            if (this.size > this.parent.height) {
                this.size = this.parent.height;
            }
        } else if (this.size > this.parent.height) {
            this.size -= growth;
            if (this.size < this.parent.height) {
                this.size = this.parent.height;
            }
        }
        this.position.x = this.parent.position.x;
        this.position.y = this.parent.position.y + this.parent.height - this.size;

        // update each particle's life
        for (var i = 0; i < this.particles.length; i++) {
            for (var j = 0; j < this.particles[i].length; j++) {
                this.particles[i][j].Update();
            }
        }

        // new particles
        // set size for new particle
        var s = floor(this.size / this.pColors.length);
        // set remainder to compensate overall length
        var r = this.size - s * this.pColors.length;
        // spawn new particles for each array in particles
        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];
            var y = this.position.y + i * s;
            // add remainer to last particle length
            if (i === this.particles.length - 1) {
                s += r;
            }
            var w = moveSpeedX + this.parent.position.x - this.parent.lastPosition.x;
            p.push(
            new Particle(
            this.position.x - w,
            y,
            w,
            s,
            this.pColors[i],
            this.pLife));
            // remove excess particles
            if (p.length > this.trailLength) {
                p.shift(1);
            }
        }
    };

    this.Draw = function () {
        for (var i = 0; i < this.particles.length; i++) {
            for (var j = 0; j < this.particles[i].length; j++) {
                this.particles[i][j].Draw(this.pLife);
            }
        }
    };
};

var GoldParticle = function (px, py, vx, vy, width, height, c, life) {
    this.position = new Vector2(px, py);
    this.velocity = new Vector2(vx, vy);
    this.width = width;
    this.height = height;
    this.fillColor = c;
    this.life = life;

    this.Update = function () {
        this.velocity.y += g * 0.1;
        this.position.Add(this.velocity);
        this.life--;
    };

    this.Draw = function () {
        fill(this.fillColor);
        noStroke();
        if (fancyGraphics) {
            FilterCanvas(LinearDodge, this.position.x, this.position.y, this.width, this.height, this.fillColor);
        } else {
            rect(this.position.x, this.position.y, this.width, this.height);
        }
    };
};

var GoldParticleSystem = function (x, y) {
    this.particles = [];
    this.position = new Vector2(x, y);
    this.pSize = blockSize * 4;
    this.pLife = 20;
    this.spawnCount = fancyGraphics ? 10 : 20;

    this.Reset = function () {
        this.particles = [];
    };

    this.SpawnParticles = function () {
        // new particles
        for (var i = 0; i < this.spawnCount; i++) {
            var size;
            if (fancyGraphics) {
                size = this.pSize + random(blockSize * 0.75);
            } else {
                size = this.pSize + random(blockSize * 3);
            }
            var a = random(-PI, PI);
            var speed = random(this.pSize * 4, this.pSize * 17) / size;
            var vx = cos(a) * speed;
            var vy = sin(a) * speed - this.pSize * 0.09;
            var g = random(220, 250);
            var b = random(50, 100);
            var c = color(255, g, b, 180);
            var z = 5;
            var l = this.pLife * size / this.pSize;
            this.particles.push(
            new GoldParticle(
            this.position.x - size / 2,
            this.position.y - size / 2,
            vx,
            vy,
            size,
            size,
            c,
            l));
        }
    };

    this.Update = function () {
        if (this.particles.length === 0) {
            return;
        }
        // update each particle's life
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];
            p.Update();
            // remove dead particles
            if (p.life <= 0 || CheckBounds(p)) {
                this.particles.splice(i, 1);
            }
        }
    };

    this.Draw = function () {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].Draw(this.pLife);
        }
    };
};

var Gold = function (x, y) {
    this.position = new Vector2(x, y);
    this.width = blockSize * 6;
    this.height = blockSize * 3.1;

    // drawing variables
    var scaleX = 11;
    var sideScaleX = 8;
    var frontScaleX = scaleX - sideScaleX;
    var w = this.width / scaleX;
    var sideWidth = w * sideScaleX;
    var frontWidth = w * frontScaleX;
    var scaleY = 4;
    var frontScaleY = 2;
    var topScaleY = (scaleY - frontScaleY) / 2;
    var h = this.height / scaleY;
    var frontHeight = h * frontScaleY;
    var topHeight = h * topScaleY;

    this.CollisionRect = function () {
        var r = {
            position: this.position.Clone(),
            width: this.width,
            height: this.height
        };
        return r;
    };

    this.Update = function () {
        this.position.x -= moveSpeedX;
    };

    this.DrawCollisionRect = function () {
        fill(255, 0, 0, 100);
        var cr = this.CollisionRect();
        rect(cr.position.x, cr.position.y, cr.width, cr.height);
    };

    this.Draw = function () {
        //stroke(255, 235, 220);
        noStroke();
        var x = this.position.x;
        var y = this.position.y;

        // top / base
        fill(color(255, 213, 0));
        y += topHeight;
        beginShape();
        vertex(x, y);
        y += frontHeight;
        vertex(x, y);
        y += topHeight;
        x += frontWidth;
        vertex(x, y);
        x += sideWidth;
        y -= topHeight;
        vertex(x, y);
        y -= frontHeight;
        vertex(x, y);
        x -= frontWidth;
        y -= topHeight;
        vertex(x, y);
        endShape(CLOSE);

        // front
        fill(color(255, 170, 0));
        beginShape();
        x -= sideWidth;
        y += topHeight;
        vertex(x, y);
        y += frontHeight;
        vertex(x, y);
        x += frontWidth;
        y += topHeight;
        vertex(x, y);
        y -= frontHeight;
        vertex(x, y);
        endShape(CLOSE);
        fill(255, 0, 0);

        // side
        fill(color(255, 132, 0));
        beginShape();
        vertex(x, y);
        y += frontHeight;
        vertex(x, y);
        x += sideWidth;
        y -= topHeight;
        vertex(x, y);
        y -= frontHeight;
        vertex(x, y);
        endShape(CLOSE);

        //this.DrawCollisionRect();
    };
};

var GoldCollection = function () {
    this.gold = [];
    this.goldPSys = new GoldParticleSystem(0, 0);

    this.Reset = function () {
        this.gold = [];
        this.goldPSys.Reset();
    };

    this.Add = function (g) {
        this.gold.push(g);
    };

    // give points for gold collected
    this.CheckGoldCollision = function () {
        for (var i = this.gold.length - 1; i >= 0; i--) {
            var g = this.gold[i];
            if (Overlap(g.CollisionRect(), cmndrVideo.CollisionRect())) {
                score += goldPoints;

                // temp gold particle solution
                this.goldPSys.position = g.position.Clone();
                this.goldPSys.position.y += g.height / 2;
                this.goldPSys.SpawnParticles();

                this.gold.splice(i, 1);
            }
        }
    };

    this.Update = function () {
        for (var i = this.gold.length - 1; i >= 0; i--) {
            var g = this.gold[i];
            g.Update();
            if (g.position.x + g.width < 0) {
                this.gold.splice(i, 1);
            }
        }
        this.CheckGoldCollision();
        this.goldPSys.Update();
    };

    this.Draw = function () {
        for (var i = 0; i < this.gold.length; i++) {
            this.gold[i].Draw();
        }
    };

    this.DrawPSys = function () {
        this.goldPSys.Draw();
    };
};

var FireParticle = function (px, py, vx, vy, width, height, life) {
    this.position = new Vector2(px, py);
    this.velocity = new Vector2(vx, vy);
    this.width = width;
    this.height = height;
    this.startColor = color(250, 130, 15);
    this.endColor = obstacleColors[obstacleTypes.indexOf("jump")];
    this.life = life;
    this.startingLife = life;

    this.Update = function () {
        this.position.Add(this.velocity);
        this.life--;
    };

    this.Draw = function (x) {
        var c = lerpColor(this.endColor, this.startColor, this.life / this.startingLife);
        //var c = obstacleColors[obstacleTypes.indexOf("jump")];
        fill(c);
        noStroke();
        rect(this.position.x + x, this.position.y, this.width, this.height);
    };
};

var FireParticleSystem = function (x, y, w, p) {
    this.particles = [];
    this.position = new Vector2(x, y);
    this.pSize = blockSize * 0.55;
    this.pLife = 20;
    this.spawnCount = 1;
    this.width = w;
    this.parent = p;

    this.SpawnParticles = function () {
        // new particles
        for (var i = 0; i < this.spawnCount; i++) {
            var vy = random(-2, -0.3);
            this.particles.push(
            new FireParticle(
            random(this.width - this.pSize),
            this.position.y,
            0,
            vy,
            this.pSize,
            this.pSize,
            this.pLife));
        }
    };

    this.Update = function () {
        //this.position = new Vector2(mouseX, mouseY);
        if (this.parent) {
            this.position = this.parent.position.Clone();
        }
        this.SpawnParticles();
        // update each particle's life        
        for (var i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];
            p.Update();
            // remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    };

    this.Draw = function () {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].Draw(this.position.x);
        }
    };
};

var Triangle = function (p0, p1, p2, v, rot, c) {
    this.points = [];
    this.points.push(p0);
    this.points.push(p1);
    this.points.push(p2);
    this.velocity = v;
    this.angle = 0;
    this.rotAmount = rot;
    this.fillColor = c;

    this.Update = function () {
        this.angle += this.rotAmount;
        for (var i = 0; i < this.points.length; i++) {
            this.points[i].Add(this.velocity);
        }
    };

    this.Draw = function () {
        noStroke();
        fill(this.fillColor);
        var offsetX = 0;
        var offsetY = 0;
        for (var i = 0; i < this.points.length; i++) {
            offsetX += this.points[i].x;
            offsetY += this.points[i].y;
        }
        offsetX /= this.points.length;
        offsetY /= this.points.length;

        pushMatrix();
        translate(offsetX, offsetY);
        rotate(this.angle);
        translate(-offsetX, -offsetY);

        triangle(
        this.points[0].x,
        this.points[0].y,
        this.points[1].x,
        this.points[1].y,
        this.points[2].x,
        this.points[2].y);
        popMatrix();
    };
};

var Obstacle = function (t) {
    this.type = t;
    this.position = new Vector2(0, 0);
    this.width = 0;
    this.height = 0;

    switch (obstacleTypes[t]) {
        case "jump":
            this.width = blockSize * 3.2;
            this.height = blockSize * 3.2;
            this.position.y = groundHeight - this.height;
            this.color = obstacleColors[t];
            break;
        case "kick":
            this.width = blockSize * 2;
            this.height = cmndrSize;
            this.position.y = groundHeight - this.height;
            this.color = obstacleColors[t];
            break;
        case "slide":
            this.width = blockSize * 10;
            this.height = groundHeight - blockSize * 6;
            this.position.y = 0;
            this.color = obstacleColors[t];
            break;
        case "launch":
            this.width = blockSize * 5;
            this.height = blockSize * 1.5;
            this.position.y = groundHeight;
            this.color = obstacleColors[t];
            break;
    }
    this.position.x = screenWidth;
    this.width = round(this.width);
    this.height = round(this.height);

    this.Update = function () {
        this.position.x -= moveSpeedX;
    };

    this.Draw = function () {
        fill(this.color);
        rect(this.position.x, this.position.y, this.width, this.height);
    };
};

var ObstacleCollection = function () {
    this.obstacles = [];
    this.pSystems = [];
    this.debris = [];

    this.Reset = function () {
        this.obstacles = [];
        this.pSystems = [];
        this.debris = [];
    };

    // broken kick obstancle triangles
    this.SpawnDebris = function (rect, kickRect) {
        //this.debris = [];
        var x = rect.position.x;
        var x2 = rect.position.x + rect.width;
        var y = kickRect.position.y + kickRect.height / 2;
        var breakDist;
        var min = 1.0;
        var max = 5;
        var scaleX = 1.85;
        var closeScaleX = 0.85;
        var closeRot = 0.065;
        var farRot = 0.055;

        // top left
        breakDist = random(min, max);
        this.debris.push(
        new Triangle(
        new Vector2(rect.position.x - breakDist, rect.position.y - breakDist),
        new Vector2(rect.position.x + rect.width - breakDist, rect.position.y - breakDist),
        new Vector2(x - breakDist, y - breakDist),
        new Vector2(moveSpeedX * scaleX * closeScaleX, 0), -PI * closeRot,
        rect.color));
        // top right
        breakDist = random(min, max);
        this.debris.push(
        new Triangle(
        new Vector2(rect.position.x + rect.width + breakDist, rect.position.y - breakDist),
        new Vector2(x + breakDist, y - breakDist),
        new Vector2(x2 + breakDist, y - breakDist),
        new Vector2(moveSpeedX * scaleX, 0), -PI * farRot,
        rect.color));
        // bottom right
        breakDist = random(min, max);
        this.debris.push(
        new Triangle(
        new Vector2(x + breakDist, y + breakDist),
        new Vector2(x2 + breakDist, y + breakDist),
        new Vector2(rect.position.x + rect.width + breakDist, rect.position.y + rect.height + breakDist),
        new Vector2(moveSpeedX * scaleX, 0),
        PI * farRot,
        rect.color));
        // bottom left
        breakDist = random(min, max);
        this.debris.push(
        new Triangle(
        new Vector2(rect.position.x - breakDist, rect.position.y + rect.height + breakDist),
        new Vector2(rect.position.x + rect.width - breakDist, rect.position.y + rect.height + breakDist),
        new Vector2(x - breakDist, y + breakDist),
        new Vector2(moveSpeedX * scaleX * closeScaleX, 0),
        PI * closeRot,
        rect.color));
    };

    // check for collision between commander video and obstacles
    this.CheckCollision = function () {
        for (var i = this.obstacles.length - 1; i >= 0; i--) {
            var c = cmndrVideo;
            var o = this.obstacles[i];
            // launch
            if (obstacleTypes[o.type] === "launch") {
                if (c.CanLaunch()) {
                    var halfX = c.position.x + c.width / 2;
                    if (halfX >= o.position.x && halfX < o.position.x + o.width) {
                        o.position.y -= o.height;
                        c.Launch();
                    }
                }
            }
            // collision, change game state to loss
            else {
                // kick check
                if (c.isKicking && obstacleTypes[o.type] === "kick" && Overlap(o, c.KickRect())) {
                    this.SpawnDebris(this.obstacles.splice(i, 1)[0], c.KickRect());
                    continue;
                }
                // collision
                if (Overlap(o, c.CollisionRect())) {
                    LoseGame();
                    return;
                }
            }
        }
    };

    this.Update = function () {
        // update obstacles
        for (var i = this.obstacles.length - 1; i >= 0; i--) {
            var o = this.obstacles[i];
            o.Update();
            // check bounds
            if (o.position.x + o.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
        // update timer
        if (launchTimer <= 0) {
            obstacleTimer += 1;
        } else {
            launchTimer--;
        }

        // spawn new obstacle on timer complete
        if (obstacleTimer >= obstacleSpawnInterval) {
            obstacleTimer = 0;
            if (obstacleSpawnInterval > obstacleSpawnMin) {
                obstacleSpawnInterval--;
            }
            // pick obstacle type
            // spawn launches less frequently
            var obIndex;
            var launchRatio = 3;
            var total = (launchRatio - 1) * (obstacleTypes.length - 1) + obstacleTypes.length;
            var rand = random(total);
            for (i = 0; i < obstacleTypes.length; i++) {
                if (rand < (i + 1) * launchRatio) {
                    obIndex = i;
                    break;
                }
            }

            //obIndex = 1; // debug obstacle type
            var o = new Obstacle(obIndex);
            this.obstacles.push(o);

            // additional spawning events
            if (obstacleTypes[obIndex] === "launch") {
                // ground
                launchTimer = launchTimerMax;
                ground.push(new Ground(screenWidth, o.width * 2));
                ground.push(new Ground(screenWidth + launchTimerMax * moveSpeedX, obstacleSpawnInterval * moveSpeedX));
                // gold
                if (random(1) < 0.5) {
                    gold.Add(new Gold(screenWidth + moveSpeedX * launchTimerMax / 2, 0));
                }
            } else if (obstacleTypes[obIndex] === "slide") {
                // gold
                if (random(1) < 0.33) {
                    var o = this.obstacles[this.obstacles.length - 1];
                    var g = new Gold(o.position.x + o.width, groundHeight - cmndrSize);
                    var offset = (obstacleSpawnMin * moveSpeedX - o.width - g.width) / 2;
                    g.position.x += offset;
                    gold.Add(g);
                }
            } else if (obstacleTypes[obIndex] === "jump") {
                this.pSystems.push(new FireParticleSystem(o.position.x, o.position.y, o.width, o));
                // prime the fire/generate particles
                for (i = 0; i < 10; i++) {
                    this.pSystems[this.pSystems.length - 1].Update();
                }
            } else if (obstacleTypes[obIndex] === "kick") {

            }
            // ground for non launch obstacles
            if (obstacleTypes[obIndex] !== "launch") {
                ground.push(new Ground(screenWidth, obstacleSpawnInterval * moveSpeedX));
            }
        }

        // update particle systems
        for (var i = this.pSystems.length - 1; i >= 0; i--) {
            var p = this.pSystems[i];
            p.Update();
            // remove parentless
            if (this.obstacles.indexOf(p.parent) < 0) {
                this.pSystems.splice(i, 1);
            }
        }
        //println(this.pSystems.length);

        // update debris	
        for (var i = this.debris.length - 1; i >= 0; i--) {
            var d = this.debris[i];
            d.Update();
            // remove offscreen debris
            if (d.points[0].x > width * 2) {
                this.debris.splice(i, 1);
            }
        }
    };

    this.Draw = function () {
        // draw particle systems
        for (var i = 0; i < this.pSystems.length; i++) {
            this.pSystems[i].Draw();
        }

        // draw obstacles
        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].Draw();
        }

        // draw debris	
        for (var i = 0; i < this.debris.length; i++) {
            this.debris[i].Draw();
        }
    };
};

var DrawScore = function () {
    ctx.save();

    // draw score
    textSize(scoreTextSize);
    text("", 0, 0);
    ctx.textBaseline = "middle";
    var txt, x, y;
    ctx.fillStyle = "white";
    ctx.lineWidth = 4;
    // score
    x = 10;
    y = screenHeight - 25;
    ctx.textAlign = "left";
    txt = "Score: " + round(score);
    ctx.strokeStyle = "black";
    ctx.strokeText(txt, x, y);
    ctx.fillText(txt, x, y);
    // high score
    ctx.textAlign = "right";
    x = screenWidth - 10;
    txt = "High Score: " + round(highScore);
    ctx.strokeText(txt, x, y);
    ctx.fillText(txt, x, y);

    ctx.restore();
};

var DrawControls = function () {
    ctx.save();
    var txtSize = ctrlTextSize;
    var x, y, txt, ctrlTxt, txtWidth;
    var bufferX = 10;
    var bufferY = 18;
    var obIndex = 0;
    var ctrlOffset = 11;
    var rectOffsetX = 8;
    var rectOffsetY = 5;
    textAlign(LEFT, TOP);
    textSize(txtSize);

    var props = [];
    for (var prop in controls) {
        props.push(prop);
    }

    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 2; j++) {
            x = j * screenWidth / 2 + bufferX * (j + 2);
            y = groundHeight + txtSize * i + bufferY * (i + 1) + rectOffsetY * i;
            // control key text
            fill(255, 255, 255);
            ctrlTxt = controls[props[obIndex]].toString().toUpperCase();
            text(ctrlTxt, x, y);
            txtWidth = ctx.measureText(ctrlTxt).width;
            // rect
            noFill();
            strokeWeight(3);
            stroke(obstacleColors[obIndex]);
            rect(x - rectOffsetX, y - rectOffsetY * 0.8, txtWidth + rectOffsetX * 2, txtSize + rectOffsetY * 2);
            // control action text
            txt = props[obIndex];
            txt = Capitalize(txt);
            fill(obstacleColors[obIndex]);
            fill(255, 255, 255);
            text(txt, x + txtWidth + ctrlOffset + rectOffsetX, y);

            obIndex++;
        }
    }
    ctx.restore();
};

var BgText = function () {
    this.txtSize = height / 2;
    this.position = new Vector2(width, height / 2 - this.txtSize / 2);
    this.colors = [color(255, 160, 80, 150), color(255, 140, 170, 150), color(245, 220, 90, 150)];
    this.colorIndex = 0;
    this.max = false; // at max level
    this.startText = "BEGIN";
    this.maxText = "MAX LEVEL";
    this.txt = this.startText;
    this.baseVelocityX = moveSpeedX * 0.65;
    this.velocity = new Vector2(this.baseVelocityX, 0);
    textSize(this.txtSize);
    this.txtWidth = ctx.measureText(this.txt).width;
    this.isVisible = true;
    this.counter = 0;
    this.counterMax = 40;

    this.Reset = function () {
        this.position = new Vector2(width, height / 2 - this.txtSize / 2);
        this.velocity = new Vector2(this.baseVelocityX, 0);
        textSize(this.txtSize);
        this.txt = this.startText;
        this.txtWidth = ctx.measureText(this.txt).width;
        this.isVisible = true;
        this.max = false;
    };

    this.Update = function () {
        // movement
        if (!this.max && obstacleSpawnInterval === obstacleSpawnMin) {
            this.max = true;
            this.position.x = width;
            this.txt = this.maxText;
            textSize(this.txtSize);
            this.txtWidth = ctx.measureText(this.txt).width;
            this.velocity.x = this.baseVelocityX;
            this.isVisible = true;
        }
        this.position.Sub(this.velocity);
        if (this.position.x + this.txtWidth < 0) {
            this.isVisible = false;
        }

        // color        
        this.counter++;
        if (this.counter >= this.counterMax) {
            this.counter = 0;
            this.colorIndex = (this.colorIndex + 1) % this.colors.length;
        }
    };

    this.Draw = function () {
        if (!this.isVisible) {
            return;
        }
        var c = lerpColor(this.colors[this.colorIndex], this.colors[(this.colorIndex + 1) % this.colors.length], this.counter / this.counterMax);
        fill(c);
        noStroke();
        textSize(this.txtSize);
        textAlign(LEFT, TOP);
        text(this.txt, this.position.x, this.position.y);
    };
};

// Setup the Processing Canvas
void setup() {
    console.log("setup");
    size(400, 400);
    strokeWeight(10);
    frameRate(35);

    cmndrVideo = new CommanderVideo();
    startButton = new StartButton(screenWidth / 2, screenHeight / 6);
    InitializeGround();
    pSys = new ParticleSystem(cmndrVideo, cmndrVideo.position.x, cmndrVideo.position.y, psSize, colors, pLife);
    obstacles = new ObstacleCollection();
    gold = new GoldCollection();
    bgText = new BgText();
    gameState = GameStates.menu;

    console.log("setup complete");
}

// Main draw loop
void draw() {
    /*var s = 0.50;
    translate(screenWidth/2*(1-s), screenHeight/2*(1-s));
    scale(s, s);*/

    background(bgColor);

    switch (gameState) {
        case "menu":
            // update
            cmndrVideo.Update();
            pSys.Update();
            startButton.Update();
            SetLastKeyState();

            // draw
            pSys.Draw();
            cmndrVideo.Draw();
            DrawGround();
            DrawControls();
            startButton.Draw();
            break;
        case "playing":
            // pause if not focused
            if (!focused) {
                textSize(35);
                textAlign(CENTER, CENTER);
                fill(ColorWithAlpha(black, 125));
                rect(0, 0, screenWidth, screenHeight);
                fill(255, 255, 255);
                text("Paused", screenWidth / 2, screenHeight / 2);
                return;
            }

            // update
            score += scoreIncrement;
            bgText.Update();
            UpdateGround();
            cmndrVideo.Update();
            pSys.Update();
            gold.Update();
            obstacles.Update();
            obstacles.CheckCollision();
            SetLastKeyState();

            // draw            
            bgText.Draw();
            gold.Draw();
            pSys.Draw();
            cmndrVideo.Draw();
            DrawGround();
            obstacles.Draw();
            DrawScore();
            if (cmndrVideo.isAlive) {
                gold.DrawPSys();
            }
            break;
        case "loss":
            // commander video flashes
            if (lossTimer % round(lossTimerMax / flashes / 2) === 0) {
                cmndrVideo.isVisible = !cmndrVideo.isVisible;
            }
            lossTimer++;

            // draw  
            bgText.Draw();
            gold.Draw();
            pSys.Draw();
            cmndrVideo.Draw();
            DrawGround();
            obstacles.Draw();
            //DrawObstacles();
            DrawScore();

            // end loss state
            if (lossTimer >= lossTimerMax) {
                ResetGame();
            }
    }
}