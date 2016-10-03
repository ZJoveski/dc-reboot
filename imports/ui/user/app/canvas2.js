import { Session } from './../../../api/session.js';

export var Canvas = function() {
    const width = 768;
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

    var triPadding = 5,
        triWidth = nodeRadius / 4,
        triHeight = triWidth,
        triColor = "#1abc9c";

    // allData will store the unfiltered data
    var allData = [];
    var curLinksData = [];
    var curNodesData = [];

    var numNodes = 0;

    var nodesG = null;
    var linksG = null;
    var curvesG = null;
    var labelsG = null;
    var voterG = null;

    function network(selection, namesOfNeighbors, adjMatrix) {
        // create svg container and group elements
        var vis = d3.select(selection).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

        console.log("is this ever run");
        console.log(selection);
        console.log(d3.select(selection));
        console.log(vis);

        linksG = vis.append("g").attr("id", "links");
        curvesG = vis.append("g").attr("id", "curves");
        nodesG = vis.append("g").attr("id", "nodes");
        labelsG = vis.append("g").attr("id", "labels");
        voter = vis.append("g").attr("id", "voter");

        var testdata = {
            x: 50,
            y: 50
        };

        var testTri = makeTriangle(testdata, true);

        var voterTest = voter.selectAll("svg:path").data(testTri, function(d) { return d; });

        console.log(testTri);

        voterTest.enter().append("#tri")
                .attr("d", function(d) { return d.path; })
                .attr("fill", function(d) { return d.color; })
                .attr("stroke", function(d) { return d.color; }),
                .attr("id", "tri");

        // voter.append("svg:path").attr("xlink:href", "http://ninjapenguin.tech:3000/greyarrow_down.png")
        //                     .attr("x", 0)
        //                     .attr("y", 0)
        //                     .attr("width", 50)
        //                     .attr("height", 50);


        network.updateData(namesOfNeighbors, adjMatrix);
    }

    function draw(namesOfNeighbors) {
        drawLinks();
        drawCurves();
        drawNodes();
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

        labels = labelsG.selectAll("text")
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
        curves = curvesG.selectAll("#curve")
                    .data(allData.curves);

        curves.enter().append("svg:path")
            .attr("id", "curve")
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
        nodes.push({
            nodeName: namesOfNeighbors[0],
            x: centerX,
            y: centerY,
            center: true
        });

        edgeLengthMultiplier = 4 + (numNodes - 3) / 2;

        // Initialize the remaining nodes.
        for (var i = 1; i < numNodes; i++) {
            nodes.push({
                nodeName: namesOfNeighbors[i],
                x: edgeLengthMultiplier * nodeRadius * Math.cos((Math.PI * 2 * i) / (numNodes-1)) + centerX,
                y: edgeLengthMultiplier * nodeRadius * Math.sin((Math.PI * 2 * i) / (numNodes-1)) + centerY,
                center: false
            });
        }

        // Add primary edges
        for (var j = 1; j < numNodes; j++) {
            if (adjMatrix[0][j]) {
                sourceNode = getNode(nodes, namesOfNeighbors[0]);
                destNode = getNode(nodes, namesOfNeighbors[j]);
                links.push(makeStraightEdge(sourceNode, destNode, true))
            }
        }

        // Draw secondary edges (edges between nodes of the neighborhood)
        for (var i = 1; i < numNodes; i++) {
            for (var j = i + 1; j < numNodes; j++) {
                if (adjMatrix[i][j]) {
                    var sourceNode = getNode(nodes, namesOfNeighbors[i]);
                    var destNode = getNode(nodes, namesOfNeighbors[j]);
                    if (i > 0 && numNodes % 2 == 1 && j - i == (numNodes-1)/2) {
                        curves.push(Edge(sourceNode, destNode));
                    } else {
                        links.push(makeStraightEdge(sourceNode, destNode, false));
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

    function makeTriangle(sourceNode, up) {
        var path = "";
        var x = sourceNode.x,
            y = sourceNode.y;

        if (up) {
            path += ("M " + (x + nodeRadius + triPadding) + " " + y +
                        " L " + (x + nodeRadius + triPadding + triWidth) + " " + y + 
                        " L " + (x + nodeRadius + triPadding + triWidth/2) + " " + (y + triHeight) + 
                        " Z");
        } else {
            path += ("M " + (x - nodeRadius - triPadding) + " " + y +
                        " L " + (x - nodeRadius - triPadding - triWidth) + " " + y + 
                        " L " + (x - nodeRadius - triPadding - triWidth/2) + " " + (y - triHeight) + 
                        " Z");
        }
        return {
            path: path,
            color: triColor
        }
    }

    function getNode(nodes, name) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName == name) {
                return nodes[i];
            }
        }
    }

    function showVoter(d, i) {
        var content = "<image xlink:href=\"/images/reputation/greyarrow_down.png\""
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





