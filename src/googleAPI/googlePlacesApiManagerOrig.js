import * as turf from '@turf/turf'
import { store } from '../store'
import { dummyGoogleCall } from './dummyCall.js'
import { settingsPanelActions } from '../features/settingsPanel/settingsPanelSlice'
import { nearbySearch as nearbySearchThunk } from '../features/search/searchSlice'

class GooglePlacesApiManager {

	constructor() {
    // this.service = undefined;
    this.tag = undefined;
		this.service = undefined

		let mapElement = document.createElement('div')
		mapElement.id = "map"
		document.body.appendChild(mapElement);


		let callBackScript = document.createElement('script');
		callBackScript.text = function callback(results, status) {
			console.log("callback")
		}
		callBackScript.async = false;
		callBackScript.defer = false;
		document.body.appendChild(callBackScript);
	};

  async nearbySearch() {
		console.log("running nearbySearch")
		try {
			let coords = store.getState().search.nextCenter;
	    let searchType = store.getState().settingsPanel.searchEntityType;
	    let testMode = store.getState().settingsPanel.testMode;

			if (testMode) {
	    	let rawData = dummyGoogleCall()
				return rawData
	    }
	    let request = {
	      location: new window.google.maps.LatLng(coords[1],coords[0]),
	      rankBy: window.google.maps.places.RankBy.DISTANCE,
	      type: searchType
	      };

			// let service = new window.google.maps.places.PlacesService(document.getElementById('map'));

			function callback(results) {
				console.log(results)
	        let lastLat = results[results.length-1].geometry.location.lat()
	        let lastLon = results[results.length-1].geometry.location.lng()
	        let from = turf.point(coords);
	        let to = turf.point([lastLon, lastLat]);
	        let options = {units: 'miles'};
	        let distance = turf.distance(from, to, options);
	        let data =  {"radius": distance, "googleData": results}
					store.dispatch(nearbySearchThunk(data))
	        }
			console.log('running nearby search')
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
    this.tag.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=places&callback=callback&fields=[business_status]`;
    this.tag.id = 'googleMaps';
    this.tag.async = false;
    this.tag.defer = false;
		this.tag.onload = () => {
			store.dispatch(settingsPanelActions.setGooglePlacesLibLoading(false))
			this.service = new window.google.maps.places.PlacesService(document.getElementById('map'));
		}
    document.body.appendChild(this.tag);
  }

  async removeGoogle() {
    if (window.google !== undefined) {
      await delete window.google
    }
    if (this.tag) {
      this.tag.remove()
      this.tag = null
    }
  }
}

export const googlePlacesApiManager = new GooglePlacesApiManager()
