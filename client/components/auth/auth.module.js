'use strict';

angular.module('blogotripFullstackApp.auth', [
  'blogotripFullstackApp.constants',
  'blogotripFullstackApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
