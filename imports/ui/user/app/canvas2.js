import { Session } from './../../../api/session.js';

export var Canvas = function() {
    const width = 1024;
    const height = 768;

    var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var vpMin = Math.min(vpWidth, vpHeight);

    var freeWidth = ((vpWidth - 0.37 * vpMin - 0.25 * vpWidth)/vpWidth) * width;
    var freeHeight = height;
    var freeViewBoxSpace = Math.min(freeWidth, freeHeight);

    var leftBoundary = ((0.37 * vpMin)/vpWidth) * width;
    var rightBoundary = 0.75 * width;

    var nodeRadius = freeViewBoxSpace / 19.5; 

    var centerX = (leftBoundary + rightBoundary)/2, // The coordinates of the center of the circle representing
    centerY = height/2;                             // the node belonging to the current client.

    var primaryEdgeColor = "black",
        secondaryEdgeColor = "LightGrey",
        edgeWidth = 3.5,
        edgeLengthMultiplier = 10,
        nodeBorderColor = "black",
        textFont = "sans-serif",
        textSize = nodeRadius * 0.75,
        textColor = "black",
        defaultNodeColor = Session.defaultNodeColor;

    // allData will store the unfiltered data
    var allData = [];
    var curLinksData = [];
    var curNodesData = [];

    var numNodes = 0;

    var nodesG = null;
    var linksG = null;
    var curvesG = null;
    var labelsG = null;

    function network(selection, namesOfNeighbors, adjMatrix) {
        // create svg container and group elements
        var vis = d3.select(selection).append("svg")
                    .attr("width", width)
                    .attr("height", height);

        nodesG = vis.append("g").attr("id", "nodes");
        linksG = vis.append("g").attr("id", "links");
        curvesG = vis.append("g").attr("id", "curves");
        labelsG = vis.append("g").attr("id", "labels");

        updateData(namesOfNeighbors, adjMatrix);
    }

    function draw(namesOfNeighbors) {
        drawNodes();
        drawLinks();
        drawCurves();
    }

    function drawNodes() {
        nodes = nodesG.selectAll("circle.node")
                .data(allData.nodes);

        nodes.enter().append("circle")
            .attr("class", "node")
            .attr("id", function(node) { return node.nodeName; })
            .attr("cx", function(node) { return node.x; })
            .attr("cy", function(node) { return node.y; })
            .attr("r", nodeRadius)
            .style("fill", defaultNodeColor)
            .style("stroke", nodeBorderColor);

        labels = textG.selectAll("text")
                .data(allData.nodes);

        labels.enter().append("text")
            .attr("x", function(node) { return node.x; })
            .attr("y", function(node) { return node.y; })
            .attr("font-family", textFont)
            .attr("font-size", textSize)
            .attr("fill", textColor)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(function(node) { 
                if (node.center) {
                    return "Me";
                } else {
                    return node.nodeName;
                }
            });
    }

    function drawLinks() {
        links = linksG.selectAll("line")
                .data(allData.links);

        links.enter().append("line")
            .style("stroke", function(link) { return link.color; })
            .attr("stroke-width", edgeWidth)
            .attr("x1", function(link) { return link.x1; })
            .attr("y1", function(link) { return link.y1; })
            .attr("x2", function(link) { return link.x2; })
            .attr("y2", function(link) { return link.y2; })
    }

    function drawCurves() {
        curves = curvesG.selectAll("svg:path")
                    .data(allData.curves);

        curves.enter().append("svg:path")
            .attr("d", function(curve) { return curve.path; })
            .style("stroke-width", edgeWidth)
            .style("stroke", function(curve) { return curve.color; })
            .style("fill", "none");
    }

    function formatData(namesOfNeighbors, adjMatrix) {
        numNodes = namesOfNeighbors.length;
        var nodes = [];
        var links = [];
        var curves = [];

        // Initialize the central node (the one corresponding to the current client).
        nodes.append({
            nodeName: namesOfNeighbors[0],
            x: centerX,
            y: centerY,
            center: true
        });

        edgeLengthMultiplier = 4 + (numNodes - 3) / 2;

        // Initialize the remaining nodes.
        for (var i = 1; i < numNodes; i++) {
            nodes.append({
                nodeName: namesOfNeighbors[i],
                x: edgeLengthMultiplier * nodeRadius * Math.cos((Math.PI * 2 * i) / (numNodes-1)) + centerX,
                y: edgeLengthMultiplier * nodeRadius * Math.sin((Math.PI * 2 * i) / (numNodes-1)) + centerY,
                center: false
            });
        }

        // Add primary edges
        for (var j = 1; j < numNodes; j++) {
            if (neighAdjMatrix[0][j]) {
                sourceNode = getNode(nodes, namesOfNeighbors[0]);
                destNode = getNode(nodes, namesOfNeighbors[j]);
                links.append(makeStraightEdge(sourceNode, destNode, true))
            }
        }

        // Draw secondary edges (edges between nodes of the neighborhood)
        for (var i = 1; i < numNodes; i++) {
            for (var j = i + 1; j < numNodes; j++) {
                if (neighAdjMatrix[i][j]) {
                    var sourceNode = getNode(nodes, namesOfNeighbors[i]);
                    var destNode = getNode(nodes, namesOfNeighbors[j]);
                    if (i > 0 && numNodes % 2 == 1 && j - i == (numNodes-1)/2) {
                        curves.append(makeCurvedEdge(sourceNode, destNode));
                    } else {
                        links.append(makeStraightEdge(sourceNode, destNode, false));
                    }
                }
            }
        }

        return {
            nodes: nodes,
            links: links,
            curves: curves
        };
    }

    function makeStraightEdge(sourceNode, destNode, primary) {
        var color = primaryEdgeColor;
        if (!primary) {
            color = secondaryEdgeColor;
        }

        return {
            x1: sourceNode.x,
            y1: sourceNode.y,
            x2: destNode.x,
            y2: destNode.y,
            color: color
        };
    }

    function makeCurvedEdge(sourceNode, destNode) {
        var x1 = sourceNode.x, 
            y1 = sourceNode.y,
            x2 = destNode.x,
            y2 = destNode.y;

        var hyp = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        var sinGamma = Math.abs(y2-y1)/hyp;
        var cosGamma = Math.abs(x2-x1)/hyp;

        var path = ("M " + x1 + " " + y1 + " C" + " " + x1 + " " + y1 + " " +
                  (cx - edgeLengthMultiplier * nodeRadius * sinGamma) + " " + (cy + edgeLengthMultiplier * nodeRadius  * cosGamma) 
                  + " "+ x2 + " " + y2);

        return {
            path: path,
            color: secondaryEdgeColor
        }
    }

    function getNode(nodes, name) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName == name) {
                return nodes[i];
            }
        }
    }

    network.updateData = function(namesOfNeighbors, adjMatrix) {
        allData = formatData(namesOfNeighbors, adjMatrix);
        draw(namesOfNeighbors);
    }

    network.updateNodeColor = function(nodeName, color) {
        var selector = "#" + nodeName;
        var node = nodesG.select(selector).style("fill", color);
    }

    return network;
}





