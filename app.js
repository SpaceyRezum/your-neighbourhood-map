/* app.js is where the ViewModel object connecting the view (index.html) and the model(s)
through the knockout framework is stored */

var ViewModel = {
	initMap: function() {
		// Function initializing the map once the Google Maps API script finished loading
		// also specifies the DOM element to which the map will be attached
	  var map = new google.maps.Map(document.getElementById('map-container'), {
			center: {lat: -34.397, lng: 150.644},
			zoom: 8
		});
	},
};

ko.applyBindings(ViewModel);