'use strict';

angular.module('blogotripFullstackApp')
  .controller('NavbarController', NavbarController);

function NavbarController($scope, $state, $stateParams,$location,$cookieStore, Auth, blogFactory, $uibModal) {

  $scope.menu = [{
    'title': 'Home',
    'state': 'main'
  }];

  $scope.isCollapsed = true;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.isAdmin = Auth.isAdmin;
  $scope.getCurrentUser = Auth.getCurrentUser;

  $scope.profile = Auth.getCurrentUser(function (data) {
    if (data) {
      if (data.provider == 'google') {
        $scope.avatar = data.google.image.url;
      }
      else if (data.provider == 'facebook') {
        $scope.avatar = data.facebook.picture.data.url;
      }
    }
  });

  $scope.openMyModal = function () {

    var modalMyInstance = $uibModal.open({
      templateUrl: 'components/navbar/modals/newsearch.html',
      controller: 'NewSearchCtrl',
      controllerAs: 'newCtr',
    });
  }

  $scope.openShareModal = function () {

    var modalMyInstance = $uibModal.open({
      templateUrl: 'components/navbar/modals/share.html',
      controller: 'ShareCtrl',
      controllerAs: 'shareCtr',
    });
  }

  $scope.openLoginModal = function () {
    var modalMyInstance = $uibModal.open({
      templateUrl: 'components/navbar/modals/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'loginCtr',
    });
  }

  $scope.openLoginPublicModal = function () {
    var newpath = $location.url().split('&');
    var basepath = newpath[0].split('/');

    // console.log('state.current.name',$rootScope.state.current.name)
    
    $cookieStore.put('returnUrl', '/itinerary-map/'+basepath[2]+'/'+newpath[1]+'_'+'copy');
    console.log('cookieStore',$cookieStore.get('returnUrl'))

    var modalMyInstance = $uibModal.open({
      templateUrl: 'components/navbar/modals/login.html',
      controller: 'LoginCtrl',
      controllerAs: 'loginCtr',
    });
  }

}

angular.module('blogotripFullstackApp').controller('ShareCtrl', function ($scope, $uibModalInstance, $rootScope) {
});

angular.module('blogotripFullstackApp').controller('LoginCtrl', function ($scope, $uibModalInstance, $rootScope) {
});

angular.module('blogotripFullstackApp').controller('NewSearchCtrl', function ($scope,
  $uibModalInstance, blogFactory, Auth, $state, toaster) {

  blogFactory.getPlaces().get(function (places) {
    $scope.places = places.results;
  },
    function (error) {
      alert('Error getPlaces Main\nDetail: ' + error);
    });

  var message = function (type, text) {
    toaster.pop({
      type: type,
      title: text,
      showCloseButton: true,
      timeout: 5000
    });
  };

  $scope.dateOptionsStart = {
    showWeeks: false,
    startingDay: 1,
    minDate: new Date()
  };
  $scope.dateOptionsEnd = {
    showWeeks: false,
    startingDay: 1,
    minDate: new Date()
  };

  var diffDays = function (firstDate, secondDate) {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
    return diffDays;
  }

  $scope.$watch('start', function (v) {

    $scope.end = v;
    if (v) {
      $scope.end = new Date(v.getTime() + 24 * 60 * 60 * 1000);
    }

    $scope.dateOptionsEnd = {
      showWeeks: false,
      startingDay: 2,
      minDate: $scope.end
    };
  });

  $scope.format = 'dd MMM yyyy';
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.dataSaved = false;

  function getFormattedDate(date) {
    // var todayTime = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    return day + "/" + month + "/" + year;
  }

  $scope.submit = function (formtype) {

    var user = Auth.getCurrentUser()
    var type = []
    if ($scope.travelform.city) {
      type.push("city");
    }
    if ($scope.travelform.cultural) {
      type.push("cultural");
    }
    if ($scope.travelform.adventure) {
      type.push("adventure");
    }
    if ($scope.travelform.luxury) {
      type.push("luxury");
    }
    if ($scope.travelform.beach) {
      type.push("beach");
    }
    if ($scope.travelform.nature) {
      type.push("nature");
    }
    if ($scope.travelform.nightlife) {
      type.push("nightlife");
    }

    // if (type.length < 1) {
      // message('danger', 'At least 1 travel experience is required');
      // $scope.error = 'At least 1 travel experience is required';
      // return;
    // }
    
    // var travelers = $scope.travelform.travelers;
    // if (travelers.$untouched) {
    //   // message('danger', 'Let us know who is traveling with you');
    //   $scope.error = 'Let us know who is traveling with you';
    //   return;
    // }
    var startdate = $scope.start;
    if (!startdate) {
      // message('danger', 'Start of travel date missing');
      $scope.error = 'Start of travel date missing';
      return;
    }
    var enddate = $scope.end;
    if (!enddate) {
      // message('danger', 'End of travel date missing');
      $scope.error = 'End of travel date missing';
      return;
    }
    var destination = $scope.travelform.destination;
    if (!destination) {
      // message('danger', 'Destination is missing');
      $scope.error = 'Destination is missing';
      return;
    }
    if (destination) {
      destination = $scope.travelform.destination.place;
    }

    var numdays = diffDays($scope.start, $scope.end);

    var newform = {
      user: user,
      traveltype: type,
      travelers: $scope.travelform.travelers,
      startdate: startdate,
      enddate: enddate,
      destination: destination,
    };

    blogFactory.form().save(newform, function (form) {
      $scope.idform = form._id;
      // console.log('form._id',form._id);
    });

    var stdate = getFormattedDate(startdate);

    var userid = ''
    var active = true
    if (!angular.equals(user, {})) {
      userid = user._id;
      active = false
    }
    var activities = [
        {
          "activities": [],
          "acttype": "Attractions"
        },
        {
          "activities": [],
          "acttype": "Food & Drink"
        },
        {
          "activities": [],
          "acttype": "Accommodation"
        },
        {
          "activities": [],
          "acttype": "Shopping"
        }
      ]

    blogFactory.getPlaceByName().get({ place: destination }, function (place) {
      var placedata = place.results[0];
      if(placedata.n_activities > 4){
        $scope.dataSaved = true;
        blogFactory.getItineraryRandom().get({ place: destination, days: numdays }, function (itirandom) {
          var newitinerary = {
            name: destination,
            startdate: startdate,
            enddate: enddate,
            activities: activities,
            days: itirandom.results.days,
            flight:itirandom.results.flights,
            active: active
          };
          if (!angular.equals(user, {})) {
            newitinerary.owner = userid;
          }
          blogFactory.itinerary().save(newitinerary, function (res) {
            blogFactory.form().update({ id: $scope.idform }, {itiid:res._id}, function (form) {
            });
            $state.go('itinerary-map', { destination: destination, id: res._id });
            $uibModalInstance.close();
          },
            function (error) {
              console.log(error);
            });

        }, function (error) {
          console.log(error);
        });
      }else{
        $scope.error = 'Sorry, we still do not have activities to show for this destination (try another one)';
        // console.log('1',$scope.error);
      }
    },function(error){
      $scope.error = 'Sorry, we still do not have activities to show for this destination (try another one!)';
      // console.log('2',error);
    });
    
  }

});

