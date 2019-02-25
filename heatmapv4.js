var classesNumber = 9,
    cellSize = 20,
    viewerWidth = 30000,
    viewerHeight = 5000,
    viewerPosTop = 200,
    viewerPosLeft = 50,
    viewerPosBot = 300,
    rowLabelMargin=10,
    legendElementWidth = cellSize * 2;

// main function
function main (url, heatmapId, paletteName) {
// create tooltip
    var tooltip = d3.select(heatmapId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");
    var colors = colorbrewer[paletteName][classesNumber];
    var svg;

    //Get the data from json file
    d3.json(url, function(error, data) {
        var load_data = data;
        var predata=Object.values(load_data) ;
        var songs=[];
        var rowLabelData=[["C"],["C#"],["D"],["D#"],["E"],["F"],["F#"],["G"],["G#"],["A"],["A#"],["B"]];
        var songname=["Shape_Of_You","Canon","Havanna","Girls_Like_You","Sugar","BiBiBi","Body_Count","Close_To_You","Happier","Lovelies"];
        //process the data, transform the data to a matrix of 12 row x n column (n is the length of song) corresponding to 12 semitones
        for (i=0;i<predata.length;i++){
            songs.push(_.unzip(predata[i]))
        }
        //create color scale to display the feature
        var colorScale = d3.scaleQuantize()
            .domain([0.0, 1.0])
            .range(colors);

        svg = d3.select(heatmapId).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)



        // create svg for group of songs
        var maing = svg.selectAll('g').data(songs).enter()
            .append("g")
            .attr("transform", (song,i)=> `translate(${viewerPosLeft},${viewerPosTop+i*viewerHeight/10})`)
            .attr("id", function (d,i){return "song"+ i})

        //create row label
        var rowLabels = maing.append("g")
            .attr("class", "rowLabels")
            .selectAll(".rowLabel")
            .data(rowLabelData)
            .enter().append("text")
            .text(function(rowLabel) {
                return rowLabel
            })
            .attr("x", 0)
            .attr("y", function(rowLabel, i) {
                return (i * cellSize);
            })
            .style("text-anchor", "middle")
            .style("font-size","12px")
            .attr("transform", function(rowLabel, i) {
                return `translate(${rowLabelMargin}, ${cellSize/2.5})`;
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
            .attr("class", "row")
            .attr("transform", (row,i)=> `translate(30,${i*cellSize})`);
        //Build the xAsis
        var xAxisG = maing.append("g").attr("transform", `translate(${cellSize*1.5}, ${250})`);
        var xScale = d3.scaleLinear().domain([0,d3.max(songs.map(song=>song[0].length))/cellSize]).range([0, cellSize*d3.max(songs.map(song=>song[0].length))]);
        var xAxis = d3.axisBottom(xScale).ticks(400);
        xAxisG.call(xAxis);

        // Time label for the x axis
        maing.append("text")
            .attr("transform",
                "translate(" + cellSize*3.5 + " ," +
                (viewerPosBot) + ")")
            .style("text-anchor", "middle")
            .text("Time(second)");

        // Song name label for each graph
        maing.append("text")
            .attr("transform",
                "translate(" + viewerPosLeft/2 + " ," +
                -(120) + ")")
            .attr("font-family", "sans-serif")
            .text(function(d,i){return "Song: " + songname[i]});


        var j;
        debugger
        var heatmap= rows.selectAll(".cell")
            .data(function(row,rownumber) {
                j=rownumber;
                return row.map(d=>{return {label:rowLabelData[rownumber%12], value: d}});
            })
            .enter().append("rect")
            .attr("x", function(cell, i) {
                return i * cellSize/2;
            })
            .attr("y", 0)
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("class", function(cell, i) {
                return "cell bordered cr" + i;
            })
            .attr("width", cellSize/2)
            .attr("height", cellSize/2)
            .style("fill", function(cell) {
                if (cell != null) return colorScale(cell.value);
                else return "url(#diagonal-stripe-3)";
            })

            .on('mouseover', function(cell, i) {
                if (cell != null) {
                        i=i%12;


                    tooltip.html('<div class="heatmap_tooltip">' + cell.label + ":" + cell.value.toFixed(2) + '</div>');
                    tooltip.style("visibility", "visible");
                } else
                    tooltip.style("visibility", "hidden");
            })
            .on('mouseout', function(cell,i) {
                d3.select(this).classed("hover", false);
                tooltip.style("visibility", "hidden");
            })
            .on("mousemove", function(cell, i) {
                tooltip.style("top", (d3.event.pageY - 55) + "px").style("left", (d3.event.pageX - 60) + "px");
            });

        //create legend bar to show the level of each chroma feature in color. Domain of chroma  [0,1]
        var legend = maing.append("g")
            .attr("class", "legend")
            .attr("transform",
                "translate(" + cellSize*1.5 + " ," +
                (-viewerPosBot) + ")")
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
            .attr("y", viewerPosTop + cellSize);

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
        //Display or Hidden selected Song
        d3.select('#song')
            .on("click", function () {
                var sect = document.getElementById("song");
                var section = sect.options[sect.selectedIndex].id;
                // d3.selectAll("#"+section).attr("visibility", "hidden");
                // Determine if current line is visible
                var active   = song.active ? false : true,
                    newOpacity = active ? "hidden" : "visible";
                // Hide or show the elements
                d3.selectAll("#" + section).attr("visibility", newOpacity);

                // Update whether or not the elements are active
                song.active = active;
            })

    });


}

//Change color palette
function changePalette(paletteName, heatmapId) {
    var colors = colorbrewer[paletteName][classesNumber];
    var colorScale = d3.scaleQuantize()
        .domain([0.0, 1.0])
        .range(colors);
    var svg = d3.select(heatmapId);
    var color_change = svg.transition().duration(500);
    color_change.selectAll(".cell")
        .style("fill", function(cell) {
                if (cell.value != null) return colorScale(cell.value);
                else return "url(#diagonalHatch)";
        })
    color_change.selectAll(".cellLegend")
        .style("fill", function(cell,i) {
            return colors[i%10];
        });
}
