'use strict';

angular.module('blogotripFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('itinerarylist', {
        url: '/itinerarylist',
        templateUrl: 'app/itinerarylist/itinerarylist.html',
        controller: 'ItineraryListController',
        controllerAs: 'itilist',
        authenticate: true
      });
  });