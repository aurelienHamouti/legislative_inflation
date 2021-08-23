// set the dimensions and margins of the graph
var margin = {top: 10, right: 450, bottom: 80, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // parse the date / time
  let parseDate = d3.timeParse("%d.%m.%Y");

  var tab_mois=new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre");

// Parse the Data
d3.csv("law_inflation_data.csv").then(function (data) {

  data.forEach(function (d) {
    //filtre des données
    d.dateMonth = tab_mois[parseDate(d.date_de_publication).getMonth()];
  });

  //grouper par date
  let groupes_month = d3.groups(data, d => d.dateMonth);
  //console.log("Groupes par mois",groupes_month);

  //transformation des données en un tableau avec les colonnes (mois de publication, nb cat1, nb cat2 ... cat10)
  newData = []
  for(let i = 0; i < groupes_month.length; i++){
    let cat1 = cat2 = cat3 = cat4 = cat5 = cat6 = cat7 = cat8 = cat9 = cat10 = 0;
    for(let j = 1; j < groupes_month[i].length; j++){
      //console.log("in for : " + groupes_month[i][j])
      for(let k = 0; k < groupes_month[i][j].length; k++){
        //console.log("in deep for : " + (groupes_month[i][j][k]).rs)
        let d = groupes_month[i][j][k];
        if (d.rs < 200){
          cat1 += 1
        }else if(d.rs > 199 && d.rs < 300){
          cat2 += 1
        }else if(d.rs > 299 && d.rs < 400){
          cat3 += 1
        }else if(d.rs > 399 && d.rs < 500){
          cat4 += 1
        }else if(d.rs > 499 && d.rs < 600){
          cat5 += 1
        }else if(d.rs > 599 && d.rs < 700){
          cat6 += 1
        }else if(d.rs > 699 && d.rs < 800){
          cat7 += 1
        }else if(d.rs > 799 && d.rs < 900){
          cat8 += 1
        }else if(d.rs > 899 && d.rs < 1000){
          cat9 += 1
        }else{// catégorie "autres" si aucune catégorie ne correspond ou si RS illisible
          cat10 += 1 
        }
      }
    }
    //var column = [];
    //console.log("push : "+groupes_month[i][0], cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat8, cat10 )
    //column.push(groupes_month[i][0], cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat8, cat10)
    /*var dict = new Object();
    dict = {
      "group": groupes_month[i][0],
      "cat1": cat1,
      "cat1": cat2,
      "cat1": cat3,
      "cat1": cat4,
      "cat1": cat5,
      "cat1": cat6,
      "cat1": cat7,
      "cat1": cat8,
      "cat1": cat9,
      "cat10": cat10
    };*/

    let monthLaw = {
      "group": groupes_month[i][0],
      "cat1": cat1,
      "cat2": cat2,
      "cat3": cat3,
      "cat4": cat4,
      "cat5": cat5,
      "cat6": cat6,
      "cat7": cat7,
      "cat8": cat8,
      "cat9": cat9,
      "cat10": cat10
    }
    //console.log("test : " + column)
    newData.push(monthLaw);
    /*newData[i][0] = groupes_month[i][0];//mois
    newData[i][1] = cat1
    newData[i][2] = cat2
    newData[i][3] = cat3
    newData[i][4] = cat4
    newData[i][5] = cat5
    newData[i][6] = cat6
    newData[i][7] = cat7
    newData[i][8] = cat8
    newData[i][9] = cat9
    newData[i][10] = cat10*/
  }


  //console.log(newData)

  // List of subgroups = header of the csv files = soil condition here
  var subgroups = ["cat1", "cat2", "cat3", "cat4", "cat5", "cat6", "cat7", "cat8", "cat9", "cat10"]

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = tab_mois

  console.log(newData)
  //console.log("subgroups : " + subgroups)
  //console.log("groups : " + groups)

  //export CSV ------------------------------
  var x = "";
  var txt = "mois, État - Peuple - Autorités, Droit privé - Procédure civile - Exécution, Droit pénal - Procédure pénale - Exécution, École - Science - Culture, Défense nationale,Travaux publics - Énergie - Transports et communications, Santé - Travail - Sécurité sociale, Économie - Coopération technique, Autres" + "\n";
  for (x in newData) {
    txt += newData[x].group + "," +  newData[x].cat1 + "," +  newData[x].cat2 + "," +  newData[x].cat3 + "," +  newData[x].cat4 + "," +  newData[x].cat5 + "," +  newData[x].cat6 + "," +  newData[x].cat7 + "," +  newData[x].cat8 + "," +  newData[x].cat9 + "," +  newData[x].cat10 + "\n";
  };
  console.log(txt)
  // -----------------------------------------

  // Add X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 10]) //amélioration -> max de lois trouvées par mois
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8','#4daf4a', '#000066', '#ffff1a', '#1aff1a', '#9900ff', 'green', '#669999', '#0066ff', '#ff8000'])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (newData)

  //console.log("stackedData : " + stackedData)

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.group); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())

  // text label for the y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Nb Lois publiées"); 

  // text label for the x axis
  svg.append("text")             
    .attr("transform","translate(" + (width/2) + " ," + (height + margin.top + 40) + ")")
    .style("text-anchor", "middle")
    .text("Date de publication");

    // legend
    svg.append("circle").attr("cx",780).attr("cy",45).attr("r", 6).style("fill", "#e41a1c")
    svg.append("circle").attr("cx",780).attr("cy",75).attr("r", 6).style("fill", "#377eb8")
    svg.append("circle").attr("cx",780).attr("cy",105).attr("r", 6).style("fill", "#4daf4a")
    svg.append("circle").attr("cx",780).attr("cy",135).attr("r", 6).style("fill", "#000066")
    svg.append("circle").attr("cx",780).attr("cy",165).attr("r", 6).style("fill", "#ffff1a")
    svg.append("circle").attr("cx",780).attr("cy",195).attr("r", 6).style("fill", "#1aff1a")
    svg.append("circle").attr("cx",780).attr("cy",225).attr("r", 6).style("fill", "#9900ff")
    svg.append("circle").attr("cx",780).attr("cy",255).attr("r", 6).style("fill", "#green")
    svg.append("circle").attr("cx",780).attr("cy",285).attr("r", 6).style("fill", "#669999")
  
    svg.append("text").attr("x", 800).attr("y", 20).text("Légende :").style("font-size", "15px").attr("alignment-baseline","middle").attr("text-decoration","underline")
    svg.append("text").attr("x", 800).attr("y", 50).text("État - Peuple - Autorités").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 80).text("Droit privé - Procédure civile - Exécution").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 110).text("Droit pénal - Procédure pénale - Exécution").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 140).text("École - Science - Culture").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 170).text("Défense nationale").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 200).text("Travaux publics - Énergie - Transports et communications").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 230).text("Santé - Travail - Sécurité sociale").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 260).text("Économie - Coopération technique").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 800).attr("y", 290).text("Autres").style("font-size", "15px").attr("alignment-baseline","middle")
})