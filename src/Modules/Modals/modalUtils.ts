import _ from 'lodash';
import { IndividualTeamSimulationResults, Team, SimulationResults, Game } from '../ApplicationWrapper'

export type TeamModalProps = { columnValuesObject: IndividualTeamSimulationResults & Team, simulationResults: SimulationResults, numberOfSimulations: number };

export const getOpponent = (game: Game, teamName: string) => {
  return (game['home_team'] === teamName) ? `vs. ${game['away_team']}` : `@ ${game['home_team']}`
};

export const getOpponentPowerRatingAndRank = (game: Game, teamName: string, simulationResults: SimulationResults) => {
  const opponent = game['home_team'] === teamName ? game['away_team'] : game['home_team']
  return `${_.get(simulationResults[opponent], 'avgPowerRtg', 'N/A')} (${_.get(simulationResults[opponent], 'rankings.avg_power_rtg', '-')})`
};

const showFinalScore = (game: Game, teamName: string) => {
  const [htPoints, atPoints] = _.map(['home_points', 'away_points'], s => game[s]);
  const isHomeTeam = game['home_team'] === teamName;
  const isWinner = isHomeTeam ? game['home_points'] > game['away_points'] : game['away_points'] > game['home_points']
  return `${isWinner ? 'WIN' : 'LOSS'}: ${Math.max(htPoints, atPoints)} - ${Math.min(htPoints, atPoints)}`;
};

export const getProjectedMargin = (game: Game, teamName: string) => {
  if (game['home_team_projected_margin']) {
    return (game['home_team'] === teamName) ? game['home_team_projected_margin'] : -game['home_team_projected_margin'];
  }
  return showFinalScore(game, teamName);
};

export const getWinProbability = (game: Game, teamName: string) => {
  const win_pct = (game['home_team'] === teamName) ? game['home_team_win_pct'] : (1 - game['home_team_win_pct']);
  return `${(win_pct * 100).toFixed(0)}%`;
};

export const exampleTextFn = (idx: number, cumulativeLikelihoods: Array<number>, numberOfSimulations: number, teamName: string) => {
  const percentage = (cumulativeLikelihoods[idx] / numberOfSimulations * 100).toFixed(1);
  const record = `${idx} - ${12 - idx}`
  return (
    `For example: ${percentage}% in the "going ____ or better" column for the row ${record} means ${teamName} has a ${percentage}% change of winning ${idx} or more regular season games.`
  );
};

export const MOBILE_SCHEDULE_HEADERS = ['Opponent', 'Proj. Margin', 'Win %'] as const;
export const MOBILE_SCHEDULE_TABLE_WIDTHS = ['3', '2', '2'] as const;

export const SCHEDULE_HEADERS = ['Week', 'Date', 'Opponent', 'Opp. Avg Power Rtg. (rank)', 'Projected Margin', 'Win Probability'] as const;
export const SCHEDULE_TABLE_WIDTHS = ['1', '3', '3', '2', '2', '2'] as const;
