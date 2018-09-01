/**
 * 2013/07/31
 * James Winkler
 * Slot Machine
 * 
 * Click the lever and release to play.
 * $1.00 per play.
 * 
 * Expected Value: -0.19
 **/

// Global variables
// game
var c = document.getElementById("myCanvas");
var ctx = c.getContext('2d');
var screenWidth = 400;
var screenHeight = 400;
var bgColor = color(168, 12, 3);
var pmouseIsPressed = mousePressed;
var offsetX = 0; // affects slot and lever x
var offsetY = -3; // affects slot and lever y
var rectRoundness = 1.9;
var globalStrokeWeight = 6;
var infoRectColor = color(33, 29, 30);

// items
var itemTypes = ["cherry", "bell", "grape", "lemon", "orange", "bar", "seven"];
var itemColors = [color(235, 7, 7), color(255, 191, 0), color(183, 7, 227), color(250, 236, 35), color(255, 140, 0), color(0, 0, 0), color(8, 201, 37)];
var itemStrokeWeight = 4;
var itemStrokeColor = color(255, 255, 255);
var pitGreen = color(8, 166, 29);
var stemGreen = color(36, 194, 8);

// slots
var slotCount = 3;
var slots = [];
var slotColor = color(212, 205, 205);
var slotStrokeWeight = 6;
var slotHeight = 150;
var slotBufferX = 17;

// lever
var lever;
var leverHeight = 200;
var leverSideWidth = 105;
var leverStrokeWeight = globalStrokeWeight;
var leverBufferX = slotBufferX;
var leverBaseColor = infoRectColor;
var leverBaseStrokeColor = color(219, 160, 11);
var leverBaseStrokeHighlightColor = color(250, 212, 45);
var leverPoleStrokeWeight = globalStrokeWeight * 1.2;
var leverPoleColor = color(201, 199, 201);
var leverPoleHighlightColor = color(236, 234, 237);
var leverPoleShadowColor = color(140, 137, 140);
var leverBallColor = color(255, 34, 0);
var leverBallShadowColor = color(166, 16, 36);
var leverBallShadowHighlightColor = color(179, 9, 111);
var leverOffsetY = 25;

// spin
var spinTimer = 0;
var spinIndex = 0;
var spinTimerMax = 75 / slotCount;
var isSpinning = false;

// winnings
var payoutAmounts = [0.2, 0.5, 1, 2.5, 5, 10, 25, 50, 100];
var payoutChances = [16840, 5000, 3000, 2000, 1500, 1000, 500, 100, 50, 10];
var payoutChanceTotal = 0;
for (var i = 0; i < payoutChances.length; i++){
    payoutChanceTotal += payoutChances[i];
}
//println(payoutChanceTotal);
var winningSet = [];
var playCost = 1;
var totalWinnings = 0;
var winningsToAdd = 0;
var spinsSincePayout = 0;
var lastPayout = 0;

// matches drawing
var matchesBuffer = slotBufferX;
var matches = [];
var matchItemstrokeWeight = 1;

// returns color with alpha
var rgbWithAlpha = function(c, a){
    var r = red(c);
    var g = green(c);
    var b = blue(c);
    return color(r, g, b, a);
};

// returns rgb as string (ctx color)
var rgbToString = function(c){
    var r = red(c);
    var g = green(c);
    var b = blue(c);
    return "rgb(" + r + "," + g + "," + b + ")";
};

// returns rgb as string (ctx color)
var rgbaToString = function(c){
    var r = red(c);
    var g = green(c);
    var b = blue(c);
    var a = alpha(c)/255;
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
};

// returns true if point is in rect
var ContainsPoint = function(rect, x, y){
    if (x >= rect.x && x < rect.x + rect.width &&
        y >= rect.y && y < rect.y + rect.height){
        return true;
    }
    return false;
};

var DrawRectStrokeHighlight = function(x, y, w, h, sw){
    var o = sw/3;
    noFill();
    stroke(leverBaseStrokeHighlightColor);
    strokeWeight(o);
    rect(x + o/2, y + o/2, w-o, h-o, sw * rectRoundness);
};

/***************************************************
 * Item
 **************************************************/

