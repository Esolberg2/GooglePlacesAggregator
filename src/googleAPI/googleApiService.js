class GoogleApiService {
  static googleServiceInstance = null;

  static getInstance() {
    if (GoogleApiService.googleServiceInstance === null) {
      GoogleApiService.googleServiceInstance = new GoogleApiService();
    }
    return this.googleServiceInstance;
  }

  constructor() {
    this.tag = undefined;
    this.map = undefined;
    this.service = undefined;
    function callback() {}
    window.callback = callback;
  }

  createMap() {
    // remove existing map.
    if (this.map) {
      this.map.parentNode.removeChild(this.map);
      this.map = null;
    }

    // create map element
    this.mapElement = document.createElement('div');
    this.mapElement.id = 'map';
    this.mapElement.async = false;
    this.mapElement.defer = false;
    document.body.appendChild(this.mapElement);
  }

  updateGoogleApi(apiKey) {
    const promise = new Promise((resolve) => {
      this.removeGoogle();
      this.tag = document.createElement('script');
      this.tag.type = 'text/javascript';
      this.tag.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=callback`;
      this.tag.id = 'googleMaps';
      this.tag.async = false;
      this.tag.defer = false;
      this.tag.onload = () => {
        this.service = new window.google.maps.places.PlacesService(document.getElementById('map'));
        resolve();
      };
      document.body.appendChild(this.tag);

      this.createMap();
    });
    return promise;
  }

  async removeGoogle() {
    if (window.google !== undefined) {
      await delete window.google;
    }
    if (this.tag) {
      this.tag.parentNode.removeChild(this.tag);
      this.tag = null;
    }
  }
}

export default GoogleApiService;
