var Moment = require('moment');
var Vue = require('vue/dist/vue.js');
var $ = require('jQuery');
var GAPI = require('./gapi.js');


function fillInAddress() {
  var place = autocomplete.getPlace();
  var location = {
  	latitude : place.geometry.location.lat(),
  	longitude : place.geometry.location.lng()
  }
  
  $.ajax({
  			url: 'https://maps.googleapis.com/maps/api/timezone/json?location=27.717245, 85.32396&timestamp=1478701674&key=',
  			type: 'GET',
  			dataType: 'json',
  			success: function(data) {
          console.log('hera',data);
  				var app = new Vue({
  				  el: '#app',
  				  data: {
  				    message: Moment(data.rawOffset).format('HH+mm') + data.timeZoneId + '/' + data.timeZoneName
  				  }
  				})

  			},
  			error: function(jqXHR, textStatus, errorThrown) {
  				console.log('err')
  			}
  		})
}



window.addEventListener('load',function(){

	GAPI.load(function(){
		autocomplete = new google.maps.places.Autocomplete(
		    /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
		    {types: ['geocode']});

		// When the user selects an address from the dropdown, populate the address
		// fields in the form.
		autocomplete.addListener('place_changed', fillInAddress);
	})

	




})