// slot items
var Item = function(x, y, w, h, t, sw){
    this.x = x;
    this.y = y;
    this.width = min(w, h);
    this.height = min(w, h);
    this.type = t;
    this.fillColor = itemColors[this.type];
    this.strokeWeight = sw;
    this.strokeColor = itemStrokeColor;
    
    this.SetType = function(index){
        this.type = index;
        this.fillColor = itemColors[this.type];
    };
    
    this.Draw = function() {
        // symbol

        pushMatrix();
        translate(this.x, this.y);
        switch(itemTypes[this.type]){
            case "cherry":
                var r = this.width * 0.30;
                var x3 = this.width/3;
                var y3 = -this.height/3;
                var x1 = r * -0.8;
                var y1 = r * 0.07;
                var cx1 = x1 + (x3 - x1)/2;
                var cy1 = y1;
                var cx2 = x3;
                var cy2 = y3 - (y3 - y1)/2;
                var x2 = r * 0.12;
                var y2 = r * 0.94;
                var cx3 = x2 + (x3 - x2)/2;
                var cy3 = y2;
                var cx4 = x3;
                var cy4 = y3 - (y3 - y2)/2;
                // stems outline
                noFill();
                stroke(this.strokeColor);
                strokeWeight(this.strokeWeight*2);
                bezier(x1, y1, cx1, cy1, cx2, cy2, x3, y3);
                strokeWeight(this.strokeWeight*2);
                bezier(x2, y2, cx3, cy3, cx4, cy4, x3, y3);
                // stems main
                stroke(stemGreen);
                strokeWeight(this.strokeWeight);
                bezier(x1, y1, cx1, cy1, cx2, cy2, x3, y3);
                bezier(x2, y2, cx3, cy3, cx4, cy4, x3, y3);
                // cherries
                stroke(this.strokeColor);
                strokeWeight(this.strokeWeight * 0.7);
                fill(this.fillColor);
                ellipse(x1, y1, r, r);        
                ellipse(x2, y2, r, r);
                break;
            case "bell":
                var x2 = 0;
                var y2 = -this.height/2;
                var x1 = -this.width/2;
                var y1 = this.height/4;
                var x3 = x2;
                var y3 = this.height/2;
                var cx1 = -this.width/6;
                var cy1 = y1;
                var cx2 = x1;
                var cy2 = y2;
                var cx3 = this.width/8;
                var cy3 = this.height/2;
                ctx.beginPath();
                ctx.lineJoin="round";
                ctx.lineWidth = this.strokeWeight;
                ctx.moveTo(x1, y1);
                ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
                ctx.bezierCurveTo(-cx2, cy2, -cx1, cy1, -x1, y1);
                ctx.bezierCurveTo(-x1, cy3, cx3, cy3, x3, y3);
                ctx.bezierCurveTo(-cx3, cy3, x1, cy3, x1, y1);
                ctx.fillStyle = rgbToString(this.fillColor);
                ctx.fill();
                ctx.shadowBlur=0;
                ctx.strokeStyle = rgbToString(this.strokeColor);
                ctx.stroke();
                ctx.closePath();
                break;
            case "grape":
                rotate(radians(-36));
                noStroke();
                // stem 
                stroke(this.strokeColor);
                strokeWeight(this.strokeWeight*2.5);
                line(0, 0, this.width * 0.6, 0);
                fill(this.fillColor);
                strokeWeight(this.strokeWeight);
                ellipse(0, 0, this.width, this.height * 0.81);
                stroke(pitGreen);
                strokeWeight(this.strokeWeight*1.25);
                line(this.width*0.33, 0, this.width * 0.55, 0);
                break;
            case "lemon":
                rotate(radians(-23));
                noStroke();
                fill(this.strokeColor);
                var r = this.width/5;
                var scaleY = 1.2;
                ellipse(this.width/2, 0, r, r*scaleY);
                ellipse(-this.width/2, 0, r, r*scaleY);
                stroke(this.strokeColor);
                strokeWeight(this.strokeWeight);
                fill(this.fillColor);
                ellipse(0, 0, this.width, this.height * 0.85);
                noStroke();
                r /= 2;
                ellipse(this.width/2, 0, r, r*scaleY);
                ellipse(-this.width/2, 0, r, r*scaleY);
                break;
            case "orange":
                stroke(this.strokeColor);
                strokeWeight(this.strokeWeight);
                fill(this.fillColor);
                ellipse(0, 0, this.width * 0.95, this.height * 0.95);
                fill(pitGreen);
                noStroke();
                ellipse(this.width/5, -this.height/6, this.width * 0.1, this.height * 0.1);
                break;
            case "bar":
                stroke(this.strokeColor);
                strokeWeight(this.strokeWeight);
                fill(this.fillColor);
                var w = this.width * 0.38;
                var h = this.height * 0.12;
                rect(-this.width + w, -this.height/2 + h, this.width*2-w*2, this.height - h*2);
                textAlign(CENTER, CENTER);
                textSize(this.width*0.5);
                fill("white");
                text("BAR", 0, 0);
                break;
            case "seven":
                pushMatrix();
                translate(-this.width / 5, 0);
                scale(0.9, 1);
                stroke(this.strokeColor);
                strokeWeight(this.strokeWeight);
                var w = this.width / 4; 
                var h = this.height / 2;
                fill(this.fillColor);
                beginShape();
                vertex(-this.width *0.5 + w, -h);
                vertex(this.width - w, -h);
                vertex(this.width - w*1.2, -h + h * 0.4);
                vertex(w * 1.3, h);
                vertex(w * -0.1, h);
                vertex(w*1.8, -h + h * 0.4);
                vertex(-this.width + w*3.0, -h + h / 2.1);
                endShape(CLOSE);
                popMatrix();
                break;
            default:
                noStroke();
                fill(color(0, 255, 213));
                ellipse(0, 0, this.width, this.height);
                break;
        }
        popMatrix();
    };
};

