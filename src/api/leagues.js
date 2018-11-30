export default {
  getTeams(league) {
    return window.axios.get(`/${league}/2018-2019-regular/team_stats_totals.json`);
  },
  getMatches(league, team, dates) {
    let path = `/${league}/2018-2019-regular/games.json`;
    if (team && dates) {
      path += `?team=${team}&date=${dates}`;
    } else if (team) {
      path += `?team=${team}`;
    } else if (dates) {
      path += `?date=${dates}`;
    }
    // console.log(path);
    return window.axios.get(path);
  },
};
