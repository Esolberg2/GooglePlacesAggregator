import * as turf from '@turf/turf'
import {axiosPutPostData} from './axios_Helpers'


export async function nextSearch(circleCoordinates, searchID, checksum, searchType) {

  try {
    let response = await getNextSearchCoord(circleCoordinates, searchID, checksum)

      let nextCenter = response["data"]["center"]
      let searchedData = response["data"]["searched"]
      let unsearchedData = response["data"]["unsearched"]

      console.log('------ unsearched data ------')
      console.log(unsearchedData)

      if (unsearchedData.length == 0) {
        console.log("returning due to unsearched exaughsted")
        return {
            "searchedData": searchedData,
            "unsearchedData": unsearchedData,
            "nextCenter": null,
            "searchID": searchID,
            "radius": null,
            "googleData": []
        }
      }

      try {
        let radius_and_googleData = await nearbySearchWrapper(nextCenter, searchType)
        console.log(radius_and_googleData)
        return {
            "searchedData": searchedData,
            "unsearchedData": unsearchedData,
            "nextCenter": nextCenter,
            "searchID": searchID,
            "radius": radius_and_googleData["radius"],
            "googleData": radius_and_googleData["googleData"]
        }
      } catch {
        return {
            "searchedData": searchedData,
            "unsearchedData": unsearchedData,
            "nextCenter": nextCenter,
            "searchID": searchID,
            "radius": 1,
            "googleData": zero_results_dummy(...nextCenter)
        }
      }
  } catch (error) {
    throw(error)
  }
}


// step 1
export async function buildSearch(polygons, searchResolution, searchType) {
      // get coordinate data
      let response = await axiosPutPostData('POST', `/setUserSearch`,
        {
          "searchRegions": polygons,
          "searchID": null,
          "coordinateResolution": searchResolution
        })

        console.log(response)

          let searchedData = response["data"]["searchedCoords"]
          let unsearchedData = response["data"]["unsearchedCoords"]
          let nextCenter = response["data"]["furthestNearest"]
          let searchID = response["data"]["searchID"]["lastRowID"]

          // !!! to implement !!!
          // addCoordinates(response["data"]["unsearchedCoords"], coordinatesFeatures, setCoordinatesFeatures)
          // addCoordinates(response["data"]["searchedCoords"], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)

          // pass necessary coordinate data to be pre processed for nearbySearch()
          try {
            let radius_and_googleData = await nearbySearchWrapper(nextCenter, searchType)
            console.log(radius_and_googleData)
            return {
                "searchedData": searchedData,
                "unsearchedData": unsearchedData,
                "nextCenter": nextCenter,
                "searchID": searchID,
                "radius": radius_and_googleData["radius"],
                "googleData": radius_and_googleData["googleData"]
            }
          } catch {
            return {
                "searchedData": searchedData,
                "unsearchedData": unsearchedData,
                "nextCenter": nextCenter,
                "searchID": searchID,
                "radius": 1,
                "googleData": zero_results_dummy(...nextCenter)
            }
          }

}


// step 2 -> returns {"radius": distance, "googleData": results}
async function nearbySearchWrapper(nextCenter, searchType) {
    console.log(searchType)
    function callback(results) {
        console.log("callback")
        let lastLat = results[results.length-1].geometry.location.lat()
        let lastLon = results[results.length-1].geometry.location.lng()
        let from = turf.point(nextCenter);
        let to = turf.point([lastLon, lastLat]);
        let options = {units: 'miles'};
        let distance = turf.distance(from, to, options);
        return {"radius": distance, "googleData": results}
        }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    console.log(service)
    console.log(nextCenter)
    console.log(searchType)
    try {
        var request = {
        location: new window.google.maps.LatLng(nextCenter[1],nextCenter[0]),
        rankBy: window.google.maps.places.RankBy.DISTANCE,
        type: searchType
        };
    } catch (error) {
        console.log("error at google request obj")
        console.log(error)
        }

    let output = await nearbySearch(callback, service, request)
    console.log(output)
    return output
}


// step 3
const nearbySearch = (callback, service, request) => new Promise((resolve,reject) => {
  try {

            console.log(request)
            service.nearbySearch(request, function(results,status){
              console.log(results,status)
            if (status === window.google.maps.places.PlacesServiceStatus.OK)
            {
                console.log("resolve block")
                resolve(callback(results));
            } else
            {
                console.log("reject block")
                reject(status);
            }
        });
      } catch (error) {
        console.log('here 3')
        console.log(error)
      }
      console.log("error")
})



async function getNextSearchCoord(circleCoordinates, searchID, checksum) {
  let request = await axiosPutPostData('POST', `/getNextSearch`,
  { "circleCoordinates": circleCoordinates,
    "searchID": searchID,
    "checksum": checksum
  })
  return request
  }


const zero_results_dummy = (lng, lat) => {
  return [{
      "types": [
        "none",
      ],
      "icon_background_color": "none",
      "place_id": "none",
      "opening_hours": {},
      "name": "ZERO_RESULTS dummy entity - nearby search found no results: use dummy search radius of 1 mile",
      "reference": "none",
      "photos": [],
      "rating": -1,
      "icon": "none",
      "html_attributions": [],
      "geometry": {
        "viewport": {
          "west": -1,
          "east": -1,
          "south": -1,
          "north": -1
        },
        "location": {
          "lng": lng,
          "lat": lat
        }
      },
      "scope": "GOOGLE",
      "vicinity": "none",
      "plus_code": {
        "compound_code": "none",
        "global_code": "none"
      },
      "user_ratings_total": 0,
      "icon_mask_base_uri": "none",
      "price_level": -1,
      "business_status": "none"
    }]
  }
