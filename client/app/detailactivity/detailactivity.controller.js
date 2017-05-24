'use strict';

angular.module('blogotripFullstackApp')
  .controller('DetailActivityController', DetailActivityController);

function DetailActivityController($scope, $state, $stateParams, $location, blogFactory, Auth, toaster) {

  var map, infoWindow, markerCluster;
  var markers = [];
  var bounds = new google.maps.LatLngBounds();
  var activityId = $stateParams.activity;
  // console.log('activityId',activityId);

  $scope.goBack = function() {
    window.history.back();
  }
  $scope.isLoggedIn = Auth.isLoggedIn();
  $scope.absUrl = $location.absUrl();
  // console.log(' $scope.absUrl ', $scope.absUrl );

  blogFactory.getActivityById().get({ id: activityId }, function (activity) {
    $scope.activity = activity.results[0];
    watchingActivities(activity.results);
    setZoomMarker($scope.activity.lat, $scope.activity.long);
    // console.log('markers',markers);
  });

  var setZoomMarker = function(lat,long){
    var pt = new google.maps.LatLng(lat, long);
    map.setCenter(pt);
    map.setZoom(10);
  }

  $scope.alertLogin = function () {
    alert('Please, sign in to save an activity into your itinerary');
  }

  var toaster1 = function(type,text){
    toaster.pop({
            type: type,           
            title: text,
            // body: text,
            showCloseButton: true,
            timeout: 3000
        });

  }

  $scope.saveActivity = function (activity) {   
    blogFactory.itineraryOwnerExist().query({owner:Auth.getCurrentUser()._id},function(itinerary){
      if(itinerary.length == 0){
      // console.log('owner exist 1',itinerary);      
      var newitinerary = {name:'Itinerary',owner:Auth.getCurrentUser()._id, activities:[activity.id],days:[{}] };
      blogFactory.itinerary().save(newitinerary,function(){
        toaster1('success','Activity saved in a new itinerary!');
      });
    }else if(itinerary.length > 0){
      // console.log('owner exist 2',itinerary);      
        var activities = itinerary[0].activities;        
        activities.push(activity.id);
        console.log('activities',activities);
        blogFactory.itinerary().update({ id: itinerary[0]._id }, {activities:activities}, function () {
          toaster1('success','Activity saved!');
        },
        function(error){
          alert('Error save activity\nDetail: '+error.message);
        });  
      }
    },function(error){
      console.log('error',error);
    }); 

  }

  var setZoomMarker = function (lat, long) {
    var pt = new google.maps.LatLng(lat, long);
    map.setCenter(pt);
    map.setZoom(12);
  }


  //------Start Google Map API-------------
  var mapOptions = {

    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: true,
    gestureHandling: 'greedy',
    mapTypeControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    }
  };

  // init the map
  function initMap() {

      map = new google.maps.Map(document.getElementById('gmaps'), mapOptions);
      
  }

  var destParam = $stateParams.activity.split("&");
  var latdest =  {lat:destParam[1]};
  var longdest =  {lng:destParam[2]};

  var watchingActivities = function (activity) {
    deleteMarkers();
    if (markerCluster) {
      markerCluster.clearMarkers();
    }
    if (activity) {

      activity.forEach(function (item) {
        // console.log(item);

        if (item.lat && item.long) {
          console.log('lat, long '+item.lat+' '+item.long);
          var position= new google.maps.LatLng(item.lat, item.long);
          setMarker(map, position, item.place, item.description, '', item.type);
          // markers.forEach(function(item){
            // map.setCenter(position);
          // });
           setZoomMarker(item.lat,item.long);
          
        }else{
          console.log('latdest, longdest '+latdest.lat+' '+longdest.lng);
          var position = new google.maps.LatLng(latdest.lat, longdest.lng);
          setMarker(map, position, item.place, item.description, '', item.type);
          // markers.forEach(function(item){
          setZoomMarker(latdest.lat,longdest.lng);
          // });
        }
      });

    }
    // map.fitBounds(bounds);
    
  }

  // map config
  

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
  }

  // categories:'sleep''eat''buy' 'see''do''drink''learn''go'
  var iconBase = 'assets/img/markers/';

  // place a marker
  function setMarker(map, position, title, content, label, category) {
    // console.log('label:',label.toString());
    // var marker;
    var markerOptions;

    if (category == 'Accommodation') {
      // console.log('sleep');
      var marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map,
        title: title,
        category: category,
        icon: iconBase + 'lodging-2.png'
      });

    }
    else if (category == 'Food & Drink') {
      var marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map,
        title: title,
        category: category,
        icon: iconBase + 'restaurant.png'
      });
    }

    else if (category == 'Things to do') {
      var marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map,
        title: title,
        category: category,
        icon: iconBase + 'thingstodo.png'
      });
    }
    else if (category == 'Sightseeing') {
      var marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map,
        title: title,
        category: category,
        icon: iconBase + 'sight2.png'
      });

    }
    else if (category == 'Shopping') {
      // console.log('buy');
      var marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map,
        title: title,
        category: category,
        icon: iconBase + 'mall.png'
      });

    }
    else if (category.includes('region')) {
      // console.log('label',label);
      var marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map,
        title: title,
        category: category
        // icon: iconBase + 'mall.png'
      });
    }
    else {

      var marker = new google.maps.Marker({
        position: position,
        label: label.toString(),
        map: map,
        title: title,
        category: category
        // icon: iconBase + 'mall.png'
      });
      // marker.setVisible(false);
    }

    // var pt = new google.maps.LatLng(lat, long);
    // map.setCenter(marker.getPosition());
    // map.setZoom(13);
    // bounds.extend(marker.position);
    
    markers.push(marker); // add marker to array
    // console.log('markers length -set:',markers.length);
    marker.addListener('click', function() {
      map.setZoom(12);
      map.setCenter(marker.getPosition());
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


