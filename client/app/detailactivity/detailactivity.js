'use strict';

angular.module('blogotripFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('detailactivity', {
        url: '/detailactivity/:activity',
        templateUrl: 'app/detailactivity/detailactivity.html',
        controller: 'DetailActivityController',
        controllerAs: 'dActCtr'
      });
  });
