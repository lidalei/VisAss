/**
 * file name: index.js
 * time: Jan. 12, 2016
 * @author Dalei Li
 */

$(function() { // executed after the html content is loaded completely
	
	/* ----Here begins the visualization code---- */
	
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
	
	// define the global variable to store instances (dataset)
	window.whiteWineInstances = null;
	
	// rendering function
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
		var d3_svg_g = d3_svg.select("g").attr({"transform": "translate(" + margin.left + "," + margin.top + ")"});
		
		var attributes = Object.keys(instances[0]);
		// alcohol (0) and pH (6) to predict quality (7)
		var xAttr = "alcohol", yAttr = "pH", zAttr = "quality";
		var rMin = 2, rMax = 20; // "r" stands for radius
		
		// map original data to svg visible area, width and height, respectively
		var xLinearScale = d3.scale.linear().range([0, width]); // Pixel space
		var yLinearScale = d3.scale.linear().range([height, 0]);
		// define axis
		var xAxis = d3.svg.axis().scale(xLinearScale).orient("bottom");
		var yAxis = d3.svg.axis().scale(yLinearScale).orient("left");
		/*
		var zLinearScale = d3.scale.linear()
			.domain(d3.extent(instances, function(instance){return instance["quality"];}))
			.range([rMin, rMax]);
		*/
		var zColorScale = d3.scale.category10();
		
		// Update...
		var d3_svg_g_circles = d3_svg_g.selectAll("circle").data(instances);
		
		// scatter, quality = f(alcohol, pH)
		xLinearScale.domain(d3.extent(instances, function(instance){return instance[xAttr];}));
		yLinearScale.domain(d3.extent(instances, function(instance){return instance[yAttr];}));
		
		if(isUpdate) { // is update
			d3_svg_g_circles.transition().duration(300)
				.attr({"fill": function(instance){return zColorScale(instance[zAttr]);}, "fill-opacity": 0.8, "stroke": "none", "stroke-width": 4, "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": function(instance){return 5;}});
			
			// update axis
			d3_svg_g.select(".xaxis").attr({"transform": "translate(0," + height + ")"})
			.transition().duration(150).ease("sin-in-out").call(xAxis);
			d3_svg_g.select(".yaxis").transition().duration(150).ease("sin-in-out").call(yAxis);
		}
		else { // first time rendering
			// set axis, give it a class so it can be used
			//to select only xaxis labels  below
			var xAxisG = d3_svg_g.append("g")
				.attr({"transform": "translate(0," + height + ")", "class": "xaxis"});
			var yAxisG = d3_svg_g.append("g").attr({"class": "yaxis"});		
			// draw axis
			xAxisG.call(xAxis);
			yAxisG.call(yAxis);
		}
		
		// Enter handles added data only
		d3_svg_g_circles.enter().append("circle")
			.attr({"fill": function(instance){return zColorScale(instance[zAttr]);}, "fill-opacity": 0.8, "stroke": "none", "stroke-width": 4, "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": function(instance){return 5;}});
		/*
		// scatter, quality = f(alcohol)
		xLinearScale.domain(d3.extent(instances, function(instance){return instance[xAttr];}));   // Data space
		yLinearScale.domain(d3.extent(instances, function(instance){return instance[zAttr];}));
		if(isUpdate) { // is update
			d3_svg_g_circles.transition().duration(300)
				.attr({"fill": function(instance){return zColorScale(instance[zAttr]);}, "fill-opacity": 0.8, "stroke": "none", "stroke-width": 4, "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[zAttr]);}, "r": 5});
		}
		*/
		// Enter handles added data only
		d3_svg_g_circles.enter().append("circle")
			.attr({"fill": function(instance){return zColorScale(instance[zAttr]);}, "fill-opacity": 0.8, "stroke": "none", "stroke-width": 4, "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[zAttr]);}, "r": 5});
		
		// Exit…
		d3_svg_g_circles.exit().remove();
		
		/*
		// manully visualize, not applicable
		instances.forEach(function(instance) {
			
		});*/
	}
	
	// read CVS files
	var d3_whiteWine = d3.csv("/static/dataset/wine/wine_white.csv", d3_type, function(instances) {
		window.whiteWineInstances = instances;
		render(window.whiteWineInstances, false);
	});
	// define the function to parse cvs attributes
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