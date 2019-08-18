import React, { useState, useEffect } from 'react';
import { Table, Dropdown, DropdownProps } from 'semantic-ui-react'
import _ from 'lodash';
import { TeamRatingsMap, SimulationResults, IndividualTeamSimulationResults, Conferences, Teams } from './ApplicationWrapper';
import { number } from 'prop-types';
import { RSA_NO_PADDING } from 'constants';
import { getConferences } from '../api';

// const [ENTROPY, FPI, MASSEY, SP_PLUS, AVERAGE] = ['ENTROPY', 'FPI', 'MASSEY', 'SP_PLUS', 'AVERAGE'];

// TODO: Turn to constants
const INITIAL_COLUMNS_TO_SHOW = ['Team Name', 'Average Power Rtg', 'Win Division %', 'Win Conference %'];
const ADDITIONAL_COLUMN_OPTIONS = _.map(_.range(1, 13), x => `${x}+ wins %`);


const columnMapper = (
  columnName: string,
  teamName: string,
  columnValuesObject: IndividualTeamSimulationResults,
  numberOfSimulations: number,
  teams: Teams,
) => {
  const map = {
    'Team Name': () => teamName,
    // @ts-ignore
    'Average Power Rtg': () => teams[teamName].avg_power_rtg,
    'Win Division %': () => `${(columnValuesObject.divisionTitleCount / numberOfSimulations * 100).toFixed(2)}%`,
    'Win Conference %': () => `${(columnValuesObject.conferenceTitleCount / numberOfSimulations * 100).toFixed(2)}%`,
  };

  // @ts-ignore
  return map[columnName]();
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

// TODO: By the time we get here these should not be null --> which should solve some typescript issues
type SimulationTableProps = { simulationResults: SimulationResults, teams: Teams, conferences: Conferences, numberOfSimulations: number };
const SimulationTable = ({ simulationResults, conferences, teams, numberOfSimulations }: SimulationTableProps) => {
  // TODO: Do I want column flexibility in V1?
  // const [columnsToShow, setColumnsToShow] = useState(INITIAL_COLUMNS_TO_SHOW);

  // TODO: add typing
  const [{ conferenceToShow, divisionToShow }, updateDropdownState] = useState<DropdownState>({ conferenceToShow: '', divisionToShow: '' });
  const [{ filteredTeams, conferenceDropdownOptions, divisionDropdownOptions }, setState] = useState({ filteredTeams: simulationResults, conferenceDropdownOptions: [], divisionDropdownOptions: [] })

  useEffect(() => {
    const filteredTeams = determineTeamsToRender(simulationResults, conferences, conferenceToShow, divisionToShow);
    const conferenceDropdownOptions = getConferenceDropdownOptions(conferences);
    const divisionDropdownOptions = getDivisionDropdownOptions(conferences, conferenceToShow)
    // @ts-ignore
    setState({ filteredTeams, conferenceDropdownOptions, divisionDropdownOptions });
  }, [conferenceToShow, divisionToShow])

  return (
    <React.Fragment>
      <Dropdown
        placeholder='Filter by conference'
        clearable
        closeOnChange
        selection
        options={conferenceDropdownOptions}
        // TODO: condense together, reset division on conference change
        // @ts-ignore
        onChange={(e: React.SyntheticEvent<HTMLElement>, { value }: DropdownProps) => updateDropdownState({ divisionToShow: '', conferenceToShow: value })}
      />
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
      <Table sortable celled fixed unstackable>
        <Table.Header>
          <Table.Row>
            {/* // todo: add onClick logic */}
            {_.map(INITIAL_COLUMNS_TO_SHOW, columnName => <Table.HeaderCell key={columnName}>{columnName}</Table.HeaderCell>)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.map(filteredTeams, (simulationResults, teamName) => (
            <Table.Row key={teamName}>
              {_.map(INITIAL_COLUMNS_TO_SHOW, columnName => {
                const value = columnMapper(columnName, teamName, simulationResults, numberOfSimulations, teams)
                return <Table.Cell key={columnName}>{value}</Table.Cell>;
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </React.Fragment>
  );
};

export default SimulationTable;
