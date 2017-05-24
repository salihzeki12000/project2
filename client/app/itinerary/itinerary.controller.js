'use strict';

angular.module('blogotripFullstackApp')
  .controller('ItineraryController', ItineraryController);

function ItineraryController($scope, $stateParams, $state, $uibModal, $location,
  $timeout, $cookies, blogFactory, Auth, toaster) {

  $scope.user = Auth.getCurrentUser();
  $scope.id = $stateParams.id;
  $scope.accommodation = [];
  $scope.shopping = [];
  $scope.fooddrink = [];
  $scope.thingsdo = [];
  $scope.sightseeing = [];
  $scope.itinerary = {};

  var toaster1 = function (type, text) {
    toaster.pop({
      type: type,
      title: text,
      showCloseButton: true,
      timeout: 3000
    });
  }

  var curStep = $cookies.get('BlogotripTour');
  if (typeof curStep === 'string')
    curStep = parseInt(curStep);
  $scope.currentStep = curStep || 0;

  $scope.postStepCallback = function () {
    $cookies.put('BlogotripTour', $scope.currentStep);
  };

  var processActIti = function (itinerary) {
    $scope.itinerary = itinerary;
    $scope.numday3 = 0;
    // $scope.viewMarkersDay($scope.numday3);
    $scope.urlshare = window.location.origin + '/public-itinerary/' + $scope.itinerary.name + '&' + $scope.itinerary._id;
    $scope.itinerary.days.forEach(function(item){
      if(item.day == 0){
        item.status = true;
      }
    });

    blogFactory.getActIti().get({ place: $scope.itinerary.name }, function (actitis) {
      $scope.actitis = actitis.results;
    },
      function (error) {
        console.log(error);
      });
  }

  if (angular.equals($scope.user, {})) {
    if ($scope.id) {
      blogFactory.itinerary().query({ id: $scope.id }, function (itineraries) {
        itineraries.forEach(function (itinerary) {
          processActIti(itinerary);
        });
      },
        function (error) {
          console.log(error);
        });
    }
    else {
      $location.path('/');
    }
  }
  else {
    blogFactory.getItineraryOwner().query({ owner: $scope.user._id },
      function (itineraries) {
        itineraries.forEach(function (itinerary) {
          processActIti(itinerary);
        });
      },
      function (error) {
        console.log(error);
      });
  }

  $scope.itiPublic = function () {
    blogFactory.itinerary().update({ id: $scope.itinerary._id }, { active: true }, function (iti) {
      console.log(iti);
    },
      function (error) {
        console.log('Error itinerary public\nDetail: ' + error.message);
      });
  }

  $scope.itiPrivate = function () {
    blogFactory.itinerary().update({ id: $scope.itinerary._id }, { active: false }, function (iti) {
      console.log(iti);
    },
      function (error) {
        console.log('Error itinerary private\nDetail: ' + error.message);
      });
  }

  $scope.itiupdate = false;
  var updateItinerary = function (itinerary) {
    blogFactory.itinerary().update({ id: $scope.itinerary._id }, itinerary, function () {
      $scope.itiupdate = true;
    },
      function (error) {
        console.log('Error updating itinerary\nDetail: ' + error);
      });
  }

  $scope.$watch('mode',function(value){

    if(value){
      $scope.mode = value;
    }else{
      $scope.mode = 'DRIVING';
    }
    // console.log('$scope.mode',$scope.mode);
    if($scope.itinerary){
      // console.log('aqui')
      setRoutes($scope.itinerary.days,$scope.numday3,$scope.mode);
    }
    
  });

  $scope.$watch('itinerary', function (value) {

    if($scope.itinerary){
      var updateiti = {
        name: value.name,
        owner: value.owner,
        startdate: value.startdate, 
        enddate: value.enddate,
        activities: value.activities,
        days: value.days,
        active:value.active
      };        
      updateItinerary(updateiti);
      setMarkerItinerary(updateiti);
      $scope.numdays2 = $scope.itinerary.days.length;
      setRoutes($scope.itinerary.days,$scope.numday3,$scope.mode);
    }
  }, true);


  $scope.goBack = function () {
    window.history.back();
  }

  $scope.goDetailActivity = function (activity) {
    if (activity.id) {
      $state.go('detailactivity', { activity: activity.id + '&' + activity.lat + '&' + activity.long });
    }
    if (activity.actid) {
      $state.go('detailactivity', { activity: activity.actid + '&' + activity.lat + '&' + activity.long });
    }
  }


  $scope.deleteActActivities = function (activity) {
    $scope.itinerary.activities.forEach(function(item){
      item.activities.forEach(function(subitem){
        if(subitem == activity){
          item.activities.splice(item.activities.indexOf(activity), 1);
          return;
        }
      });
      
    });
    
  }
  
  $scope.deleteActDays = function (activity) {
    $scope.itinerary.days.forEach(function(item){
      item.activities.forEach(function(subitem){
        if(subitem == activity){
          item.activities.splice(item.activities.indexOf(activity), 1);
          return;
        }
      });
    });
  }

  $scope.clearDaysActivities = function () {
      $scope.itinerary.days = [];
      $scope.itinerary.days.push({ day: 0, activities: [] });
  }

  $scope.clearActActivities = function () {
   $scope.itinerary.activities=[];
  }
  
  $scope.toggle = function () {
    $scope.checked = !$scope.checked
  }

  $scope.isloggin = function(event){
    if (angular.equals($scope.user, {})) {
      // event.stopPropagation();
      event.preventDefault(); 
        toaster1('danger', 'Login with Gmail to make private and personalize this itinerary');
        console.log('no');
        $scope.disabletoggle = true;
        
    }else{
      console.log('si');
      $scope.disabletoggle = false;
      if($scope.itinerary.active){
        $scope.itiPublic();  
      }else{
        $scope.itiPrivate();      
      }
    }

  }

  var saveDaysItinerary = function(array){
    blogFactory.itinerary().update({ id: $scope.itinerary._id }, {days:array}, function () {
    },
      function (error) {
        console.log('Error updating days itinerary\nDetail: ' + error);
      });
  }

  var getItiRandom = function(){
    if (angular.equals($scope.user, {})) {
      blogFactory.getItineraryRandom().get({ place: $scope.itinerary.name, days: $scope.numdays }, function (itirandom) {
        var newitinerary = {
          name: $scope.itinerary.name,
          startdate: $scope.itinerary.startdate, 
          enddate: $scope.itinerary.enddate,  
          activities: itirandom.results.activities,
          days: itirandom.results.days,          
          active: true
        };

        updateItinerary(newitinerary);

      }, function (error) {
        console.log(error);
      });
    }
    else {
      blogFactory.getItineraryRandom().get({ place: $scope.itinerary.name, days: $scope.numdays }, function (itirandom) {
        var newitinerary = {
          name: $scope.itinerary.name,
          owner: $scope.user._id,
          startdate: $scope.itinerary.startdate, 
          enddate: $scope.itinerary.enddate,
          activities: itirandom.results.activities,
          days: itirandom.results.days
        };

        updateItinerary(newitinerary);

      }, function (error) {
        console.log(error);
      });
    }
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
        $scope.numdays='';
        return;
      }
      else if ($scope.numdays > $scope.itinerary.days.length) {      
       getItiRandom();
       $timeout(function(){
         location.reload();
       },5000);
       
      }
      else if ($scope.numdays < $scope.itinerary.days.length) {      
        $scope.itinerary.days.splice($scope.numdays,$scope.itinerary.days.length-1);
        saveDaysItinerary($scope.itinerary.days);
        $scope.viewMarkersDay($scope.numdays-1);
        $scope.numdays='';
      }
    }

  $scope.openMyModal = function (name, num, type) {

    var modalMyInstance = $uibModal.open({
      templateUrl: 'app/itinerary/externalact/externalact.html',
      controller: 'ExternalActCtrl',
      controllerAs: 'extCtr',
      //size: size,
      resolve: {
        itinerary: function () {
          return $scope.itinerary;
        },
        activities: function () {
          return $scope.actitis;
        }
      }
    });

    modalMyInstance.result.then(function (ext) {
      // console.log('ext',ext);
      var newactivity = {acttype:'New Activities',status:true,activities:[]};
      var isNewAct = false;
      $scope.itinerary.activities.forEach(function (item) {
        if(item.acttype =="New Activities"){
          // console.log('one');
          if(ext.actext){
            // console.log('ext.actext',ext.actext);
            item.activities.unshift(ext.actext);
          }
          if (ext.actinew) {
            // console.log('ext.actinew',ext.actinew);
            item.activities.unshift(ext.actinew);
          }
          item.status = true;
          isNewAct = true;
        }
        
      });

      if(!isNewAct){
          // console.log('aqui');
          if(ext.actext){
            newactivity.activities.unshift(ext.actext);
          }
          if(ext.actinew){
            newactivity.activities.unshift(ext.actinew);
          }
          // newactivity.activities.splice(1,newactivity.activities.length-1);
          $scope.itinerary.activities.unshift(newactivity);
        }
      
      
    }, function () {
    });
  };

   //------Start Google Map API-------------
  var map, infoWindow, markerCluster;
  var markers = [];
  var bounds = new google.maps.LatLngBounds();
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  
  // init the map
  function initMap() {
    map = new google.maps.Map(document.getElementById('gmaps'), mapOptions);
    
  }

  var setRoutes = function(daysArray,selectnumday,mode){
    directionsDisplay.setMap(map);
    // console.log(selectnumday,daysArray);
    var latorig;
    var longorig;
    var latdest;
    var longdest;
    var waypts = [];
    var i;

    daysArray.forEach(function(item){ 
      if(item.day == selectnumday){
        for(i=0 ; i< item.activities.length ; i++){
          if(i == 0){
            latorig = parseFloat(item.activities[0].lat);   
            longorig =  parseFloat(item.activities[0].long); 
            console.log(item.activities[0].name,latorig+'/'+longorig);
          }
          else if(i == item.activities.length-1){
            latdest = parseFloat(item.activities[i].lat);   
            longdest = parseFloat(item.activities[i].long);  
            console.log(item.activities[i].name,latdest+'/'+longdest);  
          }else{
             waypts.push({location:new google.maps.LatLng(parseFloat(item.activities[i].lat), parseFloat(item.activities[i].long))});
             
          }
        }
        return;
      }
        
    });
    // console.log(waypts);
    // console.log('mode',mode);
    
    directionsService.route({
      origin: {lat: latorig, lng: longorig},
      destination: {lat: latdest, lng: longdest},
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode[mode]
    }, function(response, status) {
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        // console.log(response)
        $scope.totalDist = computeTotalDistance(response);
        $scope.totalDur = secondsToHms(computeTotalDuration(response));
      } else {
        directionsDisplay.setMap(null);
        toaster1('danger','Directions request failed due to '+ status);
        // console.log('Directions request failed due to ' + status);
      }
    });
    
  }

  var computeTotalDistance = function(result) {
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

   var computeTotalDuration = function(result) {
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

  var secondsToHms = function(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
  }
 
  var setMarkerItinerary = function (itinerary) {

    deleteMarkers();
    
      itinerary.activities.forEach(function (item) {
        item.activities.forEach(function (subitem) {
          if (subitem.lat && subitem.long) {
            setMarker(map, new google.maps.LatLng(subitem.lat, subitem.long),
              subitem.name, subitem.name, subitem.acttype, subitem.rank,
              subitem.actid, subitem.photo_reference, 'activities', -1);
          }
        });
      });
    
    
      itinerary.days.forEach(function (item) {
        item.activities.forEach(function (subitem) {
          if (subitem.lat && subitem.long) {
            setMarker(map, new google.maps.LatLng(subitem.lat, subitem.long),
              subitem.name, subitem.name, subitem.acttype, subitem.rank,
              subitem.actid, subitem.photo_reference, 'day', item.day);
          }
        });
      });
    
    map.fitBounds(bounds);
  }

  var mapOptions = {
    center: new google.maps.LatLng(-34.397, 150.644),
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

  var iconBase = 'assets/img/markers/';

  // place a marker
  function setMarker(map, position, title, content, category, rank, id, photo_reference, type, day) {

    var markerOptions;

    var iconImage = function () {
      if (category == 'Accommodation' && type == 'day') {
        return 'lodging-2.png';
      }else if (category == 'Accommodation' && type == 'activities') {
        return 'lodging-2_opac.png';
      } else if (category == 'Food & Drink' && type == 'day') {
        return 'restaurant.png';
      } else if (category == 'Food & Drink' && type == 'activities') {
        return 'restaurant_opac.png';
      } else if (category == 'Things to do' && type == 'day') {
        return 'thingstodo.png';
      } else if (category == 'Things to do' && type == 'activities') {
        return 'thingstodo_opac.png';
      } else if (category == 'Sightseeing' && type == 'day') {
        return 'sight2.png';
      } else if (category == 'Sightseeing' && type == 'activities') {
        return 'sight2_opac.png';
      } else if (category == 'Shopping' && type == 'day') {
        return 'mall.png';
      } else if (category == 'Shopping' && type == 'activities') {
        return 'mall_opac.png';
      } else {
        return '';
      }
    }

    var iconImageCategory = iconImage();

    if (iconImageCategory != '') {
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
        category: category,
        icon: iconBase + iconImage(category),
        rank: rank,
        id: id,
        type: type,
        day: day
      });
    } else {
      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: title,
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

    if (day != $scope.numday3 && type != 'activities') {
      marker.setVisible(false);
    }

    bounds.extend(marker.position);
    
    markers.push(marker); // add marker to array

    google.maps.event.addListener(marker, 'click', function () {
      if (infoWindow !== void 0) {
        infoWindow.close();
      }

      if (photo_reference) {
        var photo_ref = '<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=80&photoreference=' +
          photo_reference + '&key=AIzaSyA-iCNYt6ham4ygfAp6AAAEUDgJcEgFpvM" width="80">';
      } else {
        var photo_ref = '';
      }

      var label = ''
      if (category == 'Accommodation') {
        label = ' <span class="label label-accommodation">' + category + '</span></div>';
      } else if (category == 'Food & Drink') {
        label = ' <span class="label label-food">' + category + '</span></div>';
      } else if (category == 'Things to do') {
        label = ' <span class="label label-thingsdo">' + category + '</span></div>';
      } else if (category == 'Sightseeing' && type == 'day') {
        label = ' <span class="label label-sightseeing">' + category + '</span></div>';
      } else if (category == 'Shopping' && type == 'day') {
        label = ' <span class="label label-shopping">' + category + '</span></div>';
      }

      var content_html = '<div id="iw-container">' +
        '<div class="iw-title">' + title +
         label +
        '<div class="iw-content">' +
        photo_ref +
        ' Ranking: <strong>' + rank + '</strong> <img src="assets/img/google13x13.png" alt=""></div>' +
        '<a target="_blank" style="color:black;padding-left: 40px;" href="/detailactivity/'
          + id + '">Show More</a></div>';

      var infoWindowOptions = {
        content: content_html
      };
      infoWindow = new google.maps.InfoWindow(infoWindowOptions);
      infoWindow.open(map, marker);
    });
  }

  $scope.gotoTop = function(){
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  }

  $scope.viewMarkersDay = function(day){
    
    $scope.numday3 = day;
    if (infoWindow !== void 0) {
        infoWindow.close();
      }
    markers.forEach(function (item) {
      if (item.type == 'day'){
        if (item.day == $scope.numday3) {
          item.setVisible(true);
        } else {
          item.setVisible(false);
        }
      }
    });
    directionsDisplay.setMap(null);
    setRoutes($scope.itinerary.days,$scope.numday3,$scope.mode);
    
  }

  // show the map and place some markers
  initMap();
  // setRoutes($scope.itinerary.days);
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

angular.module('blogotripFullstackApp').controller('ExternalActCtrl', function ($scope, $uibModalInstance, blogFactory, itinerary, activities) {

  $scope.itinerary = itinerary;
  $scope.actitis = activities;
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
    if ($scope.actSelected) {
      $scope.ext.actinew = { actid: 0, acttype: '', rank: '', name: '', photo_reference: '', lat: '', long: '' };
      blogFactory.getActivityById().get({ id: $scope.actSelected.actid }, function (activity) {
        // console.log('activity',activity);
        $scope.ext.actinew.actid = activity.results[0].actid;
        $scope.ext.actinew.rank = activity.results[0].rank;
        $scope.ext.actinew.acttype = activity.results[0].acttype;
        $scope.ext.actinew.name = activity.results[0].name;
        $scope.ext.actinew.photo_reference = activity.results[0].photo_reference;
        $scope.ext.actinew.lat = activity.results[0].lat;
        $scope.ext.actinew.long = activity.results[0].long;
      },
        function (error) {
          console.log('Error getActivityById\nDetail: ' + error);
        });
    }
    $uibModalInstance.close($scope.ext);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

