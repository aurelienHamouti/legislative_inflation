/* -----------------------------------------------------------------------------
  Projet : 
    This project is part of the Data Visualization course taught by Mr. Isaac Pante at the University of Lausanne 
    during the spring 2021 semester. 
    - Course Git : https://github.com/ipante/ressources_visualisation_de_donnees
    - projet Git : https://github.com/aurelienHamouti/legislative_inflation
  Date : September 2021
  Autors : 
    Aurélien Hamouti (developer): development and programming of the main code and integration to GitHub.
    Catherine Döbeli and David Pressouyre (lawyers): creation, enrichment and update of the databases and development assistance.
  Licence : Copyright@ All rights reserved
  References : 
    https://bl.ocks.org/mbostock/7882658
    https://bl.ocks.org/emmasaunders/f55caf3a742aac10a5d44f58374bf343
-------------------------------------------------------------------------------*/
let maxRadiusCircles = document.getElementById("sizeCircles").value / 100,
    lstCategoriesRS = [],
    rsLevelSelected = 1
    rsCategorieSelected = null,
    charge = -3,
    gravity = 0.02,
    clusterPadding = 10, // Espace de séparation entre les différents noeuds de couleur
    width = 1600, // Largeur de la zone de travail
    height = 900, // Hauteur de la zone de travail
    padding = 3, // Espace de séparation entre les noeuds de même couleur
    delayTransition = 3, // Délai d'apparition des cercles
    dateAnneeMax = new Date(document.getElementById("anneeAfficheesMax").value).getFullYear(),
    dateAnneeMin = new Date(document.getElementById("anneeAfficheesMin").value).getFullYear();

const 
      dateMaxDefault = dateAnneeMax,
      dateMinDefault = dateAnneeMin,
      parseDate = d3.time.format("%d.%m.%Y").parse,
      tab_mois = new Array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");

document.getElementById("affichageAnneeSelectionnee").innerHTML = 'Lois publiées de ' + dateAnneeMin + ' à 2020';
document.getElementById("selectAnnee").value = dateAnneeMin;
document.getElementById("chChangeGraph").checked = true;

function initializeParameters(){
  charge = -3; gravity = 0.02; maxRadiusCircles = document.getElementById("sizeCircles").value / 100;
  clusterPadding = 10; // Espace de séparation entre les différents noeuds de couleur
  width = 1600; // Largeur de la zone de travail
  height = 900; // Hauteur de la zone de travail
  padding = 3; // Espace de séparation entre les noeuds de même couleur
  delayTransition = 3; // Délai d'apparition des cercles
}

// Gestion des événements -----------------------------------------------------
// ---------------------------------------------------------------------------
function changeSizeCircles(maxRadius){
  //document.location.reload();
  d3.select("svg").remove();
  loadAgregateGraph(maxRadius/100, dateMinDefault, dateMaxDefault, rsLevelSelected, rsCategorieSelected)
}

function changeRsCategories(){
  d3.select("svg").remove();
  dateAnneeMin = new Date(document.getElementById("selectAnnee").value).getFullYear();
  loadAgregateGraph(maxRadiusCircles, dateAnneeMin, dateMaxDefault, rsLevelSelected, rsCategorieSelected)
}

function selectedCategorie(rsLevelSelected, categorie){
  d3.select("svg").remove();
  document.getElementById("rsCategories").innerHTML = '';

  anneeMin = document.getElementById("selectAnnee").value;

  if(rsLevelSelected < 3){
    maxRadiusCircles = 1.5;
    clusterPadding = 3;
    charge = -3;
    gravity = 0.02;
    loadAgregateGraph(maxRadiusCircles, anneeMin, dateMaxDefault, rsLevelSelected+1, categorie)
  }else{
    document.location.reload();
  }
  dateAnneeMin = new Date(document.getElementById("selectAnnee").value).getFullYear();
}

