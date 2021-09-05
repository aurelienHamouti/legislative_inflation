console.clear();

// dimensions du graphe
// convention d'écriture
let margin = { top: 10, right: 60, bottom: 80, left: 40 };
let width = 1060 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

// parse the date / time
let parseDate = d3.timeParse("%d.%m.%Y");

// définir les échelles
// l'échelle x est complètement définie
// lors de sa déclaration
let x = d3
  .scaleTime()
  // .Domain = Données
  .domain([new Date(2020, 0, 1), new Date(2020, 12, 30)])
  // .Range = Rendu
  .rangeRound([0, width]);

// échelle y partiellement définie
let y = d3
  .scaleLinear()
  // le domaine n'est pas encore ajouté
  .range([height, 0]);

// set the parameters for the histogram
let histogram = d3
  .bin() // !! plus histogram !!
  .value(d => d.date)
  .domain(x.domain())
  .thresholds(x.ticks(d3.timeMonth));

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3
  .select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g") // grouper les éléments
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// get the data
d3.csv("law_inflation_data.csv").then(function (data) {
  // format the data
  data.forEach(function (d) {
    d.date = parseDate(d.date_de_publication);
    let categorie = "catégorie du texte inconnue";
    //rs = str.substr(0, 2)
    if (d.rs < 200){
      categorie = "État - Peuple - Autorités";
    }else if(d.rs > 199 && d.rs < 300){
      categorie = "Droit privé - Procédure civile - Exécution";
    }else if(d.rs > 299 && d.rs < 400){
      categorie = "Droit pénal - Procédure pénale - Exécution";
    }else if(d.rs > 399 && d.rs < 500){
      categorie = "École - Science - Culture";
    }else if(d.rs > 499 && d.rs < 600){
      categorie = "Défense nationale";
    }else if(d.rs > 599 && d.rs < 700){
      categorie = "Finances";
    }else if(d.rs > 699 && d.rs < 800){
      categorie = "Travaux publics - Énergie - Transports et communications";
    }else if(d.rs > 799 && d.rs < 900){
      categorie = "Santé - Travail - Sécurité sociale";
    }else if(d.rs > 899 && d.rs < 1000){
      categorie = "Économie - Coopération technique";
    }
    d.categorie = categorie;
    //console.log("test categorie : " + d.categorie + " RS = " + d.rs)
  });

  // à faire : regroupe par RS (200 > RS < 300 == Droit privé)
  // à faire : créer bars composées d'autres bars colorées  

  // group the data for the bars
  let bins = histogram(data);
  console.log(bins);
  console.log(bins[11]);

  let groupes_categorie = d3.groups(bins[11], d => d.categorie);
  console.log("Groupes par catégorie du RS",groupes_categorie);

  // Scale the range of the data in the y domain
  y.domain([0,d3.max(bins, b => b.length)]);


  
  // append the bar rectangles to the svg element
  svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("class", "bar")
      .attr("x", 1)
      .style("fill", function(d) { return d3.color("steelblue") })
      .attr("transform", function (d) {
        return "translate(" + x(d.x0) + "," + y(d.length) + ")";
      })
      .attr("width", function (d) {
        //console.log("test : " + d.x0 + " x1 : " + d.x1)
        return (x(d.x1) - x(d.x0) - 1)/3;
      })
      .attr("height", function (d) {
        return height - y(d.length);//quantitatif
      })
      
      ;

  // add the x Axis
  /*svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));*/

  // Draw the x axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")  
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,10)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", 20)
    .style("fill", "#69a3b2")

  // add the y Axis
  svg.append("g").call(d3.axisLeft(y));

  // text label for the x axis
  svg.append("text")             
    .attr("transform","translate(" + (width/2) + " ," + (height + margin.top + 60) + ")")
    .style("text-anchor", "middle")
    .text("Date de publication");
        
  // text label for the y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Lois publiées"); 



  
  
});
