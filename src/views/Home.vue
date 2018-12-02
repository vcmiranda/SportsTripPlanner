<template>
  <v-container fluid class="ma-0 pa-0">
    <Filters/>
    <Toolbar/>
    <Map class="gMap"/>
  </v-container>
</template>

<script>
import Filters from '../components/Filters.vue';
import Map from '../components/Map.vue';
import Toolbar from '../components/Toolbar.vue';

export default {
  name: 'Home',
  components: {
    Filters,
    Map,
    Toolbar,
  },
  data: () => ({
    height: '100vh',
  }),
};
</script>

<style>
.gMap {
 height: calc(100vh - 48px);
 width: 100%;
}
</style>
