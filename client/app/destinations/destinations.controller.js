'use strict';

angular.module('blogotripFullstackApp')
  .controller('DestinationsController', DestinationsController);

function DestinationsController($scope, $state, $stateParams, $filter, $window,$rootScope, blogFactory, Auth, toaster,MetaService) {

  var map, infoWindow, markerCluster;
  var markers = [];
  var bounds = new google.maps.LatLngBounds();
  $scope.isLoggedIn = Auth.isLoggedIn();
  $scope.activityResult = [];
  $scope.latitude = 0;
  $scope.longitude = 0;
  $rootScope.state = $state;

  String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };

  blogFactory.getPlaces().get(function (places) {
    $scope.places = places.results;
  },
    function (error) {
      alert('Error getPlaces Main\nDetail: ' + error);
    });

  $scope.getPlaceSelected = function (placeSelected) {
    if (placeSelected.place) {
      blogFactory.getPlaceByName().get({ place: placeSelected.place }, function (places) {
        $scope.place = places.results[0];
        $state.go('destinations', {
          destination: $scope.place.place
        });
      });
    } else {
      $scope.message = "Sorry, we don't have this places in our database, but wait a couple of days and we will"
      toaster1('warning', $scope.message, )

    }

  }

  var setZoomMarker = function (lat, long) {
    var pt = new google.maps.LatLng(lat, long);
    map.setCenter(pt);
    map.setZoom(6);
  }

  var setVisibleMarkers = function (array) {
    array.forEach(function (item) {
      if (item.marker) {
        item.marker.setVisible(true);
      }

    });
  }
  var setInvisibleMarkers = function () {
    $scope.activityResult.forEach(function (item) {
      if (item.marker) {
        item.marker.setVisible(false);
      }

    });
  }

  var processActivity = function (activity, place, marker) {
    
    if ($scope.type.includes('country') || $scope.type.includes('region') || $scope.type.includes('continent')) {
      
      if($scope.placeparams.length == 1){
        $window.document.title = 'Destinations in '+$scope.placeparams[0].replaceAll('-',' ') +' | PlannerTrip';
        //Adding metas/////////////////////////
        var description = 'Destinations in '+$scope.placeparams[0].replaceAll('-',' ');
        
        var keywords = 'destinations, '+$scope.placeparams[0].replaceAll('-',' ');

        $rootScope.metaservice = MetaService;
        $rootScope.metaservice.set(description,keywords);

      }else if($scope.placeparams.length == 2){
        $window.document.title = 'Destinations in '+$scope.placeparams[1].replaceAll('-',' ')+', '+$scope.placeparams[0].replaceAll('-',' ')+' | PlannerTrip';
        //Adding metas/////////////////////////
        var description= 'Destinations in '+$scope.placeparams[1].replaceAll('-',' ')+', '+$scope.placeparams[0].replaceAll('-',' ');
        
        var keywords = 'plannertrip, destinations, '+$scope.placeparams[1].replaceAll('-',' ')+', '+$scope.placeparams[0].replaceAll('-',' ');

        $rootScope.metaservice = MetaService;
        $rootScope.metaservice.set(description,keywords);
      }
      $scope.activityResult = activity.results;
      sortRankAsc($scope.activityResult, 'n_activities');
      sortRankDesc($scope.activityResult, 'n_activities');
      watchingActivities(activity.results);
      if (markers.length == 1) {
        setZoomMarker(lat, long);
        markers[0].setVisible(true);
      }
      $scope.activityResult.forEach(function (item) {
        markers.forEach(function (subitem) {
          if (item.id == subitem.id) {
            item.marker = subitem;
            return;
          }
        });
      });
    } else {
      $window.document.title = 'Itineraries in '+$scope.placeparams[1].replaceAll('-',' ')+', '+$scope.placeparams[0].replaceAll('-',' ') +' | PlannerTrip';
      //Adding metas/////////////////////////
      var description= 'Itineraries in '+$scope.placeparams[1].replaceAll('-',' ')+', '+$scope.placeparams[0].replaceAll('-',' ')+' | PlannerTrip';
      
      var keywords = 'plannertrip, itineraries, itinerary, '+$scope.placeparams[1].replaceAll('-',' ')+', '+$scope.placeparams[0].replaceAll('-',' ');

      $rootScope.metaservice = MetaService;
      $rootScope.metaservice.set(description,keywords);

      $scope.activityResult = activity;
      $scope.activityResult.forEach(function(item){
        //adding form info to each itinerary
        if(item.itilength >1){
          item.itilength = item.itilength+' days';
        }else{
          item.itilength = item.itilength+' day';
        }
        
        blogFactory.getFormByItiId().query({ itiid: item._id }, function (form) {
          if(form.length > 0){
            // console.log('form',form)
            if(form[0].travelers){
              item.form = {travelers:form[0].travelers};
            }
            if(form[0].traveltype.length > 0){
              var traveltypestr='';
              form[0].traveltype.forEach(function(subitem){            
                if(traveltypestr==''){
                  traveltypestr = subitem;
                }else{
                  traveltypestr = traveltypestr+' - '+subitem;
                } 
              item.form.traveltype = traveltypestr;
              });
            }
          }
        });
      });
      // console.log('$scope.activityResult',$scope.activityResult)
      map.setCenter(new google.maps.LatLng($scope.latitude, $scope.longitude));
    }

  }

  var searchActivities = function (place) {

    blogFactory.getPlaceByName().get({ place: place }, function (activity) {
      
      $scope.type = activity.results[0].type;
      $scope.latitude = activity.results[0].lat;
      $scope.longitude = activity.results[0].long;
      $scope.top = 50;
      //For destination (continents, countries, cities)
      if ($scope.type.includes('country') || $scope.type.includes('region') || $scope.type.includes('continent')) {
        blogFactory.getPlacesByPlace().get({ place: place }, function (activity) {
          processActivity(activity, place, 'marker');
          setInvisibleMarkers();
          var activityAllLimit = $filter('limitTo')($scope.activityResult, $scope.top);
          setVisibleMarkers(activityAllLimit);
        });
      }
      //For Itineraries
      else if ($scope.type.includes('city')) {
        blogFactory.getItineraries().query({ place: place }, function (itineraries) {
          // console.log('itineraries',itineraries)
          processActivity(itineraries, place, 'city marker');
          $scope.itineraries = true;
        });
      }
    });
  }

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

  $scope.placeparams = $stateParams.destination.split('_');
  this.paramDest = $scope.placeparams[$scope.placeparams.length - 1].replaceAll('-', ' ')
  $scope.placeSelected = this.paramDest;
  $scope.placeSelected1 = this.paramDest;
  searchActivities(this.paramDest);

  $scope.activityFilter = function (activity) {
    return (activity.place !== $scope.placeSelected1);
  }

  var toaster1 = function (type, text) {
    toaster.pop({
      type: type,
      title: text,
      showCloseButton: true,
      timeout: 3000
    });
  }

  //Routes >> Next destinations////////////////////////////////////////////
  blogFactory.getRoutes().get({ route: this.paramDest }, function (routes) {
    // console.log('routes',routes)
    $scope.routes = routes.results;
  });
  ///////////////////////////////////////////////////////////////////////////


  $scope.categoryname = 'All activities';
  $scope.category = {};
  $scope.category.type = '';

  $scope.filterMarkers = function (category) {

    $scope.top = '';

    if (category == 'all') {
      $scope.category.type = '';
      markers.forEach(function (item) {
        item.setVisible(true);
        if (item.category.includes('marker')) {
          item.setVisible(false);
        }

      });
    } else {
      $scope.category.type = category;
      $scope.categoryname = category;
      markers.forEach(function (item) {
        if (item.category == category) {
          item.setVisible(true);
          if (item.category.includes('marker')) {
            item.setVisible(false);
          }

        }
        else {
          item.setVisible(false);
        }

      });
    }

  }


  //------Start Google Map API-------------


  // init the map
  function initMap() {
    map = new google.maps.Map(document.getElementById('gmaps'), mapOptions);
  }

  var watchingActivities = function (activities) {
    deleteMarkers();
    if (markerCluster) {
      markerCluster.clearMarkers();
    }

    if (activities) {
      activities.forEach(function (item) {
        if (item.lat && item.long) {
          setMarker(map, new google.maps.LatLng(item.lat, item.long),
            item.place, item.description, '', item.type, item.rank,
            item.id, item.photo_reference);
        }
      });

    }

    map.fitBounds(bounds);
  }

  var mapOptions = {
    center: new google.maps.LatLng($scope.latitude, $scope.longitude),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: true,
    gestureHandling: 'greedy',
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

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }

  var iconBase = 'assets/img/markers/';

  // place a marker
  function setMarker(map, position, title, content, n_activities, category, rank, id, photo_reference) {

    var markerOptions;
    var marker = new google.maps.Marker({
      position: position,
      label: n_activities.toString(),
      map: map,
      title: title,
      category: category,
      rank: rank,
      id: id
    });

    if (category.includes('marker')) {
      marker.setVisible(false);
    }

    bounds.extend(marker.position);
    markers.push(marker); // add marker to array

    google.maps.event.addListener(marker, 'click', function () {
      if (infoWindow !== void 0) {
        infoWindow.close();
      }

      if (photo_reference) {
        var photo_ref = '<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=' +
          photo_reference + '&key=AIzaSyA-iCNYt6ham4ygfAp6AAAEUDgJcEgFpvM" width="200">';
      } else {
        var photo_ref = '';
      }

      if ($scope.type.includes('city')) {
        var content_html = '<div id="iw-container">' +
          '<div class="iw-title">' + title +
          '<a style="color:black;padding-left: 40px;" href="/detailactivity/'
          + id + '">Show More</a></div>' +
          '<div class="iw-content">' +
          photo_ref +
          '</div>' +
          '</div>';
      } else {
        var content_html = '<div id="iw-container">' +
          '<div class="iw-title">' + title +
          '</div>' +
          '<div class="iw-content">' +
          photo_ref +
          '</div>' +
          '</div>';
      }

      var infoWindowOptions = {
        content: content_html
      };
      infoWindow = new google.maps.InfoWindow(infoWindowOptions);
      infoWindow.open(map, marker);
    });


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
  //------End Google Map API-------------


}