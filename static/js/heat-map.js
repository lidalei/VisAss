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
	window.whiteWineInstances = null;
    
	function render_heatmap(instances,isUpdate){
		
		var attributes = $.map(instances[0], function(value,index){
			return [index];
		});
		attributes.pop();
		var cols = attributes.length; //numbers of columns minus ID
		var rows = instances.length; //numbers of rows
		var margin = { top: 100, right: 120, bottom: 100, left: 120 },
        width = 1200 - margin.left - margin.right,
		gridSize = Math.floor(width / 12),
		height = gridSize * rows - margin.top - margin.bottom + 200,
        legendElementWidth = gridSize*2,
        buckets = 9;
		var min=[],max=[];
		var data = [], samples = [];
		var k = 0;
		for (var i=0; i <cols;i++){
			var c=[];
			for (var j=0;j < rows; j ++){
				c.push(parseFloat(instances[j][attributes[i]]));
			}
			var Max = d3.max(c);
			var Min = d3.min(c);
			min.push(Min);
			max.push(Max);
		}

		for (var i = 0; i < cols; i++) {
			for (var j = 0; j < rows; j ++){
				data[k] = (instances[j][attributes[i]] - min[i])/(max[i]-min[i]);
				//console.log(instances[j][attributes[i]]);
				k++;
				
			}
		}
		for(var i = 0 ;i < rows; i++){
			var str = "" + parseFloat(i+1);
			var pad = "0000";
			var ans = pad.substring(0, pad.length - str.length) + str;
			samples.push("White_Wine" + ans);
		}			
		var svg = d3.select("#chart-heat").append("svg")
			.attr("class", "chart")
			//.attr("width", gridSize * cols)
			//.attr("height", gridSize * rows)
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);
		
		var g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var xAxisG = g.append("g")
			//.attr("class", "x axis")
			.attr("transform", "translate(0," + (-50) + ")");
		var xScale = d3.scale.ordinal().rangeBands([0, width],0.2);
		
		var xAxis = d3.svg.axis().scale(xScale).orient("top")
			.outerTickSize(0);
			
		xScale.domain(attributes);
		
		xAxisG
          .call(xAxis)
          .selectAll("text")  
          .attr("dx", "-0.8em")
          .attr("dy", "1em")
          .attr("transform", "rotate(-20)" );
		
		var samplesLabels = g.selectAll(".sampleLabel")
          .data(samples)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")");
		
		
		
		var color = d3.scale.linear()
				.domain([0, 1])
				.range(["#ffa6a6", "#ff0000"]);
		
		
		g.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attr("x", function(d,i) { return Math.floor(i / rows) * gridSize; })
			.attr("y", function(d,i) { return i % rows * gridSize; })
			.attr("rx", 4)
            .attr("ry", 4)
			.attr("width", gridSize)
			.attr("height", gridSize)
			.attr("fill", color);
		
		var legend = g.selectAll(".legend")
		.data(color.ticks(buckets).slice(1).reverse())
		.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(" + (width + 30) + "," + (30 + i * 30) + ")"; });
		
		legend.append("rect")
			.attr("width", 30)
			.attr("height", 30)
			.style("fill", color);

		legend.append("text")
			.attr("x", 36)
			.attr("y", 15)
			.attr("dy", ".35em")
			.text(String);
	}
    
    // read CSV files, may use d3.dsv(delimiter, mimeType) to configure delimiter
	var d3_whiteWine = d3.csv("/static/dataset/wine/wine_white.csv", d3_type, function(error, instances) {
		if (error){
			throw error;
		}
                
        // compute statistics of the dataset
        var whiteWineStatistics = {};
        var attributes = Object.keys(instances[0]);
        attributes.forEach(function(attribute) {
            whiteWineStatistics[attribute] = {
                "mean": d3.mean(instances, function(instance){return instance[attribute];}),
                "min": d3.min(instances, function(instance){return instance[attribute];}),
                "max": d3.max(instances, function(instance){return instance[attribute];}),
                "median": d3.median(instances, function(instance){return instance[attribute];}),
                "variance": d3.variance(instances, function(instance){return instance[attribute];}),
                "deviation": d3.deviation(instances, function(instance){return instance[attribute];})
            };
        });
        
        window.whiteWineStatistics = whiteWineStatistics;
        
        // add ID attribute for each instance, after statistics computation to avoid compute ID's
        instances.every(function(instance, index) {
            instances[index].ID = index;
            
            return true;
        });
        
        // sort the instances quality descending
        var sortedWhiteWineInstancesByQuality = clone(instances);
        sortedWhiteWineInstancesByQuality.sort(function (a, b) {
            
            return parseFloat(b["quality"]) - parseFloat(a["quality"]);
        });
        
//        console.log(sortedWhiteWineInstancesByQuality);
        window.sortedWhiteWineInstancesByQuality = sortedWhiteWineInstancesByQuality;
        
        // normalized sortedWhiteWineInstancesByQuality using Feature scaling method
        // https://en.wikipedia.org/wiki/Feature_scaling
       
        var normalizedSortedInstances = clone(sortedWhiteWineInstancesByQuality);
        
        var indexOfID = attributes.indexOf("ID");
        if(indexOfID != -1) {
            attributes.splice(indexOfID, 1);
        }
        
        normalizedSortedInstances.every(function(instance, index) {
            attributes.forEach(function(attribute) {
                normalizedSortedInstances[index][attribute] = 100 * (normalizedSortedInstances[index][attribute] - whiteWineStatistics[attribute]["min"]) / (whiteWineStatistics[attribute]["max"] - whiteWineStatistics[attribute]["min"] + 1e-6);
            });
            
            return true;            
        });
        
//        console.log(normalizedSortedInstances);
        window.normalizedSortedInstances = normalizedSortedInstances;
                
        // store as global variable, for window is a global variable
        window.whiteWineInstances = instances;
        
		render_heatmap(window.whiteWineInstances,false);
        
        
//        console.log(window.whiteWineInstances);        
        // render_luc(window.whiteWineInstances,false);
//		render_table(window.whiteWineInstances,false);
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