var map;
var mapCenter = new google.maps.LatLng(36.379, -105.254);
var app = angular.module('afMap', []);

// returnColor(difficulty) receives the shortName of a difficulty and returns the corresponding hex value
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

function getDifficultyName(difficulty) {
	switch (difficulty) {
		case "e":
			return 'Easiest';
		case "i":
			return 'Intermediate';
		case "a":
			return 'Advanced';
		case "ex":
			return 'Expert Only';
	}
}

// angular service to return array of geoJSON trail objects
app.factory('myService', function($http) {
	return {
		getTrailData: function() {
			// return $http.get('http://localhost:8080/api/trails/').then(function(result) {
		    return $http.get('http://107.170.53.46:8080/api/trails/').then(function(result) {
		    	return result.data;
		    });
		}
	}
});

// angular application controller
app.controller('MainCtrl', function($scope, myService) {
	// service returns trail data before controller logic begins
	myService.getTrailData().then(function(trailData) {
		var trails = [];
		var markers = [];
		var infowindows = [];
		$scope.mapTypes = ["Satellite", "Topo"];
		$scope.trailData = trailData;
		$scope.allTrails = [];
		$scope.difficulties = [];

		function initialize() {
			// init google.maps.MapOptions
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
			
			var GeoMarker = new GeolocationMarker(map);

			// init trails[] - google.maps.Data[] for trail overlays on map + hover/click functions
			setTrails(trailData, map);

			// init $scope.allTrails[] - an array of trail data objects for map controls
			setTrailControls(trails, trailData, map);

			// init $scope.difficulties[] - array of difficulty objects for map controls
			setDifficulties();

			// init hub markers + click functions
			setMarkers(map);

			// show all trails by default
			$scope.showAllTrails();

		}

		function setTrails(trailData, map) {
			var trail, key, center;
			for (key = 0; key < trailData.length; key++){
				// define center position + remove elevation
				center = trailData[key].geometry.coordinates[Math.round(trailData[key].geometry.coordinates.length / 2)];
				(center.length != 2) ? center.pop() : center;

				trails[key] = new google.maps.Data();
				trails[key].addGeoJson(trailData[key]);
				trails[key].setStyle({
					strokeColor: returnColor(trailData[key].properties.difficulty),
					strokeOpacity: 0.75,
					strokeWeight: 4,
					name: trailData[key].properties.name,
					difficulty: trailData[key].properties.difficulty,
					num: key,
					id: trailData[key].properties.id,
					segment: trailData[key].properties.segment,
					center: center,
					zoom: 15,
					description: trailData[key].properties.description
				});

				trail = trails[key];

				if (trail.style.name != "Chair Lift") {
					// event listener to increase weight of trail on mouseover
					google.maps.event.addListener(trail, 'mouseover', (function(trail, key) {
						return function() {
							trail.setStyle({
								strokeColor: returnColor(trail.style.difficulty),
								strokeOpacity: 1,
								strokeWeight: 5,
								name: trail.style.name,
								difficulty: trail.style.difficulty,
								num: key,
								id: trail.style.id,
								segment: trail.style.segment,
								center: trail.style.center,
								description: trail.style.description
							});
						}
					})(trail, key));

					// event listener to decrease weight of trail on mouseout
					google.maps.event.addListener(trail, 'mouseout', (function(trail, key) {
						return function() {
							trail.setStyle({
								strokeColor: returnColor(trail.style.difficulty),
								strokeOpacity: 0.75,
								strokeWeight: 4,
								name: trail.style.name,
								difficulty: trail.style.difficulty,
								num: key,
								id: trail.style.id,
								segment: trail.style.segment,
								center: trail.style.center,
								description: trail.style.description
							});
						}
					})(trail, key));

					// create infoWindows
					var contentString =
						'<div class="iw-content">' +
							'<div class="iw-header">' + trail.style.id + ' - ' + trail.style.name + ' (#' + trail.style.segment + ')' + '</div>' +
							'<div class="iw-difficulty">' + getDifficultyName(trail.style.difficulty) + '</div>' +
							'<div class="iw-description">' + trail.style.description + '</div>' +
						'</div>';

					infowindows[key] = new google.maps.InfoWindow({
						content: contentString
					});

					// event listener to move to center of segment and show infoWindow on click
					google.maps.event.addListener(trail, 'click', (function(trail, key, map) {
						return function() {
							console.log(trail.style.name + " has been clicked");
							marker = new google.maps.Marker({icon:{}, map:map, position:{lat: trail.style.center[1], lng: trail.style.center[0]}, title:trail.style.name});
							marker.setVisible(false);
							map.setCenter({lat: trail.style.center[1], lng: trail.style.center[0]});
							infowindows[key].open(map, marker);
						}
					})(trail, key, map));
				}
			}
		}

		function setTrailControls(trails, trailData, map) {
			for (var i in trails) {
				// if the current trail is a unique trail, add it to $scope.allTrails[]
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
				// if the current trail is a segment of a previous trail, add it to $scope.allTrails[].segments[]
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
		}

		function setDifficulties() {
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

		function setMarkers(map) {
			var marker, i;
			var markerData = [
				{lat: 36.372149, lng: -105.245045, icon: 'img/a.png'},
				{lat: 36.372304, lng: -105.252478, icon: 'img/b.png'},
				{lat: 36.378944, lng: -105.247422, icon: 'img/c.png'},
				{lat: 36.380713, lng: -105.253571, icon: 'img/d.png'},
				{lat: 36.380236, lng: -105.260261, icon: 'img/e.png'},
				{lat: 36.382454, lng: -105.258893, icon: 'img/f.png'}
			];

			for (i = 0; i < markerData.length; i++) {
				// create markers
				marker = new google.maps.Marker({
					position: new google.maps.LatLng(markerData[i].lat, markerData[i].lng),
					map: map,
					icon: markerData[i].icon
				});
				// event listener to zoom to center of marker on click
				google.maps.event.addListener(marker, 'click', (function(marker, i) {
					return function() {
						map.setZoom(18);
						map.setCenter({lat: markerData[i].lat, lng: markerData[i].lng});
					}
				})(marker, i));
			}
		}

		// $scope.toggleSegment() - show/hide certain segment
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

		// $scope.toggleTrail() - show/hide all segments of a certain trail
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

		// $scope.toggleDifficulty() - show/hide all trails of a certain difficulty
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
					if($scope.allTrails[i].segments[j].name != "Chair Lift") {
						trails[$scope.allTrails[i].segments[j].num].setMap(null);
						$scope.allTrails[i].segments[j].active = false;
					}
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

		google.maps.event.addDomListener(window, "DOMContentLoaded", initialize());
	});
});