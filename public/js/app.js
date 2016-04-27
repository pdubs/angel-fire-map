var map;
var mapCenter = new google.maps.LatLng(36.379, -105.254);
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
		case "p":
			return '#d9212e';
	}
}

app.factory('myService', function($http) {
	return {
		getTrailData: function() {
		    return $http.get('http://localhost:8080/api/trails/').then(function(result) {
		    	return result.data;
		    });
		}
	}
});

app.controller('MainCtrl', function($scope, myService) {
	myService.getTrailData().then(function(trailData) {
		var trails = [];
		$scope.mapTypes = ["Satellite", "Topo"];
		$scope.trailData = trailData;
		$scope.eTrails = [];
		$scope.iTrails = [];
		$scope.aTrails = [];
		$scope.exTrails = [];

		$scope.setSelectedTrail = function(trail) {
			(trails[trail.num].getMap() == null) ? trails[trail.num].setMap(map) : trails[trail.num].setMap(null);
		}

		$scope.setSelectedDifficulty = function(difficulty) {
			for (var i = 0; i < trails.length; i++) {
				if (trails[i].style.difficulty === difficulty) {
					(trails[i].getMap() == null) ? trails[i].setMap(map) : trails[i].setMap(null);
				}
			}
		}

		$scope.setMapType = function(type) {
			(type === "Satellite") ? map.setMapTypeId(google.maps.MapTypeId.SATELLITE) : map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
		}

		function initialize() {
			var mapOptions = {
				center: mapCenter,
				zoom: 15,
				disableDefaultUI: true,
				disableDoubleClickZoom: false,
				draggable: true,
				scrollwheel: true,
				panControl: false,
				zoomControl: true,
				mapTypeId: google.maps.MapTypeId.SATELLITE	
			};
			
			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

			var markerA = new google.maps.Marker({position: new google.maps.LatLng(36.372149, -105.245045), map: map, icon: 'img/a.png'});
			var markerB = new google.maps.Marker({position: new google.maps.LatLng(36.372304, -105.252478), map: map, icon: 'img/b.png'});
			var markerC = new google.maps.Marker({position: new google.maps.LatLng(36.378944, -105.247422), map: map, icon: 'img/c.png'});
			var markerD = new google.maps.Marker({position: new google.maps.LatLng(36.380713, -105.253571), map: map, icon: 'img/d.png'});
			var markerE = new google.maps.Marker({position: new google.maps.LatLng(36.380236, -105.260261), map: map, icon: 'img/e.png'});
			var markerF = new google.maps.Marker({position: new google.maps.LatLng(36.382454, -105.258893), map: map, icon: 'img/f.png'});

			for (var key = 0; key < trailData.length; key++){
				trails[key] = new google.maps.Data();
				trails[key].addGeoJson(trailData[key]);
				trails[key].setStyle({
					strokeColor: returnColor(trailData[key].properties.difficulty),
					strokeOpacity: 0.95,
					strokeWeight: 3,
					name: trailData[key].properties.name,
					difficulty: trailData[key].properties.difficulty,
					num: key + 1,
					id: trailData[key].properties.id,
					segment: trailData[key].properties.segment
				});
			}

			for (var i in trails) {
				switch (trails[i].style.difficulty) {
					case "e":
						$scope.eTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							id: trails[i].style.id,
							segment: trails[i].style.segment
						});
						break;
					case "i":
						$scope.iTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							id: trails[i].style.id,
							segment: trails[i].style.segment
						});
						break;
					case "a":
						$scope.aTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							id: trails[i].style.id,
							segment: trails[i].style.segment
						});
						break;
					case "ex": 
						$scope.exTrails.push({
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							num: i,
							id: trails[i].style.id,
							segment: trails[i].style.segment
						});
						break;
				}
			}
		} 
		google.maps.event.addDomListener(window, "DOMContentLoaded", initialize());
	});
});