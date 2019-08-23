import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Table, Dropdown, DropdownProps, Image, Modal, Header, Responsive, Message, Icon } from 'semantic-ui-react'
import { SimulationResults, IndividualTeamSimulationResults, Conferences, Team } from './ApplicationWrapper';
import { getColorByValue } from '../utils';
import { TeamModalMobile } from './Modals/Mobile';
import { TeamModalTablet } from './Modals/Tablet';
import { TeamModalLargeScreen } from './Modals/LargeScreen';
import ReactGA from 'react-ga';

// TODO: Turn to constants
const INITIAL_COLUMNS_TO_SHOW = [
  // [textToShowToUser, propertyOnTeamObject]
  ['Team', 'teamName'],
  ['Average Power Rtg', 'avgPowerRtg'],
  ['Win Division %', 'divisionTitleWinPct'],
  ['Win Conference %', 'conferenceTitleWinPct'],
];

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

const linkStyle = {
  cursor: 'pointer',
  color: '#225fb2',
  textDecoration: 'underline',
};

const TeamModal = (columnValuesObject: IndividualTeamSimulationResults & Team, simulationResults: SimulationResults, numberOfSimulations: number) => {
  ReactGA.modalview('TeamModalView');
  return (
    <Modal
      trigger={<p style={linkStyle}>{`${columnValuesObject.teamName}`}</p>}
      centered={false}
      closeIcon
      size="fullscreen"
    >
      <Header as='h2'>
        <Image src={columnValuesObject.logos[0]} style={{ marginRight: '20px' }} />{columnValuesObject.teamName}
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
          <TeamModalMobile
            columnValuesObject={columnValuesObject}
            simulationResults={simulationResults}
            numberOfSimulations={numberOfSimulations}
          />
        </Responsive>
        <Responsive minWidth={500} maxWidth={800}>
          <TeamModalTablet
            columnValuesObject={columnValuesObject}
            simulationResults={simulationResults}
            numberOfSimulations={numberOfSimulations}
          />
        </Responsive>
        <Responsive minWidth={801}>
          <TeamModalLargeScreen
            columnValuesObject={columnValuesObject}
            simulationResults={simulationResults}
            numberOfSimulations={numberOfSimulations}
          />
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
    'teamName': TeamModal(columnValuesObject, simulationResults, numberOfSimulations),
    'avgPowerRtg': columnValuesObject.avgPowerRtg,
    'divisionTitleWinPct': columnValuesObject.divisionTitleWinPct === -1 ? 'N/A' : `${(columnValuesObject.divisionTitleWinPct * 100).toFixed(2)} %`,
    'conferenceTitleWinPct': columnValuesObject.conferenceTitleWinPct === -1 ? 'N/A' : `${(columnValuesObject.conferenceTitleWinPct * 100).toFixed(2)} %`,
  };

  const style = styleByValue(columnName, columnValuesObject);

  // @ts-ignore
  return [{ ...style, paddingRight: '5px' }, map[columnName]];
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

type SortState = { valueToSortBy: string, directionByColumn: { avgPowerRtg: string, divisionTitleWinPct: string, conferenceTitleWinPct: string } };
const INITIAL_SORTING_STATE = {
  valueToSortBy: 'avgPowerRtg',
  directionByColumn: { avgPowerRtg: 'descending', divisionTitleWinPct: '', conferenceTitleWinPct: '' },
};

type DropdownState = { conferenceToShow: string, divisionToShow: string };
const INITIAL_DROPDOWN_STATE = { conferenceToShow: '', divisionToShow: '' };

type SimulationTableProps = {
  simulationResults: SimulationResults,
  conferences: Conferences,
  numberOfSimulations: number,
  lastUpdated: moment.Moment,
  showOutdatedWarningStartTime: moment.Moment,
};

const SimulationTable = ({ simulationResults, conferences, numberOfSimulations, lastUpdated, showOutdatedWarningStartTime }: SimulationTableProps) => {
  const [{ conferenceToShow, divisionToShow }, updateDropdownState] = useState<DropdownState>(INITIAL_DROPDOWN_STATE);
  const [{ filteredTeams, conferenceDropdownOptions, divisionDropdownOptions }, setState] = useState({
    filteredTeams: simulationResults, conferenceDropdownOptions: [], divisionDropdownOptions: [],
  });
  const [{ valueToSortBy, directionByColumn }, setValueToSortBy] = useState<SortState>(INITIAL_SORTING_STATE);

  ReactGA.pageview('SimulationTable');

  useEffect(() => {
    const filteredTeams = determineTeamsToRender(simulationResults, conferences, conferenceToShow, divisionToShow);
    const conferenceDropdownOptions = getConferenceDropdownOptions(conferences);
    const divisionDropdownOptions = getDivisionDropdownOptions(conferences, conferenceToShow)
    // @ts-ignore
    setState({ filteredTeams, conferenceDropdownOptions, divisionDropdownOptions });
  }, [conferenceToShow, divisionToShow, conferences, simulationResults]);

  const sortedTeams = _.sortBy(filteredTeams, team => {
    // TODO: Fix sorting bug for teamName
    return (directionByColumn[valueToSortBy] === '' || directionByColumn[valueToSortBy] === 'descending') ? -team[valueToSortBy] : team[valueToSortBy];
  });

  return (
    // TODO: Show the number of simulations
    <React.Fragment>
      <h1 style={{ margin: '20px 0' }}>NCAAF Simulations</h1>
      <Responsive maxWidth={499}>
        <Message warning style={{ margin: '10px 0' }} size='mini'>
          <Icon name='sync alternate' />Rotate your phone for a better view!
        </Message>
      </Responsive>
      <Responsive minWidth={500}>
        <Message info style={{ margin: '10px 0' }} size='small'>
          <p>
            Projected results are based on 100,000 simulations of the season using four well-respected power rating
            models - ESPN FPI, S&amp;P+, Entropy and Massey. The simulation results are driven by the projected margin
            for each game. This is subsequently translated to a win likelihood for every game for each team, which is then
            used to power the simulation. The simulation below is a combination of results to date, power ratings and
            forward-looking simulations.
          </p>
          <p>
            <b>For more detail see the FAQ.</b>
          </p>
        </Message>
      </Responsive>
      <Dropdown
        placeholder='Filter by conference'
        clearable
        closeOnChange
        selection
        style={{ margin: '5px 5px 5px 0' }}
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
          style={{ margin: '5px 0 10px 0' }}
          options={divisionDropdownOptions}
          // @ts-ignore
          onChange={(e: React.SyntheticEvent<HTMLElement>, { value }: DropdownProps) => updateDropdownState({ divisionToShow: value, conferenceToShow })}
        />
      )}
      {/* </div> */}
      <div id="should-be-centered">
        <Message info style={{ margin: '10px 0', width: '400px' }} size='mini'>
          <Icon name='info' />Simulations results and power ratings last updated {lastUpdated.format('ddd, MMM D')}
        </Message>
        <Table sortable celled unstackable fixed>
          <Table.Header>
            <Table.Row>
              {/* TODO: add some styling for down arrow and up arrow based on ascending / descending */}
              {_.map(INITIAL_COLUMNS_TO_SHOW, ([columnNameToShowUser, objectPropertyRelatedToColumnName]) => {
                return (
                  <Table.HeaderCell
                    key={columnNameToShowUser}
                    sorted={valueToSortBy === objectPropertyRelatedToColumnName ? directionByColumn[valueToSortBy] : null}
                    onClick={(e: React.ChangeEvent) => setValueToSortBy(
                      {
                        valueToSortBy: objectPropertyRelatedToColumnName,
                        // directionByColumn: // directionToSort === 'ascending' || directionToSort === '' ? 'descending' : 'ascending',
                        directionByColumn: {
                          ...directionByColumn,
                          [valueToSortBy]: '',
                          [objectPropertyRelatedToColumnName]: (
                            (directionByColumn[objectPropertyRelatedToColumnName] === 'ascending'
                              || directionByColumn[objectPropertyRelatedToColumnName] === '')
                              ? 'descending'
                              : 'ascending'
                          ),
                        }
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
      </div>
    </React.Fragment>
  );
};

export default SimulationTable;
