import React, { Component } from 'react';
import { Map, InfoWindow, GoogleApiWrapper, Marker } from 'google-maps-react';
import { connect } from 'react-redux';
import axios from 'axios';

import simple from './minimapStyle';
import {
  fetchAllDistricts,
  changeZoomLevel,
  fetchAllLocations,
} from '../../redux/actions/map';

const mapStyles = {
  width: '100%',
  height: '30%',
};

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.mapRefs = React.createRef();
  }

  state = {
    showingInfoWindow: false, //Hides or the shows the infoWindow
    activeMarker: {}, //Shows the active marker upon click
    selectedPlace: {}, //Shows the infoWindow to the selected place upon a marker
    currentLocation: {
      lat: null,
      lng: null,
    },
    locations_id: null,
    selectedPlaceImages: [],
    // This must be stored in database
    selfDefinedMarkers: [],
  };

  componentDidMount() {
    this.props.fetchAllDistricts();
    this.props.fetchAllLocations();

    console.log(this.mapRefs.current.props.google.maps.Map);

    console.log(window.google.maps.Map.prototype.panTo);
    console.log(this.mapRefs.current.props.google.maps);
    // console.log(this.mapRefs);

    if (navigator && navigator.geolocation) {
      // console.log(this.props.google.maps.Map().panT);
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = pos.coords;
        this.setState({
          currentLocation: {
            lat: coords.latitude,
            lng: coords.longitude,
          },
        });
      });
    }
  }

  _mapLoaded(mapProps, map) {
    map.setOptions({
      styles: simple,
    });
  }

  changeTheme(mapProps, map) {
    map.setOptions.styles === simple
      ? map.setOptions({
          styles: mapStyles,
        })
      : map.setOptions({
          styles: simple,
        });
  }

  onMarkerClick = (props, marker, e) => {
    this.setState(
      {
        selectedPlace: props,
        activeMarker: marker,
        showingInfoWindow: true,
      },
      () => {
        if (!this.state.selectedPlace.locationId) {
          console.log('Return');
          return;
        }
        axios
          .get(
            `https://localhost:8000/image/public/${this.state.selectedPlace.locationId}`
          )
          .then((data) => {
            this.setState({
              ...this.state,
              selectedPlaceImages: data.data,
            });
          });
      }
    );
  };

  onClose = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState(
        {
          showingInfoWindow: false,
          activeMarker: null,
          selectedPlaceImages: null,
          selectedPlace: {},
        },
        () => {
          console.log(props);
        }
      );
    }
  };

  createMarker = (lat, lng) => {
    this.mapRefs.current.props.google.maps.Map.prototype.panTo({
      lat: 22.5838475,
      lng: 114.0552244,
    });
    this.setState(
      {
        ...this.state,
        selfDefinedMarkers: [...this.state.selfDefinedMarkers, { lat, lng }],
      },
      () => {
        console.log(this.state.selfDefinedMarkers);
      }
    );
  };

  render() {
    let locations;
    let selfDefinedMarkers;

    this.props.zoom <= 13
      ? (locations = this.props.districts.map((district) => {
          return (
            <Marker
              icon={{
                url: './assets/icons/adventure.png',
                anchor: new window.google.maps.Point(25, 25),
                scaledSize: new window.google.maps.Size(25, 25),
              }}
              key={district.id}
              position={{ lat: district.lat, lng: district.lng }}
              onClick={this.onMarkerClick}
              name={district.en}
            />
          );
        }))
      : (locations = this.props.locations.map((location) => {
          return (
            <Marker
              icon={{
                url: './assets/icons/adventure1.png',
                anchor: new window.google.maps.Point(25, 25),
                scaledSize: new window.google.maps.Size(50, 50),
              }}
              key={location.id}
              locationId={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={this.onMarkerClick}
              name={location.en}
            />
          );
        }));

    let locationImages = <p> Please wait, Images are loading...</p>;

    if (this.state.selectedPlaceImages) {
      locationImages = this.state.selectedPlaceImages.map((image) => {
        return (
          <img
            className='center icons30 sm-col-5'
            alt={image.en}
            src={`${image.url}.jpg`}
          />
        );
      });
    }

    if (this.state.selfDefinedMarkers) {
      selfDefinedMarkers = this.state.selfDefinedMarkers.map((marker) => {
        return (
          <Marker
            position={{
              lat: marker.lat,
              lng: marker.lng,
            }}
            onClick={this.onMarkerClick}
            name='You defined it'
          />
        );
      });
    }

    return (
      <div>
        <Map
          ref={this.mapRefs}
          onZoomChanged={(google, map) => {
            this.props.changeZoomLevel(map.zoom);
          }}
          onLoad={(map) => console.log(map)}
          onClick={(props, google, clickEvent) => {
            const lat = clickEvent.latLng.lat();
            const lng = clickEvent.latLng.lng();
            console.log(google);
            this.createMarker(lat, lng);
          }}
          centerAroundCurrentLocation
          google={this.props.google}
          zoom={12}
          initialCenter={{
            lat: this.state.currentLocation.lat,
            lng: this.state.currentLocation.lng,
          }}
          onReady={(mapProps, map) => this._mapLoaded(mapProps, map)}
        >
          <Marker
            icon={{
              url: './assets/icons/user.png',
              anchor: new window.google.maps.Point(25, 25),
              scaledSize: new window.google.maps.Size(50, 50),
            }}
            position={{
              lat: this.state.currentLocation.lat,
              lng: this.state.currentLocation.lng,
            }}
            onClick={this.onMarkerClick}
            name='You are here'
          />
          {selfDefinedMarkers}
          {locations}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
            onClose={this.onClose}
          >
            <div className='center'>
              <h5 className='bold gray70'>{this.state.selectedPlace.name}</h5>
              <div className='row d-flex'>{locationImages}</div>
            </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    districts: state.map.districts,
    locations: state.map.locations,
    zoom: state.map.zoom,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllDistricts: () => dispatch(fetchAllDistricts()),
    fetchAllLocations: () => dispatch(fetchAllLocations()),
    changeZoomLevel: (zoomLevel) => dispatch(changeZoomLevel(zoomLevel)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  GoogleApiWrapper({
    apiKey: 'AIzaSyAg-zxdwaWHeCd5QnJ-yBcy1_lvDttzCKk',
  })(MapContainer)
);