export default {
  /**
   * @desc Counts number of registrations according with param, add new attribute to each element, and return array
   * @param {string} league - League to be used (MLB, NBA, NFL, NHL)
   * @param {string} team - Teams(s) to filter response
   * @param {string} dates - Date(s) to filter response
   * @returns {array} Returns an array with matches from chosen league, filtered or not by team(s) and date(s)
   */
  getSchedule(league, team, dates) {
    let path = `/${league}/2018-2019-regular/games.json`;
    if (team && dates) {
      path += `?team=${team}&date=${dates}`;
    } else if (team) {
      path += `?team=${team}`;
    } else if (dates) {
      path += `?date=${dates}`;
    }
    return window.axios.get(path);
  },
};
