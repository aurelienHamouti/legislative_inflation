//importation des données depuis un CSV
console.clear()
// 1 importation des données d3
d3.csv('law_inflation_data.csv',function(d){
  // fonction de conversion
  // second paramètre
  return {
    //Ne conserver que ces données (ici on prend tout)
    date_de_publication : d.date_de_publication,
    date_du_vote : d.date_du_vote, 
    nom_de_la_loi : d.nom_de_la_loi, 
    ro : d.ro, 
    rs : d.rs, 
    unite : d.unite
  }
}).then(data => {
  // affichage des données
  console.log("Data",data);

    // 5. obtenir le minimum et le maximum
    let empan_date = d3.extent(data, d => d.rs) // [valeur_min,valeur_max]
    console.log("Empan",empan_date);

    // 6. obtenir la moyenne du terrain
    //let moyenne_terrain = d3.mean(data, d => d.terrain);
    //console.log("Moyenne terrain",moyenne_terrain);

    // 7. filtrage de valeurs par valeur RS et par date
    // toutes les valeurs supérieures au numéro 900 du RS
    let rs_superieur = data.filter(d => d.rs > 900);
    console.log("rs_superieur",rs_superieur);

    // toutes lois votées après le 30 juin 2020
    var parseTime = d3.timeParse("%d.%m.%Y");
    let date_vote_limite = parseTime("30.06.2020")
    let lois_recentes = data.filter(d => parseTime(d.date_du_vote) > date_vote_limite);
    console.log("date_du_vote_recent",lois_recentes);

    // 8. ajout RS au nom d'une loi avec reduce
    let lois_avec_rs = lois_recentes.reduce((somme, d) => somme +"\n"+ d.nom_de_la_loi + " RS : " + d.rs, 0);
    console.log("lois_avec_rs",lois_avec_rs);

    // 9. grouper par type
    // attention ! cette méthode retourne une Map
    // avec une surcouche de structure
    let groupe_unite = d3.group(data, d => d.unite);
    console.log("Groupe par unité",groupe_unite);
    console.log("Services du Parlement",groupe_unite.get('Services du Parlement'));

    // 10. résumer avec rollup
    // attention ! cette méthode retourne une Map
    // cette fois, les éléments sont perdus
    let compte_type = d3.rollup(
    // données retenues
    data,
    // valeur affichée
    d => d.length,
    // facteur de groupement
    d => d.unite
    );
    console.log("compte_type",compte_type);

    // 11. retrouver des tableaux
    // une seule lettre change! un "s" à "d3.group"
    let groupes_unite = d3.groups(data, d => d.unite);
    console.log("Groupes par unité",groupes_unite);
    // idem avec d3.rollups
 
})