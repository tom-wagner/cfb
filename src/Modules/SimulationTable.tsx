import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Table, Dropdown, DropdownProps, Image, Modal, Header, Responsive, Grid, Message, Icon, Divider } from 'semantic-ui-react'
import _ from 'lodash';
import { SimulationResults, IndividualTeamSimulationResults, Conferences, Team, Game } from './ApplicationWrapper';
import { getColorByValue } from '../utils';
import { avgPowerHeaderStyle, avgPowerRankStyle, ratingRankStyle, ratingHeaderStyle } from './styles';

// const [ENTROPY, FPI, MASSEY, SP_PLUS, AVERAGE] = ['ENTROPY', 'FPI', 'MASSEY', 'SP_PLUS', 'AVERAGE'];

// TODO: Turn to constants
const INITIAL_COLUMNS_TO_SHOW = [
  // [textToShowToUser, propertyOnTeamObject]
  ['Team Name (click to see more detail)', 'teamName'],
  ['Average Power Rtg', 'avgPowerRtg'],
  ['Win Division %', 'divisionTitleWinPct'],
  ['Win Conference %', 'conferenceTitleWinPct'],
];

// TODO: Consider using in team modal
// const ADDITIONAL_COLUMN_OPTIONS = _.map(_.range(1, 13), x => `${x}+ wins %`);

// TODO: Consider changing styling to make the styling relative to the other values being displayed
const styleByValue = (
  columnName: string,
  columnValuesObject: IndividualTeamSimulationResults & Team,
) => {
  if (columnName === 'divisionTitleWinPct') {
    if (columnValuesObject.divisionTitleWinPct === -1) {
      return { backgroundColor: getColorByValue(0) };
    }
    return { backgroundColor: getColorByValue(columnValuesObject.divisionTitleWinPct) };
  }
  if (columnName === 'conferenceTitleWinPct') {
    if (columnValuesObject.conferenceTitleWinPct === -1) {
      return { backgroundColor: getColorByValue(0) };
    }
    return { backgroundColor: getColorByValue(columnValuesObject.conferenceTitleWinPct) };
  }
  if (columnName === 'avgPowerRtg') {
    const absolutePowerRatingDivHundred = Math.abs(columnValuesObject.avgPowerRtg * .01);
    return { backgroundColor: getColorByValue(absolutePowerRatingDivHundred) };
  }
  return {};
}

type TeamModalProps = { columnValuesObject: IndividualTeamSimulationResults & Team, simulationResults: SimulationResults, numberOfSimulations: number };
const TeamModalMobile = ({ columnValuesObject }: TeamModalProps) => {
  return <p>mobile: {columnValuesObject.teamName}</p>;
};

const getOpponent = (game: Game, teamName: string) => {
  return (game['home_team'] === teamName) ? `vs. ${game['away_team']}` : `@ ${game['home_team']}`
};

const getOpponentPowerRatingAndRank = (game: Game, teamName: string, simulationResults: SimulationResults) => {
  const opponent = game['home_team'] === teamName ? game['away_team'] : game['home_team']
  return `${_.get(simulationResults[opponent], 'avgPowerRtg', 'N/A')} (${_.get(simulationResults[opponent], 'rankings.avg_power_rtg', '-')})`
};

const getProjectedMargin = (game: Game, teamName: string) => {
  return (game['home_team'] === teamName) ? game['home_team_projected_margin'] : -game['home_team_projected_margin'];
};

const getWinProbability = (game: Game, teamName: string) => {
  const win_pct = (game['home_team'] === teamName) ? game['home_team_win_pct'] : (1 - game['home_team_win_pct']);
  return `${(win_pct * 100).toFixed(0)}%`;
};

const exampleTextFn = (idx: number, cumulativeLikelihoods: Array<number>, numberOfSimulations: number, teamName: string) => {
  const percentage = (cumulativeLikelihoods[idx] / numberOfSimulations * 100).toFixed(1);
  const record = `${idx} - ${12 - idx}`
  return (
    `For example: ${percentage}% next to ${record} in the "going ____ or better" column means ${teamName} has a ${percentage}% change of winning ${idx} or more regular season games.`
  );
};

const SCHEDULE_HEADERS = ['Week', 'Date', 'Opponent', 'Opponent Avg Power Rating (rank)', 'Projected Margin', 'Win Probability'] as const;
const SCHEDULE_TABLE_WIDTHS = ['1', '2', '3', '3', '3', '3'] as const;

