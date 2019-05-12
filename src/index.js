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

	//Event handler of airport input keyup to populate the suggested airports
	function onAirportKeyUp(event) {
		var targetElement = event.target,
			keyValue = targetElement.value,
			liItems;

		suggestionList.innerHTML = '';

		if(!keyValue.length) {
			fromAirportObj = null;
			toAirportObj = null;
			return;
		}
		isFromAirport = targetElement.id === "FromAirport" ? true : false;
		if(isFromAirport) {
			suggestionList.classList.remove('float-right');
		} else {
			suggestionList.classList.add('float-right');
		}
		getFilteredAirports(keyValue.toLowerCase());
		liItems = getSuggestionListItems(); 
		suggestionList.appendChild(liItems);
	}

	//On selection of suggested airport sets the input value
	function onSuggestionClick(event) {
		var targetElement = event.target,
			airportCode = targetElement.id,
			fromInput = airportInputs.querySelector('#FromAirport'),
			toInput = airportInputs.querySelector('#ToAirport'),
			airportObj;

		airportObj = autoList.find(function(item) { 
			return item.code === airportCode; 
		});
		if(isFromAirport) {
			fromInput.value = airportObj.name;
			fromAirportObj = airportObj;
		} else {
			toInput.value = airportObj.name;
			toAirportObj = airportObj;
		}
		suggestionList.innerHTML = '';
	}

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
