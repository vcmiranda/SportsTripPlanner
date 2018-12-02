<template>
  <v-container fluid class="ma-0 pa-0">
    <v-layout wrap row align-center fill-height>
      <v-flex xs12 text-xs-center>
        <v-layout wrap row justify-center>
          <v-flex xs10 sm4 md2 class="mx-5">
            <v-select
              :items="leagues"
              :value="leagueSelected"
              @input="setLeagueSelected"
              item-text="label"
              item-value="code"
              label="League"
              solo
            />
          </v-flex>
          <v-flex xs10 sm4 md2 class="mx-5">
            <v-select
              :items="teamsList"
              v-model="teamsSelected"
              item-text="team"
              item-value="abbreviation"
              label="Team"
              multiple
              solo
              :disabled="!leagueSelected"
            >
              <template
                slot="selection"
                slot-scope="{ item, index }"
              >
                <v-chip v-if="index === 0">
                  <span>{{ item.abbreviation }}</span>
                </v-chip>
                <span
                  v-if="index === 1"
                  class="grey--text caption"
                >(+{{ teamsSelected.length - 1 }} others)</span>
              </template>
            </v-select>
          </v-flex>
          <v-flex xs10 sm4 md2 class="mx-5">
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
                solo
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
          <v-flex xs10 sm4 md2 class="mx-5">
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
                solo
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
          <v-flex xs12 class="mx-5">
            <v-btn @click="getSchedule()" :disabled="!leagueSelected">Show Map</v-btn>
            <v-btn @click="clearData()" :disabled="!leagueSelected">Clear</v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
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
      'league',
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
      'clearSchedule',
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
      this.$store.dispatch('getSchedule', { league: this.league, teams: teams, dates })
        .then(() => {
          this.teamsSelected = null;
          this.$emit('component', 'Map');
        });
    },
    // It saves date to the correct element
    saveDateStart(date) {
      this.$refs.menuStart.save(date);
    },
    // It saves date to the correct element
    saveDateEnd(date) {
      this.$refs.menuEnd.save(date);
    },
    clearData() {
      this.leagueSelected = null;
      this.teamsSelected = null;
      this.dateStartSelected = null;
      this.dateEndSelected = null;
      this.clearSchedule();
    },
  },
  watch: {
    // Every time user chooses a league, it calls an action to load teams list
    leagueSelected: {
      handler(value) {
        if (value) {
          this.teamsSelected = null;
          this.$store.dispatch('getTeams', value);
          this.$emit('league', value);
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
  },
};
</script>

<style>

</style>
