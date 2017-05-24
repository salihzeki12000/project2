'use strict';

angular.module('blogotripFullstackApp')
    .controller('PublicItineraryController', PublicItineraryController);

function PublicItineraryController($scope, $state, $timeout, $location, $stateParams, $window, $rootScope, blogFactory, Auth, toaster,MetaService) {

  $scope.user = Auth.getCurrentUser();
  $scope.absUrl = $location.absUrl();
  $scope.itinerary= {};
  var markers = [];
  $rootScope.state = $state;
  $scope.isLoggedIn = Auth.isLoggedIn;
  // console.log('state public',$rootScope.state);

  var placeparam = $stateParams.destination.split("&");
  $scope.place = placeparam[0];
  $scope.id = placeparam[1];


  var message = function(type,text){
  toaster.pop({
      type: type,           
      title: text,
      showCloseButton: true,
      timeout: 3000
    });
  }

  

  var setTitleMeta = function(){
    blogFactory.getPlaceByName().get({ place: $scope.place }, function (place) {
      // console.log('place',place)
      var placedata = place.results[0];
      $scope.country = placedata.partOf2;

      var description = '';
      if($scope.itilength > 1){
        //Adding title/////////////////////////
        $window.document.title = $scope.itilength+' days Itinerary in '+$scope.place+', '+$scope.country+' | PlannerTrip';
        //Adding metas/////////////////////////
        description= $scope.itilength+' days Itinerary in '+$scope.place+', '+$scope.country+' | PlannerTrip'; 

      }
      else{
        //Adding title/////////////////////////
        $window.document.title = $scope.itilength+' day Itinerary in '+$scope.place+', '+$scope.country+' | PlannerTrip';
        //Adding metas/////////////////////////
        description= $scope.itilength+' day Itinerary in '+$scope.place+', '+$scope.country+' | PlannerTrip';
      }
      
      var keywords=$scope.place+', '+$scope.country+', '+$scope.itilength+' days, '+$scope.itilength+' day, '+'plannertrip, itinerary, Food & Drink, Accommodation, Sightseeing, Things to do, Shopping, destination, activities';

      $rootScope.metaservice = MetaService;
      $rootScope.metaservice.set(description,keywords);
    });
  }

  var setNumDays = function(){
    $scope.selectData = {
      availableOptions: [],
      selectedOption: { id: 0, name: 1 } //This sets the default value of the select in the ui
    }

    $scope.itinerary.days.forEach(function (item) {
      $scope.selectData.availableOptions.push({ id: item.day, name: item.day + 1 })
      if (item.day == 0) {
        item.status = true;
      }
    });
  }

  $scope.gotoTop = function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  }

  blogFactory.itinerary().query({id:$scope.id}, function(itineraries){
    itineraries.forEach(function(itinerary){
      $scope.itinerary = itinerary;
      $scope.itilength = itinerary.days.length;
      setNumDays();
      setMarkerItinerary($scope.itinerary);
      $scope.viewMarkersDay(0);
      setTitleMeta();
      //------Share Functionality-------------
      $rootScope.urlshare = window.location.origin + '/public-itinerary/' + $scope.itinerary.name + '&' + $scope.itinerary._id;
      $rootScope.logo = window.location.origin + '/assets/img/logo/plannertrip_logo.svg';
      $rootScope.destination = $scope.itinerary.name;
      $rootScope.ndays = $scope.itinerary.days.length;
    });
  },
  function(error){
    console.log(error);
  });

  

  $scope.goDetailActivity = function (activity) {
    blogFactory.getActivityById().get({id:activity.actid}, function (activity) {
      $scope.detailactivity = activity.results[0];
      $scope.opendetail = true;
      
    });
  }

  $scope.copyitinerary = function () {
    var user = Auth.getCurrentUser();
    if (angular.equals(user, {})) {
        message('danger', 'Login with Gmail to copy this itinerary in your account');
        return;
    }
    var newitinerary = {
          name: $scope.itinerary.name,
          owner: user._id,
          activities: $scope.itinerary.activities,
          days: $scope.itinerary.days
        };
    blogFactory.itinerary().save(newitinerary, function (res) {
      $state.go('itinerary-map', {destination: $scope.itinerary.name, id: res._id});
    },
    function (error) {
      console.log(error);
    });
  }

  $scope.$watch('mode', function (value) {

    if (value) {
      $scope.mode = value;
    } else {
      $scope.mode = 'DRIVING';
    }
    if ($scope.itinerary && !angular.equals($scope.itinerary, {})) {
      setRoutes($scope.itinerary.days, $scope.numday, $scope.mode);
    }

  });

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

  var setMarkerItinerary = function (itinerary) {
    deleteMarkers();
    
    itinerary.days.forEach(function (item) {
      item.activities.forEach(function (subitem) {
        if (subitem.lat && subitem.long) {
          setMarker(map, subitem.lat, subitem.long,
            subitem.name, subitem.name, '', subitem.acttype, subitem.rank,
            subitem.actid, subitem.photo_reference, 'day', item.day);
        }
      });
    });
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

  }

  $scope.gotoTop = function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  }

  $scope.viewMarkersDay = function (day) {

    $scope.numday = day;
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
    $scope.numday = day;
    $scope.open = false;
    $scope.selectData.selectedOption = { id: day, name: day + 1 }
    $scope.itinerary.days[day].status = true;
    // if (infoWindow !== void 0) {
    //   infoWindow.close();
    // }
    markers.forEach(function (item) {
      if (item.type == 'day') {
        if (item.day == $scope.numday) {
          item.setVisible(true);
        } else {
          item.setVisible(false);
        }
      }
    });
    directionsDisplay.setMap(null);
    setRoutes($scope.itinerary.days, $scope.numday, $scope.mode);

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


