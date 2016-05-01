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
			return '#000000';
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
		$scope.allTrails = [];
		$scope.difficulties = [];

		$scope.toggleSegment = function(trail) {
			console.log(((trail.active) ? "HIDING TRAIL SEGMENT " : "SHOWING TRAIL SEGMENT ") + trail.name + " #" + trails[trail.num].style.segment);

			for (var i=0;i<$scope.allTrails.length;i++) {
				for (var j=0;j<$scope.allTrails[i].segments.length;j++) {
					if ($scope.allTrails[i].segments[j].num == trail.num) {
						if ($scope.allTrails[i].segments[j].active == false){
							trails[trail.num].setMap(map);
							$scope.allTrails[i].segments[j].active = true;
						}
						else {
							trails[trail.num].setMap(null);
							$scope.allTrails[i].segments[j].active = false;
						}
					}
				}
			}
		}

		$scope.toggleTrail = function(trail) {
			var rightTrail;

			console.log(((trail.active) ? "HIDING TRAIL " : "SHOWING TRAIL ") + trail.name);

			for (var i=0;i<$scope.allTrails.length;i++) {
				if ($scope.allTrails[i].id == trail.id) { rightTrail = i }

				for (var j=0;j<$scope.allTrails[i].segments.length;j++) {
					if ($scope.allTrails[i].segments[j].id == trail.id) {
						if ($scope.allTrails[rightTrail].active) {
							trails[$scope.allTrails[i].segments[j].num].setMap(null);
							$scope.allTrails[i].segments[j].active = false;
						}
						else {
							trails[$scope.allTrails[i].segments[j].num].setMap(map);
							$scope.allTrails[i].segments[j].active = true;
						}
					}
				}
			}

			$scope.allTrails[rightTrail].active = ($scope.allTrails[rightTrail].active) ? false : true;

		}

		$scope.toggleDifficulty = function(difficulty) {
			var diffNum;
			angular.forEach($scope.difficulties, function(value, key) {
				if (value.shortName == difficulty) { diffNum = key; } 
			});

			if ($scope.difficulties[diffNum].active == false) {
				console.log("SHOWING DIFFICULTY " + difficulty);
				$scope.difficulties[diffNum].active = true;
				for (var i=0;i<$scope.allTrails.length;i++) {
					for (var j=0;j<$scope.allTrails[i].segments.length;j++) {
						if ($scope.allTrails[i].segments[j].difficulty == difficulty) {
							trails[$scope.allTrails[i].segments[j].num].setMap(map);
							$scope.allTrails[i].segments[j].active = true;
						}
					}
				}
			}
			else {
				console.log("HIDING DIFFICULTY " + difficulty);
				$scope.difficulties[diffNum].active = false;
				for (var i=0;i<$scope.allTrails.length;i++) {
					for (var j=0;j<$scope.allTrails[i].segments.length;j++) {
						if ($scope.allTrails[i].segments[j].difficulty == difficulty) {
							trails[$scope.allTrails[i].segments[j].num].setMap(null);
							$scope.allTrails[i].segments[j].active = false;
						}
					}
				}
			}
		}

		$scope.showAllTrails = function() {
			for (var i=0;i<$scope.allTrails.length;i++) {
				for (var j=0;j<$scope.allTrails[i].segments.length;j++) {
					trails[$scope.allTrails[i].segments[j].num].setMap(map);
					$scope.allTrails[i].segments[j].active = true;
				}
				$scope.allTrails[i].active = true;
			}
			angular.forEach($scope.difficulties, function(value, key) {
				value.active = true;
			});
		}

		$scope.hideAllTrails = function() {
			for (var i=0;i<$scope.allTrails.length;i++) {
				for (var j=0;j<$scope.allTrails[i].segments.length;j++) {
					trails[$scope.allTrails[i].segments[j].num].setMap(null);
					$scope.allTrails[i].segments[j].active = false;
				}
				$scope.allTrails[i].active = false;
			}
			angular.forEach($scope.difficulties, function(value, key) {
				value.active = false; 
			});
		}

		$scope.setMapType = function(type) {
			(type === "Satellite") ? map.setMapTypeId(google.maps.MapTypeId.SATELLITE) : map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
		}

		function initialize() {
			// init map options
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
			
			// init map - new google maps object targeting the .map-canvas element
			map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

			// init hub markers
			var markerA = new google.maps.Marker({position: new google.maps.LatLng(36.372149, -105.245045), map: map, icon: 'img/a.png'});
			var markerB = new google.maps.Marker({position: new google.maps.LatLng(36.372304, -105.252478), map: map, icon: 'img/b.png'});
			var markerC = new google.maps.Marker({position: new google.maps.LatLng(36.378944, -105.247422), map: map, icon: 'img/c.png'});
			var markerD = new google.maps.Marker({position: new google.maps.LatLng(36.380713, -105.253571), map: map, icon: 'img/d.png'});
			var markerE = new google.maps.Marker({position: new google.maps.LatLng(36.380236, -105.260261), map: map, icon: 'img/e.png'});
			var markerF = new google.maps.Marker({position: new google.maps.LatLng(36.382454, -105.258893), map: map, icon: 'img/f.png'});

			// init trails[] - an array of google maps data objects
			for (var key = 0; key < trailData.length; key++){
				trails[key] = new google.maps.Data();
				trails[key].addGeoJson(trailData[key]);
				trails[key].setStyle({
					strokeColor: returnColor(trailData[key].properties.difficulty),
					strokeOpacity: 0.75,
					strokeWeight: 2,
					name: trailData[key].properties.name,
					difficulty: trailData[key].properties.difficulty,
					num: key,
					id: trailData[key].properties.id,
					segment: trailData[key].properties.segment
				});
//14
			}

			// init $scope.allTrails[] - an array of trail data objects
			//   nests each segment into segments[] for controls
			for (var i in trails) {
				if (trails[i].style.segment == "1" ) {
					$scope.allTrails.push({
						name: trails[i].style.name,
						difficulty: trails[i].style.difficulty,
						id: trails[i].style.id,
						active: false,
						segments: [{
							name: trails[i].style.name,
							difficulty: trails[i].style.difficulty,
							id: trails[i].style.id,
							num: trails[i].style.num,
							segment: trails[i].style.segment,
							active: false
						}]
					});
				}
				else {
					for (var j in $scope.allTrails) {
						if (trails[i].style.id == $scope.allTrails[j].id) {
							$scope.allTrails[j].segments.push({
								name: trails[i].style.name,
								difficulty: trails[i].style.difficulty,
								id: trails[i].style.id,
								num: trails[i].style.num,
								segment: trails[i].style.segment,
								active: false
							});
						}
					}
				}
				// display the chairlift path
				if (trails[i].style.name == "Chair Lift") {
					trails[i].setMap(map);
				}
			}
				console.log($scope.allTrails);

			// init $scope.difficulties[] - an array of difficulty objects
			$scope.difficulties = [{
				id: 1,
				name: 'Easy',
				img: 'img/e.jpg',
				shortName: 'e',
				active: false,
				color: '#66CD00'
			}, {
				id: 2,
				name: 'Intermediate',
				img: 'img/i.jpg',
				shortName: 'i',
				active: false,
				color: '#1ca4d5'
			}, {
				id: 3,
				name: 'Advanced',
				img: 'img/a.jpg',
				shortName: 'a',
				active: false,
				color: '#fbf136'
			}, {
				id: 4,
				name: 'Expert',
				img: 'img/ex.jpg',
				shortName: 'ex',
				active: false,
				color: '#000000'
			}];




		} 
		google.maps.event.addDomListener(window, "DOMContentLoaded", initialize());
	});
});