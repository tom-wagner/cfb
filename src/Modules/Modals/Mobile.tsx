import React from 'react';
import { Table, Grid, Message, Icon, Divider } from 'semantic-ui-react'
import _ from 'lodash';
import { TeamModalProps, exampleTextFn, MOBILE_SCHEDULE_HEADERS, MOBILE_SCHEDULE_TABLE_WIDTHS, getOpponent, getProjectedMargin, getWinProbability } from './modalUtils';
import { ratingHeaderStyle, avgPowerHeaderStyle, avgPowerRankStyle, ratingRankStyle } from '../styles';

export const TeamModalMobile = ({ columnValuesObject, simulationResults, numberOfSimulations }: TeamModalProps) => {
  const likelihoods = _.map(_.range(0, 13), x => columnValuesObject['totalWins'][x])
  let [occurrencesCount, cumulativeLikelihoods] = [0, []];
  _.forEach(likelihoods, numberOfTimesTeamWonXGames => {
    cumulativeLikelihoods.push(numberOfSimulations - occurrencesCount);
    occurrencesCount += numberOfTimesTeamWonXGames;
  });

  const firstIndexUnderSeventyPercent = _.findIndex(cumulativeLikelihoods, (val, idx) => (val / numberOfSimulations) <= 0.7);
  const exampleText = exampleTextFn(firstIndexUnderSeventyPercent, cumulativeLikelihoods, numberOfSimulations, columnValuesObject.teamName);

  return (
    <Grid stackable>
      <Grid.Row>
        <Message warning style={{ margin: '10px 0' }} size='mini'>
          <Icon name='sync alternate' />
          Rotate your phone to see more information
        </Message>
      </Grid.Row>
      {/* TEAM RATINGS COMPONENT */}
      <Grid.Row>
        <h2>Power Ratings</h2>
      </Grid.Row>
      <Grid.Row>
        <Message info style={{ margin: '15px 0' }} size='mini'>
          <p>See the FAQ for more info on how these power ratings were used to run the simulation.</p>
        </Message>
      </Grid.Row>
      {/* // TODO: Turn into a map */}
      {/* // TODO: Flatten rows */}
      <Grid.Row>
        <Grid.Column width={1}>
          <p style={avgPowerHeaderStyle}>Average Power Rating (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={avgPowerRankStyle}>{columnValuesObject.avgPowerRtg} ({columnValuesObject.rankings.avg_power_rtg})</p>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column width={1}>
          <p style={ratingHeaderStyle}>ESPN FPI (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.FPI} ({columnValuesObject.rankings.FPI})</p>
        </Grid.Column>
        <Grid.Column>
          <p style={ratingHeaderStyle}>Entropy (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.ENTROPY} ({columnValuesObject.rankings.ENTROPY})</p>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <p style={ratingHeaderStyle}>S&amp;P+ (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.SP_PLUS} ({columnValuesObject.rankings.SP_PLUS})</p>
        </Grid.Column>
        <Grid.Column>
          <p style={ratingHeaderStyle}>Massey (rank)</p>
          {/*
            // @ts-ignore */}
          <p style={ratingRankStyle}>{columnValuesObject.powerRtgs.MASSEY} ({columnValuesObject.rankings.MASSEY})</p>
        </Grid.Column>
      </Grid.Row>
      <Divider />
      <Grid.Row style={{ margin: '10px 0' }}>
        <h2>Schedule</h2>
      </Grid.Row>
      <Grid.Row style={{ margin: '10px 0' }}>
        <Table celled fixed unstackable compact>
          <Table.Header>
            <Table.Row>
              {_.map(MOBILE_SCHEDULE_HEADERS, (header, idx) => <Table.HeaderCell width={MOBILE_SCHEDULE_TABLE_WIDTHS[idx]}>{header}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {_.map(columnValuesObject.schedule, (game) => {
              const teamName = columnValuesObject.teamName;
              return (
                <Table.Row>
                  <Table.Cell width={MOBILE_SCHEDULE_TABLE_WIDTHS[0]}>{getOpponent(game, teamName)}</Table.Cell>
                  <Table.Cell width={MOBILE_SCHEDULE_TABLE_WIDTHS[1]}>{getProjectedMargin(game, teamName)}</Table.Cell>
                  <Table.Cell width={MOBILE_SCHEDULE_TABLE_WIDTHS[2]}>{getWinProbability(game, teamName)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </Grid.Row>
      <Divider />
      <Grid.Row style={{ margin: '10px 0' }}>
        <h2>Regular Season Simulation Detail</h2>
      </Grid.Row>
      <Grid.Row style={{ margin: '10px 0' }}>
        <Message info>
          <p>
            For each simulated season every team is assigned a final record. The simulated seasons can be combined
            together to determine the likelihood a given teams ends the season with X or more regular season wins.
          </p>
          {/* TODO: Make dynamic and tied to actual numbers */}
          <p>{exampleText}</p>
        </Message>
      </Grid.Row>
      <Grid.Row style={{ margin: '10px 0' }}>
        <Table celled compact size='small' unstackable style={{ marginBottom: '10px' }}>
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
