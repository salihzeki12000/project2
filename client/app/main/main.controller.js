'use strict';

angular.module('blogotripFullstackApp')
  .controller('MainController', MainController);

function MainController($scope, $state,$rootScope,$timeout,$window,$http, Auth, toaster, blogFactory,MetaService) {

   $rootScope.state = $state;
  $scope.travelform = {travelers:''};

  var photoArray = ['assets/img/chile/chile-1463830.jpg',
    'assets/img/chile/chile-1477188.jpg',
    'assets/img/chile/chile-1740804.jpg',
    'assets/img/chile/chile-1912174.jpg',
    'assets/img/chile/conguillio-national-park-710571.jpg',
    'assets/img/chile/glacier-1740892.jpg',
    'assets/img/chile/landscape-74572.jpg',
    'assets/img/chile/volcano-139625.jpg']
  $scope.photo = photoArray[Math.floor(Math.random() * photoArray.length)];

  $scope.responsive = [
    {
      breakpoint: 687,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]

  // var api_url = 'http://api.travelpayouts.com/v2/prices/latest?currency=usd&period_type=year&page=1&limit=30&show_to_affiliates=true&sorting=price&trip_class=0&token=bcc250b8b45570a65fd37a33ba178540';
  //  $http({
  //   url: api_url, 
  //   method: "GET"
  //   })
  //   .then(function(response) {
  //       // $scope.rate = Object.values(response.data.rates)[0];  
  //       $scope.flights = response.data;
  //       console.log('$scope.flights',$scope.flights);
        
  //   });

  //Adding metas/////////////////////////
  var description= 'Plannertrip simplifies the travel planning process by creating customized itineraries. It extracts information from several travel sources and match it to each user’s profile using artificial intelligence algorithms. In addition, it integrates the major travel providers to help you to book the most important services in just one platform.';
  
  
  var keywords = 'plannertrip, itinerary, Food & Drink, Accommodation, Sightseeing, Things to do, Shopping, destination, activities, recommendations';
  
  $window.document.title = 'PlannerTrip | Create awesome itineraries instantly';

  $rootScope.metaservice = MetaService;
  $rootScope.metaservice.set(description,keywords);

  //Latest shared itineraries//////////////////////////////////////////////
  blogFactory.itinerary().query({}, function (itineraries) {
    itineraries.forEach(function (itinerary) {
      blogFactory.getPlaceByName().get({ place: itinerary.name }, function (place) {
        itinerary.photo = place.results[0].photo_reference
      });
      // console.log(itinerary)
    });
    $scope.itineraries = itineraries;
  },
    function (error) {
      console.log(error);
    });

  //travelform//////////////////////////////////////////////////////////
  blogFactory.getPlaces().get(function (places) {
    $scope.places = places.results;
  },
    function (error) {
      alert('Error getPlaces Main\nDetail: ' + error);
    });

  //toaster/////////////////////////////////////////////////////////////
  var message = function (type, text) {
    toaster.pop({
      type: type,
      title: text,
      showCloseButton: true,
      timeout: 5000
    });
  };

  //For uib-datepicker///////////////////////////////////
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
  ////////////////////////////////////////////////////////

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

  $(document).ready(function(){
  $('.destinationsslick').slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
    // You can unslick at a given breakpoint now by adding:
    // settings: "unslick"
    // instead of a settings object
  ]
  });
});


}


