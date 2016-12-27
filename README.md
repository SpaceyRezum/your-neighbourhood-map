# Neighborhood Map App

The Neighborhood Map App is a SPA (Single Page Application) with the purpose of helping users discovering cool places to visit around their neighborhood or any location they are interested in. These places can be filtered and favorited for next time use.

## Getting Started

Try out the Neighborhood Map App by downloading the current GitHub depository and launch it using a local server such as python SimpleHTTPServer functionality. Make sure you have python installed, open your command line interface, navigate to the downloaded depository and run the following code to launch a local server:

```
python -m SimpleHTTPServer
```

Open your favorite internet browser, head to localhost:8000. You can now start using the Neighborhood Map App.

### Prerequisites

To run a local server, you'll need python, which [you can download here](https://www.python.org/downloads/)

### Using the App

Once you have opened localhost:8000, type a location in the search bar in the top left corner of the page. If the map API finds the location you have entered (or if you have used an autocomplete suggestion), the map should load the top 30 places found nearby out of the FourSquare API.

You can navigate these places by either clicking on them in the suggestion list in the left side menu or by clicking on a map marker to get more information.

You can also use the filter function to re-run the FourSquare API call focusing, this time, on the category you have selected. 

Finally, you have the possibility to favorite locations by clicking on the star next to their name in the left side menu. 

## Built With

* Created with the [Knockout MVVM Framework](http://knockoutjs.com/documentation/introduction.html)
* Using [jQuery library](http://api.jquery.com/) for some of the DOM manipulations
* [Google Maps API](https://developers.google.com/maps/) - World-known API to generate map & fetch geographical information
* [FourSquare Explore Venues API](https://developer.foursquare.com/docs/venues/explore) - Used to generate venue suggestions depending on address entered by user

## Author

**[Alexis Bellet](https://github.com/SpaceyRezum)**
 
