angular
    .module('blogotripFullstackApp')
    .directive('activityBox', activityBox)
    .directive('pageTitle', pageTitle);


function activityBox() {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/views/activitybox.html'

    }
}


/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
    return {
        link: function (scope, element) {
            var listener = function (event, toState, toParams, fromState, fromParams) {
                // Default title - load on Dashboard 1
                var title = 'PlannerTrip';
                // Create your own title pattern
                if (toState.data.pageTitle){
                    title = toState.data.pageTitle;
                } 
                $timeout(function () {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    }
};