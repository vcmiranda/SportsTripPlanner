<template>
  <v-toolbar color="orange darken-1" dense clipped-left app>
    <v-toolbar-side-icon
      @click="toggleDrawer"
      dark
    />
    <v-toolbar-title class="white--text">Sports Trip Planner</v-toolbar-title>
  </v-toolbar>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'Toolbar',
  methods: {
    ...mapMutations([
      'toggleDrawer',
    ]),
  },
};
</script>
