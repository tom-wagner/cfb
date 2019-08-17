import React, { useState } from 'react';
import { Table, Dropdown } from 'semantic-ui-react'
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


type SimulationTableProps = { simulationResults: SimulationResults, teams: Teams, conferences: Conferences, numberOfSimulations: number };
const SimulationTable = ({ simulationResults, conferences, teams, numberOfSimulations }: SimulationTableProps) => {
  const [columnsToShow, setColumnsToShow] = useState(INITIAL_COLUMNS_TO_SHOW);
  const [conferenceToShow, updateConferenceToShow] = useState('Big Ten');
  const [divisionToShow, updateDivisionToShow] = useState(null);

  // @ts-ignore --> TODO: Consider moving to useEffect and listening for conferenceToShow change --> combine with division logic
  const conferenceTeams = conferenceToShow ? new Set(_.get(conferences, `${conferenceToShow}.teams`)) : null;
  const filteredTeams = conferenceTeams ? _.pickBy(simulationResults, (v, teamName) => conferenceTeams.has(teamName)) : simulationResults;
  // TODO: Can this duplication be removed? And this should only once, not on every render --> maybe useMemo?
  // TODO: useEffect and listen for conference change to update a division dropdown
  const conferenceDropdownOptions = _.map(conferences, ({ name }) => ({ key: name, text: name, value: name }));
  return (
    <React.Fragment>
      <Dropdown clearable options={conferenceDropdownOptions} closeOnChange onChange={(x) => console.log(x)}/>
      <Table sortable celled fixed unstackable>
        <Table.Header>
          <Table.Row>
            {/* // todo: add onClick logic */}
            {_.map(columnsToShow, columnName => <Table.HeaderCell key={columnName}>{columnName}</Table.HeaderCell>)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.map(filteredTeams, (simulationResults, teamName) => (
            <Table.Row key={teamName}>
              {_.map(columnsToShow, columnName => {
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
