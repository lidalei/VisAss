/**
 * file name: index.js
 * time: Jan. 4, 2016
 * @author Dalei Li
 */

$(function() { // executed after the html content is loaded completely
	
	// jQuery basics
	// decalre variables
	var $game = "Easy, let's rock!";
	console.log($game);
	
	var $arrayExample = ["Qiyue Wang", "Dalei Li"];
	for(var i = 0; i < $arrayExample.length; ++i) {
		// console.log(arrayExample[i] + ",");
	}
	
	var $arrayWithNamesExample = {"Author 1": "Qiyue Wang", "Author 2": "Dalei Li"};
	console.log($arrayWithNamesExample["Author 1"] + ", " + $arrayWithNamesExample["Author 2"]);
	
	// declare a function, function is the first class object in JS
	function square(x) {
		return x * x;
	}
	// an alternative way to declare a function
	var _square = function(x) {
		return x * x;
	};
	// functional forEach, First define an array
	var arrayOfNumbers = [4, 5, 8, 9, 45];
	arrayOfNumbers.forEach(function(d) {
		console.log(d);
	});
	
	// Here begins the visualization code!
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
	var d3_svg_g = d3_svg.select("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	/*
	// add elements
	var d3_svg_g_text = d3_svg_g.append("text").text("SVG Learning").attr({"x": 20, "y": 10, "fill": "red", "stroke": "black", "stroke-width": 2})
			.style("font-size", "2em");
	var d3_svg_g_rect = d3_svg_g.append("rect").attr({"x": 100, "y": 100, "width": 100, "height": 100, "fill": "none", "stroke": "red", "stroke-width": 10, "rx": 10, "ry": 10})
	var d3_svg_g_circle = d3_svg_g.append("circle").attr({"cx": 150, "cy": 150, "r": 50, "fill": "#9370DB", "stroke": "rgba(0, 0, 255, 0.8)"});
	var d3_svg_g_line1 = d3_svg_g.append("line").attr({"x1": 100, "y1": 100, "x2": 200, "y2": 200, "stroke": "black", "stroke-width": 15});
	var d3_svg_g_line2 = d3_svg_g.append("line").attr({"x1": 200, "y1": 100, "x2": 100, "y2": 200, "stroke": "black", "stroke-width": 15});
	// M move to, L line to
	var d3_svg_g_path1 = d3_svg_g.append("path").attr({"d": "M50 50 L50 250 M250 250 L250 50", "fill": "none", "stroke": "yellow", "stroke-width": 15});
	// Z close the path
	var d3_svg_g_path2 = d3_svg_g.append("path").attr({"d": "M25 25 L25 275 L275 275 L275 25Z", "fill": "none", "stroke": "yellow", "stroke-width": 15});	
	
	// d3 linear scale
	var linearScale = d3.scale.linear()
        .domain([0, 100])   // Data space
        .range([300, 2800]); // Pixel space
		
	// d3 ordinal scale
	var ordinalScale = d3.scale.ordinal()
		.domain(["A", "B", "C", "D"])
		.rangeRoundPoints([0, 100]);//.rangePoints([0, 100]);//.range(["Apple", "Banana", "Coconut", "D3"]);
	
	// D3 basics
	// Update…
	var d3_svg_g_paths = d3_svg_g.selectAll("path")
		.data([10, 12, 8, 6, 4])
		.attr("stroke-width", function(d) { return d + "px"; });
	
	// Enter handles added data only
	setTimeout(
		function(){d3_svg_g_paths.enter().append("path").attr({"d": function(d){return "M25 " + linearScale(d) + " L275 " + linearScale(d);}, "fill": "none", "stroke": "yellow", "stroke-width": function(d) { return d + "px"; }});}
		, 1000);
	// Exit…
	d3_svg_g_paths.exit().remove();
	*/
	
	// rendering function
	function render(instances) {
		var attributes = Object.keys(instances[0]);
		// alcohol (0) and pH (6) to predict quality (7)
		var xAttr = "alcohol", yAttr = "pH", zAttr = "quality";
		var rMin = 2, rMax = 20; // "r" stands for radius
		// Update…
		var d3_svg_g_circles = d3_svg_g.selectAll("circle")
			.data(instances);
		
		var xLinearScale = d3.scale.linear()
			.domain(d3.extent(instances, function(instance){return instance[xAttr];}))   // Data space
			.range([0, width]); // Pixel space
		
		var yLinearScale = d3.scale.linear()
			.domain(d3.extent(instances, function(instance){return instance["pH"];}))
			.range([height, 0]);

		var zLinearScale = d3.scale.linear()
			.domain(d3.extent(instances, function(instance){return instance["quality"];}))
			.range([rMin, rMax]);

		
		// Enter handles added data only
		d3_svg_g_circles.enter().append("circle").attr({"fill": "none", "stroke": "rgba(0, 255, 0, 0.5)", "stroke-width": 4, "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": function(instance){return zLinearScale(instance[zAttr]);}});
		// Exit…
		d3_svg_g_circles.exit().remove();
		
		// manully visualize, not applicable
		instances.forEach(function(instance) {
			
		});
	}
	
	// define the function to parse cvs attributes
	function d3_type(instance) {
		for (var attribute in instance) {
			instance[attribute] = parseFloat(instance[attribute]); // we can use + to replace parseFloat()		
		}
		return instance;
	}
	
	var d3_whiteWine = d3.csv("/static/dataset/wine/wine_white.csv", d3_type, render);
	
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