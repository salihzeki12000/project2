'use strict';

angular.module('blogotripFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('itineraries', {
        url: '/itineraries',
        templateUrl: 'app/userprofile/useritineraries/useritineraries.html',
        controller: 'useritinerariesController',
        controllerAs: 'useritictr'
      });
  });