// returns the index of a random item type
var RandomItemType = function(){
    return floor(random(itemTypes.length));
};

var DrawSlots = function(){
    for (var i = 0; i < slotCount; i++){
        slots[i].Draw();
    }
};

// changes slot item, spin effect better than random item
var IncrementSlots = function(start){
    for (var i = start; i < slotCount; i++){
        var s = slots[i];
        s.item.SetType((s.item.type + 1) % itemTypes.length);
    }
};

// set each slot to a random type
var RandomizeSlots = function(start){
    for (var i = start; i < slotCount; i++){
        var s = slots[i];
        s.item.SetType(RandomItemType());
    }
};

var RandomWinningSet = function(){
    for (var i = 0; i < slotCount; i++){
        winningSet[i] = RandomItemType();
    }
};

var NoMatch = function(){
    var itemCount = [];
    for (var i = 0; i < itemTypes.length; i++){
        itemCount[i] = 0;
    }
    
    for (var i = 0; i < slotCount; i++){ 
        var index = 0;
        while (index === 0){
            index = RandomItemType();
        }
        if (i !== slotCount - 1){
            itemCount[index] += 1;
        } else {
            while (itemCount[index] === slotCount - 1){
                index = RandomItemType();
                while (index === 0){
                    index = RandomItemType();
                }
            }
        }
        winningSet[i] = index;
    }
};

var OneLowestMatch = function(){
    var itemCount = 0;
    
    // set winning indices
    for (var i = 0; i < slotCount; i++){ 
        var index = RandomItemType();
        // if itemCount is already 1, pick a different index
        if (itemCount === 1){
            while (index === 0){
                index = RandomItemType();
            }
        }
        // if no items set randomly, set last item
        if (i === slotCount - 1){
            if (itemCount < 1){
                index = 0;
            }
        }
        // update item count
        if (index === 0){
            itemCount++;
        }
        winningSet[i] = index;
    }
};

var TwoLowestMatch = function(){
    var itemCount = 0;
    
    // set winning indices
    for (var i = 0; i < slotCount; i++){ 
        var index = RandomItemType();
        // if itemCount is already 2, pick a different index
        if (itemCount === 2){
            while (index === 0){
                index = RandomItemType();
            }
        }
        if (itemCount < 2 && i >= slotCount - 2){
            index = 0;
        }
        // update item count
        if (index === 0){
            itemCount++;
        }
        winningSet[i] = index;
    }
};

var ThreeMatch = function(index){
    for (var i = 0; i < slotCount; i++){
        winningSet[i] = index;
    } 
};

// sets the winning item indices
// unpredictable results for a slot count other than three
var SetWinningSet = function(){
    for (var i = 0; i < slotCount; i++){
        winningSet[i] = -1;
    }
    
    var rand = random(payoutChanceTotal);
    var itemIndex = 0;
    var payoutIndex = 0;
    var payoutChanceIndex = 0;
    var payoutChanceCurrent = 0;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        NoMatch();
        winningsToAdd = 0;
        return;
    }
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        OneLowestMatch();
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        TwoLowestMatch();
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    itemIndex = 1;
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        ThreeMatch(itemIndex);
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    itemIndex = 2;
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        ThreeMatch(itemIndex);
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    itemIndex = 3;
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        ThreeMatch(itemIndex);
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    itemIndex = 4;
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        ThreeMatch(itemIndex);
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    itemIndex = 5;
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        ThreeMatch(itemIndex);
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    itemIndex = 0;
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        ThreeMatch(itemIndex);
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
    itemIndex = 6;
    payoutIndex++;
    payoutChanceCurrent += payoutChances[payoutChanceIndex++];
    if (rand < payoutChanceCurrent){
        ThreeMatch(itemIndex);
        winningsToAdd = payoutAmounts[payoutIndex];
        return;
    }
};

