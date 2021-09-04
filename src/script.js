// Variables et constantes ---------------------------------------------------------
//----------------------------------------------------------------------------------

var width = 1600, // Largeur de la zone de travail
    height = 900, // Hauteur de la zone de travail
    padding = 3, // Espace de séparation entre les noeuds de même couleur
    clusterPadding = 10, // Espace de séparation entre les différents noeuds de couleur
    delayTransition = 3, // Délai d'apparition des cercles
    lstCategoriesRS = [],
    hauteurLegende = 300,
    maxRadiusCircles = document.getElementById("sizeCircles").value / 100,
    rsLevelSelected = 1
    rsCategorieSelected = null
    charge = -3,
    gravity = 0.02;

// Gestion des dates -----------------------------------------------------
// -----------------------------------------------------------------------

// Parse de la date au format jj.mm.yyyy
var parseDate = d3.time.format("%d.%m.%Y").parse;

const tab_mois=new Array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");

var dateMaxDefault = new Date(document.getElementById("anneeAfficheesMax").value);
var dateMinDefault = new Date(document.getElementById("anneeAfficheesMin").value);
var anneeMax = dateMaxDefault.getFullYear();
var anneeMin = dateMinDefault.getFullYear();
dateMinDefault = anneeMin
dateMaxDefault = anneeMax

document.getElementById("affichageAnneeSelectionnee").innerHTML = 'Lois publiées au RO de ' + anneeMin + ' à 2020';
document.getElementById("selectAnnee").value = anneeMin;

document.getElementById("chChangeGraph").checked = true;

// Lancement du graph ----------------------------------------------------------------------
//-------------------------------------------------------------------------------------------


loadGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsLevelSelected, rsCategorieSelected)// Appel de la fonction qui va charger les données et construire le graphique

