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
	window.renderingType = "Scatter"; // Scatter, Line, Bar, ...
	
    // after loading the DOM, adjust the svg size according to window height width ratio
    function autoAdjustWindow() {
        var windowWidth = $(this).width(), windowHeight = $(this).height(),
            $canvas_svg = $("#canvas > svg"),
            svgWidth = $canvas_svg.width(),
            svgHeight = $canvas_svg.height();
        $canvas_svg.height(Math.floor(svgWidth * windowHeight / windowWidth));
    };
    autoAdjustWindow();
    
	// auto adjust when resizing window
	$(window).resize(function() {
        autoAdjustWindow();
		if(window.whiteWineInstances != null) {
			// re-render
//			render(window.whiteWineInstances, true);
		}
	});
	
    
    // resizable tables, charts
    $( ".resizable" ).resizable({
      animate: true
    });
	
	function render_luc(instances, isUpdate) {
		var w = 700,
			h = 700;
	
		var colorscale = d3.scale.category10();
		
		//Legend titles
		var LegendOptions = ['WhiteWine0001'];
		
		//Data
		var d = 
				[
					[
						{axis:"Fixed acidity",value:instances[0]["fixed acidity"]/d3.max(instances, function(instance){return instance["fixed acidity"]})},
						{axis:"Volatile acidity",value:instances[0]["volatile acidity"]/d3.max(instances, function(instance){return instance["volatile acidity"]})},
						{axis:"Citric acid",value:instances[0]["citric acid"]/d3.max(instances, function(instance){return instance["citric acid"]})},
						{axis:"Residual sugar",value:instances[0]["residual sugar"]/d3.max(instances, function(instance){return instance["residual sugar"]})},
						{axis:"Chlorides",value:instances[0]["chlorides"]/d3.max(instances, function(instance){return instance["chlorides"]})},
						{axis:"Free sulfur dioxide",value:instances[0]["free sulfur dioxide"]/d3.max(instances, function(instance){return instance["free sulfur dioxide"]})},
						{axis:"Total sulfur dioxide",value:instances[0]["total sulfur dioxide"]/d3.max(instances, function(instance){return instance["total sulfur dioxide"]})},
						{axis:"Density",value:instances[0]["density"]/d3.max(instances, function(instance){return instance["density"]})},
						{axis:"pH",value:instances[0]["pH"]/d3.max(instances, function(instance){return instance["pH"]})},
						{axis:"Sulphates",value:instances[0]["sulphates"]/d3.max(instances, function(instance){return instance["sulphates"]})},
						{axis:"Alcohol",value:instances[0]["alcohol"]/d3.max(instances, function(instance){return instance["alcohol"]})},
					]
				];
				
		//Options for the Radar chart, other than default
		var mycfg = {
		  w: w,
		  h: h,
		  maxValue: 1.0,
		  levels: 6,
		  ExtraWidthX: 300
		}
		
		//Call function to draw the Radar chart
		//Will expect that data is in %'s
		RadarChart.draw("#chart", d, mycfg);
		
		////////////////////////////////////////////
		/////////// Initiate legend ////////////////
		////////////////////////////////////////////
		
		var svg = d3.select('#body')
			.selectAll('svg')
			.append('svg')
			.attr({"width": w+500,"height": h})
		
		//Create the title for the legend
		var text = svg.append("text")
			.attr({"class": "title",'transform': 'translate(90,0)',"x": w - 100,"y": 20,"font-size": "16px","fill": "#404040"})
			.text('The attributes of the wine "whitewine0001"');
				
		//Initiate Legend	
		var legend = svg.append("g")
			.attr({"class": "legend","height": 100,"width": 200,'transform':'translate(90,20)'})
			;
			//Create colour squares
			legend.selectAll('rect')
			  .data(LegendOptions)
			  .enter()
			  .append("rect")
			  .attr({"x": w - 65,"y":function(d, i){ return i * 20+10;},"width":10,"height":10})
			  .style("fill", function(d, i){ return colorscale(i);})
			  ;
			//Create text next to squares
			legend.selectAll('text')
			  .data(LegendOptions)
			  .enter()
			  .append("text")
			  .attr({"x": w - 52, "y": function(d, i){ return i * 20 + 9+10;},"font-size": "11px","fill": "#737373"})
			  .text(function(d) { return d; })
			  ;	
	
	}
	
	function transform(attrName,data) {
	    d3.select("tbody").selectAll("tr").remove();
	
		// Header
	    var th = d3.select("thead").selectAll("th")
	            .data(jsonToArray(data[0]))
	          	.enter().append("th")
	          	.on("click", function(d){transform(d[0], data);})
	            .text(function(d) { return d[0]; });
	
		// Rows	
	    var tr = d3.select("tbody").selectAll("tr")
	    	.data(data)
			.enter().append("tr")
			// .sort(function (a, b) { return a - b});
			.sort(function (a, b) { return a == null || b == null ? 0 : Compare(a[attrName], b[attrName]);});
	
		// Cells
	    var td = tr.selectAll("td")
	            .data(function(d) { return jsonToArray(d); })
	        	.enter().append("td")
	            .text(function(d) { return d[1]; });

	}
	
	
	function Compare(a, b) {

		if(!isNaN(parseFloat(a)) && !isNaN(parseFloat(b))){

			return parseFloat(a) > parseFloat(b) ? 1 : parseFloat(a)==parseFloat(b) ? 0 : -1;
			
		}else{
			a = a.toLowerCase();
			b = b.toLowerCase();
			return a > b ? 1 : a == b ? 0 : -1;//for string comparison
		}
		
	}
	function jsonKeyValueToArray(k, v) {return [k, v];}
	
	function jsonToArray(json) {
		    var ret = new Array();
		    var key;
		    for (key in json) {
		        if (json.hasOwnProperty(key)) {
		            ret.push(jsonKeyValueToArray(key, json[key]));
		        }
		    }
		    return ret;
		}
	
	function render_table(instances, isUpdate) {
        transform("ID", instances);
    }
    
    /*
    * render statistics
    */
    function renderStatistics(d3_table, statistics) {
        var thead = d3_table.append("thead"),
            tbody = d3_table.append("tbody");
        
        // get all keys
        var atrributes = Object.keys(statistics),
            staticticIndicators = Object.keys(statistics[atrributes[0]]);
        staticticIndicators.unshift("attr");
        
//        // add thead
        thead.append("tr")
            .selectAll("th")
            .data(staticticIndicators)
            .enter()
            .append("th")
            .text(function(d) {return d;});   
        
        // add tbody
        for(statistic in statistics) {
            var tr = tbody.append("tr");
            tr.append("td").text(statistic);
            for(value in statistics[statistic]) {
                tr.append("td").text(parseFloat(statistics[statistic][value]).toPrecision(4));
            }
        }
        
    }
    
    /*
    * Compare good wines with bad wines of quality
    * @para the element to contain the svg
    * @para sortedInstances, descending
    */
    function compareGoodBadWines(container, sortedInstances) {
        
        // first of all, get first 10% and last 10% instances
        var sampleInstancesNumber = Math.round(sortedInstances.length * 0.1);
        var topTenPercentInstances = [],
            botTenPercentInstances = [];
        for(var i = 0; i <= sampleInstancesNumber; ++i) {
            topTenPercentInstances.push(sortedInstances[i]);
            botTenPercentInstances.push(sortedInstances[sortedInstances.length - 1 - i]);
        }
//        console.log(topTenPercentInstances);
//        console.log(botTenPercentInstances);
        
        // compute statistics of the atrributes of good and bad wines
        var attrStatis = [];
        
        var attributes = Object.keys(sortedInstances[0]);
        var indexOfID = attributes.indexOf("ID");
        if(indexOfID != -1) {
            attributes.splice(indexOfID, 1);
        }
        var indexOfQuality = attributes.indexOf("quality");
        if(indexOfQuality != -1) {
            attributes.splice(indexOfQuality, 1);
        }
//        console.log(attributes);
        attributes.forEach(function(attribute) {
            attrStatis.push({
                "attribute": attribute,
                "quality": "good",
                "mean": d3.mean(topTenPercentInstances, function(instance){return instance[attribute];}),
                "min": d3.min(topTenPercentInstances, function(instance){return instance[attribute];}),
                "max": d3.max(topTenPercentInstances, function(instance){return instance[attribute];}),
                "median": d3.median(topTenPercentInstances, function(instance){return instance[attribute];}),
                "variance": d3.variance(topTenPercentInstances, function(instance){return instance[attribute];}),
                "deviation": d3.deviation(topTenPercentInstances, function(instance){return instance[attribute];})
            });
            
            attrStatis.push({
                "attribute": attribute,
                "quality": "bad",
                "mean": d3.mean(botTenPercentInstances, function(instance){return instance[attribute];}),
                "min": d3.min(botTenPercentInstances, function(instance){return instance[attribute];}),
                "max": d3.max(botTenPercentInstances, function(instance){return instance[attribute];}),
                "median": d3.median(botTenPercentInstances, function(instance){return instance[attribute];}),
                "variance":d3.variance(botTenPercentInstances, function(instance){return instance[attribute];}),
                "deviation": d3.deviation(botTenPercentInstances, function(instance){return instance[attribute];})
            });  
        });
        
//        console.log(attrStatis);
        // draw the bar charts
        
        // define margin and padding
		var d3_svg = d3.select(container).select("svg"),
			svgWidth = d3_svg.style("width").replace("px", ""),
			svgHeight = d3_svg.style("height").replace("px", ""),
			margin = {top: 20, right: 20, bottom: 20, left: 20},
			padding = {top: 20, right: 20, bottom: 60, left: 60},
            barPadding = 0.2,
			innerWidth = svgWidth - margin.left - margin.right,
			innerHeight = svgHeight - margin.top - margin.bottom,
			width = innerWidth - padding.left - padding.right,
			height = innerHeight - padding.top - padding.bottom;
		
		// set visible area, i.e., the container of visualized charts
		var d3_svg_g = d3_svg.select("g").attr({"transform": "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")"});
        
        var xColumn = "attribute",
            yColumn = "median",
            colorColumn = "quality",
            layerColumn = colorColumn;
        
        var xAxisG = d3_svg_g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");
        
        var yAxisG = d3_svg_g.append("g")
            .attr("class", "y axis");
        
        var yAxisLabel = yAxisG.append("text")
            .style("text-anchor", "middle")
            .attr("transform", "translate(-" + 40 + "," + (height / 2) + ") rotate(-90)")
            .attr("class", "label")
            .text("Normalized " + yColumn);
        
        var colorLegendG = d3_svg_g.append("g")
            .attr({"class": "color-legend", "transform": "translate(20, 0)"});
        
        var xScale = d3.scale.ordinal().rangeBands([0, width], barPadding),
            yScale = d3.scale.linear().range([height, 0]),
            colorScale = d3.scale.category10();

        var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
            .outerTickSize(0);
        var yAxis = d3.svg.axis().scale(yScale).orient("left")
            .ticks(5)
            .tickFormat(d3.format("s"))
            .outerTickSize(0);
        
        var colorLegend = d3.legend.color()
            .scale(colorScale)
            .shapePadding(2)
            .shapeWidth(15)
            .shapeHeight(15)
            .labelOffset(4);
        
        render();
        
        $("#comparisonToolBar > button").click(function(event) {
            
            $(this).siblings().removeClass("active").end().addClass("active");
            
            yColumn = $(this).text();
            
            yAxisLabel.text("Normalized " + yColumn);
            
            render();
        });
        
        
        // render, will be changed according to the statistics chosen
        function render() {
            
            var nested = d3.nest()
              .key(function (d){ return d[layerColumn]; })
              .entries(attrStatis);

            var stack = d3.layout.stack()
              .y(function (d){ return d[yColumn]; })
              .values(function (d){ return d.values; });

            var layers = stack(nested);

            xScale.domain(layers[0].values.map(function (d){
              return d[xColumn];
            }));

            yScale.domain([
              0,
              d3.max(layers, function (layer){
                return d3.max(layer.values, function (d){
                  return d.y;
                });
              })
            ]);

            colorScale.domain(layers.map(function (layer){
              return layer.key;
            }));

            xAxisG
              .call(xAxis)
              .selectAll("text")  
              .attr("dx", "-.8em")
              .attr("dy", "1em")
              .attr("transform", "rotate(-20)" );

            yAxisG.call(yAxis);

            // add tips
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var attrStatistics = window.whiteWineStatistics[d["attribute"]];
                    var originalData = (d[yColumn] / 100 * (attrStatistics["max"] - attrStatistics["min"]) + attrStatistics["min"]).toPrecision(4);
                    return "<strong>" + d["attribute"] + ":</strong> <span>" + originalData + "</span>";
            });

            d3_svg_g.call(tip);

            var layers = d3_svg_g.selectAll(".layer").data(layers);
            layers.enter().append("g").attr("class", "layer");
            layers.exit().remove();
            layers.style("fill", function (d){
              return colorScale(d.key);
            });

            var bars = layers.selectAll("rect").data(function (d){
              return d.values;
            });
            var barWidth = xScale.rangeBand() / colorScale.domain().length;
            bars.enter().append("rect")
            bars.exit().remove();
            bars.attr({
                "x": function (d, i, j) {return xScale(d[xColumn]) + barWidth * j;},       
                "y": function (d){ return yScale(d.y); },
                "width": barWidth,
                "height": function (d){return height - yScale(d.y);}})
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            colorLegendG.call(colorLegend);
        }
    }
    
    
    /*
    * render scatter
    *
    */
    
    // first, define the canvas
    // define margin and padding
    var d3_svg = d3.select("#scatterPlot").select("#canvas").select("svg"),
        d3_svg_paras = {
            svgWidth: parseFloat(d3_svg.style("width").replace("px", "")),
            svgHeight: parseFloat(d3_svg.style("height").replace("px", "")),
            margin: {top: 20, right: 20, bottom: 20, left: 20},
            padding: {top: 40, right: 40, bottom: 40, left: 40}
        };

    // set visible area, i.e., the container of visualized charts
    var d3_svg_g = d3_svg.select("g").attr({"transform": "translate(" + (d3_svg_paras.margin.left + d3_svg_paras.padding.left) + "," + (d3_svg_paras.margin.top + d3_svg_paras.padding.top) + ")"}),
        d3_svg_g_paras = {
            innerWidth: d3_svg_paras.svgWidth - d3_svg_paras.margin.left - d3_svg_paras.margin.right,
            innerHeight: d3_svg_paras.svgHeight - d3_svg_paras.margin.top - d3_svg_paras.margin.bottom
        };
    d3_svg_g_paras.width = d3_svg_g_paras.innerWidth - d3_svg_paras.padding.left - d3_svg_paras.padding.right;
    d3_svg_g_paras.height= d3_svg_g_paras.innerHeight - d3_svg_paras.padding.top - d3_svg_paras.padding.bottom;
    
    var axisesParas = {
        // next, define x-label, y-label, z-label and assign default values
        // default alcohol (0) to predict quality (7)
        "xAttr": "alcohol",
        "yAttr": "quality",
        "zAttr": "quality",
        // map original data to svg visible area, width and height, respectively
        "xLinearScale": d3.scale.linear().range([0, d3_svg_g_paras.width]),
        "yLinearScale": d3.scale.linear().range([d3_svg_g_paras.height, 0]),
        "zColorScale": d3.scale.category10()
        /*
        var rMin = 2, rMax = 20; // "r" stands for radius
        var zLinearScale = d3.scale.linear()
            .domain(d3.extent(instances, function(instance){return instance["quality"];}))
            .range([rMin, rMax]);
        */
    },
        axises = {
            // define axis
            "xAxis": d3.svg.axis().scale(axisesParas["xLinearScale"]).orient("bottom"),
            "yAxis": d3.svg.axis().scale(axisesParas["yLinearScale"]).orient("left")
        },
        axisLabelsParas = { // define axis labels
            // xAxisLabelText: xAttr,
            "xAxisLabelOffset": 48,
            // yAxisLabelText: yAttr,
            "yAxisLabelOffset": 36
        };
    
	/*
	 * scatter renderer
	 * @para instances, object. The data set to be rendered.
	 * @para isUpdate, boolean. true, first time rendering; false, update. 
	 */
	function scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axises, axisLabelsParas, instances, isUpdate) {
        
        var width = d3_svg_g_paras.width,
            height = d3_svg_g_paras.height,
            xLinearScale = axisesParas.xLinearScale,
            yLinearScale = axisesParas.yLinearScale,
            xAttr = axisesParas["xAttr"],
            yAttr = axisesParas["yAttr"],
            xAxis = axises["xAxis"],
            yAxis = axises["yAxis"];
        
        // clear previous scatter
        d3_svg_g.selectAll("*").remove();
        
        // scatter, yAttr = f(xAttr)
		xLinearScale.domain(d3.extent(instances, function(instance){return instance[xAttr];}));
		yLinearScale.domain(d3.extent(instances, function(instance){return instance[yAttr];}));	
        
        // Update...
		var d3_svg_g_circles = d3_svg_g.selectAll("circle").data(instances);
		if(isUpdate) { // is update
		  d3_svg_g_circles.transition().duration(300)
			.attr({"fill": function(instance){return "#2ca02c"/*zColorScale(instance[zAttr])*/;}, "fill-opacity": 0.8, "stroke": "none", "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": 3});	
        }
        
        // draw axises
        // set axis, give it a class so it can be used to select only xaxis labels  below
        var xAxisG = d3_svg_g.append("g")
            .attr({"transform": "translate(0," + height + ")", "class": "xaxis"});
        var yAxisG = d3_svg_g.append("g").attr({"class": "yaxis"});		
        var xAxisLabel = xAxisG.append("text")
            .style("text-anchor", "middle")
            .attr({"x": width / 2, "y": axisLabelsParas.xAxisLabelOffset, "class": "label"}).style("font-size", "2em")
            .text(xAttr);
        var yAxisLabel = yAxisG.append("text")
            .style("text-anchor", "middle")
            .attr("transform", "translate(-" + axisLabelsParas.yAxisLabelOffset + "," + (height / 2) + ") rotate(-90)").style("font-size", "2em")
            .text(yAttr);
        // draw axis
        xAxisG.call(xAxis);
        yAxisG.call(yAxis);

        // Enter handles added data only
        d3_svg_g_circles.enter().append("circle")
            .attr({"fill": function(instance){return "#2ca02c"/*zColorScale(instance[zAttr])*/;}, "fill-opacity": 0.8, "stroke": "none", "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": 3});

        // Exit…
        d3_svg_g_circles.exit().remove();
		
		/*
		// manully visualize, not applicable
		instances.forEach(function(instance) {
			
		});
		*/
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
        
        compareGoodBadWines("#compareGoodBadWines", window.normalizedSortedInstances);
        
        // store as global variable, for window is a global variable
        window.whiteWineInstances = instances;
        
        // scatter render
        scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axises, axisLabelsParas, window.whiteWineInstances, false);
        // bind x, y, z-labels change events
        $("#xLabelBtns > button").click(function() {
            axisesParas.xAttr = $(this).attr("title");
            $(this).addClass("active").siblings().removeClass("active");
            scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axises, axisLabelsParas, window.whiteWineInstances, false);
        });
        
        $("#yLabelBtns > button").click(function() {
            axisesParas.yAttr = $(this).attr("title");
            $(this).addClass("active").siblings().removeClass("active");
            scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axises, axisLabelsParas, window.whiteWineInstances, false);
        });
        
        
        
//        renderStatistics(d3.select("#statistics").select("table"), window.whiteWineStatistics);

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