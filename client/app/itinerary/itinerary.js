'use strict';

angular.module('blogotripFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('itinerary', {
        url: '/itinerary/:id',
        templateUrl: 'app/itinerary/itinerary.html',
        controller: 'ItineraryController',
        controllerAs: 'itinerary'
      });
  });