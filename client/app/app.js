'use strict';

angular.module('blogotripFullstackApp', [
  'blogotripFullstackApp.auth',
  'blogotripFullstackApp.admin',
  'blogotripFullstackApp.constants',
  'ngCookies',
  'ngResource',
  // 'ngSanitize',
  // 'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'gm',
  'angularUtils.directives.dirPagination',
  'toaster',
  'angulartics',
  'angulartics.google.analytics',
  'angular-loading-bar',
  'ui.tree',
  '720kb.socialshare',
  'slick',
  'angular-tour',
  'ui.toggle',
  'pageslide-directive'
])
  .config(function ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);

  })

  .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }])

  .config(function ($httpProvider) {
    
    // $httpProvider.defaults.headers.get = { 'x-api-key': '' };
  })

  .run(function ($rootScope, $location,$timeout,$cookieStore) {
    $rootScope.$on('$locationChangeStart', function (event, next) {

        if ($location.url() != '/logout') {
          if($rootScope.state && $rootScope.state.current.name == 'itinerary-map'){
            // console.log('location itinerary-map',$location.url());
            // console.log('state.current.name',$rootScope.state.current.name)
            $cookieStore.put('returnUrl', $location.url());
          }
          else if (typeof $cookieStore.get('returnUrl') != 'undefined' && $cookieStore.get('returnUrl') != '') {
            
            $cookieStore.remove('returnUrl');
          
            // console.log('cookieStore',$cookieStore.get('returnUrl'));
          }
           
        }
      
    });

  });