function loadGraph(maxRadius, dateMinSelected, dateMaxSelected, rsLevelSelected, rsCategorieSelected){
  dateMinSelected -= 1

  // Importation des données -------------------------------------------------------
  //--------------------------------------------------------------------------------

  d3.csv("../data/law_inflation_data_2010-2020.csv", function(data) {
    console.log("data import law");// Affiche les données au format brut dans la console du navigateur
    console.log(data);// Affiche les données au format brut dans la console du navigateur

    //Filtrer et transformer les données
    d3.csv("../data/table_categories_rs.csv", function(corespondanceTable) {
      console.log("data import categories law")// Affiche les données au format brut dans la console du navigateur
      console.log(corespondanceTable)// Affiche les données au format brut dans la console du navigateur

      data.forEach(function (d) {//filtre des données
        d.dateMonth = tab_mois[parseDate(d.date_de_publication).getMonth()];//transformer date en groupe (mois ou années)
        
        //let date = parseDate(d.date_de_publication)// Extraction de la plus petite et de la plus grande années (afin de construire automatiquement la légende)
        // if(date < dateMinSelected){dateMinSelected = date}// Calcul des dates max et min des données à disposition
        // if(date > dateMaxSelected){dateMaxSelected = date}
        
        let categorieRS_level_1 = "Catégorie inconnue"
        lstCategoriesRS = []

        corespondanceTable.forEach(function (d_table) {// Ajout des catégories et des sous catégories du RS à l'aide de la table de correspondance
          if(d.rs.substr(0,1) == d_table.numero_RS){
            d.categorieRS_level_1_nb = parseInt(d_table.numero_RS);
            d.categorieRS_level_1_description = d_table.description_loi;   
          }else if(d.rs.substr(0,2) == d_table.numero_RS){
            d.categorieRS_level_2_nb = parseInt(d_table.numero_RS);
            d.categorieRS_level_2_description = d_table.description_loi;
          }else if(d.rs.substr(0,3) == d_table.numero_RS){
            d.categorieRS_level_3_nb = parseInt(d_table.numero_RS);
            d.categorieRS_level_3_description = d_table.description_loi;
          }

          if(rsCategorieSelected == null){// level 1
            fillRSTable()
          }else if(rsCategorieSelected == d_table.numero_RS[0]){// level 2
            fillRSTable()
          }else if (rsCategorieSelected == d_table.numero_RS.substr(0, 2)){// level 3
            fillRSTable()
          }

          function fillRSTable(){
            if(d_table.numero_RS.length == rsLevelSelected && !lstCategoriesRS.some(e => e.num_rs === parseInt(d_table.numero_RS))){
              lstCategoriesRS.push({
                  "num_rs" : parseInt(d_table.numero_RS),
                  "description_categorie_rs" : d_table.description_loi
              }) 
            }
          }
        });
      });

      console.log(lstCategoriesRS)// Affiche les données au format brut dans la console du navigateur
      console.log("Data with RS categories : ")// Affiche les données avec les catégories dans la console du navigateur
      console.log(data)// Affiche les données avec les catégories dans la console du navigateur

      /*var nbCategoriesRS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      // color palette = one color per subgroup
      var color = d3.scale.ordinal()
        .domain(lstCategoriesRS)
        .range(['pink', '#e41a1c','orange','#4daf4a', '#000066', '#ffff1a', '#1aff1a', '#9900ff', '#green', '#669999', 'black', ' #339cff'])
        //dans l'ordre -> cat1, cat2, cat3, cat4, cat5 etc..
      */

      console.log("Catégorie RS de niveau 1")
      console.log(lstCategoriesRS)  
      var color = d3.scale.category10()
    
      // Transformation des données et génération des clusters contenant les cercles -------------------------------------------
      //------------------------------------------------------------------------------------------------------------------------

      // The largest node for each cluster.
      var clusters = new Array();

      nodes = new Array();

      let i = 0;
      data.forEach(function (d) {

        //rsLevelSelected, rsCategorieSelected
        if(rsLevelSelected == 1){
          let ch =  document.getElementById("rs"+d.categorieRS_level_1_nb)
          if(ch == null){// Cas de figure où la page est chargée pour la 1ère fois, sans catégorie sélectionnée
             if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected){// Uniquement les occurences de d qui sont conformes aux dates min et max sélectionnées
               addNodesToList(d.categorieRS_level_1_nb);
            }
          }else{
            if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && ch.checked == true){
              addNodesToList(d.categorieRS_level_1_nb);
            }
          }
        }else if(rsLevelSelected == 2){
          let ch =  document.getElementById("rs"+d.categorieRS_level_2_nb)
          if(ch == null){
             if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && d.categorieRS_level_1_nb == rsCategorieSelected){
              addNodesToList(d.categorieRS_level_2_nb)
            }
          }else{
            if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && ch.checked == true && d.categorieRS_level_1_nb == rsCategorieSelected){
              addNodesToList(d.categorieRS_level_2_nb);
            }
          }
        }else if(rsLevelSelected == 3){
          console.log("niveau 3 du RS")
          let ch =  document.getElementById("rs"+d.categorieRS_level_3_nb)
          if(ch == null){
             if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && d.categorieRS_level_2_nb == rsCategorieSelected){
              addNodesToList(d.categorieRS_level_3_nb)
            }
          }else{
            if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && ch.checked == true && d.categorieRS_level_2_nb == rsCategorieSelected){
              addNodesToList(d.categorieRS_level_3_nb);
            }
          }
        }    

        function addNodesToList(cluster){
          r = d.nb_pages * maxRadius;//pour chaque loi extraire nombre de page -> radius
          d = {
            cluster: cluster, 
            radius: r,
            nb_pages: d.nb_pages,
            date_du_vote : d.date_du_vote,
            date_de_publication : d.date_de_publication,
            nom_de_la_loi : d.nom_de_la_loi
          };
          let clusterAlreadyPresent = false  
          clusters.forEach(function (c){
            if(c.cluster == d.cluster){
              if(c.radius < d.radius){
                clusters.splice(clusters.indexOf(c), 1)
                clusters.push(d)
              }
              clusterAlreadyPresent = true
            }
          })
          if(clusters.length < 1){//ajouter le cluster à la liste des clusters
            clusters.push(d)
          }
          if(!clusterAlreadyPresent){clusters.push(d)}
          nodes.push(d);//ajouter le noeud (cercle) à la liste des clusters
        }
      });

      console.log("liste des clusters :")
      console.log(clusters)

      console.log("liste des noeuds (cercles) :")
      console.log(nodes)

      // Paramétrage des champs de forces, positionnement des cercles par rapport aux autres -------------------------------
      //--------------------------------------------------------------------------------------------------------------------

      // Use the pack layout to initialize node positions.
      d3.layout.pack()
          .sort(null)
          .size([width, height])
          .children(function(d) {return d.values; })
          .value(function(d) {return d.radius * d.radius; })
          .nodes({values: d3.nest()
            .key(function(d) {return d.cluster; })
            .entries(nodes)});

      var force = d3.layout.force()
          .nodes(nodes)
          .size([width, height])
          .gravity(gravity)
          .charge(charge)
          .on("tick", tick)
          .start();

      var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);

      var node = svg.selectAll("circle")
          .data(nodes);

      // Gestion des événements internes au SVG ------------------------------------------------------------------------
      // -----------------------------------------------------------------------------------------------

      function mouseover(p){

          if(svg.selectAll(".text_law_selected_label").text != null){
            svg.selectAll(".text_law_selected_label").remove()
          }

          if(svg.selectAll(".rect_law_selected_label") != null){
            svg.selectAll(".rect_law_selected_label").remove()  
          }

          if(svg.selectAll(".law_label") != null){
            svg.selectAll(".law_label").remove()  
          }

          var law_label_node = svg.selectAll(".law_label")// Ajout du label de description d'une loi sélectionnée
          .data(nodes)
          .enter().append("g")
          .attr("class", "law_label")
          .call(force.drag);

          law_label_node.append("rect")
          .attr("class", "rect_law_selected_label")
          .attr("x", "5%")
          .attr("y", "25%")
          .attr("width", 450)
          .attr("height", 150)
          .attr('stroke', 'black')
          .attr("stroke-opacity", 0)
          .attr("fill-opacity", "0")// Opacité à 0 afin de cacher le rectangle
          .attr('fill', '#e7eb90');

          svg.selectAll(".rect_law_selected_label")
            .attr("fill-opacity", "100")
            .attr("stroke-opacity", 100);
    
          // Ajout des labels textuels d'une loi sélectionnée -----------

          /*law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "1.8em")
            .attr("dy", "8.8em")
            .attr("font-weight", 1000)
            .style("text-decoration", "underline")
            //.style("font-family", "Saira")
            //.style("opacity", 100)
            .style('fill', '#1f5e78')
            .style("font-size", "18px")
            .text("Informations sur la loi sélectionnée");*/

         
          let nom_loi = p.nom_de_la_loi

          //document.getElementById("test").innerHTML = nom_loi

          law_label_node.append("text")
          .attr("class", "text_law_selected_label")
          .attr("dx", "5.5%")
          .attr("dy", "28%")
          .style("opacity", 100)
          .style("font-size", "14px")
          .text("Titre : " + nom_loi);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "5.5%")
            .attr("dy", "31.5%")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Date de publication : " + p.date_de_publication);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "5.5%")
            .attr("dy", "34.5%")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Date du vote  : " + p.date_du_vote);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "5.5%")
            .attr("dy", "37.5%")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Nombre de pages : " + p.nb_pages);
            
      }

      function mouseout(p){// La souris quitte un cercle, on réinitialise le label
        if(!isClicked) {
          //console.log("on quitt le cercle")
          svg.selectAll(".rect_law_selected_label")
            .attr("fill-opacity", "0")
            .attr("stroke-opacity", 0);
          svg.selectAll(".text_law_selected_label").remove()
          svg.selectAll(".text_law_selected_label").text("")
    
        }
      }
      
      function click(p){
          isClicked = !isClicked;
          d3.select("svg").remove();
          document.getElementById("rsCategories").innerHTML = '';
          maxRadiusCircles = 2.1;
          clusterPadding = 3;
          charge = -3;
          gravity = 0.02;
          loadGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsLevelSelected+1, p.cluster)
      }
      var isClicked = false;

      //----------------------------------------------------

      var circleEnter = node.enter()
          .append("circle")
          .call(d3.behavior.zoom().on("zoom", function () {
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
          }))
          .on("mouseover", mouseover)
          .on("mouseout", mouseout)
          .on("click", click)
          .style("fill", function(d) {
            //if (d.cluster == 4){console.log(color(d.cluster))}
            return color(d.cluster);
          })
          .call(force.drag);

      node.transition()
          .duration(750)
          .delay(function(d, i) { return i * delayTransition; })
          .attrTween("r", function(d) {
            var i = d3.interpolate(0, d.radius);
            return function(t) { return d.radius = i(t); };
          });

      function tick(e) {
        node
            .each(cluster(10 * e.alpha * e.alpha))
            .each(collide(.5))
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }

      // Fonctions de calculs des champs de forces et des collisions -----------------------------------------------------
      //------------------------------------------------------------------------------------------------------------------

      // Move d to be adjacent to the cluster node.
      function cluster(alpha) {
        return function(d) {

          var cluster     
          clusters.forEach(function(c){
            //console.log(c.cluster + " == " + d.cluster)
            if(c.cluster == d.cluster){ cluster = c}
          })

          if (cluster === d) return;
          var x = d.x - cluster.x,
              y = d.y - cluster.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + cluster.radius;
          if (l != r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            cluster.x += x;
            cluster.y += y;
          }
        };
      }

      // Resolves collisions between d and all other circles.
      function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function(d) {
          var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        };
      }

      // Ajout des légendes ----------------------------------------------------------------------------------------------
      //------------------------------------------------------------------------------------------------------------------

      //svg.append("text").attr("x", 450).attr("y", 60).text("Lois publiées entre le "+dateMinSelected.getDate() + " " +tab_mois[dateMinSelected.getMonth()]+" "+dateMinSelected.getFullYear()+" et le "+dateMaxSelected.getDate() + " " +tab_mois[dateMaxSelected.getMonth()]+" "+dateMaxSelected.getFullYear()+" par catégorie du RS").style("font-size", "20px").attr("alignment-baseline","middle").attr("text-decoration","underline").attr("font-weight", 1000)
      svg.append("text").attr("x", 1180).attr("y", hauteurLegende -10).text("Légende :").style("font-size", "20px").attr("alignment-baseline","middle")

      let haut = hauteurLegende

      lstCategoriesRS.forEach(function (d) {// Ajout de la légende selon données des catégories RS + code couleur
        haut += 30
        var categorie = d.num_rs
        svg.append("text")
          .attr("x", 1180).attr("y", haut)
          .text(d.description_categorie_rs)
          .style("font-size", "15px").attr("alignment-baseline","middle")
          .attr("value", categorie)
          .on("click", function(){
            selectedCategorie(rsLevelSelected, categorie)
          });
          //.attr("onclick", "selectedCategorie(rsLevelSelected, value)");

        svg.append("circle").attr("cx",1140).attr("cy",haut-5).attr("r", 6).style("fill", color(d.num_rs))
        
        // Checkbox des catégories ---------------------------------------------
        let ch = document.getElementById("rs"+d.num_rs)
        if(ch == null){
          d3.select("body").selectAll("#rsCategories")
          .append("input")
            .style("position", "absolute")
            .style("left", 1620 + "px").style("top", haut + 1 + "px")
            .attr("class", "rsCheckboxes")
            .attr("id", "rs"+d.num_rs)
            .attr("value", d.num_rs)
            .attr("checked", true)
            .attr("type", "checkbox")
            .attr("onClick", "changeRsCategories(checked, value)");
        }
      });
    });
  });
}

