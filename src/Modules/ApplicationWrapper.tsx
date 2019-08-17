import React, { useState } from 'react';
import { Loader, Dimmer } from 'semantic-ui-react'
import { unreachable } from '../utils'
import SimulationTable from './SimulationTable';
import { getSimulationResults, getConferences, getTeams } from '../api';
import { useAsyncEffect } from '../customHooks';
// TODO: Figure out how to use path properly
// import path from 'path';

export enum PageStatusEnum {
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

type Conference = {
  abbreviation: string,
  divisions: { [key: string]: Array<string> } | null,
  id: number,
  name: string,
  short_name: string,
  teams: Array<string>,
}

export type Conferences = { [key: string]: Conference } | null;

// TODO: Improve typing
export type Teams = {} | null;
export type SimulationResults = { [key: string]: IndividualTeamSimulationResults };
export type TeamRatingsMap = { [key: string]: { [key: string]: number } };

type SimulationResponse = {
  numberOfSimulations: number,
  simulationResults: SimulationResults,
};

type State = {
  pageStatus: PageStatusEnum,
  simulationResults: SimulationResults | null,
  numberOfSimulations: number,
  conferences: Conferences,
  teams: Teams,
};

const INITIAL_STATE = {
  pageStatus: PageStatusEnum.LOADING,
  teams: null,
  conferences: null,
  simulationResults: null,
  numberOfSimulations: 0,
};

// type TableState = { column: string | null , data: [], direction: string | null };
const ApplicationWrapper: React.FC = () => {
  // TODO: Refactor into INITIAL_STATE
  const [state, setState] = useState<State>(INITIAL_STATE);
  const { pageStatus, simulationResults, numberOfSimulations, conferences, teams } = state;

  useAsyncEffect(async () => {
    console.log('firing async effect');
    try {
      // @ts-ignore
      const [{ numberOfSimulations, simulationResults }, conferences, teams]: [SimulationResponse, Conferences, Teams] = await Promise.all([
        getSimulationResults(),
        getConferences(),
        getTeams(),
      ]);
      setState({ numberOfSimulations, simulationResults, conferences, teams, pageStatus: PageStatusEnum.HAS_DATA });
    } catch (e) {
      // set status error
    }
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
          numberOfSimulations={numberOfSimulations}
          conferences={conferences}
          teams={teams}
        />
      );
    default:
      // this should throw an error if compiler gets here --> no fall through of reducer allowed
      unreachable(pageStatus)

      return null;
  }
};

export default ApplicationWrapper;
