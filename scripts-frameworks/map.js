// map.js seperates the map only related functions from the knockout ViewModel
var map = {};
var infoWindow = {};

/* Function initializing the map once the Google Maps API script finished loading
also specifies the DOM element to which the map will be attached */
function initMap() {
    map = new google.maps.Map(document.getElementById('map-container'), {
        center: {
            lat: -34.39,
            lng: 150.64
        },
        zoom: 8
    });

    // initiates the global infoWindow with the map
    infoWindow = new google.maps.InfoWindow();

    // while the infowindow opening function is linked to each marker click event, the closeclick event
    // can already be created in the map initialization phase 
    google.maps.event.addListener(infoWindow, 'closeclick', function() {
        // closing an infoWindow will automatically untoggle all list & marker animation
        ViewModel.suggestionFocusChange(ViewModel.itemFocused());
    });

    // Allow autocomplete for the input search box with the id 'address'
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'), {
        types: ['geocode']
    });

    // loads favorite when the map is loaded
    ViewModel.loadFavoriteList();
    // intitially updates the map when the map is ready
    ViewModel.confirmAddress('Toronto, ON, Canada');
}

function populateInfoWindow(relatedMarker, map) {
    infoWindow.setContent(relatedMarker.content);
    infoWindow.open(map, relatedMarker);
}

function errorHandling() {
    alert('There was an error while loading one of the scripts, please try reloading the page or contact app developer.');
}