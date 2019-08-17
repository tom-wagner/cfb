import axios, { AxiosResponse } from 'axios';
import { BASE_API_URL } from './constants/constants';
import _ from 'lodash';

export const getSimulationResults = async () => {
  return axios.get(`${BASE_API_URL}/simulate`).then((data: AxiosResponse) => {
    const { simulation_results: simulationResults, num_of_sims: numberOfSimulations } = data.data;
    const adjSimulationResults = _.mapValues(simulationResults, teamDetail => _.mapKeys(teamDetail, (v, k) => _.camelCase(k)));
    return { simulationResults: adjSimulationResults, numberOfSimulations }
  });
};

export const getConferences = async () => axios.get(`${BASE_API_URL}/conferences`).then(({ data }: AxiosResponse) => data);

export const getTeams = async () => axios.get(`${BASE_API_URL}/teams`).then(({ data }: AxiosResponse) => data);
