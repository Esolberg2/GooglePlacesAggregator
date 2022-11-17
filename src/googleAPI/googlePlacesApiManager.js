import * as turf from '@turf/turf'
import { store } from '../store'
import { dummyGoogleCall } from './dummyCall.js'

// import React, { useState } from 'react'


class GooglePlacesApiManager {

	constructor() {
    this.service = undefined;
    this.tag = undefined;
    this.loading = false;

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

  // // var radius_and_googleData = testMode ? await dummyGoogleCall() : await nearbySearchWrapper(currentCenter, searchType)
  // async function nearbySearchWrapper(currentCenter, searchType) {
  //
  //     function callback(results) {
  //         let lastLat = results[results.length-1].geometry.location.lat()
  //         let lastLon = results[results.length-1].geometry.location.lng()
  //         let from = turf.point(currentCenter);
  //         let to = turf.point([lastLon, lastLat]);
  //         let options = {units: 'miles'};
  //         let distance = turf.distance(from, to, options);
  //         return {"radius": distance, "googleData": results}
  //         }
  //
  //     // const service = new window.google.maps.places.PlacesService(document.createElement('div'));
  //
  //     try {
  //         var request = {
  //         location: new window.google.maps.LatLng(currentCenter[1],currentCenter[0]),
  //         rankBy: window.google.maps.places.RankBy.DISTANCE,
  //         type: searchType
  //         };
  //     } catch (error) {
  //         console.log("error at google request obj")
  //         console.log(error)
  //         }
  //
  //     let output = await nearbySearch(callback, service, request)
  //     return output
  // }
  //
  // const nearbySearch = (callback, service, request) => new Promise((resolve,reject) => {
  //
  //   try {
  //       service.nearbySearch(request, function(results,status) {
  //       if (status === window.google.maps.places.PlacesServiceStatus.OK)
  //       {
  //           resolve(callback(results));
  //       } else
  //       {
  //           reject(status);
  //       }
  //   });
  //       }
  //       catch (error) {
  //         console.log(error)
  //       }
  //
  //       console.log("error")
  //     })

  nearbySearch() {
    console.log("nearbySearch")
    let coords = store.getState().search.data.furthestNearest;
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
    return rawData;
  }


  updateGoogleApi(apiKey) {
    if (this.loading) {
      console.log("already loading")
      return;
    };
    this.loading = true;
    console.log("      loading:", this.loading)
    this.removeGoogle();
    this.tag = document.createElement('script');
    this.tag.type = 'text/javascript';
    this.tag.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=places`;
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
