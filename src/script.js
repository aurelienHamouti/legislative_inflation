// Variables et constantes ---------------------------------------------------------
//----------------------------------------------------------------------------------

var width = 1500, // Largeur de la zone de travail
    height = 1000, // Hauteur de la zone de travail
    padding = 3, // Espace de séparation entre les noeuds de même couleur
    clusterPadding = 10, // Espace de séparation entre les différents noeuds de couleur
    delayTransition = 3, // Délai d'apparition des cercles
    lstCategoriesRS_level_1 = [],
    hauteurLegende = 150,
    maxRadiusCircles = document.getElementById("sizeCircles").value / 100,
    rsCategoriesSelected = null
    charge = -3,
    gravity = 0.02;

// Gestion des dates -----------------------------------------------------
// -----------------------------------------------------------------------

// Parse de la date au format jj.mm.yyyy
let parseDate = d3.time.format("%d.%m.%Y").parse;

const tab_mois=new Array("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre");

var dateMaxDefault = new Date(document.getElementById("anneeAfficheesMax").value);
var dateMinDefault = new Date(document.getElementById("anneeAfficheesMin").value);

// Lancement du graph ----------------------------------------------------------------------
//-------------------------------------------------------------------------------------------

loadGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, rsCategoriesSelected)// Appel de la fonction qui va charger les données et construire le graphique

function loadGraph(maxRadius, dateMinSelected, dateMaxSelected, rsCategoriesSelected){

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

          if(d_table.numero_RS.length == 1 && !lstCategoriesRS_level_1.some(e => e.num_rs === parseInt(d_table.numero_RS))){
              lstCategoriesRS_level_1.push({
                  "num_rs" : parseInt(d_table.numero_RS),
                  "description_categorie_rs" : d_table.description_loi
              }) 
          }
        });
      });

      console.log("Data with RS categories : ")// Affiche les données avec les catégories dans la console du navigateur
      console.log(data)// Affiche les données avec les catégories dans la console du navigateur

      /*var nbCategoriesRS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      // color palette = one color per subgroup
      var color = d3.scale.ordinal()
        .domain(lstCategoriesRS_level_1)
        .range(['pink', '#e41a1c','orange','#4daf4a', '#000066', '#ffff1a', '#1aff1a', '#9900ff', '#green', '#669999', 'black', ' #339cff'])
        //dans l'ordre -> cat1, cat2, cat3, cat4, cat5 etc..
      */

      console.log("Catégorie RS de niveau 1")
      console.log(lstCategoriesRS_level_1)  
      var color = d3.scale.category10()
    
      // Transformation des données et génération des clusters contenant les cercles -------------------------------------------
      //------------------------------------------------------------------------------------------------------------------------

      // The largest node for each cluster.
      var clusters = new Array();

      nodes = new Array();


      let i = 0;
      data.forEach(function (d) {

        let ch =  document.getElementById("rs"+d.categorieRS_level_1_nb)
        if(ch == null){
           // Uniquement les occurences de d qui sont conformes aux dates min et max sélectionnées
           if(parseDate(d.date_de_publication) < dateMaxSelected && parseDate(d.date_de_publication) > dateMinSelected){
              r = d.nb_pages * maxRadius;//pour chaque loi extraire nombre de page -> radius
              let cluster = d.categorieRS_level_1_nb;//pour chaque loi extraire catégorie RS (1..N) -> cluster
              //ajouter le cluster à la liste des clusters
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
                  //console.log(c.cluster + " == " + d.cluster)
                  //console.log(c.radius + " < " + d.radius)
                  if(c.radius < d.radius){
                    //console.log(c.radius + " < " + d.radius)
                    //console.log(clusters[clusters.indexOf(c)])
                    clusters.splice(clusters.indexOf(c), 1)
                   
                    clusters.push(d)
                  }
                  clusterAlreadyPresent = true
                }
              })
              if(clusters.length < 1){
                clusters.push(d)
              }
              if(!clusterAlreadyPresent){clusters.push(d)}

              nodes.push(d);
          }
        }else{
          // Uniquement les occurences de d qui sont conformes aux dates min et max sélectionnées
          if(parseDate(d.date_de_publication) < dateMaxSelected && parseDate(d.date_de_publication) > dateMinSelected && ch.checked == true){
            r = d.nb_pages * maxRadius;//pour chaque loi extraire nombre de page -> radius
            let cluster = d.categorieRS_level_1_nb;//pour chaque loi extraire catégorie RS (1..N) -> cluster
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
                  clusters.slice(clusters.indexOf(c), 1)
                  clusters.push(d)
                }
                clusterAlreadyPresent = true
              }
            })
            if(clusters.length < 1){clusters.push(d)}
            if(!clusterAlreadyPresent){clusters.push(d)}

            nodes.push(d);//ajouter le cluster à la liste des clusters
          }
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
          .data(nodes)

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
          .attr("x", "1.5em")
          .attr("y", "10em")
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

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "2.3em")
            .attr("dy", "13.5em")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Titre : " + p.nom_de_la_loi);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "2.3em")
            .attr("dy", "15.5em")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Date de publication : " + p.date_de_publication);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "2.3em")
            .attr("dy", "17.5em")
            .style("opacity", 100)
            .style("font-size", "14px")
            .text("Date du vote  : " + p.date_du_vote);

          law_label_node.append("text")
            .attr("class", "text_law_selected_label")
            .attr("dx", "2.3em")
            .attr("dy", "19.5em")
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
          //svg.selectAll(".text_law_selected_label").remove()
          svg.selectAll(".text_law_selected_label").text("")
    
        }
      }
      
      function click(p){
          isClicked = !isClicked;
          console.log("on clique sur un cercle")
      }
      var isClicked = false;

      //----------------------------------------------------

      var circleEnter = node.enter()
          .append("circle")
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

      
      svg.append("text").attr("x", 1100).attr("y", hauteurLegende).text("Légende :").style("font-size", "15px").attr("alignment-baseline","middle").attr("font-weight", "bold")

      let haut = hauteurLegende

      lstCategoriesRS_level_1.forEach(function (d) {// Ajout de la légende selon données des catégories RS + code couleur
        haut += 30
        svg.append("text").attr("x", 1120).attr("y", haut).text(d.description_categorie_rs).style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("circle").attr("cx",1100).attr("cy",haut-5).attr("r", 6).style("fill", color(d.num_rs))
        
        // Checkbox des catégories ---------------------------------------------

        //console.log(rsCategoriesSelected)
        let ch =  document.getElementById("rs"+d.num_rs)
        if(ch == null){
          d3.select("body").selectAll("#rsCategories")
          .append('label')
            .attr("class", "rsCheckboxes")
            .text(d.description_categorie_rs) 
          .append("input")
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
  loadGraph(maxRadius/100, dateMinDefault, dateMaxDefault)
}

function changeMaxDate(maxDate){
  d3.select("svg").remove();
  loadGraph(maxRadiusCircles, dateMinDefault, new Date(maxDate))
}

function changeMinDate(minDate){
  d3.select("svg").remove();
  loadGraph(maxRadiusCircles, new Date(minDate), dateMaxDefault)
}

function changeRsCategories(isChecked, rsCategorie){
  d3.select("svg").remove();
  loadGraph(maxRadiusCircles, dateMinDefault, dateMaxDefault, [rsCategorie, isChecked])
}