# Projet de visualisation du phénomène d'inflation législative

## Description
Le présent projet s’inscrit dans le cadre du cours de Visualisation des données dispensé par M. Isaac Pante à l’Université de Lausanne au semestre du printemps 2021. Il a pour objet de permettre la visualisation de l’œuvre de l’Assemblée fédérale suisse selon plusieurs perspectives, notamment : 
-	**chronologique** : en permettant de suivre le travail du législateur au fil des mois et des années ; 
-	**quantitative** : le projet intègre la possibilité d’agréger les objets législatifs afin de se rendre compte du nombre de lois votées par mois, par année ou sur toute la période donnée, ainsi que la taille de chaque loi ; 
-	**qualitative** : la couleur des éléments permet en outre de déterminer les thématiques et sous-thématiques relatives à chaque loi.

L’objectif poursuivi est de permettre à l’utilisateur d’observer le travail effectué par le législateur et de pouvoir tirer ses propres conclusions par exemple sur les cycles régissant l’Assemblée , les thématiques qui y sont abordées, les priorités du législateur etc. 

![illustrations graphique aggrégé](/figures/Illustration_graphique_aggrégé_1.jpg)


## Base de données
Deux bases de données sont principalement utilisées afin d’alimenter le projet : 
-	le **[Recueil officiel](https://www.fedlex.admin.ch/fr/oc?news_period=last_day&news_pageNb=1&news_order=desc&news_itemsPerPage=10)** : dont sont uniquement extraites les lois fédérales définitivement votées par l’Assemblée fédérale et publiées (pour les besoins de la visualisation, ne sont pas compris dans la base de données les ordonnances, règlements, arrêtés pris par le pouvoir exécutif) ; 
-	le **[Recueil systématique](https://www.fedlex.admin.ch/fr/cc?news_period=last_day&news_pageNb=1&news_order=desc&news_itemsPerPage=10)** : dont sont extraits les listes de thématiques législatives ainsi que leurs codes correspondants afin de permettre d’identifier la thématique de chaque objet législatif dans la base de données.

![illustrations bases](/figures/IllustrationRORS.png)

## Données
Pour chaque loi, la base données contient plusieurs informations : 
-	le nom de la loi ;
-	la date de publication de la loi ;
-	la date du vote ou de la modification de la loi ;
-	le numéro au Recueil officiel ;
-	un lien hypertexte vers le Recueil officiel ;
-	l’unité administrative responsable de la loi ; 
-	le nombre de pages de la loi.

À ce stade, les données ont été recueillies sur **10 ans** (de 2010 à 2020). Le projet et sa base de données ont toutefois été conçus afin de permettre une mise à jour des prochaines lois (pour les années 2021 et suivantes) ainsi qu’un enrichissement (pour les années 2009 et antérieures).

![illustrations données](figures/IllustrationDonnees1.png)


## Auteurs
**Aurélien Hamouti** (développeur): développement et programmation du code principal et intégration à GitHub.

**Catherine Döbeli et David Pressouyre** (juristes) : création, enrichissement et mise à jour des bases de données et assistance au développement.

## Droits d'auteurs
Copyright@ Tout droits réservés


**************************************************************************************************

# Project to visualize the phenomenon of legislative inflation

## Description
This project is part of the Data Visualization course taught by Mr. Isaac Pante at the University of Lausanne during the spring 2021 semester. It aims to allow the visualization of the work of the Swiss Federal Assembly from several perspectives, including: 
- **chronological**: by allowing to follow the work of the legislator over the months and years ; 
- **quantitative**: the project integrates the possibility to aggregate the legislative objects in order to see the number of laws passed per month, per year or over the whole period, as well as the size of each law; 
- **qualitative**: the color of the elements also makes it possible to determine the themes and sub-themes related to each law.

The objective is to allow the user to observe the work done by the swiss legislator and to be able to draw his own conclusions, for example, on the cycles governing the Assembly, the themes addressed, the legislator's priorities, etc. 

## Database
Two databases are mainly used to feed the project: 
- the **[Recueil Officiel](https://www.fedlex.admin.ch/fr/oc?news_period=last_day&news_pageNb=1&news_order=desc&news_itemsPerPage=10)** : from which are extracted only the federal laws definitively voted by the Federal Assembly and published (for the needs of the visualization, ordinances, regulations, decrees taken by the executive power are not included in the database) ; 
- the **[Recueil systématique](https://www.fedlex.admin.ch/fr/cc?news_period=last_day&news_pageNb=1&news_order=desc&news_itemsPerPage=10)** : from which are extracted the lists of legislative themes as well as their corresponding codes in order to identify the theme of each legislative object in the database.

![illustrations bases](/figures/IllustrationRORS.png)

## Data
For each law, the database contains several information: 
- its name;
- its date of publication;
- its date of vote or modification;
- its number in the Recueil Officiel;
- an hyperlink to the Recueil Officiel;
- the administrative unit responsible for the law; 
- its size in number of pages.

At this stage, data has been collected for **10 years** (2010 to 2020). However, the project and its database have been designed to allow for updating of future laws (for the years 2021 onwards) as well as enrichment (for the years 2009 onwards).

![illustrations données](figures/IllustrationDonnees1.png)

## Authors
**Aurélien Hamouti** (developer): development and programming of the main code and integration to GitHub.

**Catherine Döbeli and David Pressouyre** (lawyers): creation, enrichment and update of the databases and development assistance.

## Copyrights
Copyright@ All rights reserved


