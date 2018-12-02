<template>
  <v-container fluid class="ma-0 pa-0">
    <v-img :src="require('../assets/trophies.jpg')" :height="height">
      <v-layout wrap row align-center>
        <v-flex xs12 text-xs-center>
          <Landing/>
        </v-flex>
        <v-flex xs10 offset-xs1 sm8 offset-sm2>
          <v-card class="gMap-container">
            <Map class="gMap"/>
          </v-card>
        </v-flex>
      </v-layout>
    </v-img>
  </v-container>
</template>

<script>
import Landing from '../components/Landing.vue';
import Map from '../components/Map.vue';

export default {
  name: 'Home',
  components: {
    Landing,
    Map,
  },
  data: () => ({
    height: '100vh',
  }),
};
</script>

<style>
.gMap-container {
  height: 75vh;
}
.gMap {
 height: 100%;
 width: 100%;
}
</style>
