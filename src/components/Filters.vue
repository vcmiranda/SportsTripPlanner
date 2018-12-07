<template>
  <v-navigation-drawer
    :value="drawer"
    :width="$vuetify.breakpoint.width < 600 ? $vuetify.breakpoint.width : 300"
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
          hide-details
          dense
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
          hide-details
          dense
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
            v-model="startDateSelected"
            label="Start Date"
            readonly
            hide-details
          />
          <v-date-picker
            ref="picker"
            v-model="startDateSelected"
            :min="league ? leaguesList.find(data => data.code === league).dates.startDate : nullDate"
            :max="endDateSelected || (league ? leaguesList.find(data => data.code === league).dates.endDate : nullDate)"
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
            v-model="endDateSelected"
            label="End Date"
            readonly
            hide-details
          />
          <v-date-picker
            ref="picker"
            v-model="endDateSelected"
            :min="startDateSelected || (league ? leaguesList.find(data => data.code === league).dates.startDate : nullDate)"
            :max="league ? leaguesList.find(data => data.code === league).dates.endDate : nullDate"
            @change="saveDateEnd"
          />
        </v-menu>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="py-2" v-if="leaguesList.length < 4 && (tempStartDateSelected || tempEndDateSelected)">
      <v-flex xs12 class="px-3">
        <v-checkbox
          label="Use dates set before?"
          v-model="datesCheckbox"
          color="orange darken-1"
          class="customClass"
          hide-details
        />
      </v-flex>
    </v-layout>
    <v-layout row wrap class="py-2">
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="getSchedule()" :disabled="!leagueSelected">Add Filter</v-btn>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="clearVariables()" :disabled="!leagueSelected">Clear</v-btn>
      </v-flex>
    </v-layout>
    <v-divider v-show="filtersList.length"/>
    <v-layout row wrap v-if="filtersList.length" class="py-2">
      <v-flex xs12>
        <v-subheader class="justify-center title">Filters Applied</v-subheader>
      </v-flex>
      <v-divider/>
      <v-flex xs12 class="px-3" v-for="(filter, i) in filtersList" :key="i">
        <v-card v-if="filter.value" @click="updateFilter(filter)" color="primary" class="px-3 py-2 my-1 caption">
          <v-layout row wrap align-center>
            <v-flex xs10>
              <v-layout row wrap>
                <v-flex xs10>
                  {{ filter.league.toUpperCase() }}<span v-if="filter.teams"> - Team(s): {{ filter.teams }}</span>
                </v-flex>
                <v-flex xs10 v-if="filter.dates.startDate || filter.dates.endDate">
                  {{ formatDates(filter.dates.startDate, filter.dates.endDate) }}
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs2>
              <v-tooltip bottom>
                <v-btn icon @click="updateFilter(filter)" slot="activator">
                  <v-icon>clear</v-icon>
                </v-btn>
                <span>Remove this filter</span>
              </v-tooltip>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
      <v-flex xs12 class="px-3">
        <v-btn block color="orange darken-1" @click="setDialog({ property: 'clearFilters', flag: true })" :disabled="!filtersList.length">Clear All Filters</v-btn>
      </v-flex>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
import moment from 'moment';
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'Filters',
  data: () => ({
    leagueSelected: null,
    teamsSelected: null,
    startDateSelected: null,
    tempStartDateSelected: null,
    endDateSelected: null,
    tempEndDateSelected: null,
    menuStart: false,
    menuEnd: false,
    nullDate: '0',
    leaguesCheckbox: false,
    datesCheckbox: false,
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
              dates: {
                startDate: this.startDateSelected,
                endDate: this.endDateSelected,
              },
            },
          });
          if (this.$vuetify.breakpoint.width < 600) {
            this.toggleDrawer();
          }
          if (!this.schedule.length) {
            this.setDialog({ property: 'noGames', flag: true });
          }
          this.saveTempDates();
          this.clearVariables();
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
      if (this.startDateSelected && this.endDateSelected) {
        return `from-${this.startDateSelected.replace(/-/g, '')}-to-${this.endDateSelected.replace(/-/g, '')}`;
      }
      if (this.startDateSelected) {
        return `since-${this.startDateSelected.replace(/-/g, '')}`;
      }
      if (this.endDateSelected) {
        return `until-${this.endDateSelected.replace(/-/g, '')}`;
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
    clearVariables() {
      this.leagueSelected = null;
      this.teamsSelected = null;
      this.datesCheckbox = false;
      this.setLeague(null);
      this.clearDates();
    },
    // Save current dates
    saveDates() {
      this.startDateSelected = this.tempStartDateSelected;
      this.endDateSelected = this.tempEndDateSelected;
    },
    // Save temp dates
    saveTempDates() {
      this.tempStartDateSelected = this.startDateSelected;
      this.tempEndDateSelected = this.endDateSelected;
    },
    // Clear temp dates
    clearDates() {
      this.startDateSelected = null;
      this.endDateSelected = null;
    },
    // Format dates to show on filters
    formatDates(start, end) {
      if (start && end) {
        return `${moment(start, 'YYYY-MM-DD').format('MMM DD, YYYY')} -
          ${moment(end, 'YYYY-MM-DD').format('MMM DD, YYYY')}`;
      }
      if (start) {
        return `${moment(start, 'YYYY-MM-DD').format('MMM DD, YYYY')}`;
      }
      return `${moment(end, 'YYYY-MM-DD').format('MMM DD, YYYY')}`;
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
        this.clearVariables();
        this.toggleClear();
      }
    },
    // When dates checkbox changes, it sets start and end date (add or remove)
    datesCheckbox(value) {
      if (value) {
        this.saveDates();
      } else {
        this.saveTempDates();
        this.clearDates();
      }
    },
  },
};
</script>

<style>
.customClass label {
  font-size: 12px !important;
}
</style>
