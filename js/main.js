
//######################################################
//###################### CONSTANTS #####################
//######################################################


const MAP_W = 700;
const MAP_H = 600;
const SQR_W = 960;
const SQR_H = 600;
const PLT_W = 960;
const PLT_H = 600;


var ctx = {
    reprVar: {population:'Population', pib:'PIB', esperance:'Espérance', accouchement: 'Accouchement', natalite: 'Natalité'},
    YEAR: "2015",
    panZoomMode: true,
    animationDuration: 2000,
    transitionDuration: 300,
    departements: [],
    mapG: 0,
    currentlyDisplayed: "population",
    currentYearMap: 2021,
    minYear: 1970,
    dateAvailable: {population: [], pib: [], esperance: [], natalite: [], accouchement: []},
    min: {population: Infinity, pib: Infinity, esperance: Infinity, natalite: Infinity, accouchement: Infinity},
    max: {population: 0, pib: 0, esperance: 0, natalite: 0, accouchement: 0},
    mycolor: d3.scaleLinear().domain([0,200, 3000000]).range(["red", "white", "blue"]),
    lowColor: "#194D6F",
    highColor: "#F69202",
    midColor: "white",
    ndColor: "grey",
    textColor: 'grey',
    sqr_x: "accouchement",
    sqr_y: "esperance",
    sqr_r: "population",
    sqr_c: "pib",
    currentYearSqr: 2015,
    mindate:0,
    maxdate:Infinity,
    datesAvailableSqr:[],
    animationDurationSqr: 20000,
    toPlt: 84,
    pltColor: {population:'red', pib:'blue', esperance: 'green', accouchement:'orange', natalite: 'purple'},
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

var animationSqr = {
    ongoing: false,
    dates: [],
    delays: [],
    len: 0,
}

var animationLegendSqr = {
    ongoing: false,
    dates: [],
    delays: [],
    len: 0,
}







//######################################################
//##################### CREATE VIZ #####################
//######################################################

var createViz = function(){
    console.log("Using D3 v"+d3.version);
    // MAP
    var svgEl = d3.select("#mapSvgArea").append("svg").attr('id','deptMap')
        .style('margin','50px auto');
    svgEl.attr("width", MAP_W);
    svgEl.attr("height", MAP_H);
    // SQR
    var svgElSqr = d3.select("#sqrSvgArea").append("svg").attr('id','sqrAnim')
        .style('margin','50px auto');
    svgElSqr.attr("width", SQR_W);
    svgElSqr.attr("height", SQR_H);
    // PLT
    var svgElPlt = d3.select("#pltSvgArea").append("svg").attr('id','plt')
        .style('margin','50px auto');
    svgElPlt.attr("width", PLT_W);
    svgElPlt.attr("height", PLT_H);
    // Data
    loadData(svgEl,svgElSqr,svgElPlt);
};










//######################################################
//######################## UTILS #######################
//######################################################

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


var makeMap = function(svgEl){
    ctx.mapG = svgEl.append("g")
                    .attr("id", "map")
                    .attr("clip-path", "url(#clip)");

    addDpt();
};

var round = function(x, d){
    return Math.round(x * Math.pow(10,d))/Math.pow(10,d)
}






//######################################################
//################# EXIT DATA LOADING ##################
//######################################################

var exitDataLoading = function(svgEl, svgElSqr, svgElPlt){
    
    //Making the map
    makeMap(svgEl);
    setMapFromHtml(500);

    //Map Menu
    setYearMenu();
    setYearMenuSqr();
    setMapLegendFromCtx();

    // Map ColorLegend
    createColorLegend(svgEl);
    addTooltip(".dpt");

    // Square
    initSVGcanvas(svgElSqr);
    createColorLegendSqr(svgElSqr);
    createCircleLegendSqr(svgElSqr);

    // Scattered plot
    initSVGcanvasPlt(svgElPlt);
    setPltFromCtx();
}






//######################################################
//################### VISUALIZATION ####################
//######################################################

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

var addCircles = function(){
    d3.selectAll(".sqrDptCirc")
        .remove()

    d3.select("#circG")
        .selectAll('circle')
        .data(ctx.departements.features)
        .enter()
        .append("circle")
        .attr('class', 'sqrDptCirc')
        .attr('cx', (d) => ctx.xScale(d["properties"][ctx.sqr_x][ctx.currentYearSqr]))
        .attr('cy', (d) => ctx.yScale(d["properties"][ctx.sqr_y][ctx.currentYearSqr]))
        .attr('r', (d) => ctx.rScale(d["properties"][ctx.sqr_r][ctx.currentYearSqr]))
        .attr('fill', (d) => ctx.cScale(d["properties"][ctx.sqr_c][ctx.currentYearSqr]))
        .attr("stroke", 'black');

    d3.select("#circG")
        .selectAll('text')
        .data(ctx.departements.features)
        .enter()
        .append('text')
        .attr('class', 'sqrDptText')
        .attr('x', (d) => ctx.xScale(d["properties"][ctx.sqr_x][ctx.currentYearSqr]) + ctx.rScale(d["properties"][ctx.sqr_r][ctx.currentYearSqr]) + 2)
        .attr('y', (d) => ctx.yScale(d["properties"][ctx.sqr_y][ctx.currentYearSqr]) + 4)
        .attr('fill', ctx.textColor)
        .attr('font-size', '12px')
        .text((d) => d["properties"]['dep']);
    
    addTooltip(".sqrDptCirc");
    setSqrLegendFromCtx();
}










//######################################################
//################### DATA LOADING #####################
//######################################################


var loadData = function(svgEl, svgElSqr, svgElPlt){

    var promises = [
        d3.json("data/carte_json/a-dep2021.json"),
        d3.csv("data/donnees_clean/population.csv"),
        d3.csv("data/donnees_clean/pibParHab.csv"),
        d3.csv("data/donnees_clean/esperanceDeVie.csv"),
        d3.csv("data/donnees_clean/ageFemmesAccouchement.csv"),
        d3.csv("data/donnees_clean/tauxNatalite.csv"),
];
    Promise.all(promises).then(function(data){

        m0 = data[0]["features"].length;
        m1 = data[1].length;
        m2 = data[2].length;
        m3 = data[3].length;
        m4 = data[4].length;
        m5 = data[5].length;
        
        /*POPULATION*/
        /*Getting the dates of the data*/
        for (let i=0;i<Object.keys(data[1][0]).length;i++) {
            if (isNumeric(Object.keys(data[1][0])[i]) && isNumeric(data[1][0][Object.keys(data[1][0])[i]]) && Object.keys(data[1][0])[i] >= ctx.minYear){
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
                        if (data[1][j][ctx.dateAvailable['population'][k]] != "" && parseFloat(data[1][j][ctx.dateAvailable['population'][k]]) < parseFloat(ctx.min['population'])){
                            ctx.min['population'] = data[1][j][ctx.dateAvailable['population'][k]];
                        };
                        if (data[1][j][ctx.dateAvailable['population'][k]] != "" &&  parseFloat(data[1][j][ctx.dateAvailable['population'][k]]) > parseFloat(ctx.max['population'])){
                            ctx.max['population'] = data[1][j][ctx.dateAvailable['population'][k]];
                        }
                    };
                    found = true;
                    break;
                }
            }
            if (! found){
                data[0]["features"][i]["properties"]["population"] = {};
                for (let k=0; k<ctx.dateAvailable['population'].length; k++){data[0]["features"][i]["properties"]["population"][ctx.dateAvailable['esperance'][k]] = 'n.d'};
                console.log("Not found population :");
                console.log(data[0]["features"][i]["properties"]);
            }
        };


        /*PIB*/
        /*Getting the dates of the data*/
        for (let i=0;i<Object.keys(data[2][0]).length;i++) {
            if (isNumeric(Object.keys(data[2][0])[i]) && isNumeric(data[2][0][Object.keys(data[2][0])[i]]) && Object.keys(data[2][0])[i] >= ctx.minYear){
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
                        if (data[2][j][ctx.dateAvailable['pib'][k]] != '' && parseFloat(data[2][j][ctx.dateAvailable['pib'][k]]) < parseFloat(ctx.min['pib'])){
                            ctx.min['pib'] = data[2][j][ctx.dateAvailable['pib'][k]];
                        };
                        if (data[2][j][ctx.dateAvailable['pib'][k]] != '' && parseFloat(data[2][j][ctx.dateAvailable['pib'][k]]) > parseFloat(ctx.max['pib'])){
                            ctx.max['pib'] = data[2][j][ctx.dateAvailable['pib'][k]];
                        }
                    };
                    found = true;
                    break;
                }
            }
            if (! found){
                data[0]["features"][i]["properties"]["pib"] = {};
                for (let k=0; k<ctx.dateAvailable['pib'].length; k++){data[0]["features"][i]["properties"]["pib"][ctx.dateAvailable['pib'][k]] = 'n.d'};
                console.log("Not found PIB :");
                console.log(data[0]["features"][i]["properties"]);
            }
        };


        /*ESPERANCE DE VIE*/
        /*Getting the dates of the data*/
        for (let i=0;i<Object.keys(data[3][0]).length;i++) {
            if (isNumeric(Object.keys(data[3][0])[i]) && isNumeric(data[3][0][Object.keys(data[3][0])[i]]) && Object.keys(data[3][0])[i] >= ctx.minYear){
                ctx.dateAvailable['esperance'].push(Object.keys(data[3][0])[i]);
            }
        }

        /*Filling the geojson*/
        for (let i=0; i<m0; i++){
            var found = false;
            for (let j = 0; j<m3; j++){
                if (data[0]["features"][i]["properties"]["dep"] == data[3][j]["CodeDep"] || (data[0]["features"][i]["properties"]["dep"][0] == '0' && data[0]["features"][i]["properties"]["dep"].substring(1) == data[3][j]["CodeDep"])) {
                    data[0]["features"][i]["properties"]["esperance"] = data[3][j];
                    /*Max and min*/
                    for (let k=0; k<ctx.dateAvailable['esperance'].length; k++){
                        if (data[3][j][ctx.dateAvailable['esperance'][k]] != "" && parseFloat(data[3][j][ctx.dateAvailable['esperance'][k]]) < parseFloat(ctx.min['esperance'])){
                            ctx.min['esperance'] = data[3][j][ctx.dateAvailable['esperance'][k]];
                        };
                        if (data[3][j][ctx.dateAvailable['esperance'][k]] != "" &&  parseFloat(data[3][j][ctx.dateAvailable['esperance'][k]]) > parseFloat(ctx.max['esperance'])){
                            ctx.max['esperance'] = data[3][j][ctx.dateAvailable['esperance'][k]];
                        }
                    };
                    found = true;
                    break;
                }
            }
            if (! found){
                data[0]["features"][i]["properties"]["esperance"] = {};
                for (let k=0; k<ctx.dateAvailable['esperance'].length; k++){data[0]["features"][i]["properties"]["esperance"][ctx.dateAvailable['esperance'][k]] = 'n.d'};
                console.log("Not found esperance :");
                console.log(data[0]["features"][i]["properties"]);
            }
        };




        /*ACCOUCHEMENT*/
        /*Getting the dates of the data*/
        for (let i=0;i<Object.keys(data[4][0]).length;i++) {
            if (isNumeric(Object.keys(data[4][0])[i]) && isNumeric(data[4][0][Object.keys(data[4][0])[i]]) && Object.keys(data[4][0])[i] >= ctx.minYear){
                ctx.dateAvailable['accouchement'].push(Object.keys(data[4][0])[i]);
            }
        }

        /*Filling the geojson*/
        for (let i=0; i<m0; i++){
            var found = false;
            for (let j = 0; j<m4; j++){
                if (data[0]["features"][i]["properties"]["dep"] == data[4][j]["CodeDep"] || (data[0]["features"][i]["properties"]["dep"][0] == '0' && data[0]["features"][i]["properties"]["dep"].substring(1) == data[4][j]["CodeDep"])) {
                    data[0]["features"][i]["properties"]["accouchement"] = data[4][j];
                    /*Max and min*/
                    for (let k=0; k<ctx.dateAvailable['accouchement'].length; k++){
                        if (data[4][j][ctx.dateAvailable['accouchement'][k]] != "" && parseFloat(data[4][j][ctx.dateAvailable['accouchement'][k]]) < parseFloat(ctx.min['accouchement'])){
                            ctx.min['accouchement'] = data[4][j][ctx.dateAvailable['accouchement'][k]];
                        };
                        if (data[4][j][ctx.dateAvailable['accouchement'][k]] != "" &&  parseFloat(data[4][j][ctx.dateAvailable['accouchement'][k]]) > parseFloat(ctx.max['accouchement'])){
                            ctx.max['accouchement'] = data[4][j][ctx.dateAvailable['accouchement'][k]];
                        }
                    };
                    found = true;
                    break;
                }
            }
            if (! found){
                data[0]["features"][i]["properties"]["accouchement"] = {};
                for (let k=0; k<ctx.dateAvailable['accouchement'].length; k++){data[0]["features"][i]["properties"]["accouchement"][ctx.dateAvailable['accouchement'][k]] = 'n.d'};
                console.log("Not found accouchement :");
                console.log(data[0]["features"][i]["properties"]);
            }
        };



        /*NATALITE*/
        /*Getting the dates of the data*/
        for (let i=0;i<Object.keys(data[5][0]).length;i++) {
            if (isNumeric(Object.keys(data[5][0])[i]) && isNumeric(data[5][0][Object.keys(data[5][0])[i]]) && Object.keys(data[5][0])[i] >= ctx.minYear){
                ctx.dateAvailable['natalite'].push(Object.keys(data[5][0])[i]);
            }
        }

        /*Filling the geojson*/
        for (let i=0; i<m0; i++){
            var found = false;
            for (let j = 0; j<m5; j++){
                if (data[0]["features"][i]["properties"]["dep"] == data[5][j]["CodeDep"] || (data[0]["features"][i]["properties"]["dep"][0] == '0' && data[0]["features"][i]["properties"]["dep"].substring(1) == data[5][j]["CodeDep"])) {
                    data[0]["features"][i]["properties"]["natalite"] = data[5][j];
                    /*Max and min*/
                    for (let k=0; k<ctx.dateAvailable['natalite'].length; k++){
                        if (data[5][j][ctx.dateAvailable['natalite'][k]] != "" && parseFloat(data[5][j][ctx.dateAvailable['natalite'][k]]) < parseFloat(ctx.min['natalite'])){
                            ctx.min['natalite'] = data[5][j][ctx.dateAvailable['natalite'][k]];
                        };
                        if (data[5][j][ctx.dateAvailable['natalite'][k]] != "" &&  parseFloat(data[5][j][ctx.dateAvailable['natalite'][k]]) > parseFloat(ctx.max['natalite'])){
                            ctx.max['natalite'] = data[5][j][ctx.dateAvailable['natalite'][k]];
                        }
                    };
                    found = true;
                    break;
                }
            }
            if (! found){
                data[0]["features"][i]["properties"]["natalite"] = {};
                for (let k=0; k<ctx.dateAvailable['natalite'].length; k++){data[0]["features"][i]["properties"]["natalite"][ctx.dateAvailable['natalite'][k]] = 'n.d'};
                console.log("Not found natalite :");
                console.log(data[0]["features"][i]["properties"]);
            }
        };


        // Minmax and maxmin
        var vars = ['population', 'pib', 'esperance', 'accouchement', 'natalite'];
        for (let i=0; i<5; i++){
            if (parseInt(ctx.dateAvailable[vars[i]][0]) > ctx.mindate){
                ctx.mindate = parseInt(ctx.dateAvailable[vars[i]][0])
            }
            if (parseInt(ctx.dateAvailable[vars[i]][ctx.dateAvailable[vars[i]].length - 1]) < ctx.maxdate){
                ctx.maxdate = parseInt(ctx.dateAvailable[vars[i]][ctx.dateAvailable[vars[i]].length - 1])
            }
        }
        for (let i=ctx.mindate; i<ctx.maxdate + 1; i++){
            ctx.datesAvailableSqr.push(i.toString());
        }

        // Logs
        console.log(data);
        console.log(ctx);

        //Saving
        ctx.departements = data[0];

        // Exit
        exitDataLoading(svgEl, svgElSqr, svgElPlt);
        
    }).catch(function(error){console.log(error)});

};









