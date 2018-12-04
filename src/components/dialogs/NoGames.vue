<template>
  <v-dialog v-model="dialog.noGames" persistent max-width="290">
    <v-card>
      <v-card-title class="headline orange darken-1 white--text">No Data</v-card-title>
      <v-card-text>Based on your filters, there are no {{ league | capitalize }} games to show.</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="orange darken-1" flat @click="clear()">Ok</v-btn>
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
      'league',
    ]),
  },
  methods: {
    ...mapMutations([
      'setDialog',
      'clearSchedule',
      'toggleClear',
    ]),
    clear() {
      this.clearSchedule();
      this.toggleClear();
      this.setDialog({ property: 'noGames', flag: false });
    },
  },
  filters: {
    capitalize(value) {
      if (value) {
        return value.toString().toUpperCase();
      }
      return '';
    },
  },
};
</script>

<style scoped>

</style>
