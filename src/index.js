(function() {
	var usAirports = [],
		autoList = [],
		apiURL = "data/usairports.json",
		fromAirportObj,
		toAirportObj,
		isFromAirport = true,
		mainContainer = document.getElementById('MainContainer'),
		distanceForm = mainContainer.querySelector('#DistanceForm'),
		airportInputs = distanceForm.querySelector('#AirportInputs'),
		suggestionList = distanceForm.querySelector('#SuggestionList');

	//Getting the complete US Airports data
	makeRequest(apiURL, onDataLoaded);

	function onDataLoaded(res) {
		if(res) {
			usAirports = res;
		}
	}

	//Events and Handling Functions
	airportInputs.addEventListener('keyup', onAirportKeyUp);
	suggestionList.addEventListener('click', onSuggestionClick);
	distanceForm.addEventListener('submit', findAirportsDistance);

})();

//Google Map Initialization
function initMap() {
	function success(pos) {
		var mapAttrs = {lat: pos.coords.latitude, lng: pos.coords.longitude};
		var map = new google.maps.Map(document.getElementById('MapContainer'), {
		  zoom: 6,
		  center: mapAttrs
		});
		var marker = new google.maps.Marker({
		  position: mapAttrs,
		  map: map
		});
	}
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success);
	}
}
