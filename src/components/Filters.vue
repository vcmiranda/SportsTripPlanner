<template>
  <v-navigation-drawer
    :value="drawer"
    clipped
    stateless
    app
    dark
  >
    <v-layout row wrap class="py-2">
      <v-flex xs12>
        <v-subheader class="justify-center title">Options</v-subheader>
      </v-flex>
      <v-divider></v-divider>

      <v-flex xs12 class="px-3">
        <v-select
          :items="leaguesList"
          :value="leagueSelected"
          @input="setLeagueSelected"
          item-text="label"
          item-value="code"
          label="League"
          single-line
          color="primary"
          :disabled="!leaguesList.length"
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
            :min="league ? leaguesList.find(data => data.code === league).dates.startDate : nullDate"
            :max="dateEndSelected || (league ? leaguesList.find(data => data.code === league).dates.endDate : nullDate)"
            @change="saveDateStart"
          />
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
            :min="dateStartSelected || (league ? leaguesList.find(data => data.code === league).dates.startDate : nullDate)"
            :max="league ? leaguesList.find(data => data.code === league).dates.endDate : nullDate"
            @change="saveDateEnd"
          />
        </v-menu>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="getSchedule()" :disabled="!leagueSelected">Show Map</v-btn>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="setDialog({ property: 'clearFilters', flag: true })" :disabled="!leagueSelected">Clear</v-btn>
      </v-flex>
    </v-layout>
    <v-divider v-show="filtersList.length"/>
    <v-layout row wrap v-if="filtersList.length" class="py-2">
      <v-flex xs12>
        <v-subheader class="justify-center title">Filters Applied</v-subheader>
      </v-flex>
      <v-divider/>
      <v-flex xs12 class="px-3">
        <template v-for="(filter, i) in filtersList">
          <v-alert :value="filter.value" @input="updateFilter(filter)" color="primary" dismissible :key="i">
            {{ filter.league.toUpperCase() }}<span v-if="filter.teams"> - Team(s): {{ filter.teams }}</span>
          </v-alert>
        </template>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="setDialog({ property: 'clearFilters', flag: true })" :disabled="!filtersList.length">Clear All Filters</v-btn>
      </v-flex>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'Filters',
  data: () => ({
    leagueSelected: null,
    teamsSelected: null,
    dateStartSelected: null,
    dateEndSelected: null,
    menuStart: false,
    menuEnd: false,
    nullDate: '0',
  }),
  computed: {
    ...mapState([
      'drawer',
      'league',
      'clear',
      'leagues',
    ]),
    ...mapGetters([
      'teams',
      'schedule',
    ]),
    teamsList() {
      if (this.leagueSelected) {
        return this.teams(this.leagueSelected);
      }
      return [];
    },
    leaguesList() {
      this.tempLeagues = Object.assign({}, this.leagues); // eslint-disable-line
      Object.values(this.leagues).forEach((league) => {
        if (Object.keys(league.filter).length) {
          delete this.tempLeagues[league.label.toLowerCase()];
        }
      });
      return Object.entries(this.tempLeagues).map(league => ({
        code: league[0],
        label: league[1].label,
        dates: {
          startDate: league[1].dates.startDate,
          endDate: league[1].dates.endDate,
        },
      }));
    },
    filtersList() {
      return Object.values(this.leagues)
        .map(league => league.filter)
        .filter(league => Object.keys(league).length);
    },
  },
  methods: {
    // Make mutations available in this component
    ...mapMutations([
      'addFilter',
      'removeFilter',
      'removeFromSchedule',
      'setDialog',
      'setLeague',
      'toggleClear',
      'toggleDrawer',
    ]),
    // Set league to be used, both locally and globally
    setLeagueSelected(value) {
      this.leagueSelected = value;
      this.setLeague(value);
    },
    // It builds team(s) and date(s) filters, then it calls action that's going to retrieve matches.
    getSchedule() {
      const teams = this.filterTeams();
      const dates = this.filterDates();
      this.$store.dispatch('getSchedule', { league: this.league, teams, dates })
        .then(() => {
          this.addFilter({
            league: this.leagueSelected,
            data: {
              league: this.leagueSelected,
              value: true,
              teams: this.teamsLabel(),
            },
          });
          // this.toggleDrawer();
          if (!this.schedule.length) {
            this.setDialog({ property: 'noGames', flag: true });
          }
          this.clearData();
        });
    },
    // Set team(s) to be used for filter
    filterTeams() {
      let teams = '';
      if (this.teamsSelected) {
        this.teamsSelected.forEach((team, i) => {
          teams += team;
          if (this.teamsSelected.length !== i + 1) {
            teams += ',';
          }
        });
      }
      return teams;
    },
    // Set date(s) to be used for filter
    filterDates() {
      if (this.dateStartSelected && this.dateEndSelected) {
        return `from-${this.dateStartSelected.replace(/-/g, '')}-to-${this.dateEndSelected.replace(/-/g, '')}`;
      }
      if (this.dateStartSelected) {
        return `since-${this.dateStartSelected.replace(/-/g, '')}`;
      }
      if (this.dateEndSelected) {
        return `until-${this.dateEndSelected.replace(/-/g, '')}`;
      }
      return undefined;
    },
    // Return team(s) label
    teamsLabel() {
      if (!this.teamsSelected) {
        return undefined;
      }
      if (this.teamsSelected.length === 1) {
        return this.teamsSelected[0];
      }
      return `${this.teamsSelected[0]} + ${this.teamsSelected.length - 1} other(s)`;
    },
    // It saves date to the correct element
    saveDateStart(date) {
      this.$refs.menuStart.save(date);
    },
    // It saves date to the correct element
    saveDateEnd(date) {
      this.$refs.menuEnd.save(date);
    },
    // Update filter
    updateFilter(value) {
      this.removeFilter(value);
      this.removeFromSchedule(value);
    },
    // Clear local variables
    clearData() {
      this.leagueSelected = null;
      this.teamsSelected = null;
      this.dateStartSelected = null;
      this.dateEndSelected = null;
      this.setLeague(null);
    },
  },
  watch: {
    // Every time user chooses a league, it calls an action to load teams list
    leagueSelected: {
      handler(newValue, oldValue) {
        if (newValue && (newValue !== oldValue)) {
          this.$store.dispatch('getTeams', newValue)
            .then(() => {
              this.teamsSelected = null;
              this.dateStartSelected = null;
              this.dateEndSelected = null;
            });
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
    // When clear flag changes, it checks whether became true, if it did clear local variables
    clear(value) {
      if (value) {
        this.clearData();
        this.toggleClear();
      }
    },
  },
};
</script>

<style>

</style>
