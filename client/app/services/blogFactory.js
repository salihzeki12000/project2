'use strict';

angular
.module('blogotripFullstackApp')
.factory('blogFactory', ['$resource',blogFactory]);

function blogFactory($resource) {

  var blogFactory = {};
  // var api_url = 'https://tv4i9t86n1.execute-api.us-east-1.amazonaws.com/dev/'
  var api_url = 'https://v55za5joj4.execute-api.us-east-1.amazonaws.com/dev/';

  blogFactory.me = function(){
    return $resource('http://www.travelpayouts.com/whereami',{
      locale:'@locale'});
  }

  blogFactory.getActivities = function(){
    return $resource(api_url+'activities/:place',{
      place: '@place'});    
  }

  blogFactory.getRoutes = function(){
    return $resource(api_url+'routes/:route',{
      place: '@route'});    
  }
  
  blogFactory.getPlaces = function(){
    return $resource('/assets/data/places');    
  }

  blogFactory.getCityCodes = function(){
    return $resource(api_url+'city_codes');    
  }

  blogFactory.getPlace = function(){
    return $resource(api_url+'place/:formatted_address', {
      formatted_address: '@formatted_address'});    
  }

  blogFactory.getPlaceByName = function(){
    return $resource(api_url+'placebyname/:place', {
      place: '@place'});    
  }

  blogFactory.getPlacesByPlace = function(){
    return $resource(api_url+'places/:place',{
      place: '@place'});    
  }

  blogFactory.getActivityById = function(){
    return $resource(api_url+'activity/:id',{
      id: '@id'});    
  }

  blogFactory.users = function(){
    return $resource('/api/users/:id',{
      id: '@id'},{
        update: {
          method:'PUT'
        },
        save: {
          method:'POST'
        }
      });
  }

  blogFactory.form = function(){
    return $resource('/api/forms/:id',{
      id: '@id'},{
        update: {
          method:'PUT'
        },
        save: {
          method:'POST'
        }
      });
  }

  
  blogFactory.getFormByItiId= function(){
    return $resource('/api/forms/formitiid/:itiid',{
      itiid: '@itiid'});    
  }

  blogFactory.itinerary = function(){
    return $resource('/api/itinerarys/:id',{
      id: '@id'},{
        update: {
          method:'PUT'
        },
        save: {
          method:'POST'
        },
        remove: {
          method:'DELETE'
        }
      });
  }

  blogFactory.getItineraryOwner = function(){
    return $resource('/api/itinerarys/owner/:owner/:id',{
      owner: '@owner',
      id: '@id'});    
  }

  blogFactory.getItinerariesOwner = function(){
    return $resource('/api/itinerarys/itineraries/by/:owner',{
      owner: '@owner'});    
  }

  blogFactory.getItineraries = function(){
    return $resource('/api/itinerarys/itinerariesplace/:place',{
      place: '@place'});    
  }

  blogFactory.itineraryOwnerExist = function(){
    return $resource('/api/itinerarys/ownerexist/:owner',{
      owner: '@owner'});    
  }

  blogFactory.getItineraryRandom = function(){
    return $resource(api_url+'itinerary/:place/:days',{
      place: '@place', days:'@days'});    
  }
  
  blogFactory.getActIti = function(){
    return $resource(api_url+'activitylist/:place', {
      place: '@place'});    
  }

  blogFactory.getAllSearches = function(){
    return $resource('/api/things');
  }

  blogFactory.getAllForms = function(){
    return $resource('/api/forms');
  }
  
  return blogFactory;
}

