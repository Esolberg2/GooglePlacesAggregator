/* eslint-disable */ 

import { dummyGoogleCall } from './dummyCall.js'

class GooglePlacesApiManager {
	constructor() {
		this.tag = undefined
		this.map = undefined
		this.service = undefined

		function callback() {
			return
		}
		window.callback = callback
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

// 	updateGoogleApi(apiKey) {
// 		if (store.getState().settingsPanel.googlePlacesLibLoading) {
//       return;
//     };

// 		store.dispatch(settingsPanelActions.setGooglePlacesLibLoading(true))

//     this.removeGoogle();
//     this.tag = document.createElement('script');
//     this.tag.type = 'text/javascript';
//     this.tag.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=places&callback=callback`;
//     this.tag.id = 'googleMaps';
//     this.tag.async = false;
//     this.tag.defer = false;
// 		this.tag.onload = () => {
// 			this.service = new window.google.maps.places.PlacesService(document.getElementById('map'));
// 			store.dispatch(settingsPanelActions.setGooglePlacesLibLoading(false))
// 		}
//     document.body.appendChild(this.tag);

// 		// rebuild the map and service
// 		this.createMap();
//   }

updateGoogleApi(apiKey) {
	console.log("updateGoogleApi", apiKey)
	let promise = new Promise((resolve) => {
		this.removeGoogle();
		this.tag = document.createElement('script');
		this.tag.type = 'text/javascript';
		this.tag.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=places&callback=callback`;
		this.tag.id = 'googleMaps';
		this.tag.async = false;
		this.tag.defer = false;
		this.tag.onload = () => {
			this.service = new window.google.maps.places.PlacesService(document.getElementById('map'));
			console.log("onload")
			resolve()
		}
		document.body.appendChild(this.tag);

		this.createMap();
	})
	return promise
	}

  async removeGoogle() {
    if (window.google !== undefined) {
      await delete window.google
    }
    if (this.tag) {
			this.tag.parentNode.removeChild(this.tag)
      this.tag = null
    }
  }
}

export const googlePlacesApiManager = new GooglePlacesApiManager()