//######################################################
//################### COLOR LEGEND #####################
//######################################################


var createColorLegend = function(svgEl){
    var valueRange4legend = d3.range(ctx.min[ctx.currentlyDisplayed],ctx.max[ctx.currentlyDisplayed], (ctx.max[ctx.currentlyDisplayed] - ctx.min[ctx.currentlyDisplayed]) / 300).reverse();
    var scale4colorLegend = d3.scaleLinear().domain([ctx.min[ctx.currentlyDisplayed], ctx.max[ctx.currentlyDisplayed]]).rangeRound([valueRange4legend.length,0]);


    var legendG = svgEl.append("g")
        .attr("id", "colorLegend")
        .attr("opacity", 1)
        .attr("transform", "translate(600,50)");
    
    legendG.selectAll("line")
        .data(valueRange4legend)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d,j) => (j))
        .attr("x2", 10)
        .attr("y2", (d,j) => (j))
        .attr("stroke", (d) => (ctx.mycolor(d)));
    legendG.append("g")
        .attr("transform", `translate(${10+4},0)`)
        .call(d3.axisRight(scale4colorLegend).ticks(5));
    legendG.append("text")
        .attr("x", 0)
        .attr("y", valueRange4legend.length+25)
        .text(ctx.reprVar[ctx.currentlyDisplayed]);
}

