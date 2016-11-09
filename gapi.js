var jsonp = require('./jsonp');

var gapiurl = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDz3fngWckCVHr0FN-bzBGjT-2P-uEqwIE&libraries=places';

exports.load = function (callback) {

    jsonp(gapiurl, callback);
};