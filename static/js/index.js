/**
 * file name: index.js
 * time: Jan. 4, 2016
 * @author Dalei Li
 */

$(function() { // executed after the html content is loaded completely
	// Writing the game here
	
	// Javascript basics
	// decalre variables
	var $game = "Easy, let's rock!";
	console.log($game);
	
	var $arrayExample = ["Jing Li", "Xinye Fu", "Dalei Li"];
	for(var i = 0; i < $arrayExample.length; ++i) {
		// console.log(arrayExample[i] + ",");
	}
	
	var $arrayWithNamesExample = {"Sister 1":"Jing Li", "Sister 2":"Xinye Fu", "Me":"Dalei Li"};
	console.log($arrayWithNamesExample["Sister 1"] + ", " + $arrayWithNamesExample["Sister 2"] + ", " + $arrayWithNamesExample["Me"] + ".");
	
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
	
	// D3 basics
	// Update…
	var d3_p = d3.select("#gameCanvas").selectAll("p")
    .data([30, 25])
    .style("font-size", function(d) { return d + "px"; });
	
	// Enter…
	d3_p.enter().append("p").text("This is a test!").style("font-size", function(d) { return d + "px"; });

	// Exit…
	d3_p.exit().remove();
	
	// Here begins the visualization code!
	
	// define the function to parse cvs attributes
	function d3_type(instance) {
		for (var attribute in instance) {
			instance[attribute] = parseFloat(instance[attribute]);			
		}
		return instance;
	}
	
	var d3_whiteWine = d3.csv("/static/dataset/wine/wine_white.csv", d3_type, function(instances) {
		// console.log(instances);
		instances.forEach(function(instance) {
			// console.log(instance);
		});
	});
	
	
	
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