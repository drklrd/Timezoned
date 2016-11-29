'use strict';

var Vue = require('vue/dist/vue.js');
var VueResource = require('vue-resource/dist/vue-resource.min.js');
var MomentTZ = require('moment-timezone');

// window.$ = window.jQuery = require('jquery/dist/jquery.js')
var GAPI = require('./gapi.js');

// window.moment = require('moment/min/moment.min.js');
// require('bootstrap/js/transition.js')
// require('bootstrap/js/collapse.js');
// var Bootstrap = require('bootstrap/dist/js/bootstrap.min.js');
// require('eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js');

String.prototype.toHourMinutes = function() {

	var sec_num = parseInt(this, 10);
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	if (Number(hours) > 0 && Number(minutes) > 0) {
		return hours + ' hours ' + minutes + ' minutes ';
	} else {
		if (Number(hours) > 0) {
			return hours + ' hours ';
		} else if (Number(minutes) > 0) {
			return minutes + ' minutes ';
		} else {
			return 'noDifference';
		}
	}

}

window.addEventListener('load', function() {

	var defaultData;
	var autocomplete;
	var location;
	var colors = ['#1abc9c', '#2980b9', '#8e44ad', '#c0392b', '#2c3e50', '#e67e22'];

	var updatedTime;

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var geolocation = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			};

			getTimeZone(geolocation, function(data) {
				defaultData = data;

				function nowTimeRenderer(){
					if(!updatedTime){
						return 'Current Time : ' + MomentTZ().tz(defaultData.timeZoneId).format('HH:mm:ss DD/MMM/YYYY ddd')
					}else{
						return 'Time : ' + MomentTZ(updatedTime).tz(defaultData.timeZoneId).format('HH:mm:ss DD/MMM/YYYY ddd')
					}
				};

				function locationTimeRenderer(timeZoneId){
					if(!updatedTime){
						return 'Current Time : ' + MomentTZ().tz(timeZoneId).format('HH:mm:ss DD/MMM/YYYY ddd');
					}else{
						return ' Time : ' + MomentTZ(updatedTime).tz(timeZoneId).format('HH:mm:ss DD/MMM/YYYY ddd');
					}
				}
				
				var app = new Vue({
					el: '#app',
					data: {
						time: nowTimeRenderer(),
						info: 'UTC ' + MomentTZ().tz(defaultData.timeZoneId).format('Z'),
						zoneId: defaultData.timeZoneId,
						zoneName: defaultData.timeZoneName,
						zones: [],
						changeDefault: false
					},
					
					mounted: function() {

						this.zones = [];
						$('#datetimepicker1').datetimepicker({
							format: 'YYYY MM DD hh:mm A'
						});
					},
					methods: {
						addNewZoneModal: function(changeDefault) {
							this.changeDefault = changeDefault;
							if(changeDefault) {
								updatedTime = false;
								this.time = nowTimeRenderer();
							}
							$('#newZoneModal').modal('show');
							$('#newZoneModal').on('shown.bs.modal', function() {
								$('#autocomplete').focus();
							})
						},
						changeTimeModal : function(){
							$('#changeTimeModal').modal('show');
						},
						addNewZone: function() {
							var context = this;

							getTimeZone(location, function(data) {
								var timeZoneInfo = data;
								var now = MomentTZ.utc();
								var offset1 = MomentTZ.tz.zone(data.timeZoneId).offset(now);
								var offset2 = MomentTZ.tz.zone(defaultData.timeZoneId).offset(now);
								var offsetInSeconds = (offset1 - offset2) * 60;
								var absoluteValue = String(Math.abs(offsetInSeconds));
								var data = {
									place: location.place,
									time: locationTimeRenderer(data.timeZoneId),
									info: 'UTC ' + MomentTZ().tz(data.timeZoneId).format('Z'),
									zoneId: data.timeZoneId,
									zoneName: data.timeZoneName,
									difference: absoluteValue.toHourMinutes() !== 'noDifference' ? (offsetInSeconds < 0 ? 'is ' + absoluteValue.toHourMinutes() + ' ahead of ' + defaultData.timeZoneId : 'is ' + absoluteValue.toHourMinutes() + ' behind ' + defaultData.timeZoneId) : 'No difference in the time',
									zoneColor: colors[Math.floor(Math.random() * colors.length)]

								};
								if (context.changeDefault) {
									defaultData = timeZoneInfo;
									context.time = data.time;
									context.info = data.info;
									context.zoneId = data.zoneId;
									context.zoneName = data.zoneName;
									context.zones = [];
									context.changeDefault = false;
								} else {



									context.zones.push(data);
								}

								document.getElementById('autocomplete').value = '';
								$('#newZoneModal').modal('hide');

							})

						},

						changeTime: function(){
							$('#changeTimeModal').modal('hide');
							// console.log('datetimepicker1',$("#datetimepicker1").find("input").val());
							var time = $("#datetimepicker1").find("input").val()
							// console.log('time',time)
							// console.log('new time',MomentTZ(new Date(time)).tz(defaultData.timeZoneId).format('HH:mm:ss DD/MMM/YYYY ddd')) 
							updatedTime =new Date(time);
							this.time = nowTimeRenderer();
						}
					}
				})
			})

			GAPI.load(function() {
				autocomplete = new google.maps.places.Autocomplete(
					(document.getElementById('autocomplete')), {
						types: ['geocode']
					});
				autocomplete.addListener('place_changed', fillInAddress);
			})


		});
	}else{
		alert('Geolocation not supported in this browser !');
	}

	function fillInAddress() {
		var place = autocomplete.getPlace();
		location = {
			latitude: place.geometry.location.lat(),
			longitude: place.geometry.location.lng(),
			place: place.formatted_address
		}

	}



	function getTimeZone(location, cb) {
		$.ajax({
			url: 'https://maps.googleapis.com/maps/api/timezone/json?location=' + location.latitude + ',' + location.longitude + '&timestamp=1478701674&key=',
			type: 'GET',
			dataType: 'json',
			success: cb,
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('err')
			}
		})
	}

})