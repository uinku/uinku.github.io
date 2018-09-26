document.oncontextmenu = function() {
  return false;
}

var game;

function setup() {
  createCanvas(500, 500);  
  var restartButton = createButton("Restart");
  restartButton.mousePressed(restart);
  restart();
}

function restart() {  
  game = new Game(height * 0.065);
  //game.graph.print();
  console.log("genus: " + game.graph.getGenus());
  console.log("sum: " + game.graph.getSum());
  console.log("solvable: " + game.isSolvable());
  game.draw();
  //console.log("end setup");  
}

/** Node **/

var Node = function(id, value, x, y) {
  this.id = id;
  this.value = value;
  this.x = x;
  this.y = y;
};

Node.prototype.toString = function() {
  return "Node [" + [this.id, this.value, this.x, this.y].join(", ") + "]";
};

Node.prototype.draw = function(d) {
  fill(255);
  ellipse(this.x, this.y, d, d);
  fill(0);
  text(this.value, this.x, this.y);
};

/** Graph **/

var Graph = function() {
  this.nodes = [];
  this.edges = [];
  this.edgeCount = 0;
};

Graph.prototype.createNode = function(value, x, y) {
  var node = new Node(this.edgeCount++, value, x, y);
  for (var i = 0; i < this.edges.length; i++) {
    this.edges[i].push(false);
  }
  var edgeConnections = [];
  for (var i = 0; i < this.nodes.length; i++) {
    edgeConnections.push(false);
  }
  edgeConnections.push(true);
  this.edges.push(edgeConnections);
  this.nodes.push(node);
};

Graph.prototype.isValidIndex = function(i) {
  return i >= 0 && i < this.nodes.length;
};

Graph.prototype.connect = function(i, j) {
  if (!this.isValidIndex(i) || !this.isValidIndex(j)) {
    return;
  }
  this.edges[i][j] = true;
  this.edges[j][i] = true;
};

Graph.prototype.getConnectedEdges = function(index) {
  var edges = [];
  for (var i = 0; i < this.edges[index].length; i++) {
    if (this.edges[index][i] === true) {
      edges.push(i);
    }
  }
  return edges;
};

Graph.prototype.getGenus = function() {
  return this.edgeCount - this.nodes.length + 1;
};

Graph.prototype.getSum = function() {
  return this.nodes.reduce(function(sum, node) {
    return sum + node.value;
  }, 0);
};

Graph.prototype.print = function() {
  console.log(this.nodes);
  for (var i = 0; i < this.edges.length; i++) {
    console.log(this.edges[i]);
  }
};

Graph.prototype.drawEdges = function(sw) {
  strokeWeight(sw);
  stroke(0);
  for (var i = 0; i < this.nodes.length; i++) {
    for (var j = i + 1; j < this.nodes.length; j++) {
      if (this.edges[i][j] === true) {
        line(this.nodes[i].x, this.nodes[i].y, this.nodes[j].x, this.nodes[j].y);
      }
    }
  }
};

Graph.prototype.drawNodes = function(nodeRadius) {
  strokeWeight(2);
  stroke(0);
  fill(255);
  var d = nodeRadius * 2;
  textSize(nodeRadius);
  textAlign(CENTER, CENTER);
  for (var i = 0; i < this.nodes.length; i++) {
    this.nodes[i].draw(d);
  }
};

Graph.prototype.draw = function(edgeSW, nodeRadius, nodeSW) {
  this.drawEdges(edgeSW);
  this.drawNodes(nodeRadius, nodeSW);
};

/** Game **/

var Game = function(nodeRadius) {
  //console.log("game init");
  this.nodeRadius = nodeRadius;
  this.mouseOverNodeRadius = nodeRadius + 5;
  this.mouseOverNode = null;
  this.moveCount = 0;

  this.graph = new Graph();
  this.graph.createNode(-1, width * 0.2, height * 0.4);
  this.graph.createNode(-2, width * 0.8, height * 0.4);
  this.graph.createNode(1, width * 0.5, height * 0.15);
  this.graph.createNode(3, width * 0.5, height * 0.75);
  this.graph.createNode(2, width * 0.25, height * 0.75);
  this.graph.connect(0, 1);
  this.graph.connect(1, 2);
  this.graph.connect(2, 3);
  this.graph.connect(1, 3);
  this.graph.connect(3, 4);
};

Game.prototype.draw = function() {
  //console.log("game draw");
  background(245);
  this.graph.draw(4, this.nodeRadius, 2);
  if (this.mouseOverNode !== null) {
    strokeWeight(4);
    stroke(255, 81, 0);
    noFill();
    ellipse(this.mouseOverNode.x, this.mouseOverNode.y, this.mouseOverNodeRadius * 2, this.mouseOverNodeRadius * 2);
  }
};

Game.prototype.getNodeAt = function(x, y) {
  for (var i = 0; i < this.graph.nodes.length; i++) {
    var node = this.graph.nodes[i];
    if (dist(node.x, node.y, x, y) <= this.nodeRadius) {
      return node;
    }
  }
  return null;
};

Game.prototype.splitWealth = function(node, isOutward) {
  var connectedEdges = this.graph.getConnectedEdges(node.id);
  var amount = isOutward ? 1 : -1;
  for (var i = 0; i < connectedEdges.length; i++) {
    var other = this.graph.nodes[connectedEdges[i]];
    if (node === other) {
      continue;
    }
    node.value -= amount;
    other.value += amount;
  }
};

Game.prototype.isSolvable = function() {
  return this.graph.getSum() >= this.graph.getGenus();
};

Game.prototype.checkWinCondition = function() {
  for (var i = 0; i < this.graph.nodes.length; i++) {
    //console.log(this.graph.nodes[i].value);
    if (this.graph.nodes[i].value < 0) {
      return false;
    }
  }
  return true;
};

Game.prototype.handleMove = function(x, y) {
  var node = this.getNodeAt(mouseX, mouseY);
  if (node === this.mouseOverNode) {
    return;
  }
  //console.log("handle move");
  this.mouseOverNode = node;
  this.draw();
};

Game.prototype.handleClick = function(x, y, isPositive) {
  var node = this.getNodeAt(mouseX, mouseY);
  if (node === null) {
    return;
  }
  this.moveCount++;
  this.splitWealth(node, isPositive);
  if (this.checkWinCondition() === true) {
    console.log("You won in " + this.moveCount + " move" + (this.moveCount === 1 ? "" : "s") + ".");
  }
  this.draw();
};

/** Input **/

function mouseMoved() {
  //console.log("mouse move");
  game.handleMove(mouseX, mouseY);
};

function mousePressed() {
  //console.log("press " + mouseButton + " " + millis());
  game.handleClick(mouseX, mouseY, mouseButton === LEFT && !(keyIsPressed && keyCode === 16));
  
}

function mouseClicked() {
  //console.log("click " + mouseButton + " " + millis());
}

function keyPressed() {
  //console.log(keyCode);

  if (keyCode === 82) {
    restart();
  }
}
