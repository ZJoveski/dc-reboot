import { Session } from './../../../api/session.js';
import './../../../api/meteormethods/game_methods.js';

export var Canvas = function() {
    var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var vpMin = Math.min(vpWidth, vpHeight);

    const width = 1024;
    const height = 768;

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
        // textSize = nodeRadius * 0.75,
        textSize = nodeRadius * .5,
        textColor = "black",
        defaultNodeColor = Session.defaultNodeColor;

    var triPadding = 5,
        triWidth = nodeRadius / 2,
        triHeight = triWidth,
        triColorUp = "green",
        triColorDown = "red",
        triColorNeutral = "grey";


    var barHeight = 10,
        barWidth = nodeRadius*3;

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
    var barsG = null;

    function network(selection, namesOfNeighbors, adjMatrix, neighReputations) {
        var coordinateSystem ="0 0 " + width + " " + height;
        // create svg container and group elements
        var vis = d3.select(selection).append("svg")
                    .attr("viewBox", coordinateSystem)
                    .classed("svg-content-responsive",true);
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

        linksG = vis.append("g").attr("id", "links");
        curvesG = vis.append("g").attr("id", "curves");
        nodesG = vis.append("g").attr("id", "nodes");
        labelsG = vis.append("g").attr("id", "labels");
        barsG = vis.append("g").attr("id", "bars");
        voter = vis.append("g").attr("id", "voter");

        network.updateData(namesOfNeighbors, adjMatrix, neighReputations);
    }

    function draw() {
        drawLinks();
        drawCurves();
        drawNodes();
    }

    function drawNodes() {
        nodes = nodesG.selectAll("circle.node")
                .data(allData.nodes);

        nodes.exit().remove();

        nodes.enter().append("circle")
            .attr("class", "node")
            .attr("id", function(node) { return node.nodeName; })
            .attr("cx", function(node) { return node.x; })
            .attr("cy", function(node) { return node.y; })
            .attr("r", nodeRadius)
            .style("fill", defaultNodeColor)
            .style("stroke", nodeBorderColor);

        nodes.on("click", showVoter);

        labels = labelsG.selectAll("text")
                .data(allData.nodes, function(d) { return d.nodeName + d.reputation; });

        labels.exit().remove();

        labels.enter().append("text")
            .attr("x", function(node) { return node.x; })
            .attr("y", function(node) { return node.y; })
            .attr("id", function(node) { return node.nodeName; })
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

        bars = barsG.selectAll("rect.positive")
                .data(allData.nodes, function(d) { return d.nodeName + d.reputation; });

        bars.exit().remove();

        bars.enter().append("rect")
            .attr("class", "positive")
            .attr("id", function(node) { return node.nodeName; })
            .attr("x", function(node) { return node.x - barWidth*.5; })
            .attr("y", function(node) { return node.y - nodeRadius - triPadding - barHeight; })
            .attr("width", function(node) { return barWidth*node.reputation; })
            .attr("height", function(node) { return barHeight; })
            .attr("stroke", "black")
            .attr("fill", "green");

        bars = barsG.selectAll("rect.negative")
                .data(allData.nodes, function(d) { return d.nodeName + d.reputation; });

        bars.enter().append("rect")
            .attr("class", "negative")
            .attr("id", function(node) { return node.nodeName; })
            .attr("x", function(node) { return node.x + (.5-1+node.reputation)*barWidth; })
            .attr("y", function(node) { return node.y - nodeRadius - triPadding - barHeight; })
            .attr("width", function(node) { return barWidth*(1-node.reputation); })
            .attr("height", function(node) { return barHeight; })
            .attr("stroke", "black")
            .attr("fill", "red");
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

    function formatData(namesOfNeighbors, adjMatrix, neighReputations) {
        numNodes = namesOfNeighbors.length;
        var nodes = [];
        var links = [];
        var curves = [];

        // Initialize the central node (the one corresponding to the current client).
        nodes.push({
            nodeName: namesOfNeighbors[0],
            x: centerX,
            y: centerY,
            center: true,
            reputation: neighReputations[namesOfNeighbors[0]]
        });

        edgeLengthMultiplier = 4 + (numNodes - 3) / 2;

        // Initialize the remaining nodes.
        for (var i = 1; i < numNodes; i++) {
            nodes.push({
                nodeName: namesOfNeighbors[i],
                x: edgeLengthMultiplier * nodeRadius * Math.cos((Math.PI * 2 * i) / (numNodes-1)) + centerX,
                y: edgeLengthMultiplier * nodeRadius * Math.sin((Math.PI * 2 * i) / (numNodes-1)) + centerY,
                center: false,
                reputation: neighReputations[namesOfNeighbors[i]]
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
                        curves.push(makeCurvedEdge(sourceNode, destNode));
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
        var color = triColorUp;
        var x = sourceNode.x,
            y = sourceNode.y;

        if (up) {
            path += ("M " + (x + nodeRadius + triPadding) + " " + (y - triPadding) +
                        " L " + (x + nodeRadius + triPadding + triWidth) + " " + (y - triPadding) + 
                        " L " + (x + nodeRadius + triPadding + triWidth/2) + " " + (y - triPadding - triHeight) + 
                        " Z");
        } else {
            path += ("M " + (x - nodeRadius - triPadding) + " " + (y - triPadding - triHeight) +
                        " L " + (x - nodeRadius - triPadding - triWidth) + " " + (y - triPadding - triHeight) + 
                        " L " + (x - nodeRadius - triPadding - triWidth/2) + " " + (y - triPadding) + 
                        " Z");
            color = triColorDown;
        }
        return {
            path: path,
            color: color,
            up: up,
            sourceNode: sourceNode.nodeName,
            chosen: false
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
        if (!d.center) {
            var triData = [makeTriangle(d, true), makeTriangle(d, false)];
            var voters = voter.selectAll(".tri").data(triData, function(d) {return d.path; });

            voters.exit().remove();

            voters.enter().append("svg:path")
                    .attr("d", function(d) { return d.path; })
                    .attr("fill", function(d) { 
                        if (d.chosen) {
                            return d.color;
                        } else {
                            return triColorNeutral;
                        }
                    })
                    .attr("stroke", function(d) { 
                        if (d.chosen) {
                            return d.color;
                        } else {
                            return triColorNeutral;
                        }
                    })
                    .attr("class", "tri")
                    .attr("id", function(d) { return d.up + d.sourceNode; });

            voters.on("click", sendReputation);
        } 
    }

    function sendReputation(data, i) {
        var rank = -1;
        if (data.up) {
            rank = 1;
        }

        var selector = ".tri#" + (data.up) + data.sourceNode;
        voter.select(selector).attr("fill", function(d) { 
                                    return d.color;
                                })
                                .attr("stroke", function(d) { 
                                    return d.color;
                                });

        var selector = ".tri#" + (!data.up) + data.sourceNode;
        voter.select(selector).attr("fill", function(d) { 
                                    return triColorNeutral;
                                })
                                .attr("stroke", function(d) { 
                                    return triColorNeutral;
                                });


        Meteor.call('updateReputation', data.sourceNode, rank);
    }

    network.updateData = function(namesOfNeighbors, adjMatrix, neighReputations) {
        allData = formatData(namesOfNeighbors, adjMatrix, neighReputations);
        draw();
    }

    network.updateNodeColor = function(nodeName, color) {
        var selector = "#" + nodeName;
        var node = nodesG.select(selector).style("fill", color);
    }

    network.updateNodeReputation = function(nodeName, rank) {
        var selector = "rect.positive#" + nodeName;
        barsG.select(selector).attr("x", function(node) { return node.x - barWidth*.5; })
                                .attr("width", function(node) { return barWidth*rank; });

        selector = "rect.negative#" + nodeName;
        barsG.select(selector).attr("x", function(node) { return node.x + (.5-1+rank)*barWidth; })
                                .attr("width", function(node) { return barWidth*(1-rank); })

        selector = "text#" + nodeName;

        var node = labelsG.select(selector).text(function(node) { 
                if (node.center) {
                    return "Me";
                } else {
                    return node.nodeName;
                }
            });
    }

    return network;
}