function changeAnnee(anneeMin){
  document.getElementById("affichageAnneeSelectionnee").innerHTML = 'Lois publiées de : ' + anneeMin + ' à 2020';
  document.getElementById("selectAnnee").value = anneeMin;
  d3.select("svg").remove();
  initializeParameters();
  loadAgregateGraph(maxRadiusCircles, anneeMin, dateAnneeMax, rsLevelSelected, rsCategorieSelected)
}

function changeGraph(checked, value) {
  d3.select("svg").remove();
  document.getElementById("rsCategories").innerHTML = '';
  if(!checked){
    document.getElementById("affichageAnneeSelectionnee").style.display = "none";
    document.getElementById("selectAnnee").style.display = "none";
    LoadlineChart()
  }else{
    document.getElementById("affichageAnneeSelectionnee").style.display = "inline";
    document.getElementById("selectAnnee").style.display = "inline";
    loadAgregateGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsLevelSelected, rsCategorieSelected)
  }
}

// Lancement du graph ----------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
loadAgregateGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsLevelSelected, rsCategorieSelected)// Appel de la fonction qui va charger les données et construire le graphique

function loadAgregateGraph(maxRadius, dateMinSelected, dateMaxSelected, rsLevel, rsCategorie){
  const 
    hauteurLegende = 300,
    color = d3.scale.category10();

  let 
    clusters = new Array(),
    nodes = new Array();

  dateMinSelected -= 1
  rsLevelSelected = rsLevel
  rsCategorieSelected = rsCategorie

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

      console.log("Data with RS categories : ")// Affiche les données avec les catégories dans la console du navigateur
      console.log(data)// Affiche les données avec les catégories dans la console du navigateur
      console.log("Liste catégorie RS")
      console.log(lstCategoriesRS)  
      
    
      // Transformation des données et génération des clusters contenant les cercles -------------------------------------------
      //------------------------------------------------------------------------------------------------------------------------
      data.forEach(function (d) {
        if(rsLevelSelected == 1){
          let ch =  document.getElementById("rs"+d.categorieRS_level_1_nb)
          if(ch == null){// Cas de figure où la page est chargée pour la 1ère fois, sans catégorie sélectionnée
             if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected){// Uniquement les occurences de d qui sont conformes aux dates min et max sélectionnées
               addNodesToList(d.categorieRS_level_1_nb);
            }
          }else{
            if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && ch.checked){
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
            if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && ch.checked && d.categorieRS_level_1_nb == rsCategorieSelected){
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
            if(parseDate(d.date_de_publication).getFullYear() < dateMaxSelected && parseDate(d.date_de_publication).getFullYear() > dateMinSelected && ch.checked && d.categorieRS_level_2_nb == rsCategorieSelected){
              addNodesToList(d.categorieRS_level_3_nb);
            }
          }
        }    

        function addNodesToList(cluster){
          let r = d.nb_pages * maxRadius;//pour chaque loi extraire nombre de page -> radius
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

      if(nodes <= 1){
        document.location.reload();
      }

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
          if(svg.selectAll(".text_law_selected_label").text != null){svg.selectAll(".text_law_selected_label").remove()}
          if(svg.selectAll(".rect_law_selected_label") != null){svg.selectAll(".rect_law_selected_label").remove()}
          if(svg.selectAll(".law_label") != null){svg.selectAll(".law_label").remove()}
          let law_label_node = svg.selectAll(".law_label")// Ajout du label de description d'une loi sélectionnée
          .data(nodes)
          .enter().append("g")
          .attr("class", "law_label")
          .call(force.drag);

          law_label_node.append("rect")
          .attr("class", "rect_law_selected_label")
          .attr("x", "5%")
          .attr("y", "28%")
          .attr("width", 450)
          .attr("height", 130)
          .attr('stroke', 'black')
          .attr("stroke-opacity", 0)
          .attr("fill-opacity", "0")// Opacité à 0 afin de cacher le rectangle
          .attr('fill', '#e7eb90');

          svg.selectAll(".rect_law_selected_label")
            .attr("fill-opacity", "100")
            .attr("stroke-opacity", 100);
    
          // Ajout des labels textuels d'une loi sélectionnée -----------
          law_label_node.append("text")
          .attr("class", "text_law_selected_label")
          .attr("dx", "5.5%")
          .attr("dy", "31%")
          .style("opacity", 100)
          .style("font-size", "14px")
          .text("Titre : " + p.nom_de_la_loi);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "5.5%")
            .attr("dy", "34.5%")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Date de publication : " + p.date_de_publication);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "5.5%")
            .attr("dy", "37.5%")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Date du vote  : " + p.date_du_vote);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "5.5%")
            .attr("dy", "40.5%")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Nombre de pages : " + p.nb_pages);
      }

      function mouseout(){// La souris quitte un cercle, on réinitialise le label
        if(!isClicked) {
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
          if(p.cluster != null && p.cluster.toString().length < 3){
            maxRadiusCircles = 2;
            clusterPadding = 3;
            charge = -3;
            gravity = 0.02;
            anneeMin = document.getElementById("selectAnnee").value;
            loadAgregateGraph(maxRadiusCircles, anneeMin, dateMaxDefault, rsLevelSelected+1, p.cluster)
          }else{
            document.location.reload();
          }
      }

      var isClicked = false;

      //----------------------------------------------------

      node.enter()
          .append("circle")
          .call(d3.behavior.zoom().on("zoom", function () {
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
          }))
          .on("mouseover", mouseover)
          .on("mouseout", mouseout)
          .on("click", click)
          .style("fill", function(d) {
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
          let cluster     
          clusters.forEach(function(c){
            if(c.cluster == d.cluster){ cluster = c}
          })
          if (cluster === d) return;
          let x = d.x - cluster.x,
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
      svg.append("text").attr("x", 1180).attr("y", hauteurLegende -10).text("Légende :").style("font-size", "20px").attr("alignment-baseline","middle")

      
      let haut = hauteurLegende

      lstCategoriesRS.forEach(function (d) {// Ajout de la légende selon données des catégories RS + code couleur
        haut += 30
        var categorie = d.num_rs
        svg.append("text")
          .attr("id", "rsTxt"+d.num_rs)
          .attr("x", 1180).attr("y", haut)
          .text(d.description_categorie_rs)
          .style("font-size", "15px").attr("alignment-baseline","middle")
          .attr("value", categorie)
          .on("mouseover", function() {
            svg.select("rsTxt"+d.num_rs).style("text-decoration", "underline")
            //document.getElementById("rs"+d.num_rs).style.color = "blue";
          })
          .on("mouseout", function() {
            svg.select("rsTxt"+d.num_rs).style("text-decoration", "none")
          })
          .on("click", function(){
            selectedCategorie(rsLevelSelected, categorie)
          });

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

function LoadlineChart(){
  let 
    margin = {left: 50, right: 20, top: 200, bottom: 50 },
    width = 1500 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom,
    max = 0,
    xNudge = 50,
    yNudge = 20,  
    minDate = new Date(),
    maxDate = new Date(),
    data = new Array(),
    years = new Array(),
    parseDate = d3.time.format("%d.%m.%Y").parse;
  
  d3.csv("../data/law_inflation_data_2010-2020.csv")
      .row(function(d) { return { date: parseDate(d.date_de_publication), pages: Number(d.nb_pages)}; })
      .get(function(error, rows) { 
      max = d3.max(rows, function(d) { return d.pages; });
      minDate = d3.min(rows, function(d) {return d.date; });
      maxDate = d3.max(rows, function(d) { return d.date; });	

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
      max = d3.max(data, function(d) { return d.pages; });
      minDate = new Date(2010, 1, 1);
      maxDate = new Date(2020, 12, 31);
  
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
          .text("Nombre de pages publiées");
    });
}