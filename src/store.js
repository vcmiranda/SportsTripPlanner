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
        dates: {
          startDate: leaguesDB.mlb.startDate,
          endDate: leaguesDB.mlb.endDate,
        },
        filter: {},
      },
      nba: {
        label: leaguesDB.nba.label,
        teams: [],
        dates: {
          startDate: leaguesDB.nba.startDate,
          endDate: leaguesDB.nba.endDate,
        },
        filter: {},
      },
      nfl: {
        label: leaguesDB.nfl.label,
        teams: [],
        dates: {
          startDate: leaguesDB.nfl.startDate,
          endDate: leaguesDB.nfl.endDate,
        },
        filter: {},
      },
      nhl: {
        label: leaguesDB.nhl.label,
        teams: [],
        dates: {
          startDate: leaguesDB.nhl.startDate,
          endDate: leaguesDB.nhl.endDate,
        },
        filter: {},
      },
    },
    schedule: [],
    league: null,
    drawer: Vue.prototype.$vuetify.breakpoint.width > 960,
    loading: false,
    clear: false,
    dialog: {
      clearFilters: false,
      noGames: false,
    },
  },
  getters: {
    teams: state => league => state.leagues[league].teams,
    schedule: state => state.schedule,
  },
  mutations: {
    // Add filters
    addFilter(state, value) {
      Vue.set(state.leagues[value.league], 'filter', value.data);
    },
    // Add games to the list
    addToSchedule(state, value) {
      state.schedule.push(...value);
    },
    // Clear schedule of all leagues
    clearSchedule(state) {
      Object.keys(state.leagues).map(league => Vue.set(state.leagues[league], 'filter', {}));
      Vue.set(state, 'schedule', []);
    },
    // Remove filters
    removeFilter(state, value) {
      Vue.set(state.leagues[value.league], 'filter', {});
    },
    // Add games to the list
    removeFromSchedule(state, value) {
      Vue.set(state, 'schedule', state.schedule.filter(game => game.league !== value.league));
    },
    // Set chosen dialog box status
    setDialog(state, value) {
      state.dialog[value.property] = value.flag;
    },
    // Set league to be used
    setLeague(state, value) {
      Vue.set(state, 'league', value);
    },
    // Set loading flag status
    setLoading(state, value) {
      Vue.set(state, 'loading', value);
    },
    // Sets teams of chosen league
    setTeams(state, value) {
      state.leagues[value.league].teams = value.data;
    },
    // Toggle clear status
    toggleClear(state) {
      state.clear = !state.clear;
    },
    // Toggle navigation drawer status
    toggleDrawer(state) {
      state.drawer = !state.drawer;
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
      if (!leagueData) {
        localStorage.setItem(league, JSON.stringify({ teams: teamsDB[league] }));
        return commit('setTeams', { league, data: teamsDB[league] });
      }
      return commit('setTeams', { league, data: JSON.parse(leagueData).teams });
    },
    /**
     * @desc It calls function that fetches games from api and set state to make data
     * available globally
     * @param {string} league - League to be used (MLB, NBA, NFL, NHL)
     * @param {string} teams - Filter api call by team(s), when fetching games
     * @param {string} dates - Filter api call by date(s), when fetching games
     * @returns {Promise<T | never>} It sets state with filtered games.
     */
    getSchedule({ commit }, { league, teams, dates }) {
      commit('setLoading', true);
      return leaguesAPI.getSchedule(league, teams, dates)
        .then(({ data: { games } }) => {
          const data = games.map(game => helperGeneral.getGameData(game.schedule, league));
          return commit('addToSchedule', data);
        })
        .catch(err => err)
        .finally(() => commit('setLoading', false));
    },
  },
});
