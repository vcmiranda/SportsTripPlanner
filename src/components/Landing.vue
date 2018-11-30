<template>
  <v-container fluid class="ma-0 pa-0">
    <v-img :src="require('../assets/trophies.jpg')" :height="height">
      <v-layout wrap row align-center fill-height>
        <v-flex xs12 text-xs-center>
          <v-layout wrap row justify-center>
            <v-flex xs10 sm4 md2 class="mx-5">
              <v-select
                :items="leagues"
                v-model="league"
                item-text="label"
                item-value="code"
                label="League"
                solo
              />
            </v-flex>
            <v-flex xs10 sm4 md2 class="mx-5">
              <v-select
                :items="teams"
                v-model="team"
                item-text="team"
                item-value="abbreviation"
                label="Team"
                multiple
                solo
                :disabled="!league"
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
                  >(+{{ team.length - 1 }} others)</span>
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
                :disabled="!league"
              >
                <v-text-field
                  slot="activator"
                  v-model="dateStart"
                  label="Start Date"
                  solo
                  readonly
                ></v-text-field>
                <v-date-picker
                  ref="picker"
                  v-model="dateStart"
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
                :disabled="!league"
              >
                <v-text-field
                  slot="activator"
                  v-model="dateEnd"
                  label="End Date"
                  solo
                  readonly
                ></v-text-field>
                <v-date-picker
                  ref="picker"
                  v-model="dateEnd"
                  min="2018-08-01"
                  max="2019-07-31"
                  @change="saveDateEnd"
                ></v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex xs12 class="mx-5">
              <v-btn @click="getData()" :disabled="!league">Show Map</v-btn>
              <v-btn @click="clearData()" :disabled="!league">Clear</v-btn>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-img>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data: () => ({
    height: '100vh',
    leagues: [
      { code: 'mlb', label: 'MLB' },
      { code: 'nba', label: 'NBA' },
      { code: 'nfl', label: 'NFL' },
      { code: 'nhl', label: 'NHL' },
    ],
    league: null,
    team: null,
    dateStart: null,
    dateEnd: null,
    menuStart: false,
    menuEnd: false,
  }),
  computed: {
    ...mapGetters([
      'teamsAll',
    ]),
    teams() {
      if (this.league) {
        return this.teamsAll(this.league);
      }
      return [];
    },
  },
  methods: {
    getData() {
      let teams = '';
      let dates = '';
      if (this.team) {
        this.team.forEach((team, i) => {
          teams += team;
          if (this.team.length !== i + 1) {
            teams += ',';
          }
        });
      }
      if (this.dateStart && this.dateEnd) {
        dates = `from-${this.dateStart.replace(/-/g, '')}-to-${this.dateEnd.replace(/-/g, '')}`;
      } else if (this.dateStart) {
        dates = `since-${this.dateStart.replace(/-/g, '')}`;
      } else if (this.dateEnd) {
        dates = `until-${this.dateEnd.replace(/-/g, '')}`;
      }
      this.$store.dispatch('getMatches', { league: this.league, team: teams, dates })
        .then(() => { this.team = []; });
    },
    saveDateStart(date) {
      this.$refs.menuStart.save(date);
    },
    saveDateEnd(date) {
      this.$refs.menuEnd.save(date);
    },
  },
  watch: {
    league: {
      handler(value) {
        this.team = null;
        this.$store.dispatch('getTeams', value);
      },
      deep: true,
    },
    menuStart(value) {
      value && this.$nextTick(() => { this.$refs.picker.activePicker = 'MONTH'; });
    },
    menuEnd(value) {
      value && this.$nextTick(() => { this.$refs.picker.activePicker = 'MONTH'; });
    },
  },
};
</script>

<style>

</style>
