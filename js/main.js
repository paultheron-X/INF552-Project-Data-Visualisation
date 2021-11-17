const MAP_W = 960;
const MAP_H = 600;


var ctx = {
    undefinedColor: "#AAA",
    YEAR: "2015",
    panZoomMode: true,
    TRANSITION_DURATION: 3000,
    departements: [],
    mapG: 0,
};


var makeMap = function(svgEl){
    ctx.mapG = svgEl.append("g")
                    .attr("id", "map")
                    .attr("clip-path", "url(#clip)");

    addDpt();
};

// color scale for drinking water data
var dwScale4color = d3.scaleLinear().domain([0,100]).range([1,0]);

var addDpt = function(){
    var projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(3000)
    .translate([300,300]);

    var path4proj = d3.geoPath()
                      .projection(projection);

    d3.select("g#map")
        .selectAll("path .dpt")
        .data(ctx.departements.features)
        .enter()
        .append("path")
        .attr("d", path4proj)
        .attr("class", "dpt")
        .style("stroke","#DDD")
        .style("fill","white")
        .style("stroke-width", 1.3);

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
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", MAP_W);
    svgEl.attr("height", MAP_H);
    loadData(svgEl);
};

var loadData = function(svgEl){

    var promises = [d3.json("data/carte_json/a-dep2021.json")];
    Promise.all(promises).then(function(data){
        console.log(data[0]);
        ctx.departements = data[0];
        makeMap(svgEl);
        
    }).catch(function(error){console.log(error)});

};
