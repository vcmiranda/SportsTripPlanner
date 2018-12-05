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

export default {
  components: {
    ClearFilters,
    NoGames,
  },
  data: () => ({
    map: null,
    markers: [],
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
        return this.schedule;
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