var setColorLegend = function() {
    var valueRange4legend = d3.range(ctx.min[ctx.currentlyDisplayed],ctx.max[ctx.currentlyDisplayed], (ctx.max[ctx.currentlyDisplayed] - ctx.min[ctx.currentlyDisplayed]) / 300).reverse();
    var scale4colorLegend = d3.scaleLinear().domain([ctx.min[ctx.currentlyDisplayed], ctx.max[ctx.currentlyDisplayed]]).rangeRound([valueRange4legend.length,0]);

    legendG = d3.select("#colorLegend")
        
    legendG.selectAll("line")
        .remove()

    legendG.selectAll("g")
        .remove()
    
    legendG.selectAll("text")
        .remove()
    
    legendG.selectAll("line")
        .data(valueRange4legend)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d,j) => (j))
        .attr("x2", 10)
        .attr("y2", (d,j) => (j))
        .attr("stroke", (d) => (ctx.mycolor(d)));
    legendG.append("g")
        .attr("transform", `translate(${10+4},0)`)
        .call(d3.axisRight(scale4colorLegend).ticks(5));

    legendG.append("text")
        .attr("x", 0)
        .attr("y", valueRange4legend.length+25)
        .text(ctx.currentlyDisplayed);
    
}









//######################################################
//###################### SET MAP #######################
//######################################################


