angular
	.module('afMap')
	.factory('dataService', dataService);

dataService.$inject = ['$http'];

function dataService($http) {
	return {
		getTrailData: getTrailData
	};

	function getTrailData() {
		return $http.get('/api/trails/')
			.then(getDataComplete);

		function getDataComplete(response) {
			return response.data;
		}
	}
}