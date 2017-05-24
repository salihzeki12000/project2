'use strict';

angular.module('blogotripFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('itinerary-map', {
        url: '/itinerary-map/:destination/:id',
        templateUrl: 'app/itinerarymap/itinerarymap.html',
        controller: 'ItineraryMapController',
        controllerAs: 'itimap'
      });
  });