var setMapFromHtml = function(){
    ctx.currentlyDisplayed = document.querySelector('#data4map').value;
    ctx.currentYearMap = ctx.dateAvailable[ctx.currentlyDisplayed][ctx.dateAvailable[ctx.currentlyDisplayed].length - 1];
    setMapFromCtx(ctx.transitionDuration);
    setMapLegendFromCtx();
}

var setMapFromCtx = function(transitionDuration){
    ctx.mycolor = d3.scaleLinear().domain([parseFloat(ctx.min[ctx.currentlyDisplayed]), (parseFloat(ctx.min[ctx.currentlyDisplayed]) + parseFloat(ctx.max[ctx.currentlyDisplayed])) / 2, parseFloat(ctx.max[ctx.currentlyDisplayed])]).range([ctx.lowColor, ctx.midColor, ctx.highColor]);
    d3.selectAll(".dpt")
        .transition("colorationMap")
        .duration(transitionDuration)
        .style("fill", function(d){
            if (d["properties"][ctx.currentlyDisplayed][ctx.currentYearMap] == "n.d" || d["properties"][ctx.currentlyDisplayed][ctx.currentYearMap] == ""){
                return ctx.ndColor;
            }
            else{
                return ctx.mycolor(d["properties"][ctx.currentlyDisplayed ][ctx.currentYearMap])
            }
        });

    setYearMenu();
    setTooltip(".dpt");
    setColorLegend();
}

var stopSetMap = function() {
    ctx.mycolor = d3.scaleLinear().domain([parseFloat(ctx.min[ctx.currentlyDisplayed]), (parseFloat(ctx.min[ctx.currentlyDisplayed]) + parseFloat(ctx.max[ctx.currentlyDisplayed])) / 2, parseFloat(ctx.max[ctx.currentlyDisplayed])]).range([ctx.lowColor, ctx.midColor, ctx.highColor]);
    d3.selectAll(".dpt")
        .interrupt("colorationMap")
        .style("fill", function(d){
            if (d["properties"][ctx.currentlyDisplayed][ctx.currentYearMap] == "n.d" || d["properties"][ctx.currentlyDisplayed][ctx.currentYearMap] == ""){
                return ctx.ndColor;
            }return ctx.mycolor(d["properties"][ctx.currentlyDisplayed ][ctx.currentYearMap])
        });
    
    setTooltip(".dpt");
    setYearMenu();
    setColorLegend();
}








//######################################################
//#################### TOOLTIPS ########################
//######################################################

