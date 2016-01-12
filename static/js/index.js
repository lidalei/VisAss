/**
 * @file name: index.js
 * @time: Jan. 12, 2016
 * @author Dalei Li
 */

$(function() { // executed after the HTML content is loaded completely
	
	/* ----Here begins the visualization code---- */
	
	// define the global variable to store instances (data set)
	window.whiteWineInstances = null;
	window.renderingType = "Scatter"; // Scatter, Line, Bar, ...
	
	// auto adjust when resizing window
	$(window).resize(function() {
		var windowWidth = $(this).width(), windowHeight = $(this).height();		
		var $canvas_svg = $("#canvas > svg"),
			svgWidth = $canvas_svg.width(),
			svgHeight = $canvas_svg.height();
		$canvas_svg.height(Math.floor(svgWidth * windowHeight / windowWidth));
		if(window.whiteWineInstances != null) {
			// re-render
			render(window.whiteWineInstances, true);
		}
	});
	
	/*
	 * renderer
	 * @para instances, object. The data set to be rendered.
	 * @para isUpdate, boolean. true, first time rendering; false, update. 
	 */
	function render(instances, isUpdate) {
		// define margin and padding
		var d3_svg = d3.select("#canvas").select("svg"),
			svgWidth = d3_svg.style("width").replace("px", ""),
			svgHeight = d3_svg.style("height").replace("px", ""),
			margin = {top: 20, right: 20, bottom: 20, left: 20},
			padding = {top: 60, right: 60, bottom: 60, left: 60},
			innerWidth = svgWidth - margin.left - margin.right,
			innerHeight = svgHeight - margin.top - margin.bottom,
			width = innerWidth - padding.left - padding.right,
			height = innerHeight - padding.top - padding.bottom;
		
		// set visible area, i.e., the container of visualized charts
		var d3_svg_g = d3_svg.select("g").attr({"transform": "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")"});
		
		// var attributes = Object.keys(instances[0]);
		
		if(window.renderingType == "Scatter") {
			
			// alcohol (0) and pH (6) to predict quality (7)
			var xAttr = "alcohol", yAttr = "pH", zAttr = "quality";
			
			// define axis labels
			var axisLabelsParas = {
				xAxisLabelText: xAttr, 
				xAxisLabelOffset: 48,
				yAxisLabelText: yAttr,
				yAxisLabelOffset: 36 };
			
			// map original data to svg visible area, width and height, respectively
			var xLinearScale = d3.scale.linear().range([0, width]); // Pixel space
			var yLinearScale = d3.scale.linear().range([height, 0]);
			// define axis
			var xAxis = d3.svg.axis().scale(xLinearScale).orient("bottom");
			var yAxis = d3.svg.axis().scale(yLinearScale).orient("left");
			
			/*
			var rMin = 2, rMax = 20; // "r" stands for radius
			var zLinearScale = d3.scale.linear()
				.domain(d3.extent(instances, function(instance){return instance["quality"];}))
				.range([rMin, rMax]);
			*/
			
			var zColorScale = d3.scale.category10();
			
			// scatter, quality = f(alcohol, pH)
			xLinearScale.domain(d3.extent(instances, function(instance){return instance[xAttr];}));
			yLinearScale.domain(d3.extent(instances, function(instance){return instance[yAttr];}));
			
			// Update...
			var d3_svg_g_circles = d3_svg_g.selectAll("circle").data(instances);
			
			if(isUpdate) { // is update
				d3_svg_g_circles.transition().duration(300)
					.attr({"fill": function(instance){return zColorScale(instance[zAttr]);}, "fill-opacity": 0.8, "stroke": "none", "stroke-width": 4, "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": function(instance){return 5;}});
			}
			// draw axis for first time rendering or update
			drawAxis(isUpdate, width, height, xAxis, yAxis);
			
			// Enter handles added data only
			d3_svg_g_circles.enter().append("circle")
				.attr({"fill": function(instance){return zColorScale(instance[zAttr]);}, "fill-opacity": 0.8, "stroke": "none", "stroke-width": 4, "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": function(instance){return 5;}});
			
			// Exit…
			d3_svg_g_circles.exit().remove();

		}
		else if(window.renderingType == "Line") {

			// alcohol (0) to predict quality (7)
			var xAttr = "alcohol", yAttr = "quality";
			// define axis labels
			var axisLabelsParas = {
				xAxisLabelText: xAttr, 
				xAxisLabelOffset: 48,
				yAxisLabelText: yAttr,
				yAxisLabelOffset: 36 };
			// map original data to svg visible area, width and height, respectively
			var xLinearScale = d3.scale.linear().range([0, width]); // Pixel space
			var yLinearScale = d3.scale.linear().range([height, 0]);
			
			// line, quality = f(alcohol)			
			xLinearScale.domain(d3.extent(instances, function(instance){return instance[xAttr];}));
			yLinearScale.domain(d3.extent(instances, function(instance){return instance[yAttr];}));	
			
			// define axis
			var xAxis = d3.svg.axis().scale(xLinearScale).orient("bottom");
			var yAxis = d3.svg.axis().scale(yLinearScale).orient("left");
			
			// personalize the line generating function
		    var line = d3.svg.line()
		    	.x(function(d) { return xLinearScale(d[xAttr]); })
		        .y(function(d) { return yLinearScale(d[yAttr]); });
			
			if(isUpdate) { // is update
				var d3_svg_g_line = d3_svg_g.select("path");
				d3_svg_g_line.transition().duration(300)
					.attr({"d": line(instances)});
			}
			else {
				// add a line
				var d3_svg_g_line = d3_svg_g.append("path");
				// draw the line
				d3_svg_g_line.attr({"fill": "none", "stroke": "rgba(150, 100, 200, 0.8)", "shape-rendering": "crispEdges", "d": line(instances)});
			}
			// draw axis for first time rendering or update
			drawAxis(isUpdate, width, height, xAxis, yAxis);
		}
		if(window.renderingType == "bar") {
			
			
		}
		
		/*
		 * draw axis
		 * @para isUpdate, boolean. true, first time rendering; false, update.
		 * @para width, float. width of the svg > g.
		 * @para height, float. Height of the svg > g.
		 * @para xAxis, axis().
		 * @para yAxis, axis(). 
		 */
		function drawAxis(isUpdate, width, height, xAxis, yAxis) {
			if(isUpdate) {
				// update axis scale and labels
				d3_svg_g.select(".xaxis").attr({"transform": "translate(0," + height + ")"})
					.transition().duration(150).ease("sin-in-out").call(xAxis)
					.select(".label").attr({"x": width / 2});
				d3_svg_g.select(".yaxis").transition().duration(150).ease("sin-in-out").call(yAxis)
					.select(".label").attr({"y": height / 2});				
			}
			else {
				// set axis, give it a class so it can be used to select only xaxis labels  below
				var xAxisG = d3_svg_g.append("g")
					.attr({"transform": "translate(0," + height + ")", "class": "xaxis"});
				var yAxisG = d3_svg_g.append("g").attr({"class": "yaxis"});		
				var xAxisLabel = xAxisG.append("text")
					.style("text-anchor", "middle")
					.attr({"x": width / 2, "y": axisLabelsParas.xAxisLabelOffset, "class": "label"}).style("font-size", "2em")
					.text(axisLabelsParas.xAxisLabelText);
				var yAxisLabel = yAxisG.append("text")
					.style("text-anchor", "middle")
					.attr("transform", "translate(-" + axisLabelsParas.yAxisLabelOffset + "," + (height / 2) + ") rotate(-90)").style("font-size", "2em")
					.text(axisLabelsParas.yAxisLabelText);
				// draw axis
				xAxisG.call(xAxis);
				yAxisG.call(yAxis);
			}
		}
		
		/*
		// manully visualize, not applicable
		instances.forEach(function(instance) {
			
		});
		*/
	}
	
	// read CVS files
	var d3_whiteWine = d3.csv("/static/dataset/wine/wine_white.csv", d3_type, function(instances) {
		window.whiteWineInstances = instances;
		render(window.whiteWineInstances, false);
	});
	
	/*
	 * define the function to parse cvs attributes
	 * @para instance, object. Each instance of the data set.
	 */
	function d3_type(instance) {
		for (var attribute in instance) {
			instance[attribute] = parseFloat(instance[attribute]); // we can use + to replace parseFloat()		
		}
		return instance;
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