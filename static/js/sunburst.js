let sunburstWidget = {
    name: 'sunburst',
    display: 'Sunburst',
    render: function(canvas, data) {
        $(canvas).empty();
        $(canvas).append(`
            <div class="sunburst-main">
            <div class="sunburst-sequence"></div>
            <div class="sunburst-chart">
                <div class="sunburst-explanation" style="visibility: hidden;">
                <span class="sunburst-percentage"></span><br/>
                ${data.y_axis}
                </div>
            </div>
            </div>`);

        var d3Canvas = d3.select(canvas);

        // Dimensions of sunburst.
        var width = $(canvas).width();
        var height = $(canvas).height() - 50;
        var radius = Math.min(width, height) / 2;

        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
        var b = {
            w: 75, h: 30, s: 3, t: 10
        };

        // Building hierarchical data
        var allColors = ["ff0029", "377eb8", "66a61e", "984ea3", "00d2d5", "ff7f00", "af8d00", "7f80cd", "b3e900", "c42e60",
                         "a65628", "f781bf", "8dd3c7", "bebada", "fb8072", "80b1d3", "fdb462", "fccde5", "bc80bd", "ffed6f",
                         "c4eaff", "cf8c00", "1b9e77", "d95f02", "e7298a", "e6ab02", "a6761d", "0097ff", "00d067", "000000"];
        allColors = allColors.map(c => '#' + c);

        var colors = {};
        let colorIndex = 0;
        let queue = [];
        let rootItem = { name: 'root', children: [] };
        queue.push({ data: data.data, item: rootItem });
        while (queue.length > 0) {
            let item = queue.shift();
            //Item is at the bottom of the hierarchy - stops everything
            if (item.data.hasOwnProperty('y_axis')) {
                delete item.children;
                item.item.size = item.data.y_axis;
            }
            //Item still has children - loop through them
            else {
                for (let name in item.data) {
                    //If this name already has a color assigned - we take it
                    //Otherwise assign next free color
                    if (!colors.hasOwnProperty(name)) {
                        colors[name] = allColors[colorIndex];
                        colorIndex = (colorIndex + 1) % allColors.length;
                    }
                    let subItem = { name: name, children: []};
                    let subData = item.data[name];
                    item.item.children.push(subItem);
                    queue.push({ data: subData, item: subItem });
                }
            }
        }
        // Total size of all segments; we set this later, after loading the data.
        var totalSize = 0; 

        var vis = d3Canvas.select(".sunburst-chart").append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .style("margin-top", `-${b.h}px`)
            .append("svg:g")
            .attr("class", "sunburst-container")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var partition = d3.partition()
            .size([2 * Math.PI, radius * radius]);

        var arc = d3.arc()
            .startAngle(function(d) { return d.x0; })
            .endAngle(function(d) { return d.x1; })
            .innerRadius(function(d) { return Math.sqrt(d.y0); })
            .outerRadius(function(d) { return Math.sqrt(d.y1); });  

        function initializeBreadcrumbTrail() {
            // Add the svg area.
            var trail = d3Canvas.select(".sunburst-sequence").append("svg:svg")
                .attr("width", width)
                .attr("height", 50)
                .attr("class", "sunburst-trail");
            // Add the label at the end, for the percentage.
            trail.append("svg:text")
                .attr("class", "sunburst-endlabel")
                .style("fill", "#000");
        }

        // Generate a string that describes the points of a breadcrumb polygon.
        function breadcrumbPoints(d, i) {
            var points = [];
            points.push("0,0");
            points.push(b.w + ",0");
            points.push(b.w + b.t + "," + (b.h / 2));
            points.push(b.w + "," + b.h);
            points.push("0," + b.h);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
                points.push(b.t + "," + (b.h / 2));
            }
            return points.join(" ");
        }

        // Update the breadcrumb trail to show the current sequence and percentage.
        function updateBreadcrumbs(nodeArray, percentageString) {

            // Data join; key function combines name and depth (= position in sequence).
            var trail = d3Canvas.select(".sunburst-trail")
                .selectAll("g")
                .data(nodeArray, function(d) { return d.data.name + d.depth; });

            // Remove exiting nodes.
            trail.exit().remove();

            // Add breadcrumb and label for entering nodes.
            var entering = trail.enter().append("svg:g");

            entering.append("svg:polygon")
                .attr("points", breadcrumbPoints)
                .style("fill", function(d) { return colors[d.data.name]; });

            entering.append("svg:text")
                .attr("x", (b.w + b.t) / 2)
                .attr("y", b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.data.name; });

            // Merge enter and update selections; set position for all nodes.
            entering.merge(trail).attr("transform", function(d, i) {
                return "translate(" + i * (b.w + b.s) + ", 0)";
            });

            // Now move and update the percentage at the end.
            d3Canvas.select(".sunburst-trail").select(".sunburst-endlabel")
                .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
                .attr("y", b.h / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(percentageString);

            // Make the breadcrumb trail visible, if it's hidden.
            d3Canvas.select(".sunburst-trail")
                .style("visibility", "");

        }       

        // Fade all but the current sequence, and show it in the breadcrumb trail.
        function mouseover(d) {

            var percentage = (100 * d.value / totalSize).toPrecision(3);
            var percentageString = percentage + "%";
            if (percentage < 0.1) {
                percentageString = "< 0.1%";
            }

            d3Canvas.select(".sunburst-percentage")
                .text(d.value);

            d3Canvas.select(".sunburst-explanation")
                .style("visibility", "");

            var sequenceArray = d.ancestors().reverse();
            sequenceArray.shift(); // remove root node from the array
            updateBreadcrumbs(sequenceArray, percentageString);

            // Fade all the segments.
            d3Canvas.selectAll("path")
                .style("opacity", 0.3);

            // Then highlight only those that are an ancestor of the current segment.
            vis.selectAll("path")
                .filter(function(node) {
                            return (sequenceArray.indexOf(node) >= 0);
                        })
                .style("opacity", 1);
        }

        // Restore everything to full opacity when moving off the visualization.
        function mouseleave(d) {

            // Hide the breadcrumb trail
            d3Canvas.select(".sunburst-trail")
                .style("visibility", "hidden");

            // Deactivate all segments during transition.
            d3Canvas.selectAll("path").on("mouseover", null);

            // Transition each segment to full opacity and then reactivate it.
            d3Canvas.selectAll("path")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .on("end", function() {
                    d3.select(this).on("mouseover", mouseover);
                        });

            d3Canvas.select(".sunburst-explanation")
                .style("visibility", "hidden");
        }

        // Main function to draw and set up the visualization, once we have the data.
        function createVisualization(json) {

            // Basic setup of page elements.
            initializeBreadcrumbTrail();

            // Bounding circle underneath the sunburst, to make it easier to detect
            // when the mouse leaves the parent g.
            vis.append("svg:circle")
                .attr("r", radius)
                .style("opacity", 0);

            // Turn the data into a d3 hierarchy and calculate the sums.
            var root = d3.hierarchy(json)
                .sum(function(d) { return d.size; })
                .sort(function(a, b) { return b.value - a.value; });
            
            // For efficiency, filter nodes to keep only those large enough to see.
            var nodes = partition(root).descendants()
                .filter(function(d) {
                    return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
                });

            var path = vis.data([json]).selectAll("path")
                .data(nodes)
                .enter().append("svg:path")
                .attr("display", function(d) { return d.depth ? null : "none"; })
                .attr("d", arc)
                .attr("fill-rule", "evenodd")
                .style("fill", function(d) { return colors[d.data.name]; })
                .style("opacity", 1)
                .on("mouseover", mouseover);

            // Add the mouseleave handler to the bounding circle.
            d3Canvas.select(".sunburst-container").on("mouseleave", mouseleave);

            // Get total size of the tree = value of root node from partition.
            totalSize = path.datum().value;
        };

        // Use d3.text and d3.csvParseRows so that we do not need to have a header
        // row, and can receive the csv as an array of arrays.
        createVisualization(rootItem);
    }
};

widgetRegistry[sunburstWidget.name] = sunburstWidget;