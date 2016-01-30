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
	
    // after loading the DOM, adjust the svg size according to window height width ratio
    function autoAdjustWindow() {
        var windowWidth = $(window).width(), windowHeight = $(window).height(),
            hwRatio = windowHeight / windowWidth,
            $scatter_svg = $("#scatterPlot > svg"),
            scatterSvgWidth = $scatter_svg.width(),
            $compareGoodBadWines_svg = $("#compareGoodBadWines > svg"),
            compareGoodBadWinesSvgWidth = $compareGoodBadWines_svg.width(),
            $parallelCoordinates_svg = $("#parallelCoordinates > svg"),
            parallelCoordinatesSvgWidth = $parallelCoordinates_svg.width(),
            $instanceRadarChart_svg = $("#instanceRadarChart > svg"),
            instanceRadarChartSvgWidth = $instanceRadarChart_svg.width();
            
        $scatter_svg.height(Math.floor(scatterSvgWidth * hwRatio));
        $compareGoodBadWines_svg.height(Math.floor(compareGoodBadWinesSvgWidth * hwRatio));
        $parallelCoordinates_svg.height(Math.floor(parallelCoordinatesSvgWidth * hwRatio));
        $instanceRadarChart_svg.height(Math.floor(instanceRadarChartSvgWidth * hwRatio));
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
	
    /*
    * draw radar chart
    * @para container, a HTML element that is used to contain radar chart, #instanceRadarChart form.
    * @para instanceID, the ID of a white wine instance.
    */
	function radarRender(radarContainer, instanceID) {
        
        var chart = RadarChart.chart();
        var data = {};
        
        //Legend titles
		var LegendOptions = ['White wine instance ' + instanceID];
		
        // dat to be rendered
        var instance = window.whiteWineInstances[instanceID];
        
        var attributes = Object.keys(instance);
        
        var indexOfID = attributes.indexOf("ID");
        if(indexOfID != -1) {
            attributes.splice(indexOfID, 1);
        }
        var indexOfQuality = attributes.indexOf("quality");
        if(indexOfQuality != -1) {
            attributes.splice(indexOfQuality, 1);
        }
        
        data["axes"] = [];
        
        attributes.forEach(function(attr) {
            data["axes"].push({
                "axis": [attr],
                "value": instance[attr] / window.whiteWineStatistics[attr]["max"]
            });
        });
        
        // TODO
        RadarChart.defaultConfig.radius = 5;
        RadarChart.defaultConfig.w = $(radarContainer).find("svg").width();
        RadarChart.defaultConfig.h = $(radarContainer).find("svg").height();
        RadarChart.draw(radarContainer, [data]);
        
        // add legend
//		
//        var colorscale = d3.scale.category10();
//        
//		var svg = d3.select(container)
//			.selectAll('svg')
//			.append('svg')
//			.attr({"width": w+500,"height": h});
//		
//		//Create the title for the legend
//		var text = svg.append("text")
//			.attr({"class": "title",'transform': 'translate(90,0)',"x": w - 100,"y": 20,"font-size": "16px","fill": "#404040"})
//			.text('The attributes of the wine "whitewine0001"');
//				
//		//Initiate Legend	
//		var legend = svg.append("g")
//			.attr({"class": "legend","height": 100,"width": 200,'transform':'translate(90,20)'})
//			;
//			//Create colour squares
//			legend.selectAll('rect')
//			  .data(LegendOptions)
//			  .enter()
//			  .append("rect")
//			  .attr({"x": w - 65,"y":function(d, i){ return i * 20+10;},"width":10,"height":10})
//			  .style("fill", function(d, i){ return colorscale(i);})
//			  ;
//			//Create text next to squares
//			legend.selectAll('text')
//			  .data(LegendOptions)
//			  .enter()
//			  .append("text")
//			  .attr({"x": w - 52, "y": function(d, i){ return i * 20 + 9+10;},"font-size": "11px","fill": "#737373"})
//			  .text(function(d) { return d; })
//			  ;	
	
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
                "quality": "Good white wine",
                "mean": d3.mean(topTenPercentInstances, function(instance){return instance[attribute];}),
                "min": d3.min(topTenPercentInstances, function(instance){return instance[attribute];}),
                "max": d3.max(topTenPercentInstances, function(instance){return instance[attribute];}),
                "median": d3.median(topTenPercentInstances, function(instance){return instance[attribute];}),
                "variance": d3.variance(topTenPercentInstances, function(instance){return instance[attribute];}),
                "deviation": d3.deviation(topTenPercentInstances, function(instance){return instance[attribute];})
            });
            
            attrStatis.push({
                "attribute": attribute,
                "quality": "Bad white wine",
                "mean": d3.mean(botTenPercentInstances, function(instance){return instance[attribute];}),
                "min": d3.min(botTenPercentInstances, function(instance){return instance[attribute];}),
                "max": d3.max(botTenPercentInstances, function(instance){return instance[attribute];}),
                "median": d3.median(botTenPercentInstances, function(instance){return instance[attribute];}),
                "variance":d3.variance(botTenPercentInstances, function(instance){return instance[attribute];}),
                "deviation": d3.deviation(botTenPercentInstances, function(instance){return instance[attribute];})
            });  
        });
        

        
        /* 
        * draw the bar charts
        *
        */
        // define margin and padding
		var d3_svg = d3.select(container).select("svg"),
			svgWidth = d3_svg.style("width").replace("px", ""),
			svgHeight = d3_svg.style("height").replace("px", ""),
			margin = {top: 20, right: 20, bottom: 20, left: 20},
			padding = {top: 40, right: 40, bottom: 40, left: 40},
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

            xAxisG.call(xAxis).selectAll("text").attr("dx", "-.8em").attr("dy", "1em").attr("transform", "rotate(-20)");

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
    var d3_svg = d3.select("#scatterPlot").select("svg"),
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
        "numberOfBins": 10,
        "zColorScale": d3.scale.category10()
        /*
        var rMin = 2, rMax = 20; // "r" stands for radius
        var zLinearScale = d3.scale.linear()
            .domain(d3.extent(instances, function(instance){return instance["quality"];}))
            .range([rMin, rMax]);
        */
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
	function scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axisLabelsParas, instances, isUpdate) {
        var statistics = window.whiteWineStatistics;
        
        var width = d3_svg_g_paras.width,
            height = d3_svg_g_paras.height,
            xAttr = axisesParas["xAttr"],
            yAttr = axisesParas["yAttr"];
        
        // clear previous scatter
        d3_svg_g.selectAll("*").remove();
        
        if(xAttr == yAttr) {    // histogram
            var numberOfBins = axisesParas["numberOfBins"],
                maxAttrValue = statistics[xAttr]["max"],
                minAttrValue = statistics[xAttr]["min"],
                intervalWidth = (maxAttrValue - minAttrValue) / numberOfBins;            
            // initialiaze the histogram
            var histogram = [];
            for(var i = 0; i < numberOfBins; ++i) {
                histogram.push(0);
            }
            
            // compute the histogram
            var histIndex = 0;
            for(var i = 0; i < instances.length; ++i) {
                histIndex = Math.floor((instances[i][xAttr] - minAttrValue) / intervalWidth);
                if(histIndex == numberOfBins) {
                    --histIndex;
                }
                ++histogram[ histIndex ];
            }
            
            // map original data to svg visible area, width and height, respectively
            var xOrdinalScale = d3.scale.ordinal().rangeBands([0, width], 0.2);
            var yLinearScale = d3.scale.linear().range([height, 0]);
            
            var binIndexArray =[];
            for(var i = 0; i < numberOfBins; ++i) {
                binIndexArray.push(i);
            }
            
            xOrdinalScale.domain(binIndexArray);
            yLinearScale.domain(d3.extent(histogram));
            
            
            // add tips
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Frequency:</strong> <span>" + d + "</span>";
            });

            d3_svg_g.call(tip);
            
            
            // draw histograms
            var d3_svg_g_bars = d3_svg_g.selectAll("rect").data(histogram);
            
            d3_svg_g_bars.enter().append("rect")
                .attr("x", function (d, i) { return xOrdinalScale(i); })
                .attr("y", function (d) { return yLinearScale(d); })
                .attr("width", xOrdinalScale.rangeBand())
                .attr("height", function (d){ return height - yLinearScale(d); })
                .attr("fill", "#ff7f0e")
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);
            
            d3_svg_g_bars.exit().remove();
            
            // draw axises
            // change the index of intervals to interval itself
            var binIntervalArray =[];
            for(var i = 0; i < numberOfBins; ++i) {
                binIntervalArray.push((minAttrValue + i * intervalWidth).toPrecision(4) + "-");
            }
            xOrdinalScale.domain(binIntervalArray);
            
            var xAxis = d3.svg.axis().scale(xOrdinalScale).orient("bottom")
                .outerTickSize(0);
            
            var yAxis = d3.svg.axis().scale(yLinearScale).orient("left")
                .ticks(5)                   // Use approximately 5 ticks marks.
                .tickFormat(d3.format("s")) // Use intelligent abbreviations, e.g. 5M for 5 Million
                .outerTickSize(0);          // Turn off the marks at the end of the axis.

            // set axis, give it a class so it can be used to select only xaxis labels  below
            var xAxisG = d3_svg_g.append("g")
                .attr({"transform": "translate(0," + height + ")", "class": "x axis"});
            var yAxisG = d3_svg_g.append("g").attr({"class": "y axis"});		
            var xAxisLabel = xAxisG.append("text")
                .style("text-anchor", "middle")
                .attr({"x": width / 2, "y": axisLabelsParas.xAxisLabelOffset, "class": "label"})
                .text(xAttr);
            var yAxisLabel = yAxisG.append("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(-" + axisLabelsParas.yAxisLabelOffset + "," + (height / 2) + ") rotate(-90)")
                .text("frequency");
            // draw axis
            xAxisG.call(xAxis);
            yAxisG.call(yAxis);            
        }
        else {  // scatter, yAttr = f(xAttr)
            var xLinearScale = d3.scale.linear().range([0, width]),
                yLinearScale = d3.scale.linear().range([height, 0]),
                xAxis = d3.svg.axis().scale(xLinearScale).orient("bottom"),
                yAxis = d3.svg.axis().scale(yLinearScale).orient("left");
            
            xLinearScale.domain([statistics[xAttr]["min"], statistics[xAttr]["max"]]);
            yLinearScale.domain([statistics[yAttr]["min"], statistics[yAttr]["max"]]);	

            // Update...
            var d3_svg_g_circles = d3_svg_g.selectAll("circle").data(instances);
            if(isUpdate) { // is update
              d3_svg_g_circles.transition().duration(300)
                .attr({"fill": function(instance){return "#2ca02c"/*zColorScale(instance[zAttr])*/;}, "fill-opacity": 0.8, "stroke": "none", "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": 3, "id": function(instance){return "whiteWine" + instance["ID"];}});
            }

            // draw axises
            // set axis, give it a class so it can be used to select only xaxis labels  below
            var xAxisG = d3_svg_g.append("g")
                .attr({"transform": "translate(0," + height + ")", "class": "x axis"});
            var yAxisG = d3_svg_g.append("g").attr({"class": "y axis"});		
            var xAxisLabel = xAxisG.append("text")
                .style("text-anchor", "middle")
                .attr({"x": width / 2, "y": axisLabelsParas.xAxisLabelOffset}).text(xAttr);
            var yAxisLabel = yAxisG.append("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(-" + axisLabelsParas.yAxisLabelOffset + "," + (height / 2) + ") rotate(-90)").text(yAttr);
            // draw axis
            xAxisG.call(xAxis);
            yAxisG.call(yAxis);

            // Enter handles added data only
            d3_svg_g_circles.enter().append("circle")
                .attr({"fill": function(instance){return "#74c476"/*zColorScale(instance[zAttr])*/;}, "fill-opacity": 0.8, "stroke": "none", "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": 3, "id": function(instance){return "whiteWine" + instance["ID"];}})
                .on("click", function() {
                // TODO
                var circle = d3.select(this);
                var instanceID = parseFloat(circle.attr("id").replace("whiteWine", ""));
                radarRender("#instanceRadarChart", instanceID);
            });

            // Exit…
            d3_svg_g_circles.exit().remove(); 
        }
	}
    
    
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
    d3_svg_g_paras_pc.width = d3_svg_g_paras_pc.innerWidth - d3_svg_paras_pc.padding.left - d3_svg_paras.padding.right;
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
            background = axisesParas_pc["background"],
            foreground = axisesParas_pc["foreground"],
            height = d3_svg_g_paras_pc["height"],
            width = d3_svg_g_paras_pc["width"],
            dragging = axisesParas_pc["dragging"],
            axis = axisesParas_pc["axis"];
        
        // Extract the list of dimensions and create a scale for each.
        x.domain(axisesParas_pc["dimensions"] = d3.keys(instances[0]).filter(function(d) {
            return d != "ID" && (y[d] = d3.scale.linear().domain(d3.extent(instances, function(p) { return +p[d];})).range([height, 0]));
        }));

        // Add grey background lines for context.
        background = d3_svg_g_pc.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(instances)
            .enter().append("path")
            .attr("d", path);
        
        // Add blue foreground lines for focus.
        foreground = d3_svg_g_pc.append("g")
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
                y = axisesParas_pc["y"],
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
        scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axisLabelsParas, window.whiteWineInstances, false);
        // bind x, y, z-labels change events
        $("#xLabelBtns > button").click(function() {
            axisesParas.xAttr = $(this).attr("title");
            $(this).addClass("active").siblings().removeClass("active");
            scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axisLabelsParas, window.whiteWineInstances, false);
        });
        
        $("#yLabelBtns > button").click(function() {
            axisesParas.yAttr = $(this).attr("title");
            $(this).addClass("active").siblings().removeClass("active");
            scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axisLabelsParas, window.whiteWineInstances, false);
        });
        
        $("#changeNumberOfBinsBtn").click(function() {
            var numberOfBins = Math.round(parseFloat($(this).parent().prev().val()));
            if(isNaN(numberOfBins)) {
                ;
            }
            else {
                axisesParas["numberOfBins"] = numberOfBins;
                scatterRender(d3_svg_g, d3_svg_g_paras, axisesParas, axisLabelsParas, window.whiteWineInstances, false);
            }
        });
        
        
        
//        renderStatistics(d3.select("#statistics").select("table"), window.whiteWineStatistics);

//        console.log(window.whiteWineInstances);
        renderParallelCoordinates(instances);
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