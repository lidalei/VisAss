/**
 * @file name: index.js
 * @time: Jan. 12, 2016
 * @author Dalei Li
 */

$(function() { // executed after the HTML content is loaded completely
	
	/* ----Here begins the visualization code---- */
	
    // define abbr. of the properties
    window.PROPERTITYABBR = {"FAC": "fixed acidity", "VAC": "volatile acidity", "CAC": "citric acid", "RSU": "residual sugar", "CHL": "chlorides", "FSD": "free sulfur dioxide", "TSD": "total sulfur dioxide", "DEN": "density", "pH" :"pH", "SUL": "sulphates", "ALC": "alcohol", "QUA": "quality"};
    
	// define the global variable to store instances (data set)
	window.instances = undefined;
	
    // after loading the DOM, adjust the svg size according to window height width ratio
    function autoAdjustWindow() {
        var windowWidth = $(window).width(), windowHeight = $(window).height(),
            hwRatio = windowHeight / windowWidth,
            $parallelCoordinates_svg = $("#parallelCoordinates > svg"),
            parallelCoordinatesSvgWidth = $parallelCoordinates_svg.width();
            
        $parallelCoordinates_svg.height(Math.floor(parallelCoordinatesSvgWidth * hwRatio));
    };
    
    autoAdjustWindow();
    
       /*
    * parallel coordinates
    * from http://bl.ocks.org/jasondavies/1341281
    */
    
    // first, define the canvas
    // define margin and padding
    var d3_svg_pc = d3.select("#parallelCoordinates").select("svg"),
        d3_svg_paras_pc = {
            svgWidth: parseFloat(d3_svg_pc.style("width").replace("px", "")),
            svgHeight: parseFloat(d3_svg_pc.style("height").replace("px", "")),
            margin: {top: 20, right: 20, bottom: 20, left: 20},
            padding: {top: 40, right: 40, bottom: 40, left: 40}
        };

    // set visible area, i.e., the container of visualized charts
    var d3_svg_g_pc = d3_svg_pc.select("g").attr({"transform": "translate(" + (d3_svg_paras_pc.margin.left + d3_svg_paras_pc.padding.left) + "," + (d3_svg_paras_pc.margin.top + d3_svg_paras_pc.padding.top) + ")"}),
        d3_svg_g_paras_pc = {
            innerWidth: d3_svg_paras_pc.svgWidth - d3_svg_paras_pc.margin.left - d3_svg_paras_pc.margin.right,
            innerHeight: d3_svg_paras_pc.svgHeight - d3_svg_paras_pc.margin.top - d3_svg_paras_pc.margin.bottom
        };
    d3_svg_g_paras_pc.width = d3_svg_g_paras_pc.innerWidth - d3_svg_paras_pc.padding.left - d3_svg_paras_pc.padding.right;
    d3_svg_g_paras_pc.height= d3_svg_g_paras_pc.innerHeight - d3_svg_paras_pc.padding.top - d3_svg_paras_pc.padding.bottom;
    
    var axisesParas_pc = {
        // next, define x-label, y-label, z-label and assign default values
        // map original data to svg visible area, width and height, respectively
        "xOrdinalScale": d3.scale.ordinal().rangePoints([0, d3_svg_g_paras_pc.width], 1),
        "yLinearScale": {},
        "zColorScale": d3.scale.category10(),
        "dragging": {},
        // define axis
        "axis": d3.svg.axis().orient("left"),
        "line": d3.svg.line(),
        "background" :undefined,
        "foreground": undefined,
        "dimensions": undefined
    };
    
    
    /*
    * render parallel coordinates
    * @para instances, the data to be rendered
    */
    function renderParallelCoordinates(instances) {
        
        var x = axisesParas_pc["xOrdinalScale"],
            y = axisesParas_pc["yLinearScale"],
            height = d3_svg_g_paras_pc["height"],
            width = d3_svg_g_paras_pc["width"],
            dragging = axisesParas_pc["dragging"],
            axis = axisesParas_pc["axis"];
        
        // Extract the list of dimensions and create a scale for each.
        x.domain(axisesParas_pc["dimensions"] = d3.keys(instances[0]).filter(function(d) {
            return d != "ID" && (y[d] = d3.scale.linear().domain(d3.extent(instances, function(p) { return +p[d];})).range([height, 0]));
        }));
        
        // Add grey background lines for context.
        axisesParas_pc["background"] = d3_svg_g_pc.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(instances)
            .enter().append("path")
            .attr("d", path);
        
        // Add blue foreground lines for focus.
        axisesParas_pc["foreground"] = d3_svg_g_pc.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(instances)
            .enter().append("path")
            .attr("d", path);
        
        // Add a group element for each dimension.
        var g = d3_svg_g_pc.selectAll(".dimension")
            .data(axisesParas_pc["dimensions"])
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            .call(d3.behavior.drag()
            .origin(function(d) { return {x: x(d)}; })
            .on("dragstart", function(d) {
                axisesParas_pc["dragging"][d] = x(d);
                axisesParas_pc["background"].attr("visibility", "hidden");
            })
            .on("drag", function(d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                axisesParas_pc["foreground"].attr("d", path);
                axisesParas_pc["dimensions"].sort(function(a, b) { return position(a) - position(b); });
                x.domain(axisesParas_pc["dimensions"]);
                g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function(d) {
                delete axisesParas_pc["dragging"][d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(axisesParas_pc["foreground"]).attr("d", path);
                axisesParas_pc["background"]
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));

            // Add an axis and title.
            g.append("g")
                .attr("class", "axis")
                .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
                .append("text")
                .style("text-anchor", "middle")
                .attr("y", -30)
                .text(function(d) { return d; })
                .attr("transform", "rotate(20)");
        
            // Add and store a brush for each axis.
            g.append("g")
              .attr("class", "brush")
              .each(function(d) {
                d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));  
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
        
        
        function position(d) {
            var dragging = axisesParas_pc["dragging"],
                x = axisesParas_pc["xOrdinalScale"],
                v = dragging[d];
            
            return v == null ? x(d) : v;
        }
        
        function transition(g) {
            return g.transition().duration(500);
        }

        // Returns the path for a given data point.
        function path(d) {
            var dimensions = axisesParas_pc["dimensions"],
                line = axisesParas_pc["line"],
                y = axisesParas_pc["yLinearScale"];
            
            return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
        }
        
        function brushstart() {
            d3.event.sourceEvent.stopPropagation();
        }
        
        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
            var dimensions = axisesParas_pc["dimensions"],
                y = axisesParas_pc["yLinearScale"],
                foreground = axisesParas_pc["foreground"];
            
            var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
                extents = actives.map(function(p) { return y[p].brush.extent(); });
            
            foreground.style("display", function(d) {
                return actives.every(function(p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
              }) ? null : "none";
          });
        }
    }
    
    
    
    
    // read CSV files, may use d3.dsv(delimiter, mimeType) to configure delimiter
	var whiteWine = d3.csv("/static/dataset/wine/wine_white.csv", type, function(error, instances) {
		if (error){
			throw error;
		}

        window.instancesName = "white wine";
            
        var attributes = Object.keys(instances[0]);
        
        // compute statistics of the dataset
        var instancesStatistics = computeStatistics(instances);
        
        window.instancesStatistics = instancesStatistics;
                
        // add ID attribute for each instance, after statistics computation to avoid compute ID's
        instances.every(function(instance, index) {
            instances[index].ID = index;
            
            return true;
        });
        
        // sort the instances quality descending
        var sortedInstancesByQuality = clone(instances);
        sortedInstancesByQuality.sort(function (a, b) {
            
            return parseFloat(b["quality"]) - parseFloat(a["quality"]);
        });
        
//        console.log(sortedWhiteWineInstancesByQuality);
        window.sortedInstancesByQuality = sortedInstancesByQuality;
        
        // normalized sortedWhiteWineInstancesByQuality using Feature scaling method
        // https://en.wikipedia.org/wiki/Feature_scaling
       
        var normalizedSortedInstances = clone(sortedInstancesByQuality);
        
        var indexOfID = attributes.indexOf("ID");
        if(indexOfID != -1) {
            attributes.splice(indexOfID, 1);
        }
        
        normalizedSortedInstances.every(function(instance, index) {
            attributes.forEach(function(attribute) {
                normalizedSortedInstances[index][attribute] = 100 * (instance[attribute] - instancesStatistics[attribute]["min"]) / (instancesStatistics[attribute]["max"] - instancesStatistics[attribute]["min"] + 1e-6);
            });
            
            return true;            
        });
        
//        console.log(normalizedSortedInstances);
        window.normalizedSortedInstances = normalizedSortedInstances;
        
        // store as global variable, for window is a global variable
        window.instances = instances;
        
        // parallel coordinates
        renderParallelCoordinates(instances);
        
	});
	
    /*
	 * define the function to parse cvs attributes
	 * @para instance, object. Each instance of the data set.
	 */
	function type(instance) {
		for (var attribute in instance) {
			instance[attribute] = parseFloat(instance[attribute]); // we can use + to replace parseFloat()		
		}
		return instance;
	}
    
    // compute statistics of a data set
    function computeStatistics(instances) {
        
        var attributes = Object.keys(instances[0]),
            instancesStatistics = {};
        
        var indexOfID = attributes.indexOf("ID");
        if(indexOfID != -1) {
            attributes.splice(indexOfID, 1);
        }
        
        attributes.forEach(function(attribute) {
            instancesStatistics[attribute] = {
                "mean": d3.mean(instances, function(instance){return instance[attribute];}),
                "min": d3.min(instances, function(instance){return instance[attribute];}),
                "max": d3.max(instances, function(instance){return instance[attribute];}),
                "median": d3.median(instances, function(instance){return instance[attribute];}),
                "variance": d3.variance(instances, function(instance){return instance[attribute];}),
                "deviation": d3.deviation(instances, function(instance){return instance[attribute];})
            };
        });
        
        return instancesStatistics;
    }
    
    // clone object deep, from http://stackoverflow.com/questions/9399369/how-to-copy-or-duplicate-an-array-of-arrays
    function clone (existingArray) {
       var newObj = (existingArray instanceof Array) ? [] : {};
       for (i in existingArray) {
          if (i == 'clone') continue;
          if (existingArray[i] && typeof existingArray[i] == "object") {
             newObj[i] = clone(existingArray[i]);
          } else {
             newObj[i] = existingArray[i]
          }
       }
       return newObj;
    }
    
	/* ----Here ends the visualization code---- */
	
	// don't have to change
	// scroll window to hide or show backToTop button
	$(window).scroll(function() {
		if ($(this).scrollTop() > 150) {
			$("#backToTop").fadeIn(100);
		} else {
			$("#backToTop").fadeOut(100);
		}
	});
	
	// jQuery animation scroll
	$("#backToTop").click(function(event) {
		event.preventDefault();
		$("body,html").animate({scrollTop: 0}, 500);
	});
	
});