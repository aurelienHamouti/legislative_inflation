// Variables et constantes ---------------------------------------------------------
//----------------------------------------------------------------------------------

var width = 1260, // Largeur de la zone de travail
    height = 1100, // Hauteur de la zone de travail
    padding = 3, // Espace de séparation entre les noeuds de même couleur
    clusterPadding = 5, // Espace de séparation entre les différents noeuds de couleur
    maxRadius = 0.7; // Taille maximale des cercles
    delayTransition = 7 // Délai d'apparition des cercles
    lstCategoriesRS_level_1 = []

// Parse de la date au format jj.mm.yyyy
let parseDate = d3.time.format("%d.%m.%Y").parse;

var tab_mois=new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre");

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
            lstCategoriesRS_level_1.push(
              {
                "num_rs" : parseInt(d_table.numero_RS),
                "description_categorie_rs" : d_table.description_loi
              }
            ) 
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

    console.log(lstCategoriesRS_level_1)  
    var color = d3.scale.category10()

    

    // Transformation des données et génération des clusters contenant les cercles -------------------------------------------
    //------------------------------------------------------------------------------------------------------------------------

    // The largest node for each cluster.
    var clusters = new Array(data.length);
    console.log(" nbLois : " + data.length);

    let i = 0;
    data.forEach(function (d) {
      r = d.nb_pages * maxRadius;//pour chaque loi extraire nombre de page -> radius
      let cluster = d.categorieRS_level_1_nb;//pour chaque loi extraire catégorie RS (1..N) -> cluster
      
      //ajouter le cluster à la liste des clusters
      d = {
        cluster: cluster, 
        radius: r,
        nb_pages: d.nb_pages
      };
      clusters[i] = d;
      i += 1;
    });

    console.log("liste of clusters :")
    console.log(clusters)
    nodes = clusters // Les clusters contiennent les cercles

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
        .gravity(0.02)
        .charge(-5)
        .on("tick", tick)
        .start();

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var node = svg.selectAll("circle")
        .data(nodes)

    var circleEnter = node.enter()
        .append("circle")
        .style("fill", function(d) {
          //if (d.cluster == 4){console.log(color(d.cluster))}
          return color(d.cluster);
        })
        .call(force.drag);

    circleEnter.append("text")
        .attr("dx", function(d){return -20})
        .text(function(d){return d.nb_pages})

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
          .each(collide(0.5))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    // Fonctions de calculs des champs de forces et des collisions -----------------------------------------------------
    //------------------------------------------------------------------------------------------------------------------

    // Move d to be adjacent to the cluster node.
    function cluster(alpha) {
      return function(d) {
        var cluster = clusters[d.cluster];
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
    //-------------------------------------------------------------------------------------------------------------------
    let hauteur = 100;

    svg.append("text").attr("x", 350).attr("y", 60).text("Lois publiées entre 2010 et 2020 par catégorie du RS").style("font-size", "20px").attr("alignment-baseline","middle").attr("text-decoration","underline")
    svg.append("text").attr("x", 800).attr("y", hauteur).text("Légende :").style("font-size", "15px").attr("alignment-baseline","middle").attr("text-decoration","underline")

    let haut = hauteur
    lstCategoriesRS_level_1.forEach(function (d) {// Ajout de la légende selon données des catégories RS + code couleur
      console.log(d.description_categorie_rs)
      haut += 30
      svg.append("text").attr("x", 800).attr("y", haut).text(d.description_categorie_rs).style("font-size", "15px").attr("alignment-baseline","middle")
      svg.append("circle").attr("cx",780).attr("cy",haut-5).attr("r", 6).style("fill", color(d.num_rs))
    });
  });
});

