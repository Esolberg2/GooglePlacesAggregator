import * as turf from '@turf/turf'
import { store } from '../store'
import { dummyGoogleCall } from './dummyCall.js'
import { settingsPanelActions } from '../features/settingsPanel/settingsPanelSlice'


class GooglePlacesApiManager {

	constructor() {
    this.service = undefined;
    this.tag = undefined;

		let callBackScript = document.createElement('script');
		callBackScript.text = function callback(results, status) {
			console.log("results", results)
			console.log("status", status)
			store.dispatch(settingsPanelActions.setGooglePlacesLibLoading(false))
		}
		callBackScript.async = false;
		callBackScript.defer = false;
		document.body.appendChild(callBackScript);

    this.observer = new MutationObserver((mutations, obs) => {
      if (window.google !== undefined) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        this.service = service;
				store.dispatch(settingsPanelActions.setGooglePlacesLibLoading(false))
        console.log("DONE LOADING");
        return;
      };
    });

    this.observer.observe(document, {
      childList: true,
      subtree: true
    });
	};

  nearbySearch() {
    console.log("nearbySearch")

		try {
			let coords = store.getState().search.nextCenter;
	    let searchType = store.getState().settingsPanel.searchEntityType;
	    let testMode = store.getState().settingsPanel.testMode;

	    let rawData;
	    if (testMode) {
	      console.log("test")
	      rawData = dummyGoogleCall()
	    }
	    else {
	      let request = {
	        location: new window.google.maps.LatLng(coords[1],coords[0]),
	        rankBy: window.google.maps.places.RankBy.DISTANCE,
	        type: searchType
	        };

	      rawData = this.service.nearbySearch(request, function(results,status) {console.log(results, status)});
	    };
			console.log("google search complete")
			console.log(rawData)

	    return rawData
		}
    catch (error) {
			console.log(error.message)
		}
  }


  updateGoogleApi(apiKey) {

		if (store.getState().settingsPanel.googlePlacesLibLoading) {
      console.log("already loading")
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
    document.body.appendChild(this.tag);
    console.log("updateGoogleApi run");
  }

  async removeGoogle() {
    if (window.google !== undefined) {
      await delete window.google
    }
    if (this.tag) {
      this.tag.remove()
      this.tag = null
    }
    if (this.service) {
      this.service = null
    }
    console.log("remove google run")
  }
}

export const googlePlacesApiManager = new GooglePlacesApiManager()
