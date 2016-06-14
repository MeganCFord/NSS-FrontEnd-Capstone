angular.module("Ident", ["ngRoute"])

  .config(($routeProvider) => {
    $routeProvider
      .when("/", {
        templateUrl: "app/identer.html",
        controller: "Identer", 
        controllerAs: "identer"
      })
      .otherwise("/");
  })

  .controller("Identer", function($scope, COLFactory) {

    const identer = this;
    identer.currentTaxa = {};

    identer.title="hello world (angular)";

    identer.startPage = () => {
      COLFactory.startPage().then((data) => {identer.currentTaxa = data; console.log("identer taxa", identer.currentTaxa);});
    };

    identer.startPage();

    identer.sendNewTaxa = (nameToSend) => {
      console.log("name to send", nameToSend );
      COLFactory.sendNewTaxa(nameToSend).then((data) => {identer.currentTaxa = data; console.log("new identer taxa", identer.currentTaxa);});
    };
  })

  .factory("COLFactory", function($http) {

    let currentTaxa = {};

    return {

  //for higher taxa, response=full is required. 
  //response data: results[0].name, results[0].url, results[0].child_taxa is an array of objects.     
      startPage: () => {
        return  $http({
          method: "GET", 
          url: "http://www.catalogueoflife.org/col/webservice?name=Mammalia&format=json&response=full"
        }).then( (res) => {
          currentTaxa = res.data.results[0];
          return currentTaxa;
        }, (e) => {
          console.log("error", e );
        });
      }, //end of getAPIURL

      sendNewTaxa: (nameToSend) => {
        return  $http({
          method: "GET", 
          url: `http://www.catalogueoflife.org/col/webservice?name=${nameToSend}&format=json&response=full`
        }).then( (res) => {
          res.data.results ?
          currentTaxa = res.data.results[0] :
          currentTaxa = res.data;

          //loop through child taxa and remove extinct ones.
          currentTaxa.child_taxa.forEach(function(taxa) {
            if (taxa.is_extinct === true) {
              console.log("this one is extinct", taxa.name );
            } else {
              console.log("this one is not extinct", taxa.name );
            }
          });


          console.log("current taxa in factory", currentTaxa );
          return currentTaxa;
        }, (e) => {
          console.log("error", e );
        });
      }, //end of sendNewTaxa

      //just in case. TODO: delete this if unused.
      getCurrentTaxa: () => {
        return currentTaxa;
      }
    };//end of return
  });
