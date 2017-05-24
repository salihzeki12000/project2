'use strict';

angular.module('blogotripFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('destinations', {
        url: '/destinations/:destination',
        templateUrl: 'app/destinations/destinations.html',
        controller: 'DestinationsController',
        controllerAs: 'des'
      });
  });
