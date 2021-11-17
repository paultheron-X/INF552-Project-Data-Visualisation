const MAP_W = 960;
const MAP_H = 484;

const PROJECTIONS = {
    ER: d3.geoEquirectangular().scale(MAP_H / Math.PI),
    IM: d3.geoInterrupt(d3.geoMollweideRaw,
         [[ // northern hemisphere
           [[-180,   0], [-100,  90], [ -40,   0]],
           [[ -40,   0], [  30,  90], [ 180,   0]]
         ], [ // southern hemisphere
           [[-180,   0], [-160, -90], [-100,   0]],
           [[-100,   0], [ -60, -90], [ -20,   0]],
           [[ -20,   0], [  20, -90], [  80,   0]],
           [[  80,   0], [ 140, -90], [ 180,   0]]
         ]])
         .scale(165)
         .translate([MAP_W / 2, MAP_H / 2])
         .precision(.1),
};

var ctx = {
    currentProj: PROJECTIONS.ER,
    undefinedColor: "#AAA",
    YEAR: "2015",
    panZoomMode: true,
    TRANSITION_DURATION: 3000,
    rivers: [],
    lakes: [],
    countries: [],
};

const getDW = function(countryCode, dw){
    for (var i=0;i<dw.length;i++){
        if (dw[i].Code == countryCode && dw[i].Year == ctx.YEAR){
            return parseFloat(dw[i].ImprovedWaterSourcePC);
        }
    }
    return null;
};

var restructureData = function(countries, rivers, lakes, dw){
    countries.features.forEach(
        function(d){
            d.properties['dw'] = getDW(d.properties.iso_a3, dw);
        }
    );
    ctx.countries = countries;
    ctx.rivers = rivers;
    ctx.lakes = lakes;
};

var makeMap = function(svgEl){
    ctx.mapG = svgEl.append("g")
                    .attr("id", "map")
                    .attr("clip-path", "url(#clip)");
    // bind and draw geographical features to <path> elements
    addCountries();
    fadeWaterIn();
    // panning and zooming
    svgEl.append("rect")
         .attr("id", "pz")
         .attr("width", MAP_W)
         .attr("height", MAP_H)
         .style("fill", "none")
         .style("pointer-events", "all")
         .call(d3.zoom()
                 .scaleExtent([1, 8])
                 .on("zoom", zoomed)
         );
    function zoomed(event, d) {
        if (ctx.panZoomMode){
            ctx.mapG.attr("transform", event.transform);
        }
    }
};

// color scale for drinking water data
var dwScale4color = d3.scaleLinear().domain([0,100]).range([1,0]);

var addCountries = function(){
    var path4proj = d3.geoPath()
                      .projection(ctx.currentProj);
    ctx.mapG.selectAll("path.country")
            .data(ctx.countries.features)
            .enter()
            .append("path")
            .attr("d", path4proj)
            .attr("class", "country")
            .style("fill", function(d){
                if (d.properties.dw){
                    return d3.interpolateOrRd(dwScale4color(d.properties.dw));
                }
                else {
                    return ctx.undefinedColor;
                }
            });
};


var getGlobalView = function(){
    d3.select("#map")
      .transition()
      .duration(ctx.TRANSITION_DURATION)
      .attr("transform", "translate(0,0) scale(1,1)");
};


var animateProjection = function(sourceProj, targetProj){
    var transCount = 0;
    getGlobalView();
    d3.select("svg").selectAll("path").transition()
      .duration(ctx.TRANSITION_DURATION)
      .attrTween("d", projectionTween(sourceProj, targetProj))
      .on("start", function(){transCount++;})
      .on("end", function(d){
          if (--transCount === 0){fadeWaterIn();}
      });
};


var createViz = function(){
    console.log("Using D3 v"+d3.version);
    Object.keys(PROJECTIONS).forEach(function(k) {
        PROJECTIONS[k].rotate([0, 0]).center([0, 0]);
    });
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", MAP_W);
    svgEl.attr("height", MAP_H);
    loadData(svgEl);
};

var loadData = function(svgEl){
    var promises = [d3.json("data/carte_json/a-dep2021.json")];
    
    Promise.all(promises).then(function(data){
        console.log(data[0])
        
    }).catch(function(error){console.log(error)});
};
