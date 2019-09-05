import axios, { AxiosResponse } from 'axios';
import { API_URL_TO_USE } from './constants/constants';
import _ from 'lodash';

export const getSimulationResults = async () => {
  return axios.get(`${API_URL_TO_USE}/simulate`).then((data: AxiosResponse) => {
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

export const getConferences = async () => axios.get(`${API_URL_TO_USE}/conferences`).then(({ data }: AxiosResponse) => data);

export const getTeams = async () => {
  return axios.get(`${API_URL_TO_USE}/teams`).then(({ data }: AxiosResponse) => {
    const camelCaseValues = _.mapValues(data, teamDetail => _.mapKeys(teamDetail, (v, k) => _.camelCase(k)));
    return camelCaseValues;
  });
};
