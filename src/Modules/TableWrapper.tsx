import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import _ from 'lodash';
import { Loader, Dimmer } from 'semantic-ui-react'
import { BASE_API_URL } from '../constants/constants';
import { unreachable } from '../utils'
import SimulationTable from './SimulationTable';
// TODO: Figure out how to use path properly
// import path from 'path';

enum PageStatusEnum {
  LOADING = 'LOADING',
  HAS_DATA = 'HAS_DATA',
  ERROR = 'ERROR'
}

type SeasonSimulationForOneTeam = { [key: string]: number }
export type IndividualTeamSimulationResults = {
  conferenceResults: SeasonSimulationForOneTeam,
  conferenceTitleCount: number,
  divisionTitleCount: number,
  nonConferenceResults: SeasonSimulationForOneTeam,
  totalWins: SeasonSimulationForOneTeam,
};

// TODO: Improve typing
export type SimulationResults = { [key: string]: IndividualTeamSimulationResults };
export type TeamRatingsMap = { [key: string]: { [key: string]: number } };

type State = {
  pageStatus: PageStatusEnum,
  simulationResults: SimulationResults | null,
  teamRatingsMap: TeamRatingsMap | null,
  numberOfSimulations: number,
}
  

// type TableState = { column: string | null , data: [], direction: string | null };
const SimulationTableWrapper: React.FC = () => {
  const [state, setApiStatus] = useState<State>({ pageStatus: PageStatusEnum.LOADING, simulationResults: null, teamRatingsMap: null, numberOfSimulations: 0 });
  const { pageStatus, teamRatingsMap, simulationResults, numberOfSimulations } = state;

  useEffect(() => {
    axios
      // TODO move all API logic to an /`api` file, or something similar
      .get(`${BASE_API_URL}/simulate`, { 'params': { 'year': 2019 } })
      .then((data: AxiosResponse) => {
        const { simulation_results: simulationResults, num_of_sims: numberOfSimulations, team_ratings: teamRatingsMap } = data.data;
        const adjSimulationResults = _.mapValues(simulationResults, teamDetail => _.mapKeys(teamDetail, (v, k) => _.camelCase(k)));
        setApiStatus({ pageStatus: PageStatusEnum.HAS_DATA, simulationResults: adjSimulationResults as unknown as SimulationResults, numberOfSimulations, teamRatingsMap })
      })
      .catch(() => setApiStatus({ ...state, pageStatus: PageStatusEnum.ERROR }))
  }, []);

  console.log({ state });

  switch (pageStatus) {
    case PageStatusEnum.LOADING:
      return (
        <Dimmer active inverted>
          <Loader inverted>Loading</Loader>
        </Dimmer>
      );
    case PageStatusEnum.ERROR:
      return <p>error</p>
    case PageStatusEnum.HAS_DATA:
      return (
        <SimulationTable
          simulationResults={simulationResults as SimulationResults}
          teamRatingsMap={teamRatingsMap as TeamRatingsMap}
          numberOfSimulations={numberOfSimulations}
        />
      );
    default:
      // this should throw an error if compiler gets here --> no fall through of reducer allowed
      unreachable(pageStatus)

      return null;
  }
};

export default SimulationTableWrapper;
