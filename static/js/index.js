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
        $instanceRadarChart_svg.height(Math.floor($scatter_svg.height()));
    };
    
    autoAdjustWindow();
    
    
    /*
    * Compare top % and bottom % quality wines of quality
    * @para container, the element to contain the rendered chart.
    * @para sortedInstances, descending.
    * @para instancesStatistics.
    */
    function compareTopAndBottom(container, sortedInstances, instancesStatistics) {
        
        // define margin and padding
		var d3_svg = d3.select(container).select("svg"),
			svgWidth = d3_svg.style("width").replace("px", ""),
			svgHeight = d3_svg.style("height").replace("px", ""),
			margin = {top: 20, right: 20, bottom: 20, left: 20},
			padding = {top: 20, right: 20, bottom: 40, left: 40},
            barPadding = 0.2,
			innerWidth = svgWidth - margin.left - margin.right,
			innerHeight = svgHeight - margin.top - margin.bottom,
			width = innerWidth - padding.left - padding.right,
			height = innerHeight - padding.top - padding.bottom;
		
        // clear all previous one
        d3_svg.select("*").remove();
        d3_svg.append("g");
        
		// set visible area, i.e., the container of visualized charts
		var d3_svg_g = d3_svg.select("g").attr({"transform": "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")"});
        // title
        var d3_svg_g_title = d3_svg_g.append("text").attr("class", "svg-title");
        
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
            .style({"text-anchor": "middle", "font-size": "2em"})
            .attr("transform", "translate(-" + 40 + "," + (height / 2) + ") rotate(-90)")
            .text("Normalized " + yColumn);
        
        // color legend to different kinds
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
        
        var colorLegend = d3.legend.color().scale(colorScale).shapePadding(2).shapeWidth(15).shapeHeight(15)
            .labelOffset(4);
        
        var percentageOfDataConsidered = 0.1;
        
        render(percentageOfDataConsidered);
        
        $("#comparisonToolBar > button").click(function(event) {
            
            $(this).siblings().removeClass("active").end().addClass("active");
            yColumn = $(this).text();
            yAxisLabel.text("Normalized " + yColumn);
            render(percentageOfDataConsidered);
        });
        
        
        $( "#percentageOfDataConsidered" ).slider({
            range: "max",
            min: 5,
            max: 50,
            value: 10,
            slide: function( event, ui ) {
                $( "#percentageOfDataConsideredValue" ).html("Top<strong> " + ui.value + "%</strong>" + " last<strong> " + ui.value + "%</strong> samples based on quality");
                render(parseFloat(ui.value) / 100);
            }
        });
        
        $( "#percentageOfDataConsideredValue" ).html("Top<strong> " + $( "#percentageOfDataConsidered" ).slider("value") + "%</strong>" + " last<strong> " + $( "#percentageOfDataConsidered" ).slider("value") + "%</strong> samples based on quality");
        
        // render, will be changed according to the statistics chosen
        function render(percentageOfDataConsideredValue) {
            // first of all, get first percentageOfDataConsideredValue and last percentageOfDataConsideredValue instances
            var sampleInstancesNumber = Math.round(sortedInstances.length * percentageOfDataConsideredValue);
            var topPercentInstances = [],
                botPercentInstances = [];
            
            for(var i = 0; i <= sampleInstancesNumber; ++i) {
                topPercentInstances.push(sortedInstances[i]);
                botPercentInstances.push(sortedInstances[sortedInstances.length - 1 - i]);
            }
    //        console.log(topPercentInstances);
    //        console.log(botPercentInstances);

            // compute statistics of the atrributes of good and bad wines
            var attrStatis = [];

            var attributes = Object.keys(sortedInstances[0]);
            var indexOfID = attributes.indexOf("ID");
            if(indexOfID != -1) {
                attributes.splice(indexOfID, 1);
            }
//            var indexOfQuality = attributes.indexOf("quality");
//            if(indexOfQuality != -1) {
//                attributes.splice(indexOfQuality, 1);
//            }
    //        console.log(attributes);
            attributes.forEach(function(attribute) {
                attrStatis.push({
                    "attribute": attribute,
                    "quality": "Top quality " + window.instancesName,
                    "mean": d3.mean(topPercentInstances, function(instance){return instance[attribute];}),
                    "min": d3.min(topPercentInstances, function(instance){return instance[attribute];}),
                    "max": d3.max(topPercentInstances, function(instance){return instance[attribute];}),
                    "median": d3.median(topPercentInstances, function(instance){return instance[attribute];}),
                    "variance": d3.variance(topPercentInstances, function(instance){return instance[attribute];}),
                    "deviation": d3.deviation(topPercentInstances, function(instance){return instance[attribute];})
                });

                attrStatis.push({
                    "attribute": attribute,
                    "quality": "Low quality " + window.instancesName,
                    "mean": d3.mean(botPercentInstances, function(instance){return instance[attribute];}),
                    "min": d3.min(botPercentInstances, function(instance){return instance[attribute];}),
                    "max": d3.max(botPercentInstances, function(instance){return instance[attribute];}),
                    "median": d3.median(botPercentInstances, function(instance){return instance[attribute];}),
                    "variance":d3.variance(botPercentInstances, function(instance){return instance[attribute];}),
                    "deviation": d3.deviation(botPercentInstances, function(instance){return instance[attribute];})
                });  
            });
            
            // render the chart
            var nested = d3.nest().key(function (d){ return d[layerColumn]; }).entries(attrStatis);

            var stack = d3.layout.stack().y(function (d){ return d[yColumn]; }).values(function (d){ return d.values; });

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
            
            // remove yAxis
//            yAxisG.call(yAxis);
            
            // add title
            d3_svg_g_title.text(["Statistics of top and last " + Math.round(percentageOfDataConsideredValue * 100) + "% quality " + window.instancesName]).style("text-anchor", "middle").attr({"x": innerWidth / 2, "y": 0, "font-size": "2em", "class": "svg-title"});

            // add tips
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var attrStatistics = instancesStatistics[d["attribute"]];
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
    * scatter render
    * @para container, the div element that is used to contain the scatter chart
    * @para instances, original data set
    * @para statistics of the original data set
    * @para sortedInstancesByQuality, the sorted data set to be rendered
    */
    
    function scatterRender(container, instances, instancesStatistics, sortedInstancesByQuality) {
        
        // first, define the canvas, define margin and padding
        var svg = d3.select(container).select("svg"),
            svg_paras = {
                svgWidth: parseFloat(svg.style("width").replace("px", "")),
                svgHeight: parseFloat(svg.style("height").replace("px", "")),
                margin: {top: 20, right: 20, bottom: 20, left: 20},
                padding: {top: 40, right: 40, bottom: 40, left: 40}
            };

        // set visible area, i.e., the container of visualized charts
        var svg_g = svg.select("g").attr({"transform": "translate(" + (svg_paras.margin.left + svg_paras.padding.left) + "," + (svg_paras.margin.top + svg_paras.padding.top) + ")"}),
            svg_g_paras = {
                innerWidth: svg_paras.svgWidth - svg_paras.margin.left - svg_paras.margin.right,
                innerHeight: svg_paras.svgHeight - svg_paras.margin.top - svg_paras.margin.bottom
            };
        svg_g_paras.width = svg_g_paras.innerWidth - svg_paras.padding.left - svg_paras.padding.right;
        svg_g_paras.height= svg_g_paras.innerHeight - svg_paras.padding.top - svg_paras.padding.bottom;

        var axisesParas = {
            // next, define x-label, y-label, z-label and assign default values
            // default alcohol (0) to predict quality (7)
            "xAttr": "alcohol",
            "yAttr": "quality",
            "zAttr": "quality",
            "numberOfBins": 10,
            "zColorScale": d3.scale.category10(),
            "qualityInterval": [instancesStatistics["quality"]["min"], instancesStatistics["quality"]["max"]]
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

        render(false);
        
        /*
        * renderer
        * @para isNumberOFBinsChanged. true, the number of bins changed, false, no.
        */
        function render(isNumberOFBinsChanged) {
            
            // filter the sorted data set based on the quality interval
            var filteredSortedInstances = undefined;
            
            var minmalQuality = axisesParas["qualityInterval"][0],
                maximalQuality = axisesParas["qualityInterval"][1];
            
            var startIndex = 0,
                endIndex = sortedInstancesByQuality.length - 1;
            
            // sortedInstancesByQuality, descending by quality
            for(var i = sortedInstancesByQuality.length - 1; i >= 0; --i) {
                if(sortedInstancesByQuality[i]["quality"] >= minmalQuality) {
                    endIndex = i + 1;
                    break;
                }
            }
            
            for(var i = 0; i < sortedInstancesByQuality.length; ++i) {
                if(sortedInstancesByQuality[i]["quality"] <= maximalQuality) {
                    startIndex = i;
                    break;
                }
            }
            
            
            console.log(startIndex + " " + endIndex);
            
            if(endIndex == -1) {
                filteredSortedInstances = sortedInstancesByQuality.slice(startIndex);
            }
            else {
                filteredSortedInstances = sortedInstancesByQuality.slice(startIndex, endIndex);
            }
            
            var filteredSortedInstancesStatistics = computeStatistics(filteredSortedInstances);
            
            console.log(filteredSortedInstancesStatistics);
            
            var width = svg_g_paras.width,
                height = svg_g_paras.height,
                xAttr = axisesParas["xAttr"],
                yAttr = axisesParas["yAttr"];

            // clear previous scatter
            svg_g.selectAll("*").remove();

            if(xAttr == yAttr) {    // histogram
                var numberOfBins = axisesParas["numberOfBins"],
                    maxAttrValue = filteredSortedInstancesStatistics[xAttr]["max"],
                    minAttrValue = filteredSortedInstancesStatistics[xAttr]["min"],
                    intervalWidth = (maxAttrValue - minAttrValue) / numberOfBins;
                
                // add title
                svg_g.append("text").style("text-anchor", "middle")
                    .attr({"x": width / 2, "y": -10, "class": "svg-title"})
                    .text("Histogram of " + xAttr)
                    .style("font-size", "2em");
                
                // initialiaze the histogram
                var histogram = [];
                for(var i = 0; i < numberOfBins; ++i) {
                    histogram.push(0);
                }

                // compute the histogram
                var histIndex = 0;
                for(var i = 0; i < filteredSortedInstances.length; ++i) {
                    histIndex = Math.floor((filteredSortedInstances[i][xAttr] - minAttrValue) / intervalWidth);
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

                svg_g.call(tip);

                // draw histograms
                var svg_g_bars = svg_g.selectAll("rect").data(histogram);

                svg_g_bars.enter().append("rect")
                    .attr("x", function (d, i) { return xOrdinalScale(i); })
                    .attr("y", function (d) { return yLinearScale(d); })
                    .attr("width", xOrdinalScale.rangeBand())
                    .attr("height", function (d){ return height - yLinearScale(d); })
                    .attr("fill", "#ff7f0e")
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);

                svg_g_bars.exit().remove();

                // draw axises
                // change the index of intervals to interval itself
                var binIntervalArray =[];
                for(var i = 0; i < numberOfBins; ++i) {
                    binIntervalArray.push((minAttrValue + i * intervalWidth).toPrecision(2) + "-" + (minAttrValue + (i+1) * intervalWidth).toPrecision(2));
                }
                xOrdinalScale.domain(binIntervalArray);

                var xAxis = d3.svg.axis().scale(xOrdinalScale).orient("bottom")
                    .outerTickSize(0);

                var yAxis = d3.svg.axis().scale(yLinearScale).orient("left")
                    .ticks(5)                   // Use approximately 5 ticks marks.
                    .tickFormat(d3.format("s")) // Use intelligent abbreviations, e.g. 5M for 5 Million
                    .outerTickSize(0);          // Turn off the marks at the end of the axis.

                // set axis, give it a class so it can be used to select only xaxis labels  below
                var xAxisG = svg_g.append("g")
                    .attr({"transform": "translate(0," + height + ")", "class": "x axis"});
                var yAxisG = svg_g.append("g").attr({"class": "y axis"});		
                var xAxisLabel = xAxisG.append("text")
                    .style({"text-anchor": "middle", "font-size": "2em"})
                    .attr({"x": width / 2, "y": axisLabelsParas.xAxisLabelOffset})
                    .text(xAttr);
                var yAxisLabel = yAxisG.append("text")
                    .style({"text-anchor": "middle", "font-size": "2em"})
                    .attr({"transform": "translate(-" + axisLabelsParas.yAxisLabelOffset + "," + (height / 2) + ") rotate(-90)"})
                    .text("frequency");
                // draw axis
                xAxisG.call(xAxis);
                yAxisG.call(yAxis);            
            }
            else if(!isNumberOFBinsChanged) {  // scatter, yAttr = f(xAttr)
                
                // add title
                svg_g.append("text").style({"text-anchor": "middle", "font-size": "2em"})
                    .attr({"x": width / 2, "y": -10, "class": "svg-title"})
                    .text("Scatter plot between " + yAttr + " and " + xAttr);
                
                var xLinearScale = d3.scale.linear().range([0, width]),
                    yLinearScale = d3.scale.linear().range([height, 0]),
                    xAxis = d3.svg.axis().scale(xLinearScale).orient("bottom"),
                    yAxis = d3.svg.axis().scale(yLinearScale).orient("left");

                xLinearScale.domain([filteredSortedInstancesStatistics[xAttr]["min"], filteredSortedInstancesStatistics[xAttr]["max"]]);
                yLinearScale.domain([filteredSortedInstancesStatistics[yAttr]["min"], filteredSortedInstancesStatistics[yAttr]["max"]]);	

                // Update...
                var svg_g_circles = svg_g.selectAll("circle").data(filteredSortedInstances);

                // draw axises
                // set axis, give it a class so it can be used to select only xaxis labels  below
                var xAxisG = svg_g.append("g")
                    .attr({"transform": "translate(0," + height + ")", "class": "x axis"});
                var yAxisG = svg_g.append("g").attr({"class": "y axis"});		
                var xAxisLabel = xAxisG.append("text")
                    .style({"text-anchor": "middle", "font-size": "2em"})
                    .attr({"x": width / 2, "y": axisLabelsParas.xAxisLabelOffset}).text(xAttr);
                var yAxisLabel = yAxisG.append("text")
                    .style({"text-anchor": "middle", "font-size": "2em"})
                    .attr("transform", "translate(-" + axisLabelsParas.yAxisLabelOffset + "," + (height / 2) + ") rotate(-90)").text(yAttr);
                // draw axis
                xAxisG.call(xAxis);
                yAxisG.call(yAxis);

                // Enter handles added data only
                svg_g_circles.enter().append("circle")
                    .attr({"fill": function(instance){return "#1f77b4"/*zColorScale(instance[zAttr])*/;}, "fill": "#ffffff", "fill-opacity": 0.6, "stroke": "rgba(31, 119, 180, 0.8)", "stroke-width": "2px", "cx": function(instance){return xLinearScale(instance[xAttr]);}, "cy": function(instance){return yLinearScale(instance[yAttr]);}, "r": 4, "id": function(instance){return "whiteWine" + instance["ID"];}})
                    .on("mouseover", function() {
                    var circle = d3.select(this).attr({"stroke": "rgba(255, 127, 14, 0.8)", "r": 6});
                    var instanceID = parseFloat(circle.attr("id").replace("whiteWine", ""));
                    radarRender("#instanceRadarChart", instances, instancesStatistics, instanceID);
                })
                .on("mouseout", function() {
                    var circle = d3.select(this).attr({"stroke": "rgba(31, 119, 180, 0.8)", "r": 4});
                });

                // Exit…
                svg_g_circles.exit().remove(); 
            }
        }
        
        // when changing attributes, update the scatter chart

        // bind x, y, z-labels change events
        $("#xLabelBtns > button").click(function() {
            var newXAttr =  $(this).attr("title");
            if(newXAttr != axisesParas.xAttr) {
                axisesParas.xAttr = newXAttr;
                $(this).addClass("active").siblings().removeClass("active");
                render(false);
            }
        });
        
        $("#yLabelBtns > button").click(function() {
            var newYAttr = $(this).attr("title");
            if(newYAttr != axisesParas.yAttr) {
                $(this).addClass("active").siblings().removeClass("active");
                
                axisesParas.yAttr = newYAttr;
                render(false);   
            }
        });
        
        // begin change number of bins
        $( "#numberOfBinsSlider" ).slider({
            range: "max",
            min: 5,
            max: 20,
            value: 10,
            slide: function( event, ui ) {
                $( "#numberOfBins" ).html("Number of bins: <strong>" + ui.value + "</strong>");
                
                axisesParas["numberOfBins"] = ui.value;
                // render only when xAttr = yAttr
                if(axisesParas.xAttr == axisesParas.yAttr) {
                    render(true);
                }
            }
        });
        
        $( "#numberOfBins" ).html("Number of bins: <strong>" + $( "#numberOfBinsSlider" ).slider("value") + "</strong>");
        // end change number of bins
        
        
        // begin quality interval control
        $("#qualityIntervalSlider").slider({
            range: true,
            min: instancesStatistics["quality"]["min"],
            max: instancesStatistics["quality"]["max"],
            values: [instancesStatistics["quality"]["min"], instancesStatistics["quality"]["max"]],
            slide: function( event, ui ) {
                $( "#qualityInterval" ).html("Quality: <strong>" + ui.values[0] + "-" + ui.values[1] + "</strong>");
                // TODO
                axisesParas["qualityInterval"] = ui.values;
                render(false);
            }
        });
        
        $("#qualityInterval").html("Quality: <strong>" + $("#qualityIntervalSlider").slider("values", 0) + "-" + $("#qualityIntervalSlider").slider("values", 1) + "</strong>");
        
        // end qualit interval control
        
        
        
        
    }
    
    
    /*
    * draw radar chart
    * @para container, a HTML element that is used to contain radar chart, #instanceRadarChart form.
    * @para instances, a data set.
    * @para instancesStatistics, the statistics of the data set.
    * @para instanceID, the ID of a white wine instance.
    */
	function radarRender(radarContainer, instances, instancesStatistics, instanceID) {
        
        var chart = RadarChart.chart();
        var data = {};
		
        // dat to be rendered
        var instance = instances[instanceID];
        
        var attributes = Object.keys(instance);
        
        var indexOfID = attributes.indexOf("ID");
        if(indexOfID != -1) {
            attributes.splice(indexOfID, 1);
        }
//        var indexOfQuality = attributes.indexOf("quality");
//        if(indexOfQuality != -1) {
//            attributes.splice(indexOfQuality, 1);
//        }
        
        data["axes"] = [];
        
        // avoid attribute overlap
        attributes.sort();
        
        attributes.forEach(function(attr) {
            
            data["axes"].push({
                "axis": [attr],
                "value": instance[attr] / instancesStatistics[attr]["max"],
                "originalValue": instance[attr]
            });
        });
        
        RadarChart.defaultConfig.radius = 5;
        RadarChart.defaultConfig.w = $(radarContainer).find("svg").width();
        RadarChart.defaultConfig.h = $(radarContainer).find("svg").height();
        RadarChart.draw(radarContainer, [data]);
        
        
        // Legend titles
//        var radar_svg = d3.select(radarContainer).select("svg"),
//			svgWidth = parseFloat(radar_svg.style("width").replace("px", "")),
//			svgHeight = parseFloat(radar_svg.style("height").replace("px", ""));
//        radar_svg.append("text")
//            .attr("x", (svgWidth / 2))
//            .attr("y", svgHeight)
//            .attr(    "text-anchor", "middle")
//            .style("font-size", "1.5em")
//            .text(window.instancesName + ' instance ' + (instanceID + 1));
        $("#instanceRadarChartTitle").text(window.instancesName + ' instance ' + (instanceID + 1));
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
        
        // overview render
        compareTopAndBottom("#compareGoodBadWines", window.normalizedSortedInstances, window.instancesStatistics);
        // scatter render
        scatterRender("#scatterPlot", window.instances, window.instancesStatistics, window.sortedInstancesByQuality);
        
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