// Gestion des événements externes -----------------------------------------------------
// ---------------------------------------------------------------------------

function changeSizeCircles(maxRadius){
  //document.location.reload();
  d3.select("svg").remove();
  loadGraph(maxRadius/100, dateMinDefault, dateMaxDefault, rsLevelSelected, rsCategorieSelected)
}

/*function changeMaxDate(maxDate){
  d3.select("svg").remove();
  loadGraph(maxRadiusCircles, dateMinDefault, new Date(maxDate), rsLevelSelected, rsCategorieSelected)
}*/

/*function changeMinDate(minDate){
  d3.select("svg").remove();
  loadGraph(maxRadiusCircles, new Date(minDate), dateMaxDefault, rsLevelSelected, rsCategorieSelected)
}*/

function changeRsCategories(isChecked, rsCategorie){
  d3.select("svg").remove();
  loadGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsLevelSelected, rsCategorieSelected)
}

function selectedCategorie(rsLevelSelected, categorie){
  d3.select("svg").remove();
  document.getElementById("rsCategories").innerHTML = '';
  loadGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsLevelSelected+1, categorie)
}

function changeAnnee(anneeMin){
  document.getElementById("affichageAnneeSelectionnee").innerHTML = 'Lois publiées au RO de ' + anneeMin + ' à 2020';
  d3.select("svg").remove();
  document.getElementById("rsCategories").innerHTML = '';
  //console.log("année max : " + anneeMax)
  //console.log("année anneeMin : " + anneeMin)
  loadGraph(maxRadiusCircles, anneeMin, anneeMax, rsLevelSelected, rsCategorieSelected)
}

