/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';
import leaguesAPI from './api/leagues';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    teams: {
      mlb: [],
      nba: [],
      nfl: [],
      nhl: [],
    },
    schedule: {
      mlb: [],
      nba: [],
      nfl: [],
      nhl: [],
    },
  },
  getters: {
    teamsAll: state => league => state.teams[league],
  },
  mutations: {
    update(state, value) {
      state[value.property][value.league] = value.data;
    },
  },
  actions: {
    getTeams({ state, commit }, league) {
      if (!state.teams[league].length) {
        return leaguesAPI.getTeams(league)
          .then(({ data: { teamStatsTotals: teams } }) => {
            const result = teams.map((info) => {
              const temp = {};
              temp.city = info.team.city;
              temp.name = info.team.name;
              temp.abbreviation = info.team.abbreviation;
              temp.team = `${info.team.city} ${info.team.name}`;
              return temp;
            });
            commit('update', {
              property: 'teams',
              league,
              data: result,
            });
          });
      }
      return null;
    },
    getMatches({ commit }, { league, team, dates }) {
      return leaguesAPI.getMatches(league, team, dates)
        .then(({ data: { games } }) => {
          commit('update', {
            property: 'schedule',
            league,
            data: games,
          });
        });
    },
  },
});
