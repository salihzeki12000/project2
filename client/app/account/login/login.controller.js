'use strict';

class LoginController {
  constructor(Auth, $state,$rootScope) {
    $rootScope.state = $state;
    this.user = {};
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
    this.$state = $state;
  }

  login(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
        .then(() => {
          // Logged in, redirect to home
          if (typeof $cookieStore.get('returnUrl') != 'undefined' && $cookieStore.get('returnUrl') != '') {
            $location.path($cookieStore.get('returnUrl'));
            $cookieStore.remove('returnUrl');
          }
          else {
            $location.path('/');
          }
        })
        .catch(err => {
          this.errors.other = err.message;
        });
    }
  }
}

angular.module('blogotripFullstackApp')
  .controller('LoginController', LoginController);
