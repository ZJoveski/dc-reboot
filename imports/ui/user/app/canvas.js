import { Session } from './../../../api/session.js';



export var OldCanvas = function () {
  var self = this,                      // Reference to the canvas object itself.
      numNodes = 0,                     /* The number of nodes in the corresponding neighborhood.
                                           Until neighborhood is made known to the client, the
                                           default value is set to 0. */
      svg;                              // Reference to the svg object (which contains the actual
                                        // drawing of the neighborhood).
  
  // name_node[someName] references the node corresponding to someName on the canvas drawing.
  name_node = {};
  name_circle = {};
  
  coordinates = {};

  var viewBoxWidth = 1024,              // Specifying the internal coordinate system of the view  
      viewBoxHeight = 768;              // box.
  

  // Resolve size of network issues.
  var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  var vpMin = Math.min(vpWidth, vpHeight);
  
  var freeWidth = ((vpWidth - 0.37 * vpMin - 0.25 * vpWidth)/vpWidth) * viewBoxWidth;
  var freeHeight = viewBoxHeight;
  var freeViewBoxSpace = Math.min(freeWidth, freeHeight);

  var leftBoundary = ((0.37 * vpMin)/vpWidth) * viewBoxWidth;
  var rightBoundary = 0.75 * viewBoxWidth;

  // var nodeRadius = viewBoxHeight / 19.5;                         
  var nodeRadius = freeViewBoxSpace / 19.5; 

  // var centerX = viewBoxWidth/2.075,        
      var centerX = (leftBoundary + rightBoundary)/2, // The coordinates of the center of the circle representing
      centerY = viewBoxHeight/2;              // the node belonging to the current client.
  
  var primaryEdgeColor = "black",
      secondaryEdgeColor = "LightGrey",
      edgeWidth = 3.5,
      edgeLengthMultiplier = 10,
      nodeBorderColor = "black",
      textFont = "sans-serif",
      textSize = nodeRadius * 0.75,
      textColor = "black",
      defaultNodeColor = Session.defaultNodeColor;
  
  var createSvg = function() {
    var coordinateSystem ="0 0 " + viewBoxWidth + " " + viewBoxHeight;
    svg = d3.select('#canvas').append('svg')
            .attr("viewBox", coordinateSystem)
            .classed("svg-content-responsive",true);
    console.log(d3.select('#canvas'));
    console.log("svg created");
  };
  createSvg();

  self.clear = function() {
    d3.select('svg').remove();
    createSvg();
  };
  
  self.draw = function(namesOfNeighbors,neighAdjMatrix) {
    if (svg) {
        // self.clear();
        numNodes = namesOfNeighbors.length;
        
        edgeLengthMultiplier = 4 + (numNodes - 3) / 2;
        
        // Initialize the central node (the one corresponding to the current client).
        self.initializeNode(namesOfNeighbors[0], centerX, centerY);
        
        // Initialize the remaining nodes.
        for(var i=1; i<numNodes; i++)
            self.initializeNode(namesOfNeighbors[i], edgeLengthMultiplier * nodeRadius * Math.cos((Math.PI * 2 * i) / (numNodes-1)) 
                                + centerX, edgeLengthMultiplier * nodeRadius * Math.sin((Math.PI * 2 * i) / (numNodes-1)) + centerY);
        
        // Draw primary edges.
        for(var j=1; j<numNodes; j++) {
            if(neighAdjMatrix[0][j]) {
                        self.drawStraightEdge(coordinates[namesOfNeighbors[0]].x, coordinates[namesOfNeighbors[0]].y,
                                  coordinates[namesOfNeighbors[j]].x, coordinates[namesOfNeighbors[j]].y, primaryEdgeColor);
            }
        }
        
        // Draw secondary edges.
        
        // Draw the edges between nodes of the neighborhood.
        for(var i=1; i<numNodes; i++)
            for(var j=i+1; j<numNodes; j++)
                if(neighAdjMatrix[i][j])
                    if(i > 0 && numNodes % 2 == 1 && j - i == (numNodes-1) / 2)
                        self.drawCurvedEdge(coordinates[namesOfNeighbors[i]].x, coordinates[namesOfNeighbors[i]].y,
                                  coordinates[namesOfNeighbors[j]].x, coordinates[namesOfNeighbors[j]].y,
                                  centerX, centerY, secondaryEdgeColor);
                    else
                        self.drawStraightEdge(coordinates[namesOfNeighbors[i]].x, coordinates[namesOfNeighbors[i]].y,
                                  coordinates[namesOfNeighbors[j]].x, coordinates[namesOfNeighbors[j]].y, secondaryEdgeColor);
        
        // Draw the nodes of the neighborhood (along with their labels, i.e. names).
        self.drawCentralNode(namesOfNeighbors[0]);
        for(var i=1; i<numNodes; i++)
        // for(var i=0; i<numNodes; i++)
            self.drawNode(namesOfNeighbors[i]);
    }
  };
  
  self.initializeNode = function(nodeName, cx, cy) {
      coordinates[nodeName] = {x: cx, y: cy};
  };
  
  self.drawCurvedEdge = function(x1, y1, x2, y2, cx, cy, edgeColor) {
      var hyp = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
      var sinGamma = Math.abs(y2-y1)/hyp;
      var cosGamma = Math.abs(x2-x1)/hyp;
      
      var path = ("M " + x1 + " " + y1 + " C" + " " + x1 + " " + y1 + " " +
                  (cx - edgeLengthMultiplier * nodeRadius * sinGamma) + " " + (cy + edgeLengthMultiplier * nodeRadius  * cosGamma) 
                  + " "+ x2 + " " + y2);
      svg.append("svg:path")
         .attr("d", path)
         .style("stroke-width", edgeWidth)
         .style("stroke", edgeColor)
         .style("fill", "none");
  };
  
  self.drawStraightEdge = function(x1, y1, x2, y2, edgeColor) {
      svg.append("line")
         .style("stroke", edgeColor)
         .attr("stroke-width", edgeWidth)
         .attr("x1", x1)
         .attr("y1", y1)
         .attr("x2", x2)
         .attr("y2", y2)
  };
  
  self.drawNode = function(nodeName) {
      // Define a "g" SVG element that will be used for grouping the circle and the text together.
      name_node[nodeName] = svg.append("g")
                               .attr("transform", "translate(" + coordinates[nodeName].x + "," + coordinates[nodeName].y + ")");
      
      name_circle[nodeName] = name_node[nodeName].append("circle")
                                                 .style("fill", defaultNodeColor)
                                                 .style("stroke", nodeBorderColor)
                                                 .attr("r", nodeRadius);
    
      self.drawLabel(nodeName);
  };
      
  self.drawCentralNode = function(nodeName) {
      console.log("drawing central node");
      // Define a "g" SVG element that will be used for grouping the circle and the text together.
      name_node[nodeName] = svg.append("g")
                               .attr("transform", "translate(" + coordinates[nodeName].x + "," + coordinates[nodeName].y + ")");
      
      name_circle[nodeName] = name_node[nodeName].append("circle")
                                                 .style("fill", defaultNodeColor)
                                                 .style("stroke", nodeBorderColor)
                                                 .attr("r", nodeRadius);
    
      self.drawCentralLabel(nodeName);
  };
  
  self.updateNodeColor = function(nodeName, color) {
      if(name_circle.hasOwnProperty(nodeName)) {
          console.log("update color successful");
          (name_circle[nodeName]).style("fill", color);
      }
  };
  
  self.drawLabel = function(nodeName) {
      name_node[nodeName].append("text")
                         .text(nodeName)
                         .attr("font-family", textFont)
                         .attr("font-size", textSize)
                         .attr("fill", textColor)
                         .attr("text-anchor", "middle")                 // Ensures horizontal alignment of text.
                         .attr("alignment-baseline", "middle");         // Ensures vertical alignment of text.
  };
  
  self.drawCentralLabel = function(nodeName) {
      var nodeLabel = "Me";
      
      name_node[nodeName].append("text")
                         .text(nodeLabel)
                         .attr("font-family", textFont)
                         .attr("font-size", textSize)
                         .attr("fill", textColor)
                         .attr("text-anchor", "middle")                 // Ensures horizontal alignment of text.
                         .attr("alignment-baseline", "middle");         // Ensures vertical alignment of text.
  };
}
