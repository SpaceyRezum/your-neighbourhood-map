/* viewmodel.js is where the ViewModel object connecting the view (index.html) and the model(s)through the knockout framework is stored */var ViewModel = {    self: this,    address: ko.observable(''), // Observable value to save the real-time value of the Address Search textBox    formattedAddress: ko.observable(''), // Observable value to store/display the formatted address of each research    preFavLocation: ko.observable(''), // Variable storing the previously entered address before displaying favorites    navButtonText: ko.observable('Favorites'),    filterInput: ko.observable(''), // stores the filter input from the user    suggestionList: ko.observableArray(), // Observable array to store the list of suggestion from 4Square (used as model)    filteredList: ko.observableArray(), // Observable array to store the filtered list of results (used with the view)    favoriteList: ko.observableArray(),    errorStatus: 'Sorry, the address couldn\'t be found due to ', // Stores a standard error status    markerList: [],    itemFocused: ko.observable(null),    lastItemFocused: ko.observable(null),    displayOrHideTransit: ko.observable('Display Transit Options (if available)'), // Observable value changing when the user displays or hides transit option    transitLayerActive: ko.observable(false),    sidebarToggled: ko.observable(false),    confirmAddress: function(formattedAddress) {        // takes in a DOM input as a paramater and passes it in ViewModel.formattedAddress observable        // to make sure to get the right address even when autocomplete suggestion is selected.        ViewModel.formattedAddress(formattedAddress);        ViewModel.updateMap(ViewModel.formattedAddress());    },    // Function updating the map when user enters its input (address)    updateMap: function(address) {        ViewModel.suggestionList.removeAll();        if (ViewModel.navButtonText() === 'Back to List') {            ViewModel.navButtonText('Favorites');        }        // creates a geocoder to retrieve lat/lng of string-type address        var geocoder = new google.maps.Geocoder();        // obtains the geocode of the user input        geocoder.geocode({            address: address        }, function(results, status) {            if (status === google.maps.GeocoderStatus.OK) {                if (results[0]) {                    // centers the map with geocode results                    map.setCenter(results[0].geometry.location);                    map.setZoom(14);                    // Updates the formattedAddress binding                    ViewModel.formattedAddress(results[0].formatted_address);                    // captures formatted values of lat & lng coordinates and Address for API uses                    var Address = results[0].formatted_address;                    var Lat = results[0].geometry.location.lat();                    var Lng = results[0].geometry.location.lng();                    // passes lat & lng parameters to update the list of suggestion                    ViewModel.updateSuggestionList(Lat, Lng);                }            } else {                // alerts user that an error occured while searching for input                ViewModel.formattedAddress(ViewModel.errorStatus + status);            }        });    },    updateSuggestionList: function(lat, lng) {        var fourSquareAuthToken = 'oauth_token=MKBPLNIJAWXXU1E1KGV5NHEUNZD5GCCZX5ETXKEPCBMXPKJ0&v=20161111';        // takes the formatted_address parameter and builds a valid foursquare ajax request url        var fourSquareAjaxUrl = 'https://api.foursquare.com/v2/venues/explore?ll=' + lat + ',' + lng +            '&' + fourSquareAuthToken;        // requests a listing of suggestions from Foursquare API        $.ajax(fourSquareAjaxUrl, {            success: function(responseObject, status) {                var responseList = responseObject.response.groups[0].items;                for (var i = 0; i < responseList.length; i++) {                    // adds a favorited property in case the venue is found in localStorage (i.e. was previously favorited)                    if (window.localStorage.getItem(responseList[i].venue.id)) {                        responseList[i].venue.favorited = ko.observable(true);                    } else {                        responseList[i].venue.favorited = ko.observable(false);                    }                    // pushes the venue in the suggestionList                    ViewModel.suggestionList.push(responseList[i].venue);                }                // running filterResults is necessary to store relevant suggestions in filteredList                ViewModel.filterResults();            },            error: function(request, status) {                alert('there was an error with the request to the foursquare API');                console.log(request);            }        });    },    // function creating markers from a list passed as parameter and adjusting the map's bounds    createMarkersAndFitBounds: function(listOfSuggestions) {        // first sets the map of existing markers to null        ViewModel.markerList.forEach(function(place) {            place.setMap(null);        });        // resets the list of markers        ViewModel.markerList = [];        // creates an array to store all the latlng coordinates of each marker        var bounds = new google.maps.LatLngBounds();        // repopulate list of markers with new suggestions        listOfSuggestions.forEach(function(place, index) {            // stores marker specific content to be used when creating the marker            var markerContent = '<div class=\'infowindow\'>' +                '<h3>' + place.name + '</h3>' +                '<p>' + place.categories[0].name + '</p></br>';            // loops over the formattedAddress array and adds it to the markerContent            if (place.location.formattedAddress) {                for (var i = 0; i < place.location.formattedAddress.length; i++) {                    markerContent += '<p>' + place.location.formattedAddress[i] + '</p>';                }            }            // if the location has a url, adds it to the markerContent            if (place.url !== undefined) {                markerContent += '</br><a href=\'' + place.url + '\'>' + place.url + '</a>';            }            // closes the markerContent's div tag            markerContent += '</div>';            // transforms the place's index into a string in order to use it as label            var indexToString = (index + 1).toString();            // creates the google map marker for the place            var marker = new google.maps.Marker({                // once created the markers will drop on screen                animation: google.maps.Animation.DROP,                map: map,                label: indexToString,                content: markerContent,                position: {                    lat: place.location.lat,                    lng: place.location.lng                },                index: index            });            // adds the marker's lat & lng coordinates to the bounds array.            // it will allow us later to fit the bounds and zoom of the map to our marker list            bounds.extend(marker.getPosition());            // Adds a global click event listener on markers to create toggle animation and infowindow opening            google.maps.event.addListener(marker, "click", (function(marker) {                return function(evt) {                	ViewModel.suggestionFocusChange(index);                };            })(marker));            // populates the markerList array with markers in order to be able to delete them later on            ViewModel.markerList.push(marker);        });        map.fitBounds(bounds);        // adds an event listener so that any window resize will trigger map.fitBounds        google.maps.event.addDomListener(window, 'resize', function() {            map.fitBounds(bounds);        });    },    getTransitOptions: function() {        // displays or hides transit options if available        if (ViewModel.transitLayerActive() === false) {            // if the transitLayer isn't active, creates a global variable to be toggled            transitLayer = new google.maps.TransitLayer();            transitLayer.setMap(map);            ViewModel.transitLayerActive(true);            // changes the message on the button            ViewModel.displayOrHideTransit('Hide Transit Options');        } else {            transitLayer.setMap(null);            ViewModel.transitLayerActive(false);            ViewModel.displayOrHideTransit('Display Transit Options (if available)');        }    },    suggestionFocusChange: function(itemIndex) {        ViewModel.applyListStyle(itemIndex);        ViewModel.applyMarkerAnimation(itemIndex);        // adjusts the lastItemFocused value        ViewModel.lastItemFocused(itemIndex);    },    applyListStyle: function(itemIndex) {        // updates the itemFocused value so that the corresponding item receives animating class        if (parseInt(itemIndex) === ViewModel.itemFocused()) {            ViewModel.itemFocused(null);        } else {            ViewModel.itemFocused(itemIndex);            // brings the highlighted list element on top of the list            // thanks to StackOver Thread: http://stackoverflow.com/questions/2905867/how-to-scroll-to-specific-item-using-jquery            // the use of jQuery allows us to simplify the code by using the animate, offset and scrollTop functions hereunder            // as well as linking click on markers to suggestion-list            var listItemContainer = $('.suggestion-list');            var listItemDiv = $('.item-clicked');            listItemContainer.animate({                scrollTop: listItemDiv.offset().top - listItemContainer.offset().top + listItemContainer.scrollTop()            });        }    },    applyMarkerAnimation: function(itemIndex) {        var markerToAnimate = ViewModel.markerList[itemIndex];        var lastMarkerAnimated = ViewModel.markerList[ViewModel.lastItemFocused()];      	var label;        populateInfoWindow(markerToAnimate, map);        // if the user clicks on an item for the first time, sets the label of         // corresponding marker to null (otherwise label won't bounce) and toggles animation        if (ViewModel.itemFocused() !== null && !lastMarkerAnimated) {            markerToAnimate.setLabel(null);            markerToAnimate.setAnimation(google.maps.Animation.BOUNCE);            // if the user clicks on the same item twice, puts its label back on and removes animation        } else if (ViewModel.itemFocused() === null) {            label = (itemIndex + 1).toString();            markerToAnimate.setLabel(label);            // animation is set back to -1 instead of null to allow continuous bouncing when set back to 1            // see http://stackoverflow.com/questions/20328326/google-maps-api-v3-markers-dont-always-continuously-bounce            markerToAnimate.setAnimation(-1);            infoWindow.close();            // if the user clicks on another marker after having clicked on one, sets the label            // of the lastMarkerAnimated back on and removes animation, meanwhile toggles label & animation            // for the currently animated marker         } else {            label = (ViewModel.lastItemFocused() + 1).toString();            lastMarkerAnimated.setLabel(label);            lastMarkerAnimated.setAnimation(-1);            markerToAnimate.setLabel(null);            markerToAnimate.setAnimation(google.maps.Animation.BOUNCE);        }    },    // filters results with the current filter value (which might be null if the user ran another location search)      filterResults: function() {        // empties filteredList to repopulate from scratch        ViewModel.filteredList.removeAll();        var filter = ViewModel.filterInput().toLowerCase();        if (filter === '') {            // no filter are passed in, so takes all the suggestionList results, pushes them in             // filteredList and create Markers             ViewModel.suggestionList().forEach(function(suggestion, index) {                // pushes a fix index number that will allow us to link the element with its marker                // even after suggestion list was filtered                suggestion.index = index;                ViewModel.filteredList.push(suggestion);            });            // creates the markers and fits the map bounds according to the new results            ViewModel.createMarkersAndFitBounds(ViewModel.filteredList());        } else {            // checks if any suggestionList suggestion is valid after being compared against the filter,             // if so, pushes it to filteredList and hide/show marker            ViewModel.suggestionList().forEach(function(suggestion, index) {                if (suggestion.categories[0].pluralName.toLowerCase().includes(filter)) {                    ViewModel.filteredList.push(suggestion);                    suggestion.index = index;                    ViewModel.markerList[index].setVisible(true);                } else {                    ViewModel.markerList[index].setVisible(false);                }            });        }        infoWindow.close();    },    removeFilter: function() {        ViewModel.filterInput('');        ViewModel.filteredList.removeAll();        ViewModel.suggestionList().forEach(function(suggestion, index) {            ViewModel.filteredList.push(suggestion);        });        ViewModel.createMarkersAndFitBounds(ViewModel.filteredList());        infoWindow.close();    },    loadFavoriteList: function() {        if (ViewModel.favoriteList().length > 0) {            ViewModel.favoriteList.removeAll();        }        // loops through local storage searching for 4Square elements        for (var i = 0; i < window.localStorage.length; i++) {            var venue = JSON.parse(window.localStorage.getItem(window.localStorage.key(i)));            // filters 4Square results from other stuff stored in localStorage            if (venue.beenHere) {                venue.favorited = ko.observable(true);                ViewModel.favoriteList.push(venue);            }        }    },    // add a function for adding a new favorite or link the existing one    displayHideFavorite: function() {        if (ViewModel.navButtonText() === 'Favorites') {            ViewModel.preFavLocation(ViewModel.formattedAddress());            ViewModel.formattedAddress('Favorited Venues');            ViewModel.navButtonText('Back to List');            // creates and populates all markers with favorite list            ViewModel.createMarkersAndFitBounds(ViewModel.favoriteList());        } else {            ViewModel.navButtonText('Favorites');            ViewModel.formattedAddress(ViewModel.preFavLocation());            ViewModel.createMarkersAndFitBounds(ViewModel.filteredList());        }    },    favorite: function(data, event) {        // stores ID of favorited list item        var favoriteID = data.id;        // checks whether the item already is favorited, if so, removes it from the list        // otherwise adds it to the list of favorite        if (window.localStorage.getItem(favoriteID)) {            data.favorited(false);            window.localStorage.removeItem(favoriteID);            // loads the favorite list in the background so when user presses displays favorite, it is already updated            if (ViewModel.navButtonText() === 'Favorites') {                ViewModel.loadFavoriteList();            }        } else {            data.favorited(true);            ViewModel.favoriteList.push(data);            window.localStorage.setItem(favoriteID, JSON.stringify(data));        }    },    toggleSidebar: function(data, event) {        if (ViewModel.sidebarToggled() === true) {            ViewModel.sidebarToggled(false);        } else {            ViewModel.sidebarToggled(true);        }    }};ko.applyBindings(ViewModel);