'use strict';

angular.module('blogotripFullstackApp')
    .controller('ItineraryListController', ItineraryListController);

function ItineraryListController($scope, $state, blogFactory,User) {

   //List itinerary for admin
   $scope.users = User.query();
   $scope.itineraries = blogFactory.itinerary().query();

   blogFactory.getAllSearches().query(function(searches){
    $scope.searches = searches;
    
  },
  function(error){
    alert('Error get all form Manage\nDetail: '+error.message);
  });
   
}


