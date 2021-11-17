const MAP_W = 960;
const MAP_H = 600;


var ctx = {
    undefinedColor: "#AAA",
    YEAR: "2015",
    panZoomMode: true,
    TRANSITION_DURATION: 3000,
    departements: [],
    mapG: 0,
    datePopulation: [],
    minPop:Infinity,
    maxPop: 0,
    datePIB: [],
    minPIB: Infinity,
    maxPIB: 0,
    minEsperance: Infinity,
    maxEsperance: 0,
    minNatalite: Infinity,
    maxNatalite: 0,
    minAccouchement: Infinity,
    maxAccouchement: 0,
};

/* Utils */
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


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

var createViz = function(){
    console.log("Using D3 v"+d3.version);
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", MAP_W);
    svgEl.attr("height", MAP_H);
    loadData(svgEl);
};

var loadData = function(svgEl){

    var promises = [
        d3.json("data/carte_json/a-dep2021.json"),
        d3.csv("data/donnees_clean/population.csv"),
        d3.csv("data/donnees_clean/pibParHab.csv"),
];
    Promise.all(promises).then(function(data){

        m0 = data[0]["features"].length;
        m1 = data[1].length;
        m2 = data[2].length;
        
        /*POPULATION*/
        /*Getting the dates of the data*/
        for (let i=0;i<Object.keys(data[1][0]).length;i++) {
            if (isNumeric(Object.keys(data[1][0])[i])){
                ctx.datePopulation.push(Object.keys(data[1][0])[i]);
            }
        }

        /*Filling the geojson*/
        for (let i=0; i<m0; i++){
            var found = false;
            for (let j = 0; j<m1; j++){
                if (data[0]["features"][i]["properties"]["dep"] == data[1][j]["Codeinsee"] || (data[0]["features"][i]["properties"]["dep"][0] == '0' && data[0]["features"][i]["properties"]["dep"].substring(1) == data[1][j]["Codeinsee"])) {
                    data[0]["features"][i]["properties"]["population"] = data[1][j];
                    /*Max and min*/
                    for (let k=0; k<ctx.datePopulation.length; k++){
                        if (data[1][j][ctx.datePopulation[k]] < ctx.minPop){
                            ctx.minPop = data[1][j][ctx.datePopulation[k]];
                        };
                        if (data[1][j][ctx.datePopulation[k]] > ctx.maxPop){
                            ctx.maxPop = data[1][j][ctx.datePopulation[k]];
                        }
                    };
                    found = true;
                    break;
                }
            }
            if (! found){
                console.log("Not found population :");
                console.log(data[0]["features"][i]["properties"]);
            }
        };


        /*PIB*/
        /*Getting the dates of the data*/
        for (let i=0;i<Object.keys(data[2][0]).length;i++) {
            if (isNumeric(Object.keys(data[2][0])[i])){
                ctx.datePIB.push(Object.keys(data[2][0])[i]);
            }
        }

        /*Filling the geojson*/
        for (let i=0; i<m0; i++){
            var found = false;
            for (let j = 0; j<m2; j++){
                if (data[0]["features"][i]["properties"]["reg"] == data[2][j]["CodeReg"] || (data[0]["features"][i]["properties"]["reg"][0] == '0' && data[0]["features"][i]["properties"]["reg"].substring(1) == data[2][j]["CodeReg"])) {
                    data[0]["features"][i]["properties"]["pib"] = data[2][j];
                    /*Max and min*/
                    for (let k=0; k<ctx.datePIB.length; k++){
                        if (data[2][j][ctx.datePIB[k]] != 'n.d' && data[2][j][ctx.datePIB[k]] < ctx.minPIB){
                            ctx.minPIB = data[2][j][ctx.datePIB[k]];
                        };
                        if (data[2][j][ctx.datePIB[k]] != 'n.d' && data[2][j][ctx.datePIB[k]] - ctx.maxPIB > 0){
                            ctx.maxPIB = data[2][j][ctx.datePIB[k]];
                        }
                    };
                    found = true;
                    break;
                }
            }
            if (! found){
                console.log("Not found PIB :");
                console.log(data[0]["features"][i]["properties"]);
            }
        };

        console.log(data);
        ctx.departements = data[0];
        makeMap(svgEl);
        
    }).catch(function(error){console.log(error)});

};

var setMap = function(){
    var data4map = document.querySelector('#data4map').value;

    switch (data4map){
        case "population":
            var mycolor = d3.scaleLinear().domain([ctx.minPop,ctx.maxPop]).range(["white","#194D6F"]);
            d3.selectAll(".dpt")
                .transition()
                .duration(2000)
                .style("fill", function(d){
                    if (d["properties"]["pib"]["2015"] == "n.d"){
                        return "grey";
                    }return mycolor(d["properties"]["population"]["2018"])
                });
            break;
        
        
        case "pib":
            var mycolor = d3.scaleLinear().domain([ctx.minPIB,ctx.maxPIB]).range(["white","#194D6F"]);
            d3.selectAll(".dpt")
                .transition()
                .duration(2000)
                .style("fill", function(d){
                    if (d["properties"]["pib"]["2015"] == "n.d"){
                        return "grey";
                    }
                    return mycolor(d["properties"]["pib"]["2015"]);
                });
            break;
    }
}
