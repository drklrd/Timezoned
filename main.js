var Vue = require('vue/dist/vue.js');
var $ = require('jQuery');
var GAPI = require('./gapi.js');
var MomentTZ = require('moment-timezone');
var viewComponents = 0;
var defaultData;

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); 
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+' hours '+minutes+' minutes ';
}

function fillInAddress() {
  console.log('this',this);
  var place = autocomplete.getPlace();
  var location = {
  	latitude : place.geometry.location.lat(),
  	longitude : place.geometry.location.lng()
  }
  
  getTimeZone(location,function(data){
    console.log('hera',data);
    
    var app = new Vue({
      el: '#app'+viewComponents,
      data: {
        time: 'Current Time :'+MomentTZ().tz(data.timeZoneId).format('HH:mm:ss'),
        info : 'UTC ' +MomentTZ().tz(data.timeZoneId).format('Z')    + data.timeZoneId + '/' + data.timeZoneName,
      }
    })
    viewComponents++;
    var now = MomentTZ.utc();
    var offset1 = MomentTZ.tz.zone(data.timeZoneId).offset(now); 
    var offset2 = MomentTZ.tz.zone(defaultData.timeZoneId).offset(now);
    var offsetInSeconds = Math.abs(offset1-offset2) * 60;
    console.log(String(offsetInSeconds).toHHMMSS());
  })
  
}



function getTimeZone(location,cb){
    $.ajax({
          url: 'https://maps.googleapis.com/maps/api/timezone/json?location='+location.latitude+','+location.longitude+'&timestamp=1478701674&key=',
          type: 'GET',
          dataType: 'json',
          success: cb,
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('err')
          }
        })
}

window.addEventListener('load',function(){


  document.getElementById('add_new').addEventListener('click', () => {
    var newElement = document.createElement('div');
    newElement.innerHTML = '<div id="app'+viewComponents+'">  {{ time }} <br> {{info}} </div>';
    document.getElementById("view_components").appendChild(newElement);

  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      getTimeZone(geolocation,function(data){
        console.log('hera',data);
        defaultData = data;
        var app = new Vue({
          el: '#app',
          data: {
            time: 'Current Time : '+MomentTZ().tz(data.timeZoneId).format('HH:mm:ss'),
            info : 'UTC ' +MomentTZ().tz(data.timeZoneId).format('Z')    + data.timeZoneId + '/' + data.timeZoneName,
          }
        })
      })

      GAPI.load(function(){
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
            {types: ['geocode']});

        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        autocomplete.addListener('place_changed', fillInAddress);
      })


    });
  }


	

	




})

