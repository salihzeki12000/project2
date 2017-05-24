angular
    .module('blogotripFullstackApp')
    .directive('googleMap', googleMap);


function googleMap() {
    var link = function (scope, element, attrs) {
        var map, infoWindow, markerCluster;
        var activity = [];
        var activity_old = [];
        var markers = [];
        var bounds = new google.maps.LatLngBounds();

        scope.$watch(attrs.googleMap, function (value) {
            deleteMarkers();
            if (markerCluster) {
                markerCluster.clearMarkers();
            }

            activity = value;
            // console.log('activity link:',activity);
            if (activity) {
                

                activity.forEach(function (item) {

                    if(item.type.includes('region')){
                        console.log('iitem.type:',item.type);
                        if (item.lat && item.long) {
                            setMarker(map, new google.maps.LatLng(item.lat, item.long), item.place, '',item.n_activities);
                            console.log('item n_activities:', item.n_activities);
                            // console.log('item zoom:', item.zoom);
                            // if(item.zoom){
                            //     map.setZoom(parseInt(item.zoom));
                            // }
                            
                        }
                    
                    // if(item.type.includes('city')){
                        
                    }else{
                         console.log('iitem.type else:',item.type);
                        if (item.lat && item.long) {
                            setMarker(map, new google.maps.LatLng(item.lat, item.long), item.title, item.description,'');
                            // console.log('item length:', item.length);
                            // console.log('item zoom:', item.zoom);
                            // if(item.zoom){
                            //     map.setZoom(parseInt(item.zoom));
                            // }
                            
                        }
                    }

                });

                // Add a marker clusterer to manage the markers.
                markerCluster = new MarkerClusterer(map, markers,
                    { imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' });
                
            }
            // console.log('markers length after:',markers.length);
            map.fitBounds(bounds);

        });

        // map config
        var mapOptions = {
            center: new google.maps.LatLng(-34.397, 150.644),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_CENTER
            },
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
            if (map === void 0) {
                map = new google.maps.Map(element[0], mapOptions);
            }
            // Try HTML5 geolocation.
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    // console.log('pos:',pos);
                    // infoWindow.setPosition(pos);
                    // infoWindow.setContent('Location found.');
                    map.setCenter(pos);
                }, function () {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }
        }

        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
        }

        // place a marker
        function setMarker(map, position, title, content,label) {
            // console.log('label:',label.toString());
            var marker;
            var markerOptions = {
                position: position,
                label: label.toString(),
                map: map,
                title: title
                
                // icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            };


            marker = new google.maps.Marker(markerOptions);
            bounds.extend(marker.position);
            markers.push(marker); // add marker to array
            // console.log('markers length -set:',markers.length);

            google.maps.event.addListener(marker, 'click', function () {
                // close window if not undefined
                if (infoWindow !== void 0) {
                    infoWindow.close();
                }
                // create new window
                var infoWindowOptions = {
                    content: content
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

    };

    return {
        template: '<div id="gmaps"></div>',
        replace: true,
        link: link
    };
}
