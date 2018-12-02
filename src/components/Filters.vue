<template>
  <v-navigation-drawer
    :value="drawer"
    clipped
    stateless
    app
    dark
  >
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="justify-center title">Filters</v-subheader>
      </v-flex>
      <v-divider></v-divider>

      <v-flex xs12 class="px-3">
        <v-select
          :items="leagues"
          :value="leagueSelected"
          @input="setLeagueSelected"
          item-text="label"
          item-value="code"
          label="League"
          single-line
          color="primary"
        />
      </v-flex>

      <v-flex xs12 class="px-3">
        <v-select
          :items="teamsList"
          v-model="teamsSelected"
          item-text="team"
          item-value="abbreviation"
          label="Team"
          multiple
          single-line
          :disabled="!leagueSelected"
        >
          <template slot="selection" slot-scope="{ item, index }">
          <span v-if="index === 0">
            {{ item.abbreviation }}
          </span>
            <span
              v-if="index === 1"
              class="white--text caption"
            >(+{{ teamsSelected.length - 1 }} others)</span>
          </template>
        </v-select>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-menu
          ref="menuStart"
          :close-on-content-click="false"
          v-model="menuStart"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
          :disabled="!leagueSelected"
        >
          <v-text-field
            slot="activator"
            v-model="dateStartSelected"
            label="Start Date"
            readonly
          ></v-text-field>
          <v-date-picker
            ref="picker"
            v-model="dateStartSelected"
            min="2018-08-01"
            max="2019-07-31"
            @change="saveDateStart"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-menu
          ref="menuEnd"
          :close-on-content-click="false"
          v-model="menuEnd"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
          :disabled="!leagueSelected"
        >
          <v-text-field
            slot="activator"
            v-model="dateEndSelected"
            label="End Date"
            readonly
          ></v-text-field>
          <v-date-picker
            ref="picker"
            v-model="dateEndSelected"
            min="2018-08-01"
            max="2019-07-31"
            @change="saveDateEnd"
          ></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="getSchedule()" :disabled="!leagueSelected">Show Map</v-btn>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="setDialog(true)" :disabled="!leagueSelected">Clear</v-btn>
      </v-flex>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'Filters',
  data: () => ({
    leagues: [
      // { code: 'mlb', label: 'MLB' },
      { code: 'nba', label: 'NBA' },
      { code: 'nfl', label: 'NFL' },
      { code: 'nhl', label: 'NHL' },
    ],
    leagueSelected: null,
    teamsSelected: null,
    dateStartSelected: null,
    dateEndSelected: null,
    menuStart: false,
    menuEnd: false,
  }),
  computed: {
    ...mapState([
      'drawer',
      'league',
      'clear',
    ]),
    ...mapGetters([
      'teams',
    ]),
    teamsList() {
      if (this.leagueSelected) {
        return this.teams(this.leagueSelected);
      }
      return [];
    },
  },
  methods: {
    // Make mutations available in this component
    ...mapMutations([
      'setLeague',
      'setDialog',
      'setClear',
    ]),
    // Set league to be used, both locally and globally
    setLeagueSelected(value) {
      this.leagueSelected = value;
      this.setLeague(value);
    },
    // It builds team(s) and date(s) filters, then it calls action that's going to retrieve matches.
    getSchedule() {
      let teams = '';
      let dates = '';
      if (this.teamsSelected) {
        this.teamsSelected.forEach((team, i) => {
          teams += team;
          if (this.teamsSelected.length !== i + 1) {
            teams += ',';
          }
        });
      }
      if (this.dateStartSelected && this.dateEndSelected) {
        dates = `from-${this.dateStartSelected.replace(/-/g, '')}-to-${this.dateEndSelected.replace(/-/g, '')}`;
      } else if (this.dateStartSelected) {
        dates = `since-${this.dateStartSelected.replace(/-/g, '')}`;
      } else if (this.dateEndSelected) {
        dates = `until-${this.dateEndSelected.replace(/-/g, '')}`;
      }
      this.$store.dispatch('getSchedule', { league: this.league, teams, dates });
    },
    // It saves date to the correct element
    saveDateStart(date) {
      this.$refs.menuStart.save(date);
    },
    // It saves date to the correct element
    saveDateEnd(date) {
      this.$refs.menuEnd.save(date);
    },
  },
  watch: {
    // Every time user chooses a league, it calls an action to load teams list
    leagueSelected: {
      handler(value) {
        if (value) {
          this.$store.dispatch('getTeams', value);
        }
      },
      deep: true,
    },
    // Starts date picker on Month
    menuStart(value) {
      value && this.$nextTick(() => { this.$refs.picker.activePicker = 'MONTH'; });
    },
    // Starts date picker on Month
    menuEnd(value) {
      value && this.$nextTick(() => { this.$refs.picker.activePicker = 'MONTH'; });
    },
    // Clear local variables if clear is true
    clear(value) {
      if (value) {
        this.leagueSelected = null;
        this.teamsSelected = null;
        this.dateStartSelected = null;
        this.dateEndSelected = null;
        this.setClear();
      }
    },
  },
};
</script>

<style>

</style>
