import * as turf from '@turf/turf'

class GoogleSearchManager {
	constructor() {
    this.service = undefined
    this.tag = undefined

    this.observer = new MutationObserver((mutations, obs) => {
      if (window.google !== undefined) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        this.service = service;
        return;
      }
    });

    this.observer.observe(document, {
      childList: true,
      subtree: true
    });
	}

  updateGoogleApi(apiKey) {
    this.removeGoogle()
    this.tag = document.createElement('script');
    this.tag.type = 'text/javascript';
    this.tag.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=places`;
    this.tag.id = 'googleMaps';
    this.tag.async = false;
    this.tag.defer = false;
    document.body.appendChild(this.tag)
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
  }
}

export const googleSearchManager = new GoogleSearchManager()
