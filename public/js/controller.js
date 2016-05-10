var map, elevator;

// Load the Visualization API and the columnchart package.
google.load('visualization', '1', {
    packages: ['columnchart']
});

angular.module('afMap').controller('MainCtrl', MainCtrl);

function MainCtrl($scope, dataService) {
	dataService.getTrailData().then(function(trailData) {
		var trails = [];
		var markers = [];
		var infowindows = [];
		var activeKey = '';
		var markerData = [
			{lat: 36.372149, lng: -105.245045, icon: 'img/a.png'},
			{lat: 36.372304, lng: -105.252478, icon: 'img/b.png'},
			{lat: 36.378944, lng: -105.247422, icon: 'img/c.png'},
			{lat: 36.380713, lng: -105.253571, icon: 'img/d.png'},
			{lat: 36.380236, lng: -105.260261, icon: 'img/e.png'},
			{lat: 36.382454, lng: -105.258893, icon: 'img/f.png'}
		];
		$scope.mapTypes = ["Satellite", "Topo"];
		$scope.trailData = trailData;
		$scope.allTrails = [];
		$scope.difficulties = [];

		function initialize() {
			var mapOptions = {
				center: (new google.maps.LatLng(36.379, -105.254)),
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
			$scope.toggleAllTrails('true');

			elevator = new google.maps.ElevationService();
		}

		function setTrails() {
			_.forEach(trailData, function(trail, key) {
				center = trail.geometry.coordinates[Math.round(trail.geometry.coordinates.length / 2)];
				(center.length != 2) ? center.pop() : center;

				trails[key] = new google.maps.Data();
				trails[key].addGeoJson(trail);
				trails[key].setStyle({
					strokeColor: returnColor(trail.properties.difficulty),
					strokeOpacity: 0.75,
					strokeWeight: 4,
					name: trail.properties.name,
					difficulty: trail.properties.difficulty,
					num: key,
					id: trail.properties.id,
					segment: trail.properties.segment,
					center: center,
					zoom: 15,
					description: trail.properties.description
				});

				trail = trails[key];

				if (trail.style.name != "Chair Lift") {
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

					var contentString =
						'<div class="iw-content">' +
							'<div class="iw-header">' + trail.style.id + ' - ' + trail.style.name + ' (#' + trail.style.segment + ')' + '</div>' +
							'<div class="iw-difficulty">' + getDifficultyName(trail.style.difficulty) + '</div>' +
							'<div class="iw-description">' + trail.style.description + '</div>' +
						'</div>';

					infowindows[key] = new google.maps.InfoWindow({
						content: contentString
					});

					google.maps.event.addListener(trail, 'click', (function(trail, key, map) {
						return function() {
							if (activeKey != '') {
								infowindows[activeKey].close();
							}
							console.log(trail.style.name + " has been clicked");
							marker = new google.maps.Marker({map:map, position:{lat: trail.style.center[1], lng: trail.style.center[0]}, title:trail.style.name});
							marker.setVisible(false);
							map.setCenter({lat: trail.style.center[1], lng: trail.style.center[0]});
							infowindows[key].open(map, marker);

							var coords = trailData[trail.style.num].geometry.coordinates;
							var path = [];
							_.forEach(coords, function(point, i) {
								point.length = 2;
								path.push(new google.maps.LatLng(point[1],point[0]));
							});

							drawPath(path);
							activeKey = key;
						}
					})(trail, key, map));
				}
			});
		}

		function setTrailControls() {
			_.forEach(trails, function(trail, i) {
				// if the current trail is a unique trail, add it to $scope.allTrails[]
				if (trail.style.segment == "1" ) {
					$scope.allTrails.push({
						name: trail.style.name,
						difficulty: trail.style.difficulty,
						id: trail.style.id,
						active: false,
						segments: [{
							name: trail.style.name,
							difficulty: trail.style.difficulty,
							id: trail.style.id,
							num: trail.style.num,
							segment: trail.style.segment,
							active: false
						}]
					});
				}
				// if the current trail is a segment of a previous trail, add it to $scope.allTrails[i].segments[]
				else {
					_.forEach($scope.allTrails, function(allTrail, j) {
						if (trail.style.id == allTrail.id) {
							$scope.allTrails[j].segments.push({
								name: trail.style.name,
								difficulty: trail.style.difficulty,
								id: trail.style.id,
								num: trail.style.num,
								segment: trail.style.segment,
								active: false
							});
						}
					});
				}
				// display the chairlift path
				if (trail.style.name == "Chair Lift") {
					trail.setMap(map);
				}
			});
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

		function setMarkers() {
			_.forEach(markerData, function(marker, i) {
				var image = {
					url: markerData[i].icon,
					size: new google.maps.Size(17, 17),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(0, 0)
				};
				marker = new google.maps.Marker({
					position: new google.maps.LatLng(markerData[i].lat, markerData[i].lng),
					map: map,
					icon: image
				});
				// event listener to zoom to center of marker on click
				google.maps.event.addListener(marker, 'click', (function(marker, i) {
					return function() {
						map.setZoom(18);
						map.setCenter({lat: markerData[i].lat, lng: markerData[i].lng});
					}
				})(marker, i));
			});
		}

		function drawPath(path) {
			chart = new google.visualization.ColumnChart(document.getElementById('elevation_chart'));
			var pathRequest = {
				'path': path,
				'samples': 256
			};
			elevator.getElevationAlongPath(pathRequest, plotElevation);
		}

		function plotElevation(results, status) {
			if (status != google.maps.ElevationStatus.OK) {
				return;
			}
			var elevations = results;
			var elevationPath = [];
			_.forEach(results, function(point, i){
				elevationPath.push(elevations[i].location);
			});

			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Distance');
			data.addColumn('number', 'Elevation');

			var distance, prevLat, prevLng, currLat, currLng, p1, p2;
			var distances = [];

			_.forEach(results, function(point, i) {
				prevIdx = (i > 0) ? i - 1 : i;

				var p1 = new google.maps.LatLng(results[prevIdx].location.lat(), results[prevIdx].location.lng());
				var p2 = new google.maps.LatLng(results[i].location.lat(), results[i].location.lng());

				distance = (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) * 3.28084).toFixed(0);
				distance = +distance;
				if (i > 0) {
					distances[i] = distances[i - 1] + distance;
				}
				else {
					distances[i] = distance;
				}
			});

			for (var i = 0; i < results.length; i++) {
				data.addRow([distances[i].toString(), (elevations[i].elevation * 3.28084)]);
			}

			var elevationData = [];
			_.forEach(elevations, function(elevationObj, i){
				elevationData.push(elevationObj.elevation);
			});
			
			var trailVert = ((_.max(elevationData) - _.min(elevationData)) * 3.28084).toFixed(0);
			var trailLength = (_.max(distances) / 5280).toFixed(1);
			var trailGrade = ((trailVert / _.max(distances)) * 100).toFixed(0);
			var trailInfo =  trailVert + ' ft descent - ' + trailLength + ' miles - ' + trailGrade + '% Average Grade';

			document.getElementById('elevation_container').style.display = 'block';
			chart.draw(data, {
				height: 150,
				legend: 'none',
				smoothLine: 'true',
				titleFontSize: 12,
				axisFontSize: 10,
				title: trailInfo,
				titleY: 'Elevation (ft)',
				titleX: 'Distance (ft)',
				enableTooltip: false
			});

		}

		// $scope.toggleSegment() - show/hide certain segment
		$scope.toggleSegment = function(toggledSegment) {
			console.log(((toggledSegment.active) ? "Hiding" : "Showing") + " SEGMENT " + toggledSegment.name + " #" + trails[toggledSegment.num].style.segment);
			_.forEach($scope.allTrails, function(trail) {
				_.find(trail.segments, function(segment) {
				// find the toggled segment in the $scope.allTrails.segments[], display it, change it to active state
					if (segment.num == toggledSegment.num) {
						var mapStatus = (segment.active) ? null : map;
						trails[toggledSegment.num].setMap(mapStatus);
						segment.active = !segment.active;
					}
				});
			});
		}

		// $scope.toggleTrail() - show/hide all segments of a certain trail
		$scope.toggleTrail = function(toggledTrail) {
			var rightTrail;
			var activeMap = (toggledTrail.active) ? null : map;
			console.log(((toggledTrail.active) ? "Hiding" : "Showing") + ' TRAIL ' + toggledTrail.name);
			_.forEach($scope.allTrails, function(trail, i) {
				if (trail.id == toggledTrail.id) { rightTrail = i }
				_.forEach(trail.segments, function(segment, j) {
					if (segment.id == toggledTrail.id) {
						trails[segment.num].setMap(activeMap);
						segment.active = !(toggledTrail.active);
					}
				});
				trail.active = !trail.active;
			});
		}

		// $scope.toggleDifficulty() - show/hide all trails of a certain difficulty
		$scope.toggleDifficulty = function(toggledDifficulty) {
			var activeState;
			_.forEach($scope.difficulties, function(difficulty) {
				if (difficulty.shortName == toggledDifficulty) {
					activeState = !difficulty.active;
					difficulty.active = !difficulty.active;
				}
			});
			_.forEach($scope.allTrails, function(trail, i) {
				if (trail.difficulty == toggledDifficulty) {
					console.log(((trail.active) ? "Hiding" : "Showing") + ' DIFFICULTY ' + getDifficultyName(trail.difficulty));
					var activeMap = (trail.active) ? null : map;
					_.forEach(trail.segments, function(segment, j) {
						trails[segment.num].setMap(activeMap);
						segment.active = activeState;
					});
				}
				trail.active = activeState;
			});
		}

		// activeState=true shows all trails, =false hides all trails
		$scope.toggleAllTrails = function(activeState) {
			console.log(((activeState) ? "Showing" : "Hiding") + " ALL TRAILS");
			var activeMap = (activeState) ? map : null;
			_.forEach($scope.allTrails, function(trail, i) {
				_.forEach(trail.segments, function(segment, j) {
					trails[segment.num].setMap(activeMap);
					segment.active = activeState;
				});
				trail.active = activeState;
			});
			_.forEach($scope.difficulties, function(value, key) {
				value.active = activeState;
			});
		}

		$scope.hideElevation = function() {
			document.getElementById('elevation_container').style.display = 'none';
		}

		// overlayControls function to set the google map type
		$scope.setMapType = function(type) {
			(type === "Satellite") ? map.setMapTypeId(google.maps.MapTypeId.SATELLITE) : map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
		}

		google.maps.event.addDomListener(window, "DOMContentLoaded", initialize());
	});
}

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
