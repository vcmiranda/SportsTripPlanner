<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <v-card>
      <v-card-title class="headline orange darken-1 white--text">Clear Filters?</v-card-title>
      <v-card-text>Are you sure you want to clear filters? This will remove all data from map.</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="orange darken-1" flat @click="setDialog(false)">Disagree</v-btn>
        <v-btn color="orange darken-1" flat @click="clear()">Agree</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ClearFilters',
  computed: {
    ...mapState([
      'dialog',
    ]),
  },
  methods: {
    ...mapMutations([
      'setDialog',
      'clearSchedule',
      'setClear',
    ]),
    clear() {
      this.clearSchedule();
      this.setClear();
      this.setDialog(false);
    },
  },
};
</script>

<style scoped>

</style>
