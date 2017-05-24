'use strict';

angular.module('blogotripFullstackApp')
  .controller('ItineraryMapController', ItineraryMapController);

function ItineraryMapController($scope, $stateParams, $state, $rootScope, $uibModal, $location,
  $timeout, $cookies, $filter, $window, $http, blogFactory, Auth, toaster, MetaService) {

  $scope.user = Auth.getCurrentUser();
  
  // console.log('$scope.user',$scope.user._id)
  // console.log('$stateParams.id',$stateParams.id)
  var idParam = $stateParams.id.split('_');
  $scope.id = idParam[0];
  // console.log('$scope.id',$scope.id)
  $scope.itinerary = {};
  $scope.resultActivity = [];
  var markers = [];
  $rootScope.state = $state;
  // console.log('state public',$rootScope.state);

  var toaster1 = function (type, text) {
    toaster.pop({
      type: type,
      title: text,
      showCloseButton: true,
      timeout: 3000
    });
  }


  //------Search Functionality-------------
  var sortRankDesc = function (array, rank) {
    array.sort(function (a, b) {
      return parseFloat(b[rank]) - parseFloat(a[rank]);
    });
  }
  var sortRankAsc = function (array, rank) {
    array.sort(function (a, b) {
      return parseFloat(a[rank]) - parseFloat(b[rank]);
    });
  }
  var setZoomMarker = function (lat, long) {
    var pt = new google.maps.LatLng(lat, long);
    map.setCenter(pt);
  }
  var setVisibleMarkers = function (array) {
    array.forEach(function (item) {
      if (item.marker) {
        item.marker.setVisible(true);
      }

    });
  }
  var setInvisibleMarkers = function () {
    $scope.resultActivity.forEach(function (item) {
      if (item.marker) {
        item.marker.setVisible(false);
      }
    });
  }

  $scope.setCity = function($model){
    $scope.citySelected = $model;
    // console.log('$scope.citySelected',$scope.citySelected);
  }

  $scope.labelCity = function(cit) {
    if(cit){
      if(cit.country_name){
        return cit.name + ' (' + cit.country_name + ')';
      }else{
        return cit.name;
      }
    }else{
      return;
    }
  };

  //Detecting user iata code and populating cities
  var getUserIataCities = function(){
    blogFactory.me().get({locale:'en'},function(mylocal){
      $scope.citySelected = mylocal;
      $scope.citySelected.iata_code = mylocal.iata;
      // console.log('citySelected',$scope.citySelected);

      //Getting cities with iata
      blogFactory.getCityCodes().get(function (cities) {
        $scope.cities = cities.results;
        $scope.cities.unshift($scope.citySelected);
        // console.log('cities',cities)
      });

    });
  }

  var processActIti = function (itinerary) {

    $scope.itinerary = itinerary;

    //Info for flights tickets///////////////////////////////////////
    $scope.adults = 1;
    $scope.children = 0;
    $scope.infants = 0;
    $scope.ticketclass = "0";
    $scope.departd = $scope.itinerary.startdate.split("T");
    $scope.returnd = $scope.itinerary.enddate.split("T");

    //Detecting user iata code and populating cities
    getUserIataCities();

    //Info for Booking.com accommodation/////////////////////////////////
    $scope.checkin = $scope.departd[0].split("-");
    $scope.checkout = $scope.returnd[0].split("-");
    $scope.rooms = 1;
    $scope.group_adults= $scope.adults;
    $scope.group_children = $scope.children;
    
    //////////////////////////////////////////////////////////////

    $scope.numday3 = 0;
    $rootScope.totalAct = 0;

    //------Share Functionality-------------
    $rootScope.urlshare = window.location.origin + '/public-itinerary/' + $scope.itinerary.name + '&' + $scope.itinerary._id;
    $rootScope.logo = window.location.origin + '/assets/img/logo/plannertrip_logo.svg';
    $rootScope.destination = $scope.itinerary.name;
    $rootScope.ndays = $scope.itinerary.days.length;

    itinerary.activities.forEach(function (item) {
      $rootScope.totalAct += item.activities.length;
    });

    $scope.selectData = {
      availableOptions: [],
      selectedOption: { id: $scope.numday3, name: $scope.numday3 + 1 } //This sets the default value of the select in the ui
    }

    itinerary.days.forEach(function (item) {
      $scope.selectData.availableOptions.push({ id: item.day, name: item.day + 1 })
      if (item.day == 0) {
        item.status = true;
      }
    });
  }

  var loadInitItinerary = function(){
   
    //If user signed in, save user id in itinerary owner
    if (angular.equals($scope.user, {})) {
      blogFactory.itinerary().query({ id: $scope.id }, function (itineraries) {
        // console.log('itinerary no user',itineraries);
        itineraries.forEach(function (itinerary) {
          processActIti(itinerary);
        });
      },
        function (error) {
          console.log(error);
        });
    }
    else{
      if(idParam[1]=='copy'){
        // console.log('is copy')
        blogFactory.itinerary().query({id:$scope.id}, function(itineraries){
          // console.log('itineraries',itineraries)
          itineraries.forEach(function(itinerary){
            // $scope.itinerary = itinerary;
            var newitinerary = {
                name: itinerary.name,
                startdate: itinerary.startdate,
                enddate: itinerary.enddate,
                activities: itinerary.activities,
                days: itinerary.days,
                owner: $scope.user._id,
                flight: itinerary.flight,
                active: false
              };
            
            blogFactory.itinerary().save(newitinerary, function (res) {
              // console.log('copied itinerary',res);
              processActIti(res);
            },
            function (error) {
              console.log(error);
            });
          });
        },
        function(error){
          console.log(error);
        });
      }else{
        // console.log('NO copy')
               
        blogFactory.itinerary().update({ id: $scope.id }, { owner: $scope.user._id, active: false }, function (iti) {
          // console.log('$scope.user._id',$scope.user._id);
          // console.log('update owner itinerary',iti);
          processActIti(iti);       
        },
        function (error) {
          console.log(error);
        });
            
        
      }
      
    }
    
  }

  loadInitItinerary()

  //For Recommendation List (limit to 50 results)/////////////////////////////////////
  var processActivity = function (activity,type) {
    $scope.resultActivity = activity.results;
    if (type.includes('country') || type.includes('region')) {
      sortRankAsc($scope.resultActivity, 'n_activities');
      sortRankDesc($scope.resultActivity, 'n_activities');
    } else {
      sortRankAsc($scope.resultActivity, 'rank');
      sortRankDesc($scope.resultActivity, 'rank');
    }
    $scope.activityAllLimit = $filter('limitTo')($scope.resultActivity, 50);

  }

  var searchActivities = function (place) {

    blogFactory.getPlaceByName().get({ place: place }, function (place) {
      // console.log('place.results[0]',place.results[0])
      var placedata = place.results[0];
      $scope.country = placedata.partOf2;
      setZoomMarker(placedata.lat, placedata.long);
      //When the destination is a country or region (for trip feature [NOT IMPLEMENTED!])
      if (placedata.type.includes('country') || placedata.type.includes('region')) {
        blogFactory.getPlacesByPlace().get({ place: placedata.place }, function (activity) {
          processActivity(activity,placedata.type);
        });
      }
      //When the destination is a city (IMPLEMENTED!)
      else if (placedata.type.includes('city')) {
        blogFactory.getActivities().get({ place: placedata.place }, function (activity) {
          processActivity(activity,placedata.type);
        });
      } else {
        blogFactory.getActivities().get({ place: place }, function (activity) {
          processActivity(activity,placedata.type);
        });
      }
    });
  }

  var place = $stateParams.destination;
  searchActivities(place);


  $scope.goDetailActivity = function (activity) {
    if ($scope.resultActivity) {
      $scope.resultActivity.forEach(function (item) {
        if (item.id == activity.actid) {
          activity.description = item.description
        }
      });
    }

    $scope.detailactivity = activity;
    $scope.opendetail = true;
  }

  // $scope.addActSearch = function (actSelected) {
  //   blogFactory.getActivityById().get({ id: actSelected.actid }, function (activity) {
  //     var actinew = {}
  //     actinew.actid = activity.results[0].actid;
  //     actinew.rank = activity.results[0].rank;
  //     actinew.acttype = activity.results[0].acttype;
  //     actinew.name = activity.results[0].name;
  //     actinew.photo_reference = activity.results[0].photo_reference;
  //     actinew.lat = activity.results[0].lat;
  //     actinew.long = activity.results[0].long;
  //     $scope.activityAllLimit.unshift(actinew);
  //   },
  //     function (error) {
  //       console.log('Error getActivityById\nDetail: ' + error);
  //     });

  // }

  var getActivitiesByCategory = function (category) {
    var activityCategory = [];
    $scope.resultActivity.forEach(function (item) {
      if (item.acttype == category) {
        activityCategory.push(item);
      }
    });
    return activityCategory;
  }


  $scope.checked = false;
  $rootScope.openWish = function () {
    // console.log('aqui',y);
    $scope.checked = !$scope.checked;
  }

  $rootScope.filterCategory = function (category) {
    $scope.category = category;
    $scope.checked = false;
    $scope.open = true;
    if (category == 'all') {
      $scope.activityAllLimit = $filter('limitTo')($scope.resultActivity, 100);
      setMarkerItinerary($scope.itinerary, $scope.activityAllLimit);
    }
    else if (category == 'none') {
      $scope.open = false;
      markers.forEach(function (item) {
        if (item.day == 999999) {
          item.setVisible(false);
          // markers.splice(markers.indexOf(item), 1);
        }
      });
    }
    else {
      $scope.activityAllLimit = $filter('limitTo')(getActivitiesByCategory(category), 50);
      setMarkerItinerary($scope.itinerary, $scope.activityAllLimit);
    }

  }

  $scope.closeActivities = function () {
    $scope.open = false;
    $rootScope.filterCategory('none');
  }

  var getItiRandom = function () {
    var userid = ''
    var active = true
    if (!angular.equals($scope.user, {})) {
      userid = $scope.user._id;
      active = false
    }
    blogFactory.getItineraryRandom().get({ place: $stateParams.destination, days: $scope.numdays }, function (itirandom) {
      var newitinerary = {
        name: $stateParams.destination,
        startdate: $scope.itinerary.startdate,
        enddate: $scope.itinerary.enddate,
        activities: $scope.itinerary.activities,
        days: itirandom.results.days,
        flight:itirandom.results.flights,
        active: active
      };
      if (!angular.equals($scope.user, {})) {
        newitinerary.owner = userid;
      }
      updateItinerary(newitinerary);

    }, function (error) {
      console.log(error);
    });
  }

  var saveDaysItinerary = function (array) {
    blogFactory.itinerary().update({ id: $scope.itinerary._id }, { days: array }, function () {
    },
      function (error) {
        console.log('Error updating days itinerary\nDetail: ' + error);
      });
  }

  $scope.saveDays = function () {
    if (!$scope.numdays) {
      return;
    }
    else if ($scope.numdays < 0) {
      toaster1('warning', 'Please, enter a number greater than 0');
      return;
    }
    else if ($scope.numdays == $scope.itinerary.days.length) {
      $scope.numdays = '';
      return;
    }
    else if ($scope.numdays > $scope.itinerary.days.length) {
      getItiRandom();
      $timeout(function () {
        location.reload();
      }, 5000);

    }
    else if ($scope.numdays < $scope.itinerary.days.length) {
      $scope.itinerary.days.splice($scope.numdays, $scope.itinerary.days.length - 1);
      saveDaysItinerary($scope.itinerary.days);
      $scope.viewMarkersDay($scope.numdays - 1);
      $scope.numdays = '';
    }
  }

  var updateItinerary = function (itinerary) {
    blogFactory.itinerary().update({ id: $scope.itinerary._id }, itinerary, function () {
    },
      function (error) {
        console.log('Error updating itinerary\nDetail: ' + error);
      });
  }

  var setTitleMeta = function(){
    var description='';
      if($scope.numdays2 > 1){
        //Adding title/////////////////////////
        $window.document.title = $scope.numdays2+' days Itinerary in '+$stateParams.destination+', '+$scope.country+' | PlannerTrip';
        //Adding metas/////////////////////////
        description= $scope.numdays2+' days Itinerary in '+$stateParams.destination+', '+$scope.country+' | PlannerTrip';      
      }
      else{
        //Adding title/////////////////////////
        $window.document.title = $scope.numdays2+' day Itinerary in '+$stateParams.destination+', '+$scope.country+' | PlannerTrip';
        //Adding metas/////////////////////////
        description= $scope.numdays2+' day Itinerary in '+$stateParams.destination+', '+$scope.country+' | PlannerTrip';
      }
      
      var keywords = $stateParams.destination+', '+$scope.country+', '+$scope.numdays2+' days, '+$scope.numdays2+' day, '+'plannertrip, itinerary, Food & Drink, Accommodation, Sightseeing, Things to do, Shopping, destination, activities';

      $rootScope.metaservice = MetaService;
      $rootScope.metaservice.set(description,keywords);
  }

  $scope.$watch('mode', function (value) {

    if (value) {
      $scope.mode = value;
    } else {
      $scope.mode = 'DRIVING';
    }
    if ($scope.itinerary && !angular.equals($scope.itinerary, {})) {
      setRoutes($scope.itinerary.days, $scope.numday3, $scope.mode);
    }

  });

  $scope.$watch('itinerary', function (value) {

    if ($scope.itinerary && !angular.equals($scope.itinerary, {})) {
      var updateiti = {
        name: value.name,
        owner: value.owner,
        startdate: value.startdate,
        enddate: value.enddate,
        activities: value.activities,
        days: value.days,
        active: value.active
      };
      $scope.itinerary.days.forEach(function (item) {
        if (item.activities.length == 2) {
          item.activities.forEach(function (subitem) {
            if (!subitem.name) {
              item.activities.splice(item.activities.indexOf(subitem), 1);
              return;
            }
          });
        }
        else if (item.activities.length == 0) {
          item.activities.push({});
          return;
        }
      });
      updateItinerary(updateiti);
      setMarkerItinerary(updateiti, $scope.activityAllLimit);
      setRoutes($scope.itinerary.days, $scope.numday3, $scope.mode);
      $scope.numdays2 = $scope.itinerary.days.length;

      $timeout(function(){
      //timeout because $scope.country has some delays
        setTitleMeta();
      },3000)
      
      if ($scope.category) {
        $rootScope.filterCategory($scope.category);
      } else {
        $rootScope.filterCategory('none');
      }
      $rootScope.totalAct = 0;
      $scope.itinerary.activities.forEach(function (item) {
        $rootScope.totalAct += item.activities.length;
      });

    }
  }, true);

 $scope.$watch('user', function (value) {
    $scope.user = Auth.getCurrentUser();
    // console.log('$scope.user 2',$scope.user._id) 
 });

  $scope.deleteActActivities = function (activity) {
    $scope.itinerary.activities.forEach(function (item) {
      item.activities.forEach(function (subitem) {
        if (subitem == activity) {
          item.activities.splice(item.activities.indexOf(activity), 1);
          return;
        }
      });
    });

  }

  $scope.deleteActDays = function (activity) {
    $scope.itinerary.days.forEach(function (item) {
      item.activities.forEach(function (subitem) {
        if (subitem == activity) {
          item.activities.splice(item.activities.indexOf(activity), 1);
          return;
        }
      });
    });
  }

  $scope.label = function(act) {
    if(act){
      if(act.type){
        return act.name + ' (' + act.type + ')';
      }else{
        return act.name;
      }
    }else{
      return;
    }
  };

  

  var addUnique = function (activity, day) {
    var push = true;
    $scope.itinerary.days.forEach(function (item) {
      if (item.day == day) {
        item.activities.forEach(function (subitem) {
          if (activity == subitem) {
            push = false;
          }
        });
        if (push) {
          item.activities.push(activity);
          var numd = day+1;
          toaster1('success','Added new '+activity.acttype+' activity to day '+ numd);
        }
        return;
      }

    });


  }

  $scope.favoriteAct = function (activity) {

    $scope.itinerary.activities.forEach(function (item) {
      if (activity.acttype == 'Sightseeing' || activity.acttype == 'Things to do') {
        if (item.acttype == 'Attractions') {
          // addUnique(activity, item);
          item.activities.unshift(activity);
          toaster1('success','Added new '+activity.acttype+' activity to your wish list');
        }
      }
      else if (item.acttype == activity.acttype) {
        // addUnique(activity, item);
        item.activities.unshift(activity);
        toaster1('success','Added new '+activity.acttype+' activity to your wish list');
      }
    });
    $scope.open = false;
    $scope.opendetail = false;
    $scope.closeActivities();
  }

  $scope.addActItinerary = function (activity, day) {
    addUnique(activity, day);
    $scope.itinerary.activities.forEach(function (item) {
      item.activities.forEach(function (subitem) {
        if (activity.actid == subitem.actid) {
          item.activities.splice(item.activities.indexOf(subitem), 1);
        }
      });
    });
    $scope.open = false;
    $scope.opendetail = false;
    $scope.actSelected = '';
    $scope.closeActivities();
  }

  $scope.openModalNewAct = function (day) {

    var modalMyInstance = $uibModal.open({
      templateUrl: 'app/itinerary/externalact/externalact.html',
      controller: 'NewExternalActCtrl',
      controllerAs: 'newextCtr',
      //size: size,
      resolve: {
        itinerary: function () {
          return $scope.itinerary;
        },
        numday: function(){
          return day.day;
        }
      }
    });

    modalMyInstance.result.then(function (ext) {
      
      $scope.itinerary.days.forEach(function (item) {
        if(item.day == day.day){
          item.activities.unshift(ext.actext);
          // console.log(item.activities)
        }
      });
      
      
    }, function () {
    });
  };

  //------Start Google Map API-------------
  var map, infoWindow, markerCluster;
  var bounds = new google.maps.LatLngBounds();
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var iwArray =[];

  // init the map
  function initMap() {
    map = new google.maps.Map(document.getElementById('gmaps'), mapOptions);
  }

  $scope.markerBounce = function (activity) {
    markers.forEach(function (item) {
      if (item.id == activity.actid) {
        item.setAnimation(google.maps.Animation.BOUNCE);
      }
    });
  }

  $scope.markerStopBounce = function (activity) {
    markers.forEach(function (item) {
      if (item.id == activity.actid) {
        item.setAnimation(null);
      }
    });
  }

  var setRoutes = function (daysArray, selectnumday, mode) {
    directionsDisplay.set('directions', null);
    directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
    directionsDisplay.setMap(map);
    var latorig;
    var longorig;
    var latdest;
    var longdest;
    var waypts = [];
    var i;

    daysArray.forEach(function (item) {
      if (item.day == selectnumday) {
        for (i = 0; i < item.activities.length; i++) {
          if (i == 0) {
            latorig = parseFloat(item.activities[0].lat);
            longorig = parseFloat(item.activities[0].long);
          }
          else if (i == item.activities.length - 1) {
            latdest = parseFloat(item.activities[i].lat);
            longdest = parseFloat(item.activities[i].long);
          } else {
            waypts.push({ location: new google.maps.LatLng(parseFloat(item.activities[i].lat), parseFloat(item.activities[i].long)) });

          }
        }
        return;
      }

    });

    directionsService.route({
      origin: { lat: latorig, lng: longorig },
      destination: { lat: latdest, lng: longdest },
      waypoints: waypts,
      travelMode: google.maps.TravelMode[mode]
    }, function (response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        // console.log(response)
        $scope.$apply(function () {
          $scope.routerror = undefined;
          $scope.totalDist = computeTotalDistance(response);
          $scope.totalDur = secondsToHms(computeTotalDuration(response));
          // console.log(mode+':'+$scope.totalDist +'/'+ $scope.totalDur)
        });
      } else {
        directionsDisplay.setMap(null);
        $scope.$apply(function () {
          $scope.routerror = status;
        // toaster1('danger','Directions request failed due to '+ status);
        });
        // console.log('Directions request failed due to ' + status);
      }
    });

  }

  var computeTotalDistance = function (result) {
    // console.log('result',result);
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    // console.log('dist',total)
    return total;
  }

  var computeTotalDuration = function (result) {
    // console.log('result',result);
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
      // console.log('each leg',myroute.legs[i].duration.value)
      total += myroute.legs[i].duration.value;
    }
    // total = total / 3600;
    // console.log('sec',total)
    return total;
  }

  var secondsToHms = function (d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var hDisplay = h > 0 ? h + (h == 1 ? "h:" : "h:") : "0h:";
    var mDisplay = m > 0 ? m + (m == 1 ? "m" : "m") : "0m";
    var sDisplay = s > 0 ? s + (s == 1 ? " " : " ") : "";
    return hDisplay + mDisplay;
  }

  var setMarkerItinerary = function (itinerary, activities) {
    deleteMarkers();
    //This creates markers for wish list activities
    itinerary.activities.forEach(function (item) {
      item.activities.forEach(function (subitem) {
        if (subitem.lat && subitem.long) {
          setMarker(map, subitem.lat, subitem.long,
            subitem.name, subitem.name, '', subitem.acttype, subitem.rank,
            subitem.actid, subitem.photo_reference, 'wish', -1);
        }
      });
    });
    //this creates markers for day activities in itinerary
    itinerary.days.forEach(function (item) {
      item.activities.forEach(function (subitem) {
        if (subitem.lat && subitem.long) {
          setMarker(map, subitem.lat, subitem.long,
            subitem.name, subitem.name, '', subitem.acttype, subitem.rank,
            subitem.actid, subitem.photo_reference, 'day', item.day);
        }
      });
    });
    //this creates markers for recommendations by category (filters)
    if (activities) {
      activities.forEach(function (item) {
        if (item.lat && item.long) {
          if (item.type.includes('region') || item.type.includes('city')) {
            setMarker(map, item.lat, item.long,
              item.place, item.description, item.n_activities, item.type,
              item.rank, item.id, item.photo_reference, 'activities', 999999);
          } else {
            setMarker(map, item.lat, item.long,
              item.title, item.description, '', item.type, item.rank,
              item.id, item.photo_reference, 'activities', 999999);
          }
        }
      });

    }
    map.fitBounds(bounds);
  }

  var mapOptions = {
    center: new google.maps.LatLng(34.397, 150.644),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: true,
    gestureHandling: 'cooperative',
    mapTypeControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  };

  var iconBase = 'assets/img/markers/';

  // place a marker
  function setMarker(map, lat, long, title, content, n_activities,
    category, rank, id, photo_reference, type, day) {

    var markerOptions;

    var iconImage = function () {
      if (category == 'Accommodation') {
        if (type == 'wish' || type == 'day') {
          return 'lodging-2.png';
        }
        if (type == 'activities') {
          return 'lodging-2_opac.png';
        }
      } else if (category == 'Food & Drink') {
        if (type == 'wish' || type == 'day') {
          return 'restaurant.png';
        }
        if (type == 'activities') {
          return 'restaurant_opac.png';
        }
      } else if (category == 'Things to do') {
        if (type == 'wish' || type == 'day') {
          return 'thingstodo.png';
        }
        if (type == 'activities') {
          return 'thingstodo_opac.png';
        }
      } else if (category == 'Sightseeing') {
        if (type == 'wish' || type == 'day') {
          return 'sight2.png';
        }
        if (type == 'activities') {
          return 'sight2_opac.png';
        }
      } else if (category == 'Shopping') {
        if (type == 'wish' || type == 'day') {
          return 'mall.png';
        }
        if (type == 'activities') {
          return 'mall_opac.png';
        }
      } else {
        return '';
      }
    }

    var iconImageCategory = iconImage();

    if (iconImageCategory != '') {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        map: map,
        title: title,
        label: n_activities.toString(),
        category: category,
        icon: iconBase + iconImage(category),
        rank: rank,
        id: id,
        type: type,
        day: day
      });
    } else {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        map: map,
        title: title,
        label: n_activities.toString(),
        category: category,
        rank: rank,
        id: id,
        type: type,
        day: day
      });
    }

    if (category.includes('marker')) {
      marker.setVisible(false);
    }

    if (day != $scope.numday3) {
      if (type != 'activities' && type != 'wish') {
        marker.setVisible(false);
      }
    }

    if (type == 'day' || type == 'wish') {
      bounds.extend(marker.position);
    }

    markers.push(marker); // add marker to array

    google.maps.event.addListener(marker, 'click', function () {

      var actinew = {}
      actinew.actid = id;
      actinew.rank = rank;
      actinew.acttype = category;
      actinew.name = title;
      actinew.photo_reference = photo_reference;
      actinew.lat = lat;
      actinew.long = long;
      $scope.$apply(function(){
        $scope.goDetailActivity(actinew);
      });
    });

    var protime;
    google.maps.event.addListener(marker, 'mouseover', function () {
      // console.log('click')

      // if (infoWindow !== void 0) {
      //   // console.log('aqui',infoWindow)
      //     infoWindow.close();
      // }
      protime = $timeout(function(){
        if (photo_reference) {
          var photo_ref = '<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference=' +
          photo_reference + '&key=AIzaSyA-iCNYt6ham4ygfAp6AAAEUDgJcEgFpvM" width="80">';
        } else {
          var photo_ref = '';
        }

        var label = ''
        if (category == 'Accommodation') {
          label = ' <span class="label label-accommodation">' + category + '</span>';
        } else if (category == 'Food & Drink') {
          label = ' <span class="label label-food">' + category + '</span>';
        } else if (category == 'Things to do') {
          label = ' <span class="label label-thingsdo">' + category + '</span>';
        } else if (category == 'Sightseeing' && type == 'day') {
          label = ' <span class="label label-sightseeing">' + category + '</span>';
        } else if (category == 'Shopping' && type == 'day') {
          label = ' <span class="label label-shopping">' + category + '</span>';
        }

        var content_html = '<div id="iw-container">' +
          '<div class="iw-title"><b>' + title +
          '</b></div><div class="iw-content">' +
          photo_ref +
          label +
          ' Ranking: <strong>' + rank + '</strong> <img src="assets/img/google13x13.png" alt=""></div></div>';

        var infoWindowOptions = {
          content: content_html
        };
        infoWindow = new google.maps.InfoWindow(infoWindowOptions);
        infoWindow.open(map, marker);
        iwArray.push(infoWindow);
        // console.log('si',iwArray)
      },1000);
      
    });

    google.maps.event.addListener(marker, 'mouseout', function () {
      $timeout.cancel(protime);   
      iwArray.forEach(function(item){
        item.close();
      });
      iwArray = [];
    });

    google.maps.event.addListener(marker, 'dblclick', function () {
      var actinew = {}
      actinew.actid = id;
      actinew.rank = rank;
      actinew.acttype = category;
      actinew.name = title;
      actinew.photo_reference = photo_reference;
      actinew.lat = lat;
      actinew.long = long;
      // $scope.goDetailActivity(actinew);
      $scope.addActItinerary(actinew, $scope.numday3);

      
      setRoutes($scope.itinerary.days, $scope.numday3, $scope.mode);
      setMarkerItinerary($scope.itinerary, $scope.activityAllLimit);

      $scope.filterCategory('none');
      // alert('something')

    });

    google.maps.event.addListener(marker, 'rightclick', function () {
      var actinew = {}
      actinew.actid = id;
      actinew.rank = rank;
      actinew.acttype = category;
      actinew.name = title;
      actinew.photo_reference = photo_reference;
      actinew.lat = lat;
      actinew.long = long;
      // // $scope.goDetailActivity(actinew);
      // $scope.addActItinerary(actinew,$scope.numday3);

      // alert('rightclick')
      $scope.favoriteAct(actinew);

     
      setRoutes($scope.itinerary.days, $scope.numday3, $scope.mode);
       setMarkerItinerary($scope.itinerary, $scope.activityAllLimit);
      $scope.filterCategory('none');

    });

    

  }

  $scope.gotoTop = function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  }

  $scope.viewMarkersDay = function (day) {

    $scope.numday3 = day;
    if (infoWindow !== void 0) {
      infoWindow.close();
    }
    $scope.opendetail = false;
    $scope.checked = false;
    $scope.itinerary.days.forEach(function (item) {
      if (item.status) {
        item.status = false;
      }
    });
    $scope.numday3 = day;
    $scope.open = false;
    $scope.selectData.selectedOption = { id: day, name: day + 1 }
    $scope.itinerary.days[day].status = true;
    // if (infoWindow !== void 0) {
    //   infoWindow.close();
    // }
    markers.forEach(function (item) {
      if (item.type == 'day') {
        if (item.day == $scope.numday3) {
          item.setVisible(true);
        } else {
          item.setVisible(false);
        }
      }
    });
    directionsDisplay.setMap(null);
    setRoutes($scope.itinerary.days, $scope.numday3, $scope.mode);

  }

  // show the map and place some markers
  initMap();

  // Sets the map on all markers in the array.
  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    setMapOnAll(null);
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }

}