// called to start the slots spinning
var SpinSlots = function(){
    isSpinning = true;
    RandomizeSlots(0);
    SetWinningSet();
    totalWinnings -= playCost;
};

// used in slot initialization
var RandomItem = function(x, y, width, height){
    var index = floor(random(itemTypes.length));
    return new Item(x + width/2, y + height / 2, width/3*2, height/3*2, index, itemStrokeWeight);
};

/***************************************************
 * Slot
 **************************************************/

// the slot containing items
var Slot = function(x, y, w, h){
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.item = RandomItem(x, y, w, h);
        
    this.Draw = function(){
        var itemColor = this.item.fillColor;
        
        // main
        noStroke();
        fill(slotColor);
        rect(this.x, this.y, this.width, this.height, slotStrokeWeight * rectRoundness);
        
        // item
        this.item.Draw();
        
        // plastic
        noStroke();
        var grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        var c = rgbWithAlpha(itemColor, 35);
        var white = lerpColor(color(255,255,255,45), c,0.28);
        white = rgbaToString(white);
        c = rgbWithAlpha(itemColor, 30);
        var grey = lerpColor(color(130,120,140,135), c,0.18);
        grey = rgbaToString(grey);
        c = rgbWithAlpha(itemColor, 45);
        var black = lerpColor(color(15,5,20,255), c, 0.15);
        black = rgbaToString(black);   
        grad.addColorStop(0, grey);
        grad.addColorStop(0.15, white);
        grad.addColorStop(0.4, white);
        grad.addColorStop(0.7, grey);
        grad.addColorStop(1, black);
        ctx.fillStyle = grad;
        ctx.fillRect(this.x, this.y, this.width, this.height, slotStrokeWeight * rectRoundness);
        
        // main outline (hack - corners show slightly)
        strokeWeight(slotStrokeWeight);
        stroke(leverBaseStrokeColor);
        noFill();
        rect(this.x, this.y, this.width, this.height, slotStrokeWeight * rectRoundness);
        DrawRectStrokeHighlight(this.x, this.y, this.width, this.height, slotStrokeWeight);
        
        // highlight
        var c = lerpColor(color(255, 255, 255, 200), itemColor, 0.05);
        fill(c);
        noStroke();
        var w = this.width / 15;
        var h = this.height / 18;
        rect(this.x + w, this.y + h*2.0, this.width - w*2, h, h);
    };
};

// set up slot position, size, and slots array
var InitializeSlots = function(){
    var bufferX = slotBufferX;
    var w = (screenWidth - leverSideWidth - bufferX * slotCount) / slotCount;
    var h = slotHeight;
    for (var i = 0; i < slotCount; i++){
        var x = (i + 1) * bufferX + i * w + offsetX;
        var y = screenHeight / 2 + offsetY;
        slots.push(new Slot(x, y - h/2, w, h, itemStrokeWeight));
    }
};

/***************************************************
 * Lever
 **************************************************/