const TeamModal = ({ columnValuesObject, simulationResults, numberOfSimulations }: TeamModalProps) => {
  const likelihoods = _.map(_.range(0, 13), x => columnValuesObject['totalWins'][x])
  let [occurrencesCount, cumulativeLikelihoods] = [0, []];
  _.forEach(likelihoods, numberOfTimesTeamWonXGames => {
    cumulativeLikelihoods.push(numberOfSimulations - occurrencesCount);
    occurrencesCount += numberOfTimesTeamWonXGames;
  });

  const firstIndexUnderSeventyPercent = _.findIndex(cumulativeLikelihoods, (val, idx) => (val / numberOfSimulations) <= 0.7);
  const exampleText = exampleTextFn(firstIndexUnderSeventyPercent, cumulativeLikelihoods, numberOfSimulations, columnValuesObject.teamName);
  
  return (
    <Grid padded divided>
      <Grid.Row>
        <Message info>
          <Message.Header>What are these "power ratings" and how are they used?</Message.Header>
          {/* TODO: Clean up --> and add note to FAQ linking to each of the rating systems, as well as the ranking of them */}
          <p>
            The simulations have been run using the "Average Power Rating", which is the average of the four power 
            rating systems outlined below. At a high level, these power ratings predict a team's projected margin 
            of victory or defeat against any given opponent, which is then converted to a "Win Likelihood" for 
            each game on their schedule.
          </p>
        </Message>
        <Message negative>
          <Icon name='exclamation' />
            Disclaimer: We are injecting any subjectivity as to whether your favorite team is good or bad.
            <p>Instead, we are using well-respected predictive systems to drive the simulation.</p>
        </Message>
      </Grid.Row>
      {/* TEAM RATINGS COMPONENT */}
      <Grid.Row>
        <h2>Power Ratings</h2>
      </Grid.Row>
      // TODO: Turn into a map
      <Grid.Row>
        <Grid.Column width={4}>
          <p style={avgPowerHeaderStyle}>Average Power Rating (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={avgPowerRankStyle}>{columnValuesObject.avgPowerRtg} ({columnValuesObject.rankings.avg_power_rtg})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>ESPN FPI (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.FPI} ({columnValuesObject.rankings.FPI})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>Entropy (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.ENTROPY} ({columnValuesObject.rankings.ENTROPY})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>S&amp;P+ (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.SP_PLUS} ({columnValuesObject.rankings.SP_PLUS})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>Massey (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.MASSEY} ({columnValuesObject.rankings.MASSEY})</p>
        </Grid.Column>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <h2>Schedule</h2>
      </Grid.Row>
      <Grid.Row>
        <Table celled fixed unstackable>
          <Table.Header>
            <Table.Row>
              {_.map(SCHEDULE_HEADERS, (header, idx) => <Table.HeaderCell width={SCHEDULE_TABLE_WIDTHS[idx]}>{header}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
              {_.map(columnValuesObject.schedule, (game, idx) => {
                const teamName = columnValuesObject.teamName;
                return (
                  <Table.Row>
                    <Table.Cell width={SCHEDULE_TABLE_WIDTHS[0]}>{idx + 1}</Table.Cell>
                    <Table.Cell width={SCHEDULE_TABLE_WIDTHS[1]}>{moment(new Date(game['start_date'])).format('ddd, MMM D')}</Table.Cell>
                    <Table.Cell width={SCHEDULE_TABLE_WIDTHS[2]}>{getOpponent(game, teamName)}</Table.Cell>
                    <Table.Cell width={SCHEDULE_TABLE_WIDTHS[3]}>{getOpponentPowerRatingAndRank(game, teamName, simulationResults)}</Table.Cell>
                    <Table.Cell width={SCHEDULE_TABLE_WIDTHS[4]}>{getProjectedMargin(game, teamName)}</Table.Cell>
                    <Table.Cell width={SCHEDULE_TABLE_WIDTHS[5]}>{getWinProbability(game, teamName)}</Table.Cell>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <h2>Regular Season Simulation Detail</h2>
      </Grid.Row>
      <Grid.Row>
        <Message info>
          <p>
            For each simulated season every team is assigned a final record. The simulated seasons can be combined
            together to determine the likelihood a given teams ends the season with X or more regular season wins.
          </p>
          {/* TODO: Make dynamic and tied to actual numbers */}
          <p>{exampleText}</p>
        </Message>
      </Grid.Row>
      <Grid.Row>
        <Table celled style={{ width: '500px' }}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell textAlign='center' colSpan='2'>Likelihood of...</Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              {_.map(['Record', 'finishing exactly ____', 'going ____ or better'], x => <Table.HeaderCell>{x}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
              {_.map(cumulativeLikelihoods, (game, idx) => (
                <Table.Row>
                  <Table.Cell width={2}>{`${idx} - ${12  - idx}`}</Table.Cell>
                  <Table.Cell textAlign='center' width={4}>{(likelihoods[idx] / numberOfSimulations * 100).toFixed(1)}%</Table.Cell>
                  <Table.Cell textAlign='center' width={4}>{(cumulativeLikelihoods[idx] / numberOfSimulations * 100).toFixed(1)}%</Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};

const linkStyle = {
  cursor: 'pointer',
  color: '#225fb2',
}

const ModalExample = (columnValuesObject: IndividualTeamSimulationResults & Team, simulationResults: SimulationResults, numberOfSimulations: number) => {
  return (
    <Modal
      trigger={<p style={linkStyle}>{`${columnValuesObject.teamName}`}</p>}
      centered={false}
      closeIcon
      size="fullscreen"
      
    >
      <Header as='h2'>
        <Image src={columnValuesObject.logos[0]} style={{ marginRight: '20px' }}/>{columnValuesObject.teamName}
        {/* // TODO: Fix h4 vs h2 issue and styling */}
        {/* {columnValuesObject.division && (
          <React.Fragment>
            <Header as='h4' floated='right' block>
              {columnValuesObject.division}
            </Header>
            <Header as='h4' floated='right' style={{ margin: '12px 10px 0px 10px', display: 'inline-block' }}>
              Division:
            </Header>
          </React.Fragment>
        )}
        <Header as='h4' floated='right' block style={{ margin: '0 10px', display: 'inline-block' }}>
          {columnValuesObject.conference}
        </Header>
        <Header as='h4' floated='right' style={{ margin: '12px 10px 0px 10px', display: 'inline-block' }}>
          Conference:
        </Header> */}
      </Header>
      <Modal.Content>
        <Responsive maxWidth={499}>
          <TeamModalMobile columnValuesObject={columnValuesObject} simulationResults={simulationResults} numberOfSimulations={numberOfSimulations} />
        </Responsive>
        <Responsive minWidth={500}>
          <TeamModal columnValuesObject={columnValuesObject} simulationResults={simulationResults} numberOfSimulations={numberOfSimulations} />
        </Responsive>
      </Modal.Content>
    </Modal>
  );
};

const columnMapperAndStyler = (
  columnName: string,
  columnValuesObject: IndividualTeamSimulationResults & Team,
  simulationResults: SimulationResults,
  numberOfSimulations: number,
) => {
  const map = {
    'teamName': ModalExample(columnValuesObject, simulationResults, numberOfSimulations),
    // 'teamName': columnValuesObject.teamName,
    'avgPowerRtg': columnValuesObject.avgPowerRtg,
    'divisionTitleWinPct': columnValuesObject.divisionTitleWinPct === -1 ? 'N/A' : `${(columnValuesObject.divisionTitleWinPct * 100).toFixed(2)} %`,
    'conferenceTitleWinPct': columnValuesObject.conferenceTitleWinPct === -1 ? 'N/A' : `${(columnValuesObject.conferenceTitleWinPct * 100).toFixed(2)} %`,
  };

  const style = styleByValue(columnName, columnValuesObject);

  // @ts-ignore
  return [style, map[columnName]];
}

const determineTeamsToRender = (
  simulationResults: SimulationResults,
  conferences: Conferences,
  conferenceToShow: string,
  divisionToShow: string,
) => {
  if (conferenceToShow && divisionToShow) {
    // @ts-ignore --> TODO: Consider moving to useEffect and listening for conferenceToShow change --> combine with division logic
    const divisionTeams = new Set(conferences[conferenceToShow]['divisions'][divisionToShow])
    return _.pickBy(simulationResults, (v, teamName) => divisionTeams.has(teamName));
  }

  if (conferences && conferenceToShow) {
    const conferenceTeams = new Set(conferences[conferenceToShow]['teams'])
    return _.pickBy(simulationResults, (v, teamName) => conferenceTeams.has(teamName));
  }
  
  return simulationResults;
};

const getConferenceDropdownOptions = (conferences: Conferences) => {
  return _.map(conferences, ({ name }) => ({ key: name, text: name, value: name }));
}

const getDivisionDropdownOptions = (conferences: Conferences, conferenceToShow: string) => {
  if (conferenceToShow && conferences[conferenceToShow]['divisions']) {
    return _.map(conferences[conferenceToShow]['divisions'], (v, k) => ({ key: k, text: k, value: k }));
  }
  return [];
}

type DropdownState = { conferenceToShow: string, divisionToShow: string };
type SortState = { valueToSortBy: string, directionToSort: string };

// TODO: By the time we get here these should not be null --> which should solve some typescript issues
type SimulationTableProps = { simulationResults: SimulationResults, conferences: Conferences, numberOfSimulations: number };
const SimulationTable = ({ simulationResults, conferences, numberOfSimulations }: SimulationTableProps) => {
  // TODO: Do I want column flexibility in V1?
  // const [columnsToShow, setColumnsToShow] = useState(INITIAL_COLUMNS_TO_SHOW);

  const [{ conferenceToShow, divisionToShow }, updateDropdownState] = useState<DropdownState>({ conferenceToShow: '', divisionToShow: '' });
  const [{ filteredTeams, conferenceDropdownOptions, divisionDropdownOptions }, setState] = useState({
     filteredTeams: simulationResults, conferenceDropdownOptions: [], divisionDropdownOptions: [],
  });
  // TODO: State needs to be maintained by each column
  const [{ valueToSortBy, directionToSort }, setValueToSortBy] = useState<SortState>({ valueToSortBy: 'avgPowerRtg', directionToSort: '' });

  useEffect(() => {
    const filteredTeams = determineTeamsToRender(simulationResults, conferences, conferenceToShow, divisionToShow);
    const conferenceDropdownOptions = getConferenceDropdownOptions(conferences);
    const divisionDropdownOptions = getDivisionDropdownOptions(conferences, conferenceToShow)
    // @ts-ignore
    setState({ filteredTeams, conferenceDropdownOptions, divisionDropdownOptions });
  }, [conferenceToShow, divisionToShow, conferences, simulationResults]);

  // TODO: Could move into useEffect and listen for a change in sort direction or valueToSortBy
  // sort --> inefficient to sort on every render but fast enough for now
  const sortedTeams = _.sortBy(filteredTeams, team => {
    // @ts-ignore --> can be fixed by typing valueToSortBy with exact possible values
    return (directionToSort === '' || directionToSort === 'DESC') ? -team[valueToSortBy] : team[valueToSortBy];
  });

  // TODO: Why is this slower than sorting on every render?
  // const [sortedTeams, setSortedTeams] = useState<Array<IndividualTeamSimulationResults>>([]);
  // useEffect(() => {
  //   const sortedTeams = _.sortBy(filteredTeams, team => {
  //     // @ts-ignore
  //     return (directionToSort === '' || directionToSort === 'DESC') ? -team[valueToSortBy] : team[valueToSortBy];
  //   });
  //   setSortedTeams(sortedTeams);
  // }, [directionToSort, valueToSortBy]);

  // COME BACK IF OTHER STUFF DONE:
  // const Divisions = conferenceToShow && conferences[conferenceToShow]['divisions'] && _.map(conferences[conferenceToShow]['divisions'], (val, key) => (
  //   <Button>{key}</Button>
  // ));

  return (
    <React.Fragment>
      <Dropdown
        placeholder='Filter by conference'
        clearable
        closeOnChange
        selection
        options={conferenceDropdownOptions}
        // @ts-ignore
        onChange={(e: React.SyntheticEvent<HTMLElement>, { value }: DropdownProps) => updateDropdownState({ divisionToShow: '', conferenceToShow: value })}
      />
      {/* // TODO: Move below on mobile or make smaller */}
      {conferenceToShow && conferences[conferenceToShow]['divisions'] && (
        <Dropdown
          placeholder='Filter by division'
          clearable
          closeOnChange
          selection
          style={{ marginLeft: '5px' }}
          options={divisionDropdownOptions}
          // @ts-ignore
          onChange={(e: React.SyntheticEvent<HTMLElement>, { value }: DropdownProps) => updateDropdownState({ divisionToShow: value, conferenceToShow })}
        />
      )}
      {/* COME BACK TO DIVISION BUTTONS VS DROPDOWN IF OTHER STUFF DONE */}
      {/* {conferenceToShow && conferences[conferenceToShow]['divisions'] && (
        <React.Fragment>
          <p>Filter by division:</p>
          {Divisions}
        </React.Fragment>
      )} */}
      {/* TODO: Add a note about sorting */}
      {/* TODO: Add a note about clicking on the team names */}
      <Table sortable celled fixed unstackable>
        <Table.Header>
          <Table.Row>
            {/* TODO: add some styling for down arrow and up arrow based on ASC / DESC */}
            {_.map(INITIAL_COLUMNS_TO_SHOW, ([columnNameToShowUser, objectPropertyRelatedToColumnName]) => {
              return (
                <Table.HeaderCell
                  key={columnNameToShowUser}
                  onClick={(e: React.ChangeEvent) => setValueToSortBy(
                    {
                      valueToSortBy: objectPropertyRelatedToColumnName,
                      directionToSort: directionToSort === 'ASC' || directionToSort === '' ? 'DESC' : 'ASC',
                    }
                  )}
                >
                  {columnNameToShowUser}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.map(sortedTeams, (team) => (
            <Table.Row key={team.teamName}>
              {_.map(INITIAL_COLUMNS_TO_SHOW, ([columnNameToShowUser, objectPropertyRelatedToColumnName]) => {
                const [style, value] = columnMapperAndStyler(objectPropertyRelatedToColumnName, team, simulationResults, numberOfSimulations)
                return <Table.Cell style={style} key={columnNameToShowUser}>{value}</Table.Cell>;
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </React.Fragment>
  );
};

export default SimulationTable;
