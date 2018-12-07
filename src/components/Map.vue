<template>
  <v-container fluid class="ma-0 pa-0">
    <v-layout class="gMap" ref="map" id="map"/>
    <v-layout justify-center align-center fill-height>
      <v-progress-circular
        :size="70"
        :width="7"
        color="orange darken-1"
        indeterminate
        v-if="loading"
      />
    </v-layout>
    <ClearFilters/>
    <NoGames/>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import ClearFilters from './dialogs/ClearFilters.vue';
import NoGames from './dialogs/NoGames.vue';

const infowindow = new google.maps.InfoWindow(); // eslint-disable-line

export default {
  components: {
    ClearFilters,
    NoGames,
  },
  data: () => ({
    map: null,
    markers: [],
    lastWindow: false,
  }),
  computed: {
    ...mapState([
      'loading',
      'league',
      'leagues',
    ]),
    ...mapGetters([
      'schedule',
    ]),
    scheduleList() {
      if (this.schedule.length) {
        const list = this.schedule;
        const byVenue = {};
        list.forEach((game) => {
          const location = Object.keys(byVenue).find(venue => venue === game.location.venue);
          if (!location) {
            byVenue[game.location.venue] = [];
          }
          byVenue[game.location.venue].push(game);
        });
        return list.map((game) => {
          const temp = game;
          temp.games = byVenue[temp.location.venue];
          return temp;
        });
      }
      return [];
    },
  },
  mounted() {
    const { breakpoint: { width } } = this.$vuetify;
    this.map = new google.maps.Map(this.$refs.map, { // eslint-disable-line
      zoom: width < 425 ? 3 : width < 600 ? 3.5 : width < 960 ? 4 : 4.5,
      center: { lat: 39.39813, lng: -96.90886 },
    });
  },
  methods: {
    // Add marker to the map (with click event bound to it)
    addMarker(game) {
      const message = this.setMInfoWindowMessage(game);
      const marker = new google.maps.Marker({ // eslint-disable-line
        position: { lat: parseFloat(game.location.coordinates.latitude), lng: parseFloat(game.location.coordinates.longitude) },
        map: this.map,
      });
      this.addInfoWindow(message, marker);
      this.markers.push(marker);
    },
    // Add info window features to each marker used
    addInfoWindow(message, marker) {
      marker.addListener('click', () => {
        if (this.lastWindow) {
          this.lastWindow.close();
        }
        this.lastWindow = infowindow;
        infowindow.setContent(message);
        infowindow.open(this.map, marker);
      });
    },
    // Deletes all markers from map
    deleteMarkers() {
      this.markers.forEach((marker) => { marker.setMap(null); });
      this.markers = [];
    },
    // Set message on info window
    setMInfoWindowMessage(game) {
      const general = {};
      let message = `<div class="d-flex justify-center my-2 font-weight-bold">Vanue: ${game.location.venue}</div>`;
      game.games.forEach((data) => {
        if (!Object.keys(general).find(current => current === data.league)) {
          message += `<div class="text-xs-center font-weight-bold pt-3 pb-2">${data.league.toUpperCase()}</div>`;
          general[data.league] = {};
        }
        if (!Object.keys(general[data.league]).find(current => current === data.dateTime.year)) {
          message += `<div class="font-weight-bold py-1">${data.dateTime.year}</div>`;
          general[data.league][data.dateTime.year] = [];
        }
        if (!general[data.league][data.dateTime.year].find(current => current === data.dateTime.month)) {
          message += `<div class="font-weight-medium py-1" @click="test">${data.dateTime.month}</div>`;
          general[data.league][data.dateTime.year].push(data.dateTime.month);
        }
        message += `<div><span class="font-weight-medium">${data.dateTime.day}</span> - ${data.awayTeam.name} x ${data.homeTeam.name} - <span class="font-weight-medium">${data.dateTime.time}</span></div>`;
      });
      return message;
    },
    // Add all markers to the map
    setMarkers() {
      this.scheduleList.forEach((game, index) => { this.addMarker(game, index); });
    },
  },
  watch: {
    // Check whether schedule of any league changes, in case it does, set new markers or remove them.
    schedule: {
      handler() {
        this.deleteMarkers();
        this.setMarkers();
      },
      deep: true,
    },
  },
};
</script>

<style>
.gMap {
  height: 100%;
  width: 100%;
  position: absolute;
}
</style>
