import axios, { AxiosResponse } from 'axios';
import { PROD_API_URL } from './constants/constants';
import _ from 'lodash';

export const getSimulationResults = async () => {
  return axios.get(`${PROD_API_URL}/simulate`).then((data: AxiosResponse) => {
    const {
      simulation_results: simulationResults,
      num_of_sims: numberOfSimulations,
      last_updated: lastUpdated,
      when_to_start_showing_warning: showOutdatedWarningStartTime,
    } = data.data;
    const adjSimulationResults = _.mapValues(simulationResults, teamDetail => _.mapKeys(teamDetail, (v, k) => _.camelCase(k)));
    return { simulationResults: adjSimulationResults, numberOfSimulations, lastUpdated, showOutdatedWarningStartTime };
  });
};

export const getConferences = async () => axios.get(`${PROD_API_URL}/conferences`).then(({ data }: AxiosResponse) => data);

export const getTeams = async () => {
  return axios.get(`${PROD_API_URL}/teams`).then(({ data }: AxiosResponse) => {
    const camelCaseValues = _.mapValues(data, teamDetail => _.mapKeys(teamDetail, (v, k) => _.camelCase(k)));
    return camelCaseValues;
  });
};
