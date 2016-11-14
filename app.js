/* app.js is where the ViewModel object connecting the view (index.html) and the model(s)through the knockout framework is stored */var ViewModel = {	self: this,	map: {}, // Created map as a global variable to be able to access and modify it later on	address: ko.observable(''), // Observable value to save the real-time value of the Address Search textBox	formattedAddress: ko.observable(''), // Observable value to display the formatted address of each research	suggestionList: ko.observableArray(), // Observable array to store the list of suggestion from 4Square	locationConfirm: ko.observable('not set'),	errorStatus: 'Sorry, the address couldn\'t be found due to ', // Stores a standard error status	markerList: [],	/* Function initializing the map once the Google Maps API script finished loading	also specifies the DOM element to which the map will be attached */	initMap: function() {	  map = new google.maps.Map(document.getElementById('map-container'), {			center: {lat: -34.39, lng: 150.64},			zoom: 8		});		// Allow autocomplete for the input search box with the id 'address'		var autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'),{types:['geocode']});	},	// Function updating the map when user enters its input (address)	updateMap: function() {		// next two lines reset the suggestionList and hides the locationConfirm buttons		ViewModel.locationConfirm('not set');		ViewModel.suggestionList.removeAll();		// creates a geocoder to retrieve lat/lng of string-type address		var geocoder = new google.maps.Geocoder();		// obtains the geocode of the user input		geocoder.geocode({address: ViewModel.address()}, function(results, status) {			if (status === google.maps.GeocoderStatus.OK) {				if (results[0]) {					// centers the map with geocode results			  	map.setCenter(results[0].geometry.location);			  	map.setZoom(14);			  	// Updates the formattedAddress binding			  	ViewModel.formattedAddress(results[0].formatted_address);			  	// captures formatted values of lat & lng coordinates and Address for API uses			  	var Address = results[0].formatted_address;			  	var Lat = results[0].geometry.location.lat();			  	var Lng = results[0].geometry.location.lng();			  	// passes lat & lng parameters to update the list of suggestion			  	ViewModel.updateWalkScore(Lat, Lng, Address);			  	ViewModel.updateSuggestionList(Lat, Lng);				};			} else {				// alerts user that an error occured while searching for input				ViewModel.formattedAddress(ViewModel.errorStatus + status);			};		});	},	updateWalkScore: function(lat, lng, address) {		var WalkscoreAPIKey = '6add8e94aa58a6ee9aec87efbf933652';		var WalkscoreAPIRequest = 'http://api.walkscore.com/score?format=json&address=' + address + '&lat=' +		lat + '&lng=' + lng + '&wapikey=' + WalkscoreAPIKey;	},	updateSuggestionList: function(lat, lng) {		var fourSquareAuthToken = 'oauth_token=MKBPLNIJAWXXU1E1KGV5NHEUNZD5GCCZX5ETXKEPCBMXPKJ0&v=20161111';		// takes the formatted_address parameter and builds a valid foursquare ajax request url		var fourSquareAjaxUrl = 'https://api.foursquare.com/v2/venues/explore?ll=' + lat +  ',' + lng +		'&' + fourSquareAuthToken;		// requests a listing of suggestions from Foursquare API		$.ajax(fourSquareAjaxUrl, {			success: function(responseObject, status) {				if (status === 'success') {					for (var i = 0; (i < 20) || (i < responseObject.response.groups[0].items.length); i++) {						ViewModel.suggestionList.push(responseObject.response.groups[0].items[i]);					};				};			},			error: function(request, status) {				if (status === 'error') {					alert('there was an error with the request to the foursquare API');					console.log(request);				};			}		});	},	// function creating markers from the suggestionList formerly populated	createMarkers: function() {		// first sets the map of existing markers to null		ViewModel.markerList.forEach(function(element){element.setMap(null)});		// resets the list of markers		ViewModel.markerList = [];		// repopulate list of markers with new suggestions		ViewModel.suggestionList().forEach(function(element) {			var marker = new google.maps.Marker({				// once created the markers will drop on screen				animation: google.maps.Animation.DROP,				map: map,				position: {lat: element.venue.location.lat, lng: element.venue.location.lng}			});			// populates the markerList array with markers in order to be able to delete them later on			ViewModel.markerList.push(marker);		});	},	confirmLocation: function() {		ViewModel.locationConfirm('confirmed');	},	specifyLocation: function() {		ViewModel.locationConfirm('not confirmed');	}	// use a comma here};ko.applyBindings(ViewModel);