console.clear();

// dimensions du graphe
// convention d'écriture
let margin = { top: 10, right: 30, bottom: 30, left: 40 };
let width = 960 - margin.left - margin.right;
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
  });

  // group the data for the bars
  let bins = histogram(data);
  console.log(bins);

  // Scale the range of the data in the y domain
  y.domain([0,d3.max(bins, d => d.length)]);

  // append the bar rectangles to the svg element
  svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("class", "bar")
      .attr("x", 1)
      .attr("transform", function (d) {
        return "translate(" + x(d.x0) + "," + y(d.length) + ")";
      })
      .attr("width", function (d) {
        return x(d.x1) - x(d.x0) - 1;
      })
      .attr("height", function (d) {
        return height - y(d.length);
      });

  // add the x Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g").call(d3.axisLeft(y));
});
