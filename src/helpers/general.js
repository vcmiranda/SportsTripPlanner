import moment from 'moment';
import teamsDB from '../data/teams.json';

export default {
  /**
   * @desc Filter and group only information to be used from each game
   * @param {string} game - Full game information
   * @param {string} league - League to be used (MLB, NBA, NFL, NHL)
   * @returns {object} Returns an object with necessary information regarding each game
   * (home and away teams, date of game, and general location information)
   */
  getGameData(game, league) {
    const homeTeam = teamsDB[league].find(row => row.abbreviation === game.homeTeam.abbreviation);
    const awayTeam = teamsDB[league].find(row => row.abbreviation === game.awayTeam.abbreviation);
    return {
      league,
      dateTime: {
        fullDate: moment(game.startTime).format('YYYY-MM-DD'),
        year: moment(game.startTime).format('YYYY'),
        month: moment(game.startTime).format('MMMM'),
        day: moment(game.startTime).format('DD'),
        time: moment(game.startTime).format('hh:mm A'),
      },
      homeTeam: {
        abbreviation: game.homeTeam.abbreviation,
        name: homeTeam.team,
      },
      awayTeam: {
        abbreviation: game.awayTeam.abbreviation,
        name: awayTeam.team,
      },
      location: {
        venue: homeTeam.venue,
        capacity: homeTeam.capacity,
        opened: homeTeam.opened,
        address: homeTeam.address,
        location: homeTeam.location,
        country: homeTeam.country,
        coordinates: homeTeam.coordinates,
      },
    };
  },
};
