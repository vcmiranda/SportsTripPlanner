<template>
  <v-container fluid class="ma-0 pa-0">
    <div class="gMap" ref="map" id="map"></div>
  </v-container>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
  data: () => ({
    map: null,
    markers: [],
  }),
  computed: {
    ...mapState([
      'league',
      'mlb',
      'nba',
      'nfl',
      'nhl',
    ]),
    ...mapGetters([
      'schedule',
    ]),
    scheduleList() {
      if (this.league) {
        return this.schedule(this.league);
      }
      return [];
    },
  },
  mounted() {
    this.map = new google.maps.Map(this.$refs.map, { // eslint-disable-line
      zoom: 4.5,
      center: { lat: 39.39813, lng: -96.90886 },
    });
  },
  methods: {
    // Add all markers to the map
    setMarkers() {
      this.scheduleList.forEach((game) => { this.addMarker(game.location.coordinates.latitude, game.location.coordinates.longitude); });
    },
    // Add marker to the map
    addMarker(lat, lng) {
      const marker = new google.maps.Marker({ // eslint-disable-line
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        map: this.map,
      });
      this.markers.push(marker);
    },
    // Deletes all markers from map
    deleteMarkers() {
      this.markers.forEach((marker) => { marker.setMap(null); });
      this.markers = [];
    },
    // Select appropriate method to call depending on having or not information on schedule
    manageMarkers(value) {
      if (value.schedule.length) {
        this.setMarkers();
      } else {
        this.deleteMarkers();
      }
    },
  },
  watch: {
    // mlb: {
    //   handler() {
    //     this.setMarkers();
    //   },
    //   deep: true,
    // },
    nba: {
      handler(value) {
        this.manageMarkers(value);
      },
      deep: true,
    },
    nfl: {
      handler(value) {
        this.manageMarkers(value);
      },
      deep: true,
    },
    nhl: {
      handler(value) {
        this.manageMarkers(value);
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
}
</style>
