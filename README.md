# Projet de visualisation du phénomène d'inflation législative

## Description
Le présent projet s’inscrit dans le cadre du cours de Visualisation des données dispensé par M. Isaac Pante à l’Université de Lausanne au semestre du printemps 2021. Il a pour objet de permettre la visualisation de l’œuvre de l’Assemblée fédérale suisse selon plusieurs perspectives, notamment : 
-	**chronologique** : en permettant de suivre le travail du législateur au fil des mois et des années ; 
-	**quantitative** : le projet intègre la possibilité d’agréger les objets législatifs afin de se rendre compte du nombre de lois votées par mois, par année ou sur toute la période donnée, ainsi que la taille de chaque loi ; 
-	**qualitative** : la couleur des éléments permet en outre de déterminer les thématiques et sous-thématiques relatives à chaque loi.

L’objectif poursuivi est de permettre à l’utilisateur d’observer le travail effectué par le législateur et de pouvoir tirer ses propres conclusions par exemple sur les cycles régissant l’Assemblée , les thématiques qui y sont abordées, les priorités du législateur etc. 

## Base de données
Deux bases de données sont principalement utilisées afin d’alimenter le projet : 
-	le **[Recueil officiel](https://www.fedlex.admin.ch/fr/oc?news_period=last_day&news_pageNb=1&news_order=desc&news_itemsPerPage=10)** : dont sont uniquement extraites les lois fédérales définitivement votées par l’Assemblée fédérale et publiées (pour les besoins de la visualisation, ne sont pas compris dans la base de données les ordonnances, règlements, arrêtés pris par le pouvoir exécutif) ; 
-	le **[Recueil systématique](https://www.fedlex.admin.ch/fr/cc?news_period=last_day&news_pageNb=1&news_order=desc&news_itemsPerPage=10)** : dont sont extraits les listes de thématiques législatives ainsi que leurs codes correspondants afin de permettre d’identifier la thématique de chaque objet législatif dans la base de données.

## Données
Pour chaque loi, la base données contient plusieurs informations : 
-	le nom de la loi ;
-	la date de publication de la loi ;
-	la date du vote ou de la modification de la loi ;
-	le numéro au Recueil officiel ;
-	un lien hypertexte vers le Recueil officiel ;
-	l’unité administrative responsable de la loi ; 
-	le nombre de pages de la loi.
À ce stade, les données ont été recueillies sur 10 ans (de 2010 à 2020).

## Auteurs
Aurélien Hamouti (développeur): développement et programmation du code principal et intégration à GitHub.
Catherine Döbeli et David Pressouyre (juristes) : création, enrichissement et mise à jour des bases de données et assistance au développement.

## Droits d'auteurs
Copyright@ Tout droits réservés
