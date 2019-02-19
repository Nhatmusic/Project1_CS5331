var classesNumber=9,
    cellSize = 20,
    rowLabelMargin=10;

//#########################################################
function heatmap_display(url, heatmapId, paletteName) {

    var tooltip = d3.select(heatmapId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");

    //==================================================
    function zoom() {
    	svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 1]).on("zoom", zoom);

    //==================================================
    var viewerWidth = 60000;
    var viewerHeight = 6000;
    var viewerPosTop = 200;
    var viewerPosLeft = 50;

    var legendElementWidth = cellSize * 2;
    var colors = colorbrewer[paletteName][classesNumber];
    var svg;

    //==================================================
    d3.json(url, function(error, data) {
        var brr = data;
        var predata=Object.values(brr) ;
        var songs=[];
        var rowLabelData=[["C"],["C#"],["D"],["D#"],["E"],["F"],["F#"],["G"],["G#"],["A"],["A#"],["B"]];
        var songname=["Shape_Of_You","Canon","Havanna","Girls_Like_You","Sugar","BiBiBi","Body_Count","Close_To_You","Happier","Lovelies"];
        for (i=0;i<predata.length;i++){
            songs.push(_.unzip(predata[i]))
        }
        console.log(songs)
        var colorScale = d3.scale.quantize()
            .domain([0.0, 1.0])
            .range(colors);

        svg = d3.select(heatmapId).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
	    // .call(zoomListener);

        var maing = svg.selectAll('g').data(songs).enter()
            .append("g")
            .attr("transform", (song,i)=> `translate(${viewerPosLeft},${viewerPosTop+i*500})`);

        svg.append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('stroke', '#3b8019')
            .attr('stroke-width', 1);

        var rowLabels = maing.append("g")
            .attr("class", "rowLabels")
            .selectAll(".rowLabel")
            .data(rowLabelData)
            .enter().append("text")
            .text(function(rowLabel) {
                return rowLabel.count > 1 ? rowLabel.join("/") : rowLabel;
            })
            .attr("x", 0)
            .attr("y", function(rowLabel, i) {
                return (i * cellSize);
            })
            .style("text-anchor", "middle")
            .style("font-size","10px")
            .attr("transform", function(rowLabel, i) {
                return `translate(${rowLabelMargin}, ${cellSize / 1.5})`;
            })
            .attr("class", "rowLabel mono")
            .attr("id", function(rowLabel, i) {
                return "rowLabel_" + i;
            })
            .on('mouseover', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", true);
            })
            .on('mouseout', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", false);
            });


        var rows = maing.selectAll(".row")
            .data(song=>song)
            .enter().append("g")
            .attr("id", function(row) {
                return row.idx;
            })
            .attr("class", "row")
            .attr("transform", (row,i)=> `translate(30,${i*cellSize})`);
        //Build the xAsis
        var xAxisG = maing.append("g").attr("transform", `translate(${cellSize*1.5}, ${250})`);
        var xScale = d3.scale.linear().domain([0,150]).range([0, 3000*cellSize]);
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(150)
        xAxisG.call(xAxis);

         var j;
        // $(document).width();

        var heatmap= rows.selectAll(".cell")
            .data(function(row,ii) {
                console.log(ii)
                j=ii;
                return row;
            })
            .enter().append("rect")
            .attr("x", function(cell, i) {
                return i * cellSize;
            })
            .attr("y", function(cell, i, j) {
                return 0;
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", function(cell, i, j) {
                return "cell bordered cr" + j + " cc" + i;
            })
            .attr("width", cellSize)
            .attr("height", cellSize)
            .style("fill", function(cell) {
                if (cell != null) return colorScale(cell);
                else return "url(#diagonal-stripe-3)";
            })

            .on('mouseover', function(cell, i, ii) {

                if (cell != null) {
                    if (ii>11){
                        ii=ii%12;
                    }
                    console.log(ii)
                    tooltip.html('<div class="heatmap_tooltip">' + rowLabelData[ii] + ":" + cell.toFixed(2) + '</div>');
                    tooltip.style("visibility", "visible");
                } else
                    tooltip.style("visibility", "hidden");
            })
            .on('mouseout', function(cell, i, j) {
                d3.select('#colLabel_' + i).classed("hover", false);
                d3.select('#rowLabel_' + j).classed("hover", false);
                tooltip.style("visibility", "hidden");
            })
            .on("mousemove", function(cell, i) {
                tooltip.style("top", (d3.event.pageY - 55) + "px").style("left", (d3.event.pageX - 60) + "px");
            });

            //

        var legend = maing.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(0,-300)")
            .selectAll(".legendElement")
            .data([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9])
            .enter().append("g")
            .attr("class", "legendElement");

        legend.append("svg:rect")
            .attr("x", function(d, i) {
                return legendElementWidth * i;
            })
            .attr("y", viewerPosTop)
            .attr("class", "cellLegend bordered")
            .attr("width", legendElementWidth)
            .attr("height", cellSize / 2)
            .style("fill", function(d, i) {
                return colors[i];
            });

        legend.append("text")
            .attr("class", "mono legendElement")
            .text(function(d) {
                return "≥" + Math.round(d * 100) / 100;
            })
            .attr("x", function(d, i) {
                return legendElementWidth * i;
            })
            .attr("y", viewerPosTop + cellSize+5);


        // var songLable = maing.append("g")
        //     .attr("class", "song lable")
        //     .attr("transform", "translate(0,0)")
        //     .selectAll(".songname")
        //     .data(songname)
        //     .enter().append("g")
        //     .attr("class", "songname");
        // songLable.append("text")
        //     .attr("class", "mono song")
        //     .text(function(d,i) {
        //         return d[i]
        //     })
        //     .attr("x",0)
        //     .attr("y", viewerPosTop);

        //==================================================
        d3.select("#palette")
            .on("keyup", function() {
		var newPalette = d3.select("#palette").property("value");
		if (newPalette != null)
                	changePalette(newPalette, heatmapId);
            })
            .on("change", function() {
		var newPalette = d3.select("#palette").property("value");
                changePalette(newPalette, heatmapId);
            });
    });

    //==================================================

}

//#########################################################
function changePalette(paletteName, heatmapId) {
    var colors = colorbrewer[paletteName][classesNumber];
    var colorScale = d3.scale.quantize()
        .domain([0.0, 1.0])
        .range(colors);
    var svg = d3.select(heatmapId);
    var t = svg.transition().duration(500);
    t.selectAll(".cell")
        .style("fill", function(d) {
                if (d != null) return colorScale(d);
                else return "url(#diagonalHatch)";
        })
    t.selectAll(".cellLegend")
        .style("fill", function(d, i) {
            return colors[i];
        });
}
