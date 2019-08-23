import React from 'react';
import { Table, Grid, Message, Icon, Divider } from 'semantic-ui-react'
import _ from 'lodash';
import moment from 'moment';
import { TeamModalProps, exampleTextFn, SCHEDULE_HEADERS, SCHEDULE_TABLE_WIDTHS, getOpponent, getOpponentPowerRatingAndRank, getProjectedMargin, getWinProbability } from './modalUtils';
import { ratingHeaderStyle, avgPowerHeaderStyle, avgPowerRankStyle, ratingRankStyle } from '../styles';

export const TeamModalLargeScreen = ({ columnValuesObject, simulationResults, numberOfSimulations }: TeamModalProps) => {
  const likelihoods = _.map(_.range(0, 13), x => columnValuesObject['totalWins'][x])
  let [occurrencesCount, cumulativeLikelihoods] = [0, []];
  _.forEach(likelihoods, numberOfTimesTeamWonXGames => {
    cumulativeLikelihoods.push(numberOfSimulations - occurrencesCount);
    occurrencesCount += numberOfTimesTeamWonXGames;
  });

  const firstIndexUnderSeventyPercent = _.findIndex(cumulativeLikelihoods, (val, idx) => (val / numberOfSimulations) <= 0.7);
  const exampleText = exampleTextFn(firstIndexUnderSeventyPercent, cumulativeLikelihoods, numberOfSimulations, columnValuesObject.teamName);

  return (
    <Grid padded divided>
      <Grid.Row>
        <Message info style={{ maxWidth: '900px' }}>
          <Icon name='info' />What are these "power ratings" and how are they used?
          <p>
            The simulations have been run using the "Average Power Rating", which is the average of the four power
            rating systems outlined below. See the FAQ for more info.
          </p>
        </Message>
      </Grid.Row>
      {/* TEAM RATINGS COMPONENT */}
      <Grid.Row>
        <h2>Power Ratings</h2>
      </Grid.Row>
      {/* // TODO: Turn into a map */}
      <Grid.Row>
        <Grid.Column width={4}>
          <p style={avgPowerHeaderStyle}>Average Power Rating (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={avgPowerRankStyle}>{columnValuesObject.avgPowerRtg} ({columnValuesObject.rankings.avg_power_rtg})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>ESPN FPI (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.FPI} ({columnValuesObject.rankings.FPI})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>Entropy (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.ENTROPY} ({columnValuesObject.rankings.ENTROPY})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>S&amp;P+ (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.SP_PLUS} ({columnValuesObject.rankings.SP_PLUS})</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p style={ratingHeaderStyle}>Massey (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.MASSEY} ({columnValuesObject.rankings.MASSEY})</p>
        </Grid.Column>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <h2>Schedule</h2>
      </Grid.Row>
      <Grid.Row>
        <Table celled fixed unstackable style={{ maxWidth: '900px' }}>
          <Table.Header>
            <Table.Row>
              {_.map(SCHEDULE_HEADERS, (header, idx) => <Table.HeaderCell width={SCHEDULE_TABLE_WIDTHS[idx]}>{header}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {_.map(columnValuesObject.schedule, (game, idx) => {
              const teamName = columnValuesObject.teamName;
              return (
                <Table.Row>
                  <Table.Cell width={SCHEDULE_TABLE_WIDTHS[0]}>{idx + 1}</Table.Cell>
                  <Table.Cell width={SCHEDULE_TABLE_WIDTHS[1]}>{moment(new Date(game['start_date'])).format('ddd, MMM D')}</Table.Cell>
                  <Table.Cell width={SCHEDULE_TABLE_WIDTHS[2]}>{getOpponent(game, teamName)}</Table.Cell>
                  <Table.Cell width={SCHEDULE_TABLE_WIDTHS[3]}>{getOpponentPowerRatingAndRank(game, teamName, simulationResults)}</Table.Cell>
                  <Table.Cell width={SCHEDULE_TABLE_WIDTHS[4]}>{getProjectedMargin(game, teamName)}</Table.Cell>
                  <Table.Cell width={SCHEDULE_TABLE_WIDTHS[5]}>{getWinProbability(game, teamName)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        <h2>Regular Season Simulation Detail</h2>
      </Grid.Row>
      <Grid.Row>
        <Message info style={{ maxWidth: '900px' }}>
          <p>
            For each simulated season every team is assigned a final record. The simulated seasons can be combined
            together to determine the likelihood a given teams ends the season with X or more regular season wins.
          </p>
          {/* TODO: Make dynamic and tied to actual numbers */}
          <p>{exampleText}</p>
        </Message>
      </Grid.Row>
      <Grid.Row>
        <Table celled style={{ width: '500px' }} unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell textAlign='center' colSpan='2'>Likelihood of...</Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              {_.map(['Record', 'finishing exactly ____', 'going ____ or better'], x => <Table.HeaderCell>{x}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {_.map(cumulativeLikelihoods, (game, idx) => (
              <Table.Row>
                <Table.Cell width={2}>{`${idx} - ${12 - idx}`}</Table.Cell>
                <Table.Cell textAlign='center' width={4}>{(likelihoods[idx] / numberOfSimulations * 100).toFixed(1)}%</Table.Cell>
                <Table.Cell textAlign='center' width={4}>{(cumulativeLikelihoods[idx] / numberOfSimulations * 100).toFixed(1)}%</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};