var addTooltip = function(targetedClass){
    d3.selectAll(targetedClass)
        .append('title')
        .text(function(d){
            var tooltip = d["properties"]['libgeo'];
            tooltip = tooltip + "\n" + ctx.reprVar["population"] + " : " + round(d["properties"]["population"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["pib"] + " : " + round(d["properties"]["pib"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["esperance"] + " : " + round(d["properties"]["esperance"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["accouchement"] + " : " + round(d["properties"]["accouchement"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["natalite"] + " : " + round(d["properties"]["natalite"][ctx.currentYearSqr], 2);
            return tooltip
        });
}

var setTooltip = function(targetedClass){
    d3.selectAll(targetedClass)
        .select('title')
        .text(function(d){
            var tooltip = d["properties"]['libgeo'];
            tooltip = tooltip + "\n" + ctx.reprVar["population"] + " : " + round(d["properties"]["population"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["pib"] + " : " + round(d["properties"]["pib"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["esperance"] + " : " + round(d["properties"]["esperance"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["accouchement"] + " : " + round(d["properties"]["accouchement"][ctx.currentYearSqr], 2);
            tooltip = tooltip + "\n" + ctx.reprVar["natalite"] + " : " + round(d["properties"]["natalite"][ctx.currentYearSqr], 2);
            return tooltip
        });
}







//######################################################
//##################### MAP MENU #######################
//######################################################

var setYearMenu = function() {
    d3.select("#selectYear4map")
        .selectAll("option")
        .remove();
    
    d3.select("#selectYear4map")
        .selectAll("option")
        .data(ctx.dateAvailable[ctx.currentlyDisplayed])
        .enter()
        .append('option')
        .attr("class","yearOption")
        .attr("value",(d) => d)
        .text((d) => d);
}

var setYearMap = function(){
    var select = document.getElementById('selectYear4map');
    setYearFromValue(select.options[select.selectedIndex].value);
}

var setYearFromValue = function(value) {
    ctx.currentYearMap = value;
    setMapLegendFromCtx();
    setMapFromCtx(ctx.transitionDuration);
}

var setMapLegendFromCtx = function(){
    setMapLegendFromValue(ctx.currentYearMap);
}

var setMapLegendFromValue = function(value){
    d3.select("#currentYearMap")
        .text("Années représentée sur le graphique : " + value);
    d3.select("#selectYear4map")
        .property('value', value);
}














//######################################################
//##################### SQR MENU #######################
//######################################################

var setYearMenuSqr = function() {
    d3.select("#selectYear4sqr")
        .selectAll("option")
        .remove();
    
    d3.select("#selectYear4sqr")
        .selectAll("option")
        .data(ctx.datesAvailableSqr)
        .enter()
        .append('option')
        .attr("class","yearOptionSqr")
        .attr("value",(d) => d)
        .text((d) => d);
}

var setYearSqr = function(){
    var select = document.getElementById('selectYear4sqr');
    setYearFromValueSqr(select.options[select.selectedIndex].value);
}

var setYearFromValueSqr = function(value) {
    ctx.currentYearSqr = value;
    setSqrLegendFromCtx();
    setSqrFromCtx(ctx.transitionDuration);
}

var setSqrLegendFromCtx = function(){
    setSqrLegendFromValue(ctx.currentYearSqr);
}

var setSqrLegendFromValue = function(value){
    d3.select("#currentYearSqr")
        .text("Année représentée sur le graphique : " + value);
    d3.select("#selectYear4sqr")
        .property('value', value);
}












//######################################################
//################## MAP ANIMATION #####################
//######################################################

var animerMap = function(){
    d3.select("#setAnimationBtn")
        .attr("onclick", "stopAnimationMap();")
        .attr("value","STOP !");
    
    stopAnimationSqr();
    
    /*Initialisation*/
    ctx.currentYearMap = ctx.dateAvailable[ctx.currentlyDisplayed][0];
    setMapFromCtx(0);
    setMapLegendFromCtx();

    /*Configuration of the animationMap object*
    It contains the dates to plot and the delay before each of them*/
    var dates4animation = ctx.dateAvailable[ctx.currentlyDisplayed]
    mDate = dates4animation.length
    range = dates4animation[mDate - 1] - dates4animation[0];

    animationMap.dates = []; animationLegend.dates = [];
    animationMap.delays = []; animationLegend.delays = [];
    animationMap.len = mDate - 1; animationLegend.len = range;
    animationMap.ongoing = true; animationLegend.ongoing = true;

    for (let i=1; i<mDate; i++){
        animationMap.dates.push(dates4animation[i]);
        animationMap.delays.push(ctx.animationDuration*(dates4animation[i] - dates4animation[i-1])/range);
    }

    for (let i=1;i<range+1; i++){
        animationLegend.dates.push(parseInt(dates4animation[0]) + i);
        animationLegend.delays.push(ctx.animationDuration/range);
    }

    /*The animation*/
    nextStepAnimationMap(0);
    nextStepAnimationLegend(0);
} 

var stopAnimationMap = function(){
    d3.select("#setAnimationBtn")
        .attr("onclick", "animerMap();")
        .attr("value","Animer >");
    setMapLegendFromCtx();
    animationMap.ongoing = false;
    animationLegend.ongoing = false;
    stopSetMap();
}

var nextStepAnimationMap = function(index){
    setTimeout(function(){
        if (animationMap.ongoing){
            ctx.currentYearMap = animationMap.dates[index];
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

var nextStepAnimationLegend = function(index){
    setTimeout(function(){
        if (animationLegend.ongoing){
            setMapLegendFromValue(animationLegend.dates[index]);
            if (index != animationLegend.len - 1){
                nextStepAnimationLegend(index + 1);
            }
            else{
                animationLegend.ongoing = false;
            }
        }
    }, animationLegend.delays[index])
}










//######################################################
//################### SQR CANVA ########################
//######################################################

var initSVGcanvas = function(svgElSqr){

    // a SVG group for background elements (axes, labels)
    svgElSqr.append("g").attr("id", "bkgG");

    // a SVG group for circles
    svgElSqr.append("g").attr("id", "circG");

    // scale for x-axis
    ctx.xScale = d3.scaleLinear().domain([parseFloat(ctx.min[ctx.sqr_x]), parseFloat(ctx.max[ctx.sqr_x])])
                                 .range([80, SQR_W-100]);
    // scale for y-axis
    ctx.yScale = d3.scaleLinear().domain([parseFloat(ctx.min[ctx.sqr_y]), parseFloat(ctx.max[ctx.sqr_y])])
                                 .range([SQR_H-60, 20]);

    // scale for r-axis
    ctx.rScale = d3.scaleLinear().domain([parseFloat(ctx.min[ctx.sqr_r]), parseFloat(ctx.max[ctx.sqr_r])])
                                 .range([3, 20]);

    // color scale to encode year of discovery
    ctx.cScale = d3.scaleLinear()
                        .domain([parseFloat(ctx.min[ctx.sqr_c]), (parseFloat(ctx.min[ctx.sqr_c]) + parseFloat(ctx.max[ctx.sqr_c])) / 2, parseFloat(ctx.max[ctx.sqr_c])])
                        .range([ctx.lowColor, ctx.midColor, ctx.highColor]);
    
    // x- and y- axes
    d3.select("#bkgG").append("g")
      .attr("transform", `translate(0,${SQR_H-50})`)
      .call(d3.axisBottom(ctx.xScale).ticks(10))
      .selectAll("text")
      .style("text-anchor", "middle");
    d3.select("#bkgG").append("g")
      .attr("transform", "translate(70,0)")
      .call(d3.axisLeft(ctx.yScale).ticks(10))
      .selectAll("text")
      .style("text-anchor", "end");
    // x-axis label
    d3.select("#bkgG")
      .append("text")
      .attr("y", SQR_H - 12)
      .attr("x", SQR_W/2)
      .classed("axisLb", true)
      .text(ctx.reprVar[ctx.sqr_x]);
    // y-axis label
    d3.select("#bkgG")
      .append("text")
      .attr("y", 0)
      .attr("x", 0)
      .attr("transform", `rotate(-90) translate(-${SQR_H/2},18)`)
      .classed("axisLb", true)
      .text(ctx.reprVar[ctx.sqr_y]);
    
    addCircles();
}


//######################################################
//###################### SET SQR #######################
//######################################################

var setSqrFromCtx = function(movingCirclesDuration){
    d3.select("#circG")
        .selectAll('circle')
        .transition("movingCircles")
        .duration(movingCirclesDuration)
        .attr('class', 'sqrDptCirc')
        .attr('cx', (d) => ctx.xScale(d["properties"][ctx.sqr_x][ctx.currentYearSqr]))
        .attr('cy', (d) => ctx.yScale(d["properties"][ctx.sqr_y][ctx.currentYearSqr]))
        .attr('r', (d) => ctx.rScale(d["properties"][ctx.sqr_r][ctx.currentYearSqr]))
        .attr('fill', (d) => ctx.cScale(d["properties"][ctx.sqr_c][ctx.currentYearSqr]))
        .attr("stroke", 'black');

    d3.select("#circG")
        .selectAll('text')
        .transition("movingCircles")
        .duration(movingCirclesDuration)
        .attr('class', 'sqrDptText')
        .attr('x', (d) => ctx.xScale(d["properties"][ctx.sqr_x][ctx.currentYearSqr]) + ctx.rScale(d["properties"][ctx.sqr_r][ctx.currentYearSqr]) + 2)
        .attr('y', (d) => ctx.yScale(d["properties"][ctx.sqr_y][ctx.currentYearSqr]) + 4);
    
    setTooltip(".sqrDptCirc");
};

var setSqrFromHtml = function(){
    ctx.currentYearMap = ctx.dateAvailable[ctx.currentlyDisplayed][ctx.dateAvailable[ctx.currentlyDisplayed].length - 1];
    setMapFromCtx(ctx.transitionDuration);
    setMapLegendFromCtx();
}

var stopSetSqr = function() {
    
    d3.select("#circG")
        .selectAll('circle')
        .interrupt("movingCircles")
        .attr('class', 'sqrDptCirc')
        .attr('cx', (d) => ctx.xScale(d["properties"][ctx.sqr_x][ctx.currentYearSqr]))
        .attr('cy', (d) => ctx.yScale(d["properties"][ctx.sqr_y][ctx.currentYearSqr]))
        .attr('r', (d) => ctx.rScale(d["properties"][ctx.sqr_r][ctx.currentYearSqr]))
        .attr('fill', (d) => ctx.cScale(d["properties"][ctx.sqr_c][ctx.currentYearSqr]))
        .attr("stroke", 'black');
    
    setTooltip(".sqrDptCirc");
}








//######################################################
//################## SQR ANIMATION #####################
//######################################################

var animerSqr = function(){
    d3.select("#setAnimationSqrBtn")
        .attr("onclick", "stopAnimationSqr();")
        .attr("value","STOP !");
    
    stopAnimationMap();

    /*Initialisation*/
    ctx.currentYearSqr = ctx.dateAvailable[ctx.currentlyDisplayed][0];
    setSqrFromCtx(0);
    setSqrLegendFromCtx();

    /*Configuration of the animationMap object*
    It contains the dates to plot and the delay before each of them*/
    var dates4animation = ctx.datesAvailableSqr
    mDate = dates4animation.length
    range = dates4animation[mDate - 1] - dates4animation[0];

    animationSqr.dates = []; animationLegendSqr.dates = [];
    animationSqr.delays = []; animationLegendSqr.delays = [];
    animationSqr.len = mDate - 1; animationLegendSqr.len = range;
    animationSqr.ongoing = true; animationLegendSqr.ongoing = true;

    for (let i=1; i<mDate; i++){
        animationSqr.dates.push(dates4animation[i]);
        animationSqr.delays.push(ctx.animationDurationSqr*(dates4animation[i] - dates4animation[i-1])/range);
    }

    for (let i=1;i<range+1; i++){
        animationLegendSqr.dates.push(parseInt(dates4animation[0]) + i);
        animationLegendSqr.delays.push(ctx.animationDurationSqr/range);
    }

    /*The animation*/
    nextStepAnimationSqr(0);
    nextStepAnimationLegendSqr(0);
} 

var stopAnimationSqr = function(){
    d3.select("#setAnimationSqrBtn")
        .attr("onclick", "animerSqr();")
        .attr("value","Animer >");
    setSqrLegendFromCtx();
    animationSqr.ongoing = false;
    animationLegendSqr.ongoing = false;
    stopSetSqr();
}

var nextStepAnimationSqr = function(index){
    setTimeout(function(){
        if (animationSqr.ongoing){
            ctx.currentYearSqr = animationSqr.dates[index];
            setSqrFromCtx(animationSqr.delays[index]);
            if (index != animationSqr.len - 1){
                nextStepAnimationSqr(index + 1);
            }
            else{
                animationSqr.ongoing = false;
            }
        }
    }, 0.8*animationSqr.delays[index])
}

var nextStepAnimationLegendSqr = function(index){
    setTimeout(function(){
        if (animationLegendSqr.ongoing){
            setSqrLegendFromValue(animationLegendSqr.dates[index]);
            if (index != animationLegendSqr.len - 1){
                nextStepAnimationLegendSqr(index + 1);
            }
            else{
                animationLegendSqr.ongoing = false;
            }
        }
    }, 0.8*animationLegendSqr.delays[index])
}








//######################################################
//#################### LEGEND SQR ######################
//######################################################


var createColorLegendSqr = function(svgElSqr){
    var valueRange4legend = d3.range(ctx.min[ctx.sqr_c],ctx.max[ctx.sqr_c], (ctx.max[ctx.sqr_c] - ctx.min[ctx.sqr_c]) / 300).reverse();
    var scale4colorLegend = d3.scaleLinear().domain([ctx.min[ctx.sqr_c], ctx.max[ctx.sqr_c]]).rangeRound([valueRange4legend.length,0]);

    var legendG = svgElSqr.append("g")
        .attr("id", "colorLegendSqr")
        .attr("opacity", 1)
        .attr("transform", "translate("+ (SQR_W - 80).toString() +",0)");
    
    legendG.selectAll("line")
        .data(valueRange4legend)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d,j) => (j))
        .attr("x2", 10)
        .attr("y2", (d,j) => (j))
        .attr("stroke", (d) => (ctx.cScale(d)));
    legendG.append("g")
        .attr("transform", `translate(${10+4},0)`)
        .call(d3.axisRight(scale4colorLegend).ticks(5));
    legendG.append("text")
        .attr("x", 0)
        .attr("y", valueRange4legend.length+25)
        .text(ctx.reprVar[ctx.sqr_c]);
}


var createCircleLegendSqr = function(svgElSqr){
    var legendG = svgElSqr.append("g")
        .attr("id", "circleLegendSqr")
        .attr("opacity", 1);

    legendG.append("circle")
        .attr("class","circleLegendItem")
        .attr('r', ctx.rScale(ctx.max[ctx.sqr_r]))
        .attr('cx', SQR_W - 70)
        .attr('cy', 380)
        .attr("fill","white")
        .attr("stroke","black");
    
    legendG.append("text")
        .attr("class","circleLegendItem")
        .attr('x', SQR_W - 45)
        .attr('y', 384)
        .attr('fill','black')
        .attr('font-size', '12px')
        .text(round(ctx.max[ctx.sqr_r], -3));
    
    legendG.append("circle")
        .attr("class","circleLegendItem")
        .attr('r', (ctx.rScale(ctx.min[ctx.sqr_r]) + ctx.rScale(ctx.max[ctx.sqr_r])) / 2)
        .attr('cx', SQR_W - 70)
        .attr('cy', 420)
        .attr("fill","white")
        .attr("stroke","black");

    legendG.append("text")
        .attr("class","circleLegendItem")
        .attr('x', SQR_W - 45)
        .attr('y', 424)
        .attr('fill','black')
        .attr('font-size', '12px')
        .text(round((parseFloat(ctx.min[ctx.sqr_r]) + parseFloat(ctx.max[ctx.sqr_r])) / 2.0, -3));
    
    legendG.append("circle")
        .attr("class","circleLegendItem")
        .attr('r', ctx.rScale(ctx.min[ctx.sqr_r]))
        .attr('cx', SQR_W - 70)
        .attr('cy', 460)
        .attr("fill","white")
        .attr("stroke","black");
    
    legendG.append("text")
        .attr("class","circleLegendItem")
        .attr('x', SQR_W - 45)
        .attr('y', 464)
        .attr('fill','black')
        .attr('font-size', '12px')
        .text(round(ctx.min[ctx.sqr_r], -3));
    
    legendG.append("text")
        .attr("class","circleLegendItem")
        .attr('x', SQR_W - 80)
        .attr('y', 504)
        .text(ctx.reprVar[ctx.sqr_r]);
}











//######################################################
//################## SCATTERED PLOT ####################
//######################################################

var getBounds4plt = function(variable) {
    min_ = Infinity;
    max_ = 0;
    var properties = ctx.departements.features[ctx.toPlt]['properties'][variable];
    m = ctx.dateAvailable[variable].length;

    for (let i = parseInt(ctx.dateAvailable[variable][0]); i< parseInt(ctx.dateAvailable[variable][m-1]) + 1; i++){
        if (parseFloat(properties[i]) < min_){
            min_ = parseFloat(properties[i]);
        }
        if (parseFloat(properties[i]) > max_){
            max_ = parseFloat(properties[i]);
        }
    }

    // return [0.98*min_, 1.02*max_];
    return [0.98*ctx.min[variable], 1.02*ctx.max[variable]];
}


var initSVGcanvasPlt = function(svgElPlt){

    // a SVG group for background elements (axes, labels)
    svgElPlt.append("g").attr("id", "bkgGPlt");

    // a SVG group for points
    svgElPlt.append("g").attr("id", "pointsGPlt");

    // scale for x-axis
    ctx.xScalePlt = d3.scaleLinear().domain([ctx.minYear, 2021])
                                .range([175, PLT_W-120]);
    
    
    // y-sclae
    ctx.yScalePlt = {};
    // scale 1 for y-axis
    ctx.yScalePlt['population'] = d3.scaleLinear().domain(getBounds4plt('population'))
                                 .range([PLT_H-100, 20]);
    
    // scale 2 for y-axis
    ctx.yScalePlt['pib'] = d3.scaleLinear().domain(getBounds4plt('pib'))
                                 .range([PLT_H-100, 20]);
                    
    // scale 3 for y-axis
    ctx.yScalePlt['esperance'] = d3.scaleLinear().domain(getBounds4plt('esperance'))
                                 .range([PLT_H-100, 20]);
                    
    // scale 4 for y-axis
    ctx.yScalePlt['accouchement'] = d3.scaleLinear().domain(getBounds4plt('accouchement'))
                                 .range([PLT_H-100, 20]);

    // scale 5 for y-axis
    ctx.yScalePlt['natalite'] = d3.scaleLinear().domain(getBounds4plt('natalite'))
                                 .range([PLT_H-100, 20]);

    
    // x-axis
    d3.select("#bkgGPlt").append("g")
      .attr("transform", `translate(0,${PLT_H-80})`)
      .call(d3.axisBottom(ctx.xScalePlt).ticks(10))
      .selectAll("text")
      .style("text-anchor", "middle");
    // x-axis label
    d3.select("#bkgGPlt")
      .append("text")
      .attr("y", PLT_H - 12)
      .attr("x", PLT_W/2)
      .classed("axisLb", true)
      .text("Années");

    // y-axis 1
    d3.select("#bkgGPlt").append("g")
      .attr("transform", "translate(55,0)")
      .call(d3.axisLeft(ctx.yScalePlt['population']).ticks(10))
      .selectAll("text")
      .style("text-anchor", "end");
    d3.select("#bkgGPlt")
        .append("text")
        .attr("x", -330)
        .attr('y', 400)
        .attr("transform", `rotate(-45) translate(0,0)`)
        .attr("font-size","13px")
        .style("fill", ctx.pltColor['population'])
        .style("text-anchor", "end")
        .classed("axisLb", true)
        .text("Population");

    // y-axis 2
    d3.select("#bkgGPlt").append("g")
      .attr("transform", "translate(110,0)")
      .call(d3.axisLeft(ctx.yScalePlt['pib']).ticks(10))
      .selectAll("text")
      .style("text-anchor", "end");
    d3.select("#bkgGPlt")
      .append("text")
      .attr("x", -291)
      .attr('y', 439)
      .attr("transform", `rotate(-45) translate(0,0)`)
      .attr("font-size","13px")
      .style("fill", ctx.pltColor['pib'])
      .style("text-anchor", "end")
      .classed("axisLb", true)
      .text("PIB");

    // y-axis 3
    d3.select("#bkgGPlt").append("g")
      .attr("transform", "translate(165,0)")
      .call(d3.axisLeft(ctx.yScalePlt['esperance']).ticks(10))
      .selectAll("text")
      .style("text-anchor", "end");
    d3.select("#bkgGPlt")
      .append("text")
      .attr("x", -252)
      .attr('y', 478)
      .attr("transform", `rotate(-45) translate(0,0)`)
      .attr("font-size","13px")
      .style("fill", ctx.pltColor['esperance'])
      .style("text-anchor", "end")
      .classed("axisLb", true)
      .text("Espérance");
    // y-axis 4
    d3.select("#bkgGPlt").append("g")
      .attr("transform", `translate(${PLT_W-110},0)`)
      .call(d3.axisRight(ctx.yScalePlt['accouchement']).ticks(10))
      .selectAll("text")
      .style("text-anchor", "start");
    d3.select("#bkgGPlt")
      .append("text")
      .attr("x", 965)
      .attr('y', -235)
      .attr("transform", `rotate(45) translate(0,0)`)
      .attr("font-size","13px")
      .style("fill", ctx.pltColor['accouchement'])
      .style("text-anchor", "start")
      .classed("axisLb", true)
      .text("Accouchement");
    // y-axis 5
    d3.select("#bkgGPlt").append("g")
    .attr("transform", `translate(${PLT_W-55},0)`)
    .call(d3.axisRight(ctx.yScalePlt['natalite']).ticks(10))
    .selectAll("text")
    .style("text-anchor", "start");
    d3.select("#bkgGPlt")
      .append("text")
      .attr("x", 1004)
      .attr('y', -274)
      .attr("transform", `rotate(45) translate(0,0)`)
      .attr("font-size","13px")
      .style("fill", ctx.pltColor['natalite'])
      .style("text-anchor", "start")
      .classed("axisLb", true)
      .text("Natalité");


    // options
    d3.select("#dep4plt")
        .selectAll('option')
        .remove()
    for (let i=0; i<ctx.departements["features"].length; i++){
        d3.select('#dep4plt')
            .append('option')
            .attr('class', 'depOption')
            .attr('value', i.toString())
            .text(ctx.departements["features"][i]['properties']['dep'] + ' : ' + ctx.departements["features"][i]['properties']['libgeo'])
    }
    d3.select('#dep4plt')
        .property('value', ctx.toPlt);
}















//######################################################
//##################### SET PLOT #######################
//######################################################

var setPltFromHtml = function(){
    ctx.toPlt = document.querySelector('#dep4plt').value;
    setPltFromCtx();
}

var setPltFromCtx = function(){
    //remove old
    d3.select('#pointsGPlt')
        .selectAll('circle')
        .remove();
    
    d3.select('#pointsGPlt')
        .selectAll('line')
        .remove();

    var mVariables = 5;
    var variables = ['population', 'pib', 'esperance', 'accouchement', 'natalite'];

    for (let i=0; i<mVariables; i++){
        var current = variables[i];
        mCurrent = ctx.dateAvailable[current].length;
        firstYear = parseInt(ctx.dateAvailable[current][0])

        var haveToDrawALine = false;

        for (let year=firstYear; year<firstYear + mCurrent; year++){
            var d = ctx.departements['features'][ctx.toPlt]['properties'][current][year];
            if (d != '' && d != 'n.d'){
                d3.select('#pointsGPlt')
                    .append('circle')
                    .attr('r',3)
                    .attr('cx', ctx.xScalePlt(year))
                    .attr('cy', ctx.yScalePlt[current](d))
                    .attr('fill', ctx.pltColor[current])
                    .append('title')
                    .text(year.toString() + '\n' + ctx.reprVar[current] + ' : ' + d);

                //draw the line
                if (haveToDrawALine){
                    var d_old = ctx.departements['features'][ctx.toPlt]['properties'][current][year - 1]
                    d3.select('#pointsGPlt')
                        .append('line')
                        .attr('x1', ctx.xScalePlt(year - 1))
                        .attr('x2', ctx.xScalePlt(year))
                        .attr('y1', ctx.yScalePlt[current](d_old))
                        .attr('y2', ctx.yScalePlt[current](d))
                        .style('stroke', ctx.pltColor[current])
                }

                // update haveToDrawALine
                haveToDrawALine = true;
            }
        }
    }
}