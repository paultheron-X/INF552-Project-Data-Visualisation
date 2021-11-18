const MAP_W = 960;
const MAP_H = 600;


var ctx = {
    undefinedColor: "#AAA",
    YEAR: "2015",
    panZoomMode: true,
    animationDuration: 5000,
    departements: [],
    mapG: 0,
    currentlyDisplayed: "population",
    currentDates: [],
    currentYear: 2021,
    dateAvailable: {population: [], pib: [], esperance: [], natalite: [], accouchement: []},
    min: {population: Infinity, pib: Infinity, esperance: Infinity, natalite: Infinity, accouchement: Infinity},
    max: {population: 0, pib: 0, esperance: 0, natalite: 0, accouchement: 0},
};

var animationMap = {
    ongoing: false,
    dates: [],
    delays: [],
    len: 0,
}

var animationLegend = {
    ongoing: false,
    dates: [],
    delays: [],
    len: 0,
}

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
                ctx.dateAvailable["population"].push(Object.keys(data[1][0])[i]);
            }
        }

        /*Filling the geojson*/
        for (let i=0; i<m0; i++){
            var found = false;
            for (let j = 0; j<m1; j++){
                if (data[0]["features"][i]["properties"]["dep"] == data[1][j]["Codeinsee"] || (data[0]["features"][i]["properties"]["dep"][0] == '0' && data[0]["features"][i]["properties"]["dep"].substring(1) == data[1][j]["Codeinsee"])) {
                    data[0]["features"][i]["properties"]["population"] = data[1][j];
                    /*Max and min*/
                    for (let k=0; k<ctx.dateAvailable['population'].length; k++){
                        if (data[1][j][ctx.dateAvailable['population'][k]] < ctx.min['population']){
                            ctx.min['population'] = data[1][j][ctx.dateAvailable['population'][k]];
                        };
                        if (data[1][j][ctx.dateAvailable['population'][k]] > ctx.max['population']){
                            ctx.max['population'] = data[1][j][ctx.dateAvailable['population'][k]];
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
                ctx.dateAvailable['pib'].push(Object.keys(data[2][0])[i]);
            }
        }

        /*Filling the geojson*/
        for (let i=0; i<m0; i++){
            var found = false;
            for (let j = 0; j<m2; j++){
                if (data[0]["features"][i]["properties"]["reg"] == data[2][j]["CodeReg"] || (data[0]["features"][i]["properties"]["reg"][0] == '0' && data[0]["features"][i]["properties"]["reg"].substring(1) == data[2][j]["CodeReg"])) {
                    data[0]["features"][i]["properties"]["pib"] = data[2][j];
                    /*Max and min*/
                    for (let k=0; k<ctx.dateAvailable['pib'].length; k++){
                        if (data[2][j][ctx.dateAvailable['pib'][k]] != 'n.d' && data[2][j][ctx.dateAvailable['pib'][k]] < ctx.min['pib']){
                            ctx.min['pib'] = data[2][j][ctx.dateAvailable['pib'][k]];
                        };
                        if (data[2][j][ctx.dateAvailable['pib'][k]] != 'n.d' && data[2][j][ctx.dateAvailable['pib'][k]] - ctx.max['pib'] > 0){
                            ctx.max['pib'] = data[2][j][ctx.dateAvailable['pib'][k]];
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
        setMapFromHtml(500);
        setYearMenu();
        setMapLegendFromCtx();
        
    }).catch(function(error){console.log(error)});

};



var setMapFromHtml = function(transitionDuration){
    ctx.currentlyDisplayed = document.querySelector('#data4map').value;
    ctx.currentYear = ctx.dateAvailable[ctx.currentlyDisplayed][ctx.dateAvailable[ctx.currentlyDisplayed].length - 1];
    setMapFromCtx(transitionDuration);
}

var setMapFromCtx = function(transitionDuration){
    var mycolor = d3.scaleLinear().domain([ctx.min[ctx.currentlyDisplayed],ctx.max[ctx.currentlyDisplayed]]).range(["white","#194D6F"]);
    d3.selectAll(".dpt")
        .transition("colorationMap")
        .duration(transitionDuration)
        .style("fill", function(d){
            if (d["properties"][ctx.currentlyDisplayed][ctx.currentYear] == "n.d"){
                return "grey";
            }return mycolor(d["properties"][ctx.currentlyDisplayed ][ctx.currentYear])
        });
}

var stopSetMap = function() {
    var mycolor = d3.scaleLinear().domain([ctx.min[ctx.currentlyDisplayed],ctx.max[ctx.currentlyDisplayed]]).range(["white","#194D6F"]);
    d3.selectAll(".dpt")
        .interrupt("colorationMap")
        .style("fill", function(d){
            if (d["properties"][ctx.currentlyDisplayed][ctx.currentYear] == "n.d"){
                return "grey";
            }return mycolor(d["properties"][ctx.currentlyDisplayed ][ctx.currentYear])
        });
}



var setYearMenu = function() {
    d3.selectAll(".yearOption")
        .remove();
    
    d3.select("#selectYear4map")
        .selectAll("option")
        .data(ctx.dateAvailable[ctx.currentlyDisplayed])
        .enter()
        .append('option')
        .attr("value",(d) => d)
        .text((d) => d);
}

var setYear = function(){
    var select = document.getElementById('selectYear4map');
    setYearFromValue(select.options[select.selectedIndex].value);
}

var setYearFromValue = function(value, duration=500) {
    ctx.currentYear = value;
    setMapLegendFromCtx();
    setMap(duration);
}

var setMapLegendFromCtx = function(){
    setMapLegendFromValue(ctx.currentYear);
}

var setMapLegendFromValue = function(value){
    d3.select("#currentYearMap")
        .text("Year currently displayed on the map : " + value);
}

var animer = function(){
    d3.select("#setAnimationBtn")
        .attr("onclick", "stopAnimation();")
        .attr("value","STOP !");
    
        /*Initialisation*/
        ctx.currentYear = ctx.dateAvailable[ctx.currentlyDisplayed][0];
        setMapFromCtx(0);

        /*Configuration of the animationMap object*
        It contains the dates to plot and the delay before each of them*/
        var dates4animation = ctx.dateAvailable[ctx.currentlyDisplayed]
        mDate = dates4animation.length
        animationMap.dates = [];
        animationMap.delays = [];
        animationMap.len = mDate - 1;
        animationMap.ongoing = true;

        range = dates4animation[mDate - 1] - dates4animation[0];

        for (let i=1; i<mDate; i++){
            animationMap.dates.push(dates4animation[i]);
            animationMap.delays.push(ctx.animationDuration*(dates4animation[i] - dates4animation[i-1])/range);
        }

        /*The animation*/
        console.log(animationMap);
        nextStepAnimationMap(0);
} 

var stopAnimation = function(){
    d3.select("#setAnimationBtn")
        .attr("onclick", "animer();")
        .attr("value","Animer >");
    console.log(ctx.currentYear);
    animationMap.ongoing = false;
    stopSetMap();
}

var nextStepAnimationMap = function(index){
    setTimeout(function(){
        if (animationMap.ongoing){
            console.log("Entering");
            ctx.currentYear = animationMap.dates[index];
            setMapFromCtx(animationMap.delays[index]);
            if (index != animationMap.len - 1){
                nextStepAnimationMap(index + 1);
            }
            else{
                animationMap.ongoing = false;
            }
        }
    }, animationMap.delays[index])
}
