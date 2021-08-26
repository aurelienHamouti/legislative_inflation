// Variables et constantes ---------------------------------------------------------
//----------------------------------------------------------------------------------

var width = 960, // Largeur de la zone de travail
    height = 1100, // Hauteur de la zone de travail
    padding = 3, // Espace de séparation entre les noeuds de même couleur
    clusterPadding = 5, // Espace de séparation entre les différents noeuds de couleur
    maxRadius = 0.7; // Taille maximale des cercles
    delayTransition = 7 // Délai d'apparition des cercles

// Parse de la date au format jj.mm.yyyy
let parseDate = d3.time.format("%d.%m.%Y").parse;

var tab_mois=new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre");
var nbCategoriesRS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// color palette = one color per subgroup
var color = d3.scale.ordinal()
  .domain(nbCategoriesRS)
  .range(['pink', '#e41a1c','orange','#4daf4a', '#000066', '#ffff1a', '#1aff1a', '#9900ff', '#green', '#669999', 'black', ' #339cff'])
  //dans l'ordre -> cat1, cat2, cat3, cat4, cat5 etc..


// Importation des données -------------------------------------------------------
//--------------------------------------------------------------------------------

d3.csv("../data/law_inflation_data_2010-2020.csv", function(data) {
  console.log("data import");// Affiche les données au format brut dans la console du navigateur
  console.log(data);// Affiche les données au format brut dans la console du navigateur

  //Filtrer et transformer les données
  var nbLois = 0
  data.forEach(function (d) {
    //filtre des données
    d.dateMonth = tab_mois[parseDate(d.date_de_publication).getMonth()];//transformer date en groupe (mois ou années)

    let categorieRS = 0 //"catégorie du texte inconnue";
    //rs = str.substr(0, 2)
    if (d.rs < 200){
      categorieRS = 1 //"État - Peuple - Autorités";
    }else if(d.rs > 199 && d.rs < 300){
      categorieRS = 2 //"Droit privé - Procédure civile - Exécution";
    }else if(d.rs > 299 && d.rs < 400){
      categorieRS = 3 //"Droit pénal - Procédure pénale - Exécution";
    }else if(d.rs > 399 && d.rs < 500){
      categorieRS = 4 //"École - Science - Culture";
    }else if(d.rs > 499 && d.rs < 600){
      categorieRS = 5 //"Défense nationale";
    }else if(d.rs > 599 && d.rs < 700){
      categorieRS = 6 //"Finances";
    }else if(d.rs > 699 && d.rs < 800){
      categorieRS = 7 //"Travaux publics - Énergie - Transports et communications";
    }else if(d.rs > 799 && d.rs < 900){
      categorieRS = 8 //"Santé - Travail - Sécurité sociale";
    }else if(d.rs > 899 && d.rs < 1000){
      categorieRS = 9 //"Économie - Coopération technique";
    }
    d.categorieRS = categorieRS;

    nbLois += 1;
  });


  // Transformation des données et génération des clusters contenant les cercles -------------------------------------------
  //------------------------------------------------------------------------------------------------------------------------

  // The largest node for each cluster.
  var clusters = new Array(nbLois);
  console.log(" nbLois : " + nbLois);

  let i = 0;
  data.forEach(function (d) {
    //if (d.categorieRS == 2){console.log("Défense nationale")}
    
    //pour chaque loi extraire nombre de page -> radius
    r = d.nb_pages * maxRadius; 

    //pour chaque loi extraire catégorie RS (1..N) -> cluster
    let cluster = d.categorieRS;

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

  // Paramètrage des champs de forces, positionnement des cercles par rapport aux autres -------------------------------
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

  svg.append("circle").attr("cx",780).attr("cy",hauteur+25).attr("r", 6).style("fill", "#e41a1c")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+55).attr("r", 6).style("fill", "orange")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+85).attr("r", 6).style("fill", "#4daf4a")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+115).attr("r", 6).style("fill", "#000066")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+145).attr("r", 6).style("fill", "#ffff1a")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+175).attr("r", 6).style("fill", "#1aff1a")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+205).attr("r", 6).style("fill", "#9900ff")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+235).attr("r", 6).style("fill", "#green")
  svg.append("circle").attr("cx",780).attr("cy",hauteur+265).attr("r", 6).style("fill", "#669999")
    
  svg.append("text").attr("x", 350).attr("y", 60).text("Lois publiées entre 2010 et 2020 par catégorie du RS").style("font-size", "20px").attr("alignment-baseline","middle").attr("text-decoration","underline")
  svg.append("text").attr("x", 800).attr("y", hauteur).text("Légende :").style("font-size", "15px").attr("alignment-baseline","middle").attr("text-decoration","underline")

  svg.append("text").attr("x", 800).attr("y", hauteur+30).text("État - Peuple - Autorités").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+60).text("Droit privé - Procédure civile - Exécution").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+90).text("Droit pénal - Procédure pénale - Exécution").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+120).text("École - Science - Culture").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+150).text("Défense nationale").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+180).text("Travaux publics - Énergie - Transports et communications").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+210).text("Santé - Travail - Sécurité sociale").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+240).text("Économie - Coopération technique").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 800).attr("y", hauteur+270).text("Autres").style("font-size", "15px").attr("alignment-baseline","middle")

});

