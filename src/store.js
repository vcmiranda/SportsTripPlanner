/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import leaguesAPI from './api/leagues';
import teamsDB from './data/teams.json';
import leaguesDB from './data/leagues.json';
import helperGeneral from './helpers/general';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    leagues: {
      mlb: {
        label: leaguesDB.mlb.label,
        teams: [],
        schedule: [],
        dates: {
          startDate: leaguesDB.mlb.startDate,
          endDate: leaguesDB.mlb.endDate,
        },
      },
      nba: {
        label: leaguesDB.nba.label,
        teams: [],
        schedule: [],
        dates: {
          startDate: leaguesDB.nba.startDate,
          endDate: leaguesDB.nba.endDate,
        },
      },
      nfl: {
        label: leaguesDB.nfl.label,
        teams: [],
        schedule: [],
        dates: {
          startDate: leaguesDB.nfl.startDate,
          endDate: leaguesDB.nfl.endDate,
        },
      },
      nhl: {
        label: leaguesDB.nhl.label,
        teams: [],
        schedule: [],
        dates: {
          startDate: leaguesDB.nhl.startDate,
          endDate: leaguesDB.nhl.endDate,
        },
      },
    },
    league: null,
    drawer: Vue.prototype.$vuetify.breakpoint.width > 960,
    loading: false,
    dialog: {
      clearFilters: false,
      noGames: false,
    },
    clear: false,
  },
  getters: {
    teams: state => league => state.leagues[league].teams,
    schedule: state => league => state.leagues[league].schedule,
  },
  mutations: {
    // Update teams or games of chosen league
    update(state, value) {
      state.leagues[value.league][value.property] = value.data;
    },
    // Set league to be used
    setLeague(state, value) {
      state.league = value;
    },
    // Clear schedule of all leagues
    clearSchedule(state) {
      state.leagues.mlb.schedule = [];
      state.leagues.nba.schedule = [];
      state.leagues.nfl.schedule = [];
      state.leagues.nhl.schedule = [];
    },
    // Toggle navigation drawer status
    toggleDrawer(state) {
      state.drawer = !state.drawer;
    },
    // Set loading flag status
    setLoading(state, value) {
      state.loading = value;
    },
    // Set chosen dialog box status
    setDialog(state, value) {
      state.dialog[value.property] = value.flag;
    },
    // Toggle clear status
    toggleClear(state) {
      state.clear = !state.clear;
    },
  },
  actions: {
    /**
     * @desc It checks whether teams of a chosen league is available on local storage, if not
     * retrieves that list from json file, and save into correct state to make available globally
     * @param {string} league - League to be used (MLB, NBA, NFL, NHL)
     * @returns {array} It sets state with teams to be used.
     */
    getTeams({ commit }, league) {
      const leagueData = localStorage.getItem(league);
      const property = 'teams';
      if (!leagueData) {
        localStorage.setItem(league, JSON.stringify({ [property]: teamsDB[league] }));
        return commit('update', {
          league,
          property,
          data: teamsDB[league],
        });
      }
      return commit('update', {
        league,
        property,
        data: JSON.parse(leagueData).teams,
      });
    },
    /**
     * @desc It calls function that fetches games from api and set state to make data
     * available globally
     * @param {string} league - League to be used (MLB, NBA, NFL, NHL)
     * @param {string} teams - Filter api call by team(s), when fetching games
     * @param {string} dates - Filter api call by date(s), when fetching games
     * @returns {array} It sets state with filtered games.
     */
    getSchedule({ commit }, { league, teams, dates }) {
      commit('setLoading', true);
      commit('clearSchedule');
      return leaguesAPI.getSchedule(league, teams, dates)
        .then(({ data: { games } }) => {
          const data = games.map(game => helperGeneral.getGameData(game.schedule, league));
          return commit('update', {
            league,
            property: 'schedule',
            data,
          });
        })
        .catch(err => err)
        .finally(() => commit('setLoading', false));
    },
  },
});