angular.module('blogotripFullstackApp').controller('NewExternalActCtrl', function ($scope, $uibModalInstance, blogFactory, itinerary,numday) {

  $scope.itinerary = itinerary;
  $scope.numday =numday;
  $scope.ext = {};

  $scope.ok = function () {

    if ($scope.extname) {
      $scope.ext.actext = { actid: -1, acttype: '', rank: '', name: '', photo_reference: '', lat: '', long: '', ext: true };
      $scope.ext.actext.name = $scope.extname;
      $scope.ext.actext.lat = $scope.extlink;
    }
    if ($scope.extlink && !$scope.extname) {
      $scope.ext.actext = { actid: -1, acttype: '', rank: '', name: '', photo_reference: '', lat: '', long: '', ext: true };
      $scope.ext.actext.name = 'Default';
      $scope.ext.actext.lat = $scope.extlink;
    }
    // if ($scope.actSelected) {
    //   $scope.ext.actinew = { actid: 0, acttype: '', rank: '', name: '', photo_reference: '', lat: '', long: '' };
    //   blogFactory.getActivityById().get({ id: $scope.actSelected.actid }, function (activity) {
    //     // console.log('activity',activity);
    //     $scope.ext.actinew.actid = activity.results[0].actid;
    //     $scope.ext.actinew.rank = activity.results[0].rank;
    //     $scope.ext.actinew.acttype = activity.results[0].acttype;
    //     $scope.ext.actinew.name = activity.results[0].name;
    //     $scope.ext.actinew.photo_reference = activity.results[0].photo_reference;
    //     $scope.ext.actinew.lat = activity.results[0].lat;
    //     $scope.ext.actinew.long = activity.results[0].long;
    //   },
    //     function (error) {
    //       console.log('Error getActivityById\nDetail: ' + error);
    //     });
    // }
    $uibModalInstance.close($scope.ext);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});