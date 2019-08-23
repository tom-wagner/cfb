import React, { useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Loader, Dimmer, Message } from 'semantic-ui-react'
import { unreachable } from '../utils'
import SimulationTable from './SimulationTable';
import { getSimulationResults, getConferences, getTeams } from '../api';
import { useAsyncEffect } from '../customHooks';

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
  lastUpdated: string,
  showOutdatedWarningStartTime: string,
};

type State = {
  pageStatus: PageStatusEnum,
  conferences: Conferences | null,
  simulationResults: SimulationResults | null,
  numberOfSimulations: number,
  lastUpdated: moment.Moment,
  showOutdatedWarningStartTime: moment.Moment,
};

const INITIAL_STATE = {
  pageStatus: PageStatusEnum.LOADING,
  lastUpdated: moment(),
  showOutdatedWarningStartTime: moment(),
  teams: null,
  conferences: null,
  simulationResults: null,
  numberOfSimulations: 0,
};

const ApplicationWrapper: React.FC = () => {
  const [state, setState] = useState<State>(INITIAL_STATE);
  const { pageStatus, simulationResults, numberOfSimulations, conferences, lastUpdated, showOutdatedWarningStartTime } = state;

  useAsyncEffect(async () => {
    try {
      // @ts-ignore
      const [
        { numberOfSimulations, simulationResults, lastUpdated, showOutdatedWarningStartTime },
        conferences,
        teams,
      ]: [SimulationResponse, Conferences, Array<Team>] = await Promise.all([
        getSimulationResults(),
        getConferences(),
        getTeams(),
      ]);
      const mergedSimulationsAndTeamsWithTeamName = _.mapValues(simulationResults, (val, key) => _.merge(val, _.get(teams, key), { teamName: key }));
      setState({
        lastUpdated: moment(lastUpdated),
        showOutdatedWarningStartTime: moment(showOutdatedWarningStartTime),
        numberOfSimulations,
        simulationResults: mergedSimulationsAndTeamsWithTeamName,
        conferences,
        pageStatus: PageStatusEnum.HAS_DATA,
      });
    } catch (e) {
      console.log({ e });
      setState({ ...state, pageStatus: PageStatusEnum.ERROR });
    }
  }, []);

  switch (pageStatus) {
    case PageStatusEnum.LOADING:
      return (
        <Dimmer active inverted>
          <Loader inverted>Loading</Loader>
        </Dimmer>
      );
    case PageStatusEnum.ERROR:
      return (
        <React.Fragment>
          <div id="outer-box" style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <div id="inner-box-to-be-centered" style={{ alignSelf: 'center', maxWidth: '1400px', marginTop: '50px' }}>
              <Message negative>Error loading simulation detail - please try again later.</Message>
            </div>
          </div>
        </React.Fragment>
      );
    case PageStatusEnum.HAS_DATA:
      return (
        <SimulationTable
          simulationResults={simulationResults}
          numberOfSimulations={numberOfSimulations}
          conferences={conferences}
          lastUpdated={lastUpdated}
          showOutdatedWarningStartTime={showOutdatedWarningStartTime}
        />
      );
    default:
      // this should throw an error if compiler gets here --> no fall through of reducer allowed
      unreachable(pageStatus)

      return null;
  }
};

export default ApplicationWrapper;