function changeGraph(checked, value) {
  d3.select("svg").remove();
  document.getElementById("rsCategories").innerHTML = '';
  if(checked == false){
    document.getElementById("affichageAnneeSelectionnee").style.display = "none";
    document.getElementById("selectAnnee").style.display = "none";
    LoadlineChart()
  }else{
    document.getElementById("affichageAnneeSelectionnee").style.display = "inline";
    document.getElementById("selectAnnee").style.display = "inline";
    loadGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsLevelSelected, rsCategorieSelected)
  }
  
}

function LoadlineChart(){
  //var parseDate = d3.time.format("%m/%d/%Y").parse;

  var margin = {left: 50, right: 20, top: 200, bottom: 50 };
  
  var width = 1500 - margin.left - margin.right;
  var height = 650 - margin.top - margin.bottom;
  
  var max = 0;
  
  var xNudge = 50;
  var yNudge = 20;
  
  var minDate = new Date();
  var maxDate = new Date();

  var parseDate = d3.time.format("%d.%m.%Y").parse;
  
  
  d3.csv("../data/law_inflation_data_2010-2020.csv")
  
      .row(function(d) { return { date: parseDate(d.date_de_publication), pages: Number(d.nb_pages)}; })
      .get(function(error, rows) { 

        //var collection_array = d3.values(rows);

        
        
        max = d3.max(rows, function(d) { return d.pages; });
        minDate = d3.min(rows, function(d) {return d.date; });
        maxDate = d3.max(rows, function(d) { return d.date; });		

        console.log("test " + minDate)

        let data = new Array();

        let years = new Array();
        for (let i = minDate.getFullYear(); i <= maxDate.getFullYear(); i++) {
          years.push(i)
        }
        console.log(years)
        
        years.forEach(function (y){
          let sum = 0
          rows.forEach(function (d){
            if(y == d.date.getFullYear()){sum += d.pages}
            
          })
          data.push({date:new Date(y, 1, 1), pages:sum})
        })
        console.log(data)

        max = d3.max(data, function(d) { return d.pages; });
        minDate = new Date(2010, 1, 1);

        console.log("test 2 " + minDate)
        maxDate = new Date(2020, 12, 31);
        

        /*
            result = rows.reduce(function (r, a) {
            r[a.date] = r[a.date] || [];
            r[a.date].push(a);
           return r;
        }, Object.create(null));

        console.log(result);*/
  
        console.log("data for line chart")
        console.log(rows)
  
      var y = d3.scale.linear()
            .domain([0,max])
            .range([height,0]);
      
      var x = d3.time.scale()
            .domain([minDate,maxDate])
            .range([0,width]);
      
      var yAxis = d3.svg.axis()
              .orient("left")
              .scale(y);
              
      var xAxis = d3.svg.axis()
              .orient("bottom")
              .scale(x);
      
      var line = d3.svg.line()
        .x(function(d){ return x(d.date); })
        .y(function(d){ return y(d.pages); })
        .interpolate("cardinal");
      
      var svg = d3.select("body").append("svg")
        .attr("id","svg")
        .style("top", "25%")
        .style("left", "5%")
        .style("position", "absolute")
        .attr("height","100%")
        .attr("width","100%");

      var chartGroup = svg.append("g").attr("class","chartGroup").attr("transform","translate("+xNudge+","+yNudge+")");
    
      chartGroup.append("path")
        .attr("class","line")
        .attr("d",function(d){ return line(data); })		
      
      chartGroup.append("g")
        .attr("class","axis x")
        .attr("transform","translate(0,"+height+")")
        .call(xAxis)
        .append("text")
          .attr("transform", "rotate(0)")
          .attr("y", 50)
          .attr("dy", ".71em")
          .attr("x", 1420)
          .attr("dx", ".71em")
          .style("text-anchor", "end")
          .attr("font-weight", 700)
          .text("Temps");
        
      chartGroup.append("g")
        .attr("class","axis y")
        .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 12)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .attr("font-weight", 700)
          .style("opacity", 1)
          .text("Nombre de pages publiées au RO");
      
    });
}