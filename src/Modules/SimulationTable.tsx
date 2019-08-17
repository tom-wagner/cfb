import React, { useState } from 'react';
import { Table } from 'semantic-ui-react'
import _ from 'lodash';
import { TeamRatingsMap, SimulationResults, IndividualTeamSimulationResults } from './TableWrapper';
import { number } from 'prop-types';
import { RSA_NO_PADDING } from 'constants';

// const [ENTROPY, FPI, MASSEY, SP_PLUS, AVERAGE] = ['ENTROPY', 'FPI', 'MASSEY', 'SP_PLUS', 'AVERAGE'];

// TODO: Turn to constants
const INITIAL_COLUMNS_TO_SHOW = ['Team Name', 'Average Power Rtg', 'Win Division %', 'Win Conference %'];
const ADDITIONAL_COLUMN_OPTIONS = _.map(_.range(1, 13), x => `${x}+ wins %`);

const getAverageTeamRating = (individualTeamPowerRatings: {}): number => {
  return _.sum(_.map(individualTeamPowerRatings)) / _.size(individualTeamPowerRatings);
};

const columnMapper = (
  columnName: string,
  teamName: string,
  columnValuesObject: IndividualTeamSimulationResults,
  numberOfSimulations: number,
  teamRatingsMap: TeamRatingsMap,
) => {
  const map = {
    'Team Name': () => teamName,
    'Average Power Rtg': () => `${getAverageTeamRating(teamRatingsMap[teamName]).toFixed(1)}`,
    'Win Division %': () => `${(columnValuesObject.divisionTitleCount / numberOfSimulations * 100).toFixed(2)}%`,
    'Win Conference %': () => `${(columnValuesObject.conferenceTitleCount / numberOfSimulations * 100).toFixed(2)}%`,
  };

  // @ts-ignore
  return map[columnName]();
}


type SimulationTableProps = { simulationResults: SimulationResults, teamRatingsMap: TeamRatingsMap, numberOfSimulations: number };
const SimulationTable = ({ simulationResults, teamRatingsMap, numberOfSimulations }: SimulationTableProps) => {
  const [columnsToShow, setColumnsToShow] = useState(INITIAL_COLUMNS_TO_SHOW);
  return (
    // TODO: Add dropdown or menu to allow user to set columns to show

    <Table sortable celled fixed unstackable>
      <Table.Header>
        <Table.Row>
          {/* // todo: add onClick logic */}
          {_.map(columnsToShow, columnName => <Table.HeaderCell key={columnName}>{columnName}</Table.HeaderCell>)}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {_.map(simulationResults, (simulationResults, teamName) => (
          <Table.Row key={teamName}>
            {_.map(columnsToShow, columnName => {
              const value = columnMapper(columnName, teamName, simulationResults, numberOfSimulations, teamRatingsMap)
              return <Table.Cell>{value}</Table.Cell>;
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default SimulationTable;