// user interface item used to start slots spinning
var Lever = function(){
    this.x = screenWidth - leverSideWidth + offsetX + leverBufferX+ leverStrokeWeight/2;
    this.y = screenHeight / 2 + offsetY + leverOffsetY;
    this.width = leverSideWidth - leverBufferX * 2 - leverStrokeWeight/2;
    this.height = leverHeight;
    this.y -= this.height/2;
    this.isPressed = false;
    this.baseColor = color(148, 148, 148);
    
    this.Update = function(){
        // lever down on click
        if (ContainsPoint(this, mouseX, mouseY)){
            c.style.cursor = "pointer";
            if (!isSpinning && !pmouseIsPressed && mousePressed){
                this.isPressed = true;
            }
        } else {
            c.style.cursor = "default";
        }
        // spin slots on mouse up
        if (this.isPressed && !mousePressed){
            this.isPressed = false;
            if (!isSpinning){
                SpinSlots();
            }
        }
    };
    
    this.Draw = function(){
        // base
        ctx.strokeStyle = null;
        fill(leverBaseColor);
        stroke(leverBaseStrokeColor);
        strokeWeight(leverStrokeWeight);
        rect(this.x, this.y, this.width, this.height, leverStrokeWeight * rectRoundness);
        DrawRectStrokeHighlight(this.x, this.y, this.width, this.height, leverStrokeWeight);
        
        // pole
        var d = this.height / 2 * 0.8;
        var x = this.x + this.width/2;
        var y = this.y + this.height/2;
        var r = this.width/2 * 0.85 - leverPoleStrokeWeight/2;
        var offsetY = leverPoleStrokeWeight/2;
        if (this.isPressed){
            d *= -1; 
            offsetY *= -1;
        }
        
        var grad = ctx.createLinearGradient(x - leverPoleStrokeWeight, y, x + leverPoleStrokeWeight, y);
        grad.addColorStop(0, rgbToString(leverPoleShadowColor));
        grad.addColorStop(0.2, rgbToString(leverPoleColor));
        grad.addColorStop(0.5, rgbToString(leverPoleHighlightColor));
        grad.addColorStop(0.8, rgbToString(leverPoleColor));
        grad.addColorStop(1, rgbToString(leverPoleShadowColor));
        ctx.beginPath();
        ctx.lineWidth = leverPoleStrokeWeight*2;
        ctx.lineCap = "round";
        ctx.strokeStyle = grad;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - d);
        ctx.stroke();
        ctx.closePath();
        
        // ball
        var offset = r/3;
        var grad = ctx.createRadialGradient(x - offset, y - d - offset, 0, x - offset, y - d - offset, r+offset);
        grad.addColorStop(0, "white");
        grad.addColorStop(0.09, "white");
        grad.addColorStop(0.2, rgbToString(leverBallColor));
        grad.addColorStop(0.85, rgbToString(leverBallShadowColor));
        grad.addColorStop(1, rgbToString(leverBallShadowHighlightColor));
        ctx.beginPath();
        ctx.arc(x, y - d, r, 0, PI*2, false);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.closePath();
    };
};

var UpdateWinnings = function(){
    if (winningsToAdd > 0){
        spinsSincePayout = 0;
        lastPayout = winningsToAdd;
    } else {
        spinsSincePayout++;
    }
    totalWinnings += winningsToAdd;
    winningsToAdd = 0;
};

// handles slot spinning
var UpdateSpinning = function(){
    if (!isSpinning){
        return;
    }
    for (var i = spinIndex; i < slotCount; i++){
        IncrementSlots(spinIndex);
    }
    spinTimer++;
    if (spinTimer >= spinTimerMax){
        spinTimer = 0;
        slots[spinIndex].item.SetType(winningSet[spinIndex]);
        spinIndex++;
        if (spinIndex >= slotCount){
            isSpinning = false;
            spinIndex = 0;
            UpdateWinnings();
        }
    }
};

var DrawWinnings = function(x, y, txtSize, buffer, w, h){
    var txt = "Winnings: ";
    var txtWidth = ctx.measureText(txt).width;
    // rect
    strokeWeight(globalStrokeWeight);
    stroke(leverBaseStrokeColor);
    fill(infoRectColor);
    rect(x, y - txtSize, w, h, globalStrokeWeight * rectRoundness);
    DrawRectStrokeHighlight(x, y - txtSize, w, h, globalStrokeWeight);
    // text
    x += globalStrokeWeight*2;
    y += globalStrokeWeight*1.8;
    textAlign(LEFT, BOTTOM);
    fill(color(255, 255, 255));
    text(txt, x, y);
    // total
    if (totalWinnings >= 0){
        fill(28, 255, 28);
    } else {
        fill(255, 36, 36);
    }
    text(totalWinnings.toFixed(2), x + txtWidth, y);
};

var DrawLastPayoutCount = function(x, y, txtSize, buffer, w, h){
    // rect
    strokeWeight(globalStrokeWeight);
    stroke(leverBaseStrokeColor);
    fill(infoRectColor);
    rect(x, y - txtSize, w, h, globalStrokeWeight * rectRoundness);
    DrawRectStrokeHighlight(x, y - txtSize, w, h, globalStrokeWeight);
    // text
    x += globalStrokeWeight*2;
    y += globalStrokeWeight*1.8;
    textAlign(LEFT, BOTTOM);
    textSize(txtSize);
    fill(color(255, 255, 255));
    text("Spins Since Last Payout: " + spinsSincePayout, x, y);
};

