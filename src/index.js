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

	//Finds the distance between two airports and updates the google maps with two airports
	function findAirportsDistance(event) {
		var dist,
			distanceContainer = distanceForm.querySelector('#DistanceContainer'),
			fromAirportSpan = distanceContainer.querySelector('#FromAirportSpan'),
			toAirportSpan = distanceContainer.querySelector('#ToAirportSpan'),
			distanceSpan = distanceContainer.querySelector('#DistanceSpan');

		event.preventDefault();

		if(!fromAirportObj || !toAirportObj) {
			alert("Please select airport from suggestion list");
			return;
		}

		dist = distance(fromAirportObj.lat, fromAirportObj.lon, toAirportObj.lat, toAirportObj.lon, 'N');
		distanceContainer.classList.remove('is-hidden');
		fromAirportSpan.textContent = fromAirportObj.name;
		toAirportSpan.textContent = toAirportObj.name;
		distanceSpan.textContent = Math.round(dist).toFixed(2);

		updateGoogleMaps();
	}

	//helper method to get suggested airports with input value
	function getFilteredAirports(key) {
		var airportObj;

		autoList = [];
		for(var i = 0; i < usAirports.length; i++) {
			airportObj = usAirports[i];
			if(airportObj.code.toLowerCase().indexOf(key) !== -1 || airportObj.name.toLowerCase().indexOf(key) !== -1 || airportObj.city.toLowerCase().indexOf(key) !== -1 || airportObj.state.toLowerCase().indexOf(key) !== -1) {
				autoList.push(airportObj);
			}
			if(autoList.length === 5) {
				return autoList;
			}
		}
		return autoList;
	}

	//helper method to construct the airports suggestion list
	function getSuggestionListItems() {
		var fragment = document.createDocumentFragment();
		for(var i = 0; i < autoList.length; i++ ) {
			var li = document.createElement('li');
			li.id = autoList[i].code;
			li.textContent = autoList[i].code + ' ' + autoList[i].city+ ' ' +autoList[i].state;
			fragment.appendChild(li);
		}
		return fragment;
	}

	//Updating the google maps with two airport points
	function updateGoogleMaps() {
		var map,
			marker,
			i,
			markers = [],
			bounds = new google.maps.LatLngBounds(),
			infowindow = new google.maps.InfoWindow(),
			mapContainer = mainContainer.querySelector('#MapContainer'),
			mapOptions = {
    	    	mapTypeId: 'roadmap'
    		};

		markers.push(fromAirportObj);
		markers.push(toAirportObj);

		map = new google.maps.Map(mapContainer, mapOptions);
    	map.setTilt(45);

	    for( i = 0; i < markers.length; i++ ) {
	        var position = new google.maps.LatLng(parseFloat(markers[i].lat), parseFloat(markers[i].lon));
	        bounds.extend(position);
	        marker = new google.maps.Marker({
	            position: position,
	            map: map,
	            title: markers[i].name
	        });
	          
	        google.maps.event.addListener(marker, 'click', (function(marker, i) {
	            return function() {
	                infoWindow.setContent(markers[i].name);
	                infoWindow.open(map, marker);
	            }
	        })(marker, i));

	        map.fitBounds(bounds);
	    }
	}
	
	//Requests and Common Functions

	//common request handler method
	function makeRequest(url, cb) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);

		xhr.onload = function (e) {
	        if (xhr.readyState === 4) {
	            if (xhr.status === 200) {
		            var res = xhr.responseText;
	                cb(JSON.parse(res));
	            } else {
	                cb(null);
	            }
	        }
	    };
    	xhr.send(null);
	}

	//distance finder with two latitude and longitude points
	function distance(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
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
