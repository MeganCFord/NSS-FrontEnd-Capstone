angular.module("Ident", ["ngRoute", "ui.bootstrap", "ngAnimate"])

  .config(($routeProvider) => {
    $routeProvider
      .when("/tree/:taxa", {
        templateUrl: "app/background/background.html",
        controller: "Background", 
        controllerAs: "background", 
        resolve:  {
          currentTaxa: function(TreeFactory, $route) {
            return TreeFactory.buildTheTree($route.current.params.taxa);
          }, 
          currentUserObject: function(UserObjectFactory, $route) {
            return UserObjectFactory.buildUserObject($route.current.params.taxa);
            //todo in here: rebuild the cumulative questions object as well. 
          }
        }
      })
      .when("/species/:taxa", {
        templateUrl:"app/background/background.html", 
        controller: "Background", 
        controllerAs: "background", 
        resolve: {
          currentTaxa: function(TreeFactory, $route) {
            return TreeFactory.buildTheTree($route.current.params.taxa);
          }, 
          currentUserObject: function(UserObjectFactory, $route) {
            return UserObjectFactory.buildUserObject($route.current.params.taxa);
            //to do in here: rebuild the cumulative questions object as well. 
          }
        }
      })
      .when("/start", {
        templateUrl: "app/background/background.html", 
        controller: "Background", 
        controllerAs: "background", 
        resolve: {
          clearedUserObject: function(UserObjectFactory) {
            return UserObjectFactory.clearUserObject();
          }, 
          feed: function(FeedFactory) {
            return FeedFactory.getPublishedAnimals();
          }
        }
      })
      .otherwise("/start");
  });


 
