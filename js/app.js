var map;
var mapCenter = new google.maps.LatLng(36.381, -105.255620);
var app = angular.module('afMap', []);

function returnColor(difficulty) {
	switch (difficulty) {
		case "e":
			return '#66CD00';
		case "i":
			return '#1ca4d5';
		case "a":
			return '#fbf136';
		case "ex":
			return '#eb573a';
	}
}

app.factory('myService', function($http) {
	return {
		getTrailData: function() {
		    return $http.get('http://45.55.14.136:8000/location/angel%20fire').then(function(result) {
		    	return result.data;
		    });
		}
	}
});

app.controller('MainCtrl', function($scope, myService) {
	myService.getTrailData().then(function(trailData) {
		$scope.trailData = trailData;
		var trails = [];

		$scope.eTrails = [];
		$scope.iTrails = [];
		$scope.aTrails = [];
		$scope.exTrails = [];

		$scope.setSelectedTrail = function(trail) {
			(trails[trail.num].getMap() == null) ? trails[trail.num].setMap(map) : trails[trail.num].setMap(null);
		}

		function initialize() {
			var mapOptions = {center: mapCenter, zoom: 15, disableDefaultUI: true,disableDoubleClickZoom: true, draggable: false, scrollwheel: false, panControl: false, zoomControl: false, mapTypeId: google.maps.MapTypeId.SATELLITE };
			
			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

			var markerA = new google.maps.Marker({position: new google.maps.LatLng(36.372149, -105.245045), map: map, icon: 'img/a.png'});
			var markerB = new google.maps.Marker({position: new google.maps.LatLng(36.372304, -105.252478), map: map, icon: 'img/b.png'});
			var markerC = new google.maps.Marker({position: new google.maps.LatLng(36.378944, -105.247422), map: map, icon: 'img/c.png'});
			var markerD = new google.maps.Marker({position: new google.maps.LatLng(36.380713, -105.253571), map: map, icon: 'img/d.png'});
			var markerE = new google.maps.Marker({position: new google.maps.LatLng(36.380236, -105.260261), map: map, icon: 'img/e.png'});
			var markerF = new google.maps.Marker({position: new google.maps.LatLng(36.382454, -105.258893), map: map, icon: 'img/f.png'});
			
			for (var key = 0; key < trailData.features.length; key++){
				trails[key] = new google.maps.Data();
				trails[key].addGeoJson(trailData.features[key]);
				trails[key].setStyle({
					strokeColor: returnColor(trailData.features[key].properties.difficulty),
					strokeOpacity: 0.95,
					strokeWeight: 3,
					name: trailData.features[key].properties.name,
					difficulty: trailData.features[key].properties.difficulty,
					num: key + 1,
					parkID: trailData.features[key].properties.parkID
				});
			}

			for (var i in trails) {
				switch (trails[i].style.difficulty) {
					case "e":
						$scope.eTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							parkID: trails[i].style.parkID
						});
						break;
					case "i":
						$scope.iTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							parkID: trails[i].style.parkID
						});
						break;
					case "a":
						$scope.aTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							parkID: trails[i].style.parkID
						});
						break;
					case "ex": 
						$scope.exTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							parkID: trails[i].style.parkID
						});
						break;
				}
			}

		} 


		google.maps.event.addDomListener(window, "DOMContentLoaded", initialize());
	});
});




