var DrawLastPayout = function(x, y, txtSize, buffer, w, h){
    // rect
    strokeWeight(globalStrokeWeight);
    stroke(leverBaseStrokeColor);
    fill(infoRectColor);
    rect(x, y - txtSize, w, h, globalStrokeWeight * rectRoundness);
    DrawRectStrokeHighlight(x, y - txtSize, w, h, globalStrokeWeight);
    // text
    x += globalStrokeWeight*2;
    y += globalStrokeWeight*1.8;
    textAlign(LEFT, BOTTOM);
    textSize(txtSize);
    fill(color(255, 255, 255));
    text("Last Payout: " + lastPayout.toFixed(2), x, y);
};

var DrawInfoText = function(){
    textAlign(LEFT, CENTER);
    var buffer = slotBufferX;
    var txtSize = screenHeight / 22;
    var w = (screenWidth - buffer * 3);
    var h = txtSize + globalStrokeWeight * 2.8;
    var x = buffer;
    var y = screenHeight - h + globalStrokeWeight/2;
    var offsetAmount = w * 0.47;
    textSize(txtSize);
    DrawWinnings(x, y, txtSize, buffer, offsetAmount, h);
    x += offsetAmount + buffer;
    DrawLastPayout(x, y, txtSize, buffer, w - offsetAmount, h);
    x -= offsetAmount + buffer;
    y -= h + buffer;
    w = (screenWidth - buffer - leverSideWidth);
    DrawLastPayoutCount(x, y, txtSize, buffer, w, h);
};

var InitializeSet = function(x, y, w, h, index, count){
    var buffer = 7;
    w *= 0.55; // shorten the width to provide space for cost
    w = (w - buffer*2) / 3;
    x += w/2;
    y += h/2;
    var items = [];
    for (var i = 0; i < count; i++){
        items.push(new Item(x + i * (buffer + w), y, w, h, index, matchItemstrokeWeight));
    }
    matches.sets.push(items);
};

var InitializeMatches = function(){
    var w = (screenWidth - matchesBuffer*2);
    var h = screenHeight * 0.2;
    var x = matchesBuffer;
    var y = matchesBuffer;
    var numCol = 3;
    var numRow = 3;
    var buffer = 11;
    var w2 = (w - buffer*3) / numCol; 
    var h2 = (h - buffer*2) / numRow;
    
    // initialize matches
    matches = {
        x: x,
        y: y,
        w: w,
        h: h,
        sets: [],
        setWidth: w2
    };
    
    // add every set to matches
    var index = 0;
    var count = 0;
    for (var i = 0; i < numCol; i++){
        for (var j = 0; j < numRow; j++){
            // special case for first two matches
            if (i === 0 && j < 2){
                index = 0;
                if (j === 0){
                    count = 1;
                } else if (j === 1){
                    count = 2;
                }
            } else {
                count = 3;
                if (i < 2){
                    index++;
                } else {
                    if (j < 1){
                        index++;
                    } else if (j === 1){
                        index = 0;
                    } else {
                        index = 6;
                    }
                }
            }
            InitializeSet(x + i * w2 + (i+1) * buffer, y + j * h2 + (j+1) * buffer/2, w2, h2, index, count);
        }
    }
};


var DrawMatches = function(){
    // rect
    strokeWeight(globalStrokeWeight);
    stroke(leverBaseStrokeColor);
    fill(infoRectColor);
    rect(matches.x, matches.y, matches.w, matches.h, globalStrokeWeight * rectRoundness);
    DrawRectStrokeHighlight(matches.x, matches.y, matches.w, matches.h, globalStrokeWeight);
    
    // items
    var buffer = globalStrokeWeight*2.7;
    for (var i = 0; i < matches.sets.length; i++){
        var m = matches.sets[i];
        for (var j = 0; j < matches.sets[i].length; j++){
            m[j].Draw();
        }
        fill("white");
        textAlign(RIGHT, CENTER);
        textSize(12);
        m = m[0];
        var txt = payoutAmounts[i].toFixed(2);
        text(txt, m.x + matches.setWidth - buffer, m.y);
    }
};

var mouseOut() {
    mousePressed = false;
    pmouseIsPressed = false;
};

// Setup the Processing Canvas
void setup() {
    size(screenWidth, screenHeight);
    frameRate(30);
    strokeCap(ROUND);
    smooth();
    
    InitializeMatches();
    InitializeSlots();
    lever = new Lever();
};

// Main draw loop
void draw() {
    lever.Update();
    UpdateSpinning();
    pmouseIsPressed = mousePressed;
    
    background(bgColor);
    DrawSlots();
    lever.Draw();
    DrawInfoText();
    DrawMatches();
};