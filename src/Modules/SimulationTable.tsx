import React, { useState, useEffect } from 'react';
import { Table, Dropdown, DropdownProps, Image, Modal, Header, Responsive } from 'semantic-ui-react'
import _ from 'lodash';
import { SimulationResults, IndividualTeamSimulationResults, Conferences, Team } from './ApplicationWrapper';
import { getColorByValue } from '../utils';

// const [ENTROPY, FPI, MASSEY, SP_PLUS, AVERAGE] = ['ENTROPY', 'FPI', 'MASSEY', 'SP_PLUS', 'AVERAGE'];

// TODO: Turn to constants
const INITIAL_COLUMNS_TO_SHOW = [
  // [textToShowToUser, propertyOnTeamObject]
  ['Team Name (click on a team to see more detail)', 'teamName'],
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

type TeamModalProps = { columnValuesObject: IndividualTeamSimulationResults & Team };
const TeamModalMobile = ({ columnValuesObject }: TeamModalProps) => {
  return <p>mobile: {columnValuesObject.teamName}</p>;
};

type TeamModalMobileProps = { columnValuesObject: IndividualTeamSimulationResults & Team };
const TeamModal = ({ columnValuesObject }: TeamModalProps) => {
  return <p>tablet and computer: {columnValuesObject.teamName}</p>;
};

const linkStyle = {
  cursor: 'pointer',
  color: '#225fb2',
}

const ModalExample = (columnValuesObject: IndividualTeamSimulationResults & Team) => {
  return (
    <Modal trigger={<p style={linkStyle}>{`${columnValuesObject.teamName}`}</p>} centered={false} closeIcon>
      <Header as='h3'>
        <Image src={columnValuesObject.logos[0]}/>{`  `}{columnValuesObject.teamName}
      </Header>
      <Modal.Content image>
        <Responsive maxWidth={499}>
          <TeamModalMobile columnValuesObject={columnValuesObject} />
        </Responsive>
        <Responsive minWidth={500}>
          <TeamModal columnValuesObject={columnValuesObject} />
        </Responsive>
      </Modal.Content>
    </Modal>
  );
};

const columnMapperAndStyler = (
  columnName: string,
  columnValuesObject: IndividualTeamSimulationResults & Team,
) => {
  const map = {
    'teamName': ModalExample(columnValuesObject),
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
                const [style, value] = columnMapperAndStyler(objectPropertyRelatedToColumnName, team)
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
