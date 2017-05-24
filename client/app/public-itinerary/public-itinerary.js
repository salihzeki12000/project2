'use strict';

angular.module('blogotripFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('public-itinerary', {
        url: '/public-itinerary/:destination',
        templateUrl: 'app/public-itinerary/public-itinerary.html',
        controller: 'PublicItineraryController',
        controllerAs: 'public-itinerary'
      });
  });