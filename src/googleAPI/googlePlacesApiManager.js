import * as turf from '@turf/turf'
import { store } from '../store'
import { dummyGoogleCall } from './dummyCall.js'

// import React, { useState } from 'react'


class GooglePlacesApiManager {

	constructor() {
    this.service = undefined;
    this.tag = undefined;
    this.loading = false;

		let callBackScript = document.createElement('script');
		callBackScript.text = function callback() {console.log(window.google)}
		callBackScript.async = false;
		callBackScript.defer = false;
		document.body.appendChild(callBackScript);

    this.observer = new MutationObserver((mutations, obs) => {
      if (window.google !== undefined) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        this.service = service;
        this.loading = false;
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
    if (this.loading) {
      console.log("already loading")
      return;
    };



		// this.tag = document.createElement('script');
    // this.tag.type = 'text/javascript';
    // this.tag.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDrk3576gQUVtPrX92lpQgPUUfJoR6W6BM&libraries=places&callback=callback`;
    // this.tag.id = 'googleMaps';
    // this.tag.async = false;
    // this.tag.defer = false;
    // document.body.appendChild(this.tag);


    this.loading = true;
    console.log("      loading:", this.loading)
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
