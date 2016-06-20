angular.module("Ident", ["ngRoute", "ui.bootstrap", "ngAnimate"])

  .config(($routeProvider) => {
    $routeProvider
      .when("/tree/:taxa", {
        templateUrl: "app/tree/tree.html",
        controller: "Tree", 
        controllerAs: "tree", 
        resolve:  {
          currentTaxa: function(COLFactory, $route) {
            return COLFactory.COLforTaxa($route.current.params.taxa);
          }, 
          currentUserObject: function(FirebaseFactory) {
            return FirebaseFactory.getUserObject();
          }
        }
      })
      .when("/species/:taxa", {
        templateUrl:"app/species/species.html", 
        controller: "Species", 
        controllerAs: "species", 
        resolve: {
          currentTaxa: function(COLFactory, $route) {
            return COLFactory.COLforTaxa($route.current.params.taxa);
          }, 
          currentUserObject: function(FirebaseFactory) {
            return FirebaseFactory.getUserObject();
          }
        }
      })
      .when("/", {
        templateUrl: "app/start/start.html", 
        controller: "Start", 
        controllerAs: "start"
      })
      .otherwise("/");
  });


