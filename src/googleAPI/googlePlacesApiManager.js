
import * as turf from '@turf/turf'
import { store } from '../store'
import { dummyGoogleCall } from './dummyCall.js'
import { settingsPanelActions } from '../features/settingsPanel/settingsPanelSlice'
import { nearbySearch as nearbySearchThunk } from '../features/search/searchSlice'


function testOutput(data) {
	console.log(data)
}


class GooglePlacesApiManager {

	constructor() {
		this.tag = undefined
		this.map = undefined
		this.service = undefined

		// create library callBackScript
		this.callBackScript = document.createElement('script');
		this.callBackScript.text = function callback(results, status) {
			console.log("callback results")
			console.log(results)
		}
		this.callBackScript.async = false;
		this.callBackScript.defer = false;
		document.body.appendChild(this.callBackScript);

	}

	createMap() {
		// remove existing map.
		if (this.map) {
			this.map.parentNode.removeChild(this.map)
      this.map = null
    }

		// create map element
		this.mapElement = document.createElement('div')
		this.mapElement.id = "map"
		this.mapElement.async = false;
    this.mapElement.defer = false;
		document.body.appendChild(this.mapElement);

	}

	async nearbySearch() {
		console.log("running nearbySearch")
		try {
			let coords = store.getState().search.nextCenter;
			console.log(coords)
	    let searchType = store.getState().settingsPanel.searchEntityType;
	    let testMode = store.getState().settingsPanel.testMode;

			if (testMode) {
	    	let rawData = dummyGoogleCall()
				return rawData
	    }

			let origin = {lat: coords[1], lng: coords[0]};
			let request = {
	      location: origin,
	      rankBy: window.google.maps.places.RankBy.DISTANCE,
	      type: searchType
	      };

			function dataHandler(results) {
					results.forEach((item, i) => {
						delete item.opening_hours
						delete item.permanently_closed
					});

					results = JSON.parse(JSON.stringify(results))

	        let lastLat = results[results.length-1].geometry.location.lat
	        let lastLon = results[results.length-1].geometry.location.lng
	        let from = turf.point(coords);
	        let to = turf.point([lastLon, lastLat]);
	        let options = {units: 'miles'};
	        let distance = turf.distance(from, to, options);
	        let data =  {"radius": distance, "googleData": results}
					// store.dispatch(nearbySearchThunk(data))
					console.log(data)
					testOutput(data)
	        }

			function* callback(results) {
			  yield new Promise((resolve, reject) => {
			    resolve(results)
			  })
			}

			this.service.nearbySearch(request, callback);
		}
		catch (error) {
			console.log(error)
		}
	}

	updateGoogleApi(apiKey) {
		if (store.getState().settingsPanel.googlePlacesLibLoading) {
      return;
    };

		store.dispatch(settingsPanelActions.setGooglePlacesLibLoading(true))

    this.removeGoogle();
    this.tag = document.createElement('script');
    this.tag.type = 'text/javascript';
    this.tag.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=places&callback=callback`;
    this.tag.id = 'googleMaps';
    this.tag.async = false;
    this.tag.defer = false; 
		this.tag.onload = () => {
			this.service = new window.google.maps.places.PlacesService(document.getElementById('map'));
			store.dispatch(settingsPanelActions.setGooglePlacesLibLoading(false))
		}
    document.body.appendChild(this.tag);

		// rebuild the map and service
		this.createMap();
  }

  async removeGoogle() {
    if (window.google !== undefined) {
      await delete window.google
    }
    if (this.tag) {
			this.tag.parentNode.removeChild(this.tag)
      // this.tag.remove()
      this.tag = null
    }
  }
}

export const googlePlacesApiManager = new GooglePlacesApiManager()
