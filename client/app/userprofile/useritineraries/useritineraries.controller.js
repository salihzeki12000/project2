'use strict';

angular.module('blogotripFullstackApp')
  .controller('useritinerariesController', useritinerariesController);

function useritinerariesController($scope, $state,$window,$rootScope, Auth, blogFactory) {

    $rootScope.state = $state;
    var user = Auth.getCurrentUser();
    $window.document.title = 'Your Itinerary List | PlannerTrip';

    blogFactory.getItinerariesOwner().query({owner: user._id}, function (itineraries) {
        itineraries.forEach(function (itinerary) {
            blogFactory.getPlaceByName().get({ place: itinerary.name }, function (place) {
                itinerary.photo = place.results[0].photo_reference
            });
        });
        $scope.itineraries = itineraries;
        // $rootScope.itiownercount = itineraries.length;
        // console.log('itineraries',itineraries)
    },
    function (error) {
      console.log(error);
    });

    
    $scope.goItineraryMap = function(itinerary){
        $state.go('itinerary-map', { destination: itinerary.name, id: itinerary._id });
    }

    $scope.deleteItinerary = function(itinerary){
        blogFactory.itinerary().remove({id:itinerary._id}, function(){
            $scope.itineraries.splice($scope.itineraries.indexOf(itinerary), 1);
        });
        
    }

    $scope.clickNotes = function(itinerary){
        $scope.itinerary = itinerary;
        // console.log($scope.itinerary)        
    }

    $scope.$watch('itinerary',function(value){
        if(value){
            // console.log(value.notes +' '+value._id);
            blogFactory.itinerary().update({ id: value._id }, {notes:value.notes}, function () {
                // console.log('add notes');
            },
            function (error) {
                console.log('Error updating notes itinerary\nDetail: ' + error);
            });
        }
    },true);

}


