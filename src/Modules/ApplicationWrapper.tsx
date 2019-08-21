import React, { useState } from 'react';
import _ from 'lodash';
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

export type Game = {};
type SeasonSimulationForOneTeam = { [key: string]: number }
export type IndividualTeamSimulationResults = {
  teamName: string,
  conferenceResults: SeasonSimulationForOneTeam,
  conferenceTitleCount: number,
  conferenceTitleWinPct: number,
  divisionTitleCount: number,
  divisionTitleWinPct: number,
  nonConferenceResults: SeasonSimulationForOneTeam,
  totalWins: SeasonSimulationForOneTeam,
  avgPowerRtg: number,
  powerRtgs: { [key: string]: number },
  logos: Array<string>
  conference: string,
  division: string,
  rankings: {},
  schedule: Array<Game>,
};

type Conference = {
  abbreviation: string,
  divisions?: { [key: string]: Array<string> },
  id: number,
  name: string,
  short_name: string,
  teams: Array<string>,
}

export type Conferences = { [key: string]: Conference };

// TODO: Improve typing
export type Team = {};
export type SimulationResults = { [key: string]: IndividualTeamSimulationResults & Team };
export type TeamRatingsMap = { [key: string]: { [key: string]: number } };

type SimulationResponse = {
  numberOfSimulations: number,
  simulationResults: SimulationResults,
};

type State = {
  pageStatus: PageStatusEnum,
  simulationResults: SimulationResults | null,
  numberOfSimulations: number,
  conferences: Conferences | null,
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
  const [state, setState] = useState<State>(INITIAL_STATE);
  const { pageStatus, simulationResults, numberOfSimulations, conferences } = state;

  useAsyncEffect(async () => {
    try {
      // @ts-ignore
      const [{ numberOfSimulations, simulationResults }, conferences, teams]: [SimulationResponse, Conferences, Teams] = await Promise.all([
        getSimulationResults(),
        getConferences(),
        getTeams(),
      ]);
      const mergedSimulationsAndTeamsWithTeamName = _.mapValues(simulationResults, (val, key) => _.merge(val, _.get(teams, key), { teamName: key }));
      setState({ numberOfSimulations, simulationResults: mergedSimulationsAndTeamsWithTeamName, conferences, pageStatus: PageStatusEnum.HAS_DATA });
    } catch (e) {
      // set status error
      console.log({ e });
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
          // @ts-ignore
          simulationResults={simulationResults as SimulationResults}
          numberOfSimulations={numberOfSimulations}
          conferences={conferences as Conferences}
        />
      );
    default:
      // this should throw an error if compiler gets here --> no fall through of reducer allowed
      unreachable(pageStatus)

      return null;
  }
};

export default ApplicationWrapper;
