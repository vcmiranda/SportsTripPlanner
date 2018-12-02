/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import leaguesAPI from './api/leagues';
import teamsDB from './data/teams.json';
import helperGeneral from './helpers/general';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // mlb: {
    //   teams: [],
    //   schedule: [],
    // },
    nba: {
      teams: [],
      schedule: [],
    },
    nfl: {
      teams: [],
      schedule: [],
    },
    nhl: {
      teams: [],
      schedule: [],
    },
    league: null,
    drawer: true,
  },
  getters: {
    teams: state => league => state[league].teams,
    schedule: state => league => state[league].schedule,
  },
  mutations: {
    update(state, value) {
      state[value.league][value.property] = value.data;
    },
    setLeague(state, value) {
      state.league = value;
    },
    clearSchedule(state) {
      // state.mlb.schedule = [];
      state.nba.schedule = [];
      state.nfl.schedule = [];
      state.nhl.schedule = [];
    },
    setDrawer(state) {
      state.drawer = !state.drawer;
    }
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
      commit('clearSchedule');
      return leaguesAPI.getSchedule(league, teams, dates)
        .then(({ data: { games } }) => {
          const data = games.map(game => helperGeneral.getGameData(game.schedule, league));
          commit('update', {
            league,
            property: 'schedule',
            data,
          });
        });
    },
  },
});
