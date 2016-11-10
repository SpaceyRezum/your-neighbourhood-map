/* app.js is where the ViewModel object connecting the view (index.html) and the model(s)
through the knockout framework is stored */

var ViewModel = {

	map: {}, // Created map as a global variable to be able to access and modify it later on
	formattedAddress: ko.observable(''), // Observable value to display the formatted address of each research
	errorStatus: 'Sorry, the address couldn\'t be found due to ', // Stores a standard error status

	initMap: function() {
		// Function initializing the map once the Google Maps API script finished loading
		// also specifies the DOM element to which the map will be attached
	  map = new google.maps.Map(document.getElementById('map-container'), {
			center: {lat: -34.397, lng: 150.644},
			zoom: 8
		});
	},

	// Function updating the map when user enters its input (address)
	updateMap: function() {
		var address = $('#address').val();
		// creates a geocoder to retrieve lat/lng of string-type address
		var geocoder = new google.maps.Geocoder();
		// obtains the geocode of the user input
		geocoder.geocode({address: address}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					// centers the map with geocode results
			  	map.setCenter(results[0].geometry.location);
			  	// Updates the formattedAddress binding
			  	ViewModel.formattedAddress(results[0].formatted_address);
				};
			} else {
				// alerts user that an error occured while searching for input
				ViewModel.formattedAddress(ViewModel.errorStatus + status);
			};
		});
	}

	// use a comma here


};

ko.applyBindings(ViewModel);