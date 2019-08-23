import React from 'react';
import { TwitterTweetEmbed, TwitterShareButton, TwitterFollowButton, TwitterTimelineEmbed } from 'react-twitter-embed';
import { Image, Responsive, Header } from 'semantic-ui-react';
import Gist from 'react-gist';
import faq_image from '../faq.png';
import ReactGA from 'react-ga';

const FAQ = () => {
  ReactGA.pageview('FAQ');
  return (
    <Responsive style={{ marginTop: '15px', marginBottom: '50px' }}>
      <Header as="h1">
        FAQ
      </Header>
      <Header as="h2" style={{ marginTop: '35px' }}>
        How do the simulations work?
      </Header>
      <div style={{ maxWidth: '900px' }} >
        <div style={{ maxWidth: '90%' }} >
          <Image src={faq_image} alt="FAQ" />
        </div>
      </div>
      <p style={{ marginTop: '15px', maxWidth: '800px', fontSize: '16px' }}>
        * - This is the standard home-field-advantage adjustment, see additional detail further down the FAQ.
      </p>
      <p style={{ marginTop: '15px', maxWidth: '800px', fontSize: '16px' }}>
        ** - See the "How does projected margin get translated to win likelihood?" section for more detail.
      </p>
      <p style={{ marginTop: '15px', maxWidth: '800px', fontSize: '16px' }}>
        ^ - Season simulations are run by simulating one game at a time using the win probabilities calculated in the orange steps above.
      </p>
      <p style={{ marginTop: '15px', maxWidth: '800px', fontSize: '16px' }}>
        ^^ - 2-way ties are broken using head to head record, and 3+ way ties are broken randomly.
      </p>
      <Header as="h2" style={{ marginTop: '35px' }}>
        Simulation steps:
      </Header>
      <p style={{ marginTop: '25px', maxWidth: '800px', fontSize: '16px' }}>
        The simulation can be broken down into five distinct steps:
      </p>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        1) Calculating the win likelihood for both teams for every game of the year.
      </p>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        2) Using those win likelihoods to simulate the regular season.
      </p>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        3) Determining division champs (or conference title game participants for conferences without divisions).
      </p>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        4) Simulate the conference championship games and determine conference champs for each conference.
      </p>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        5) Repeat.
      </p>
      <Header as="h2" style={{ marginTop: '35px' }}>
        Each step in detail:
      </Header>
      <Header as="h4" style={{ marginTop: '20px' }}>
        1) Calculating the win likelihood for both teams for every game of the year.
      </Header>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        The driver of this step is the four power rating systems used in the simulation: ESPN FPI, S&amp;P+, Entropy and Massey. These models have been
        selected because they've historically predicted games accurately, both straight up and aga0inst
        the spread, <a href="http://www.thepredictiontracker.com/ncaaresults.php?orderby=cover%20desc&type=1&year=18">as detailed on The Prediction Tracker</a>.
        I encourage you to read more about each model on their respective websites.
      </p>
      <ul>
        <li>
          <p style={{ fontSize: '16px', maxWidth: '800px', marginTop: '5px' }}>
            <a href="http://www.espn.com/college-football/statistics/teamratings">ESPN FPI</a>
          </p>
        </li>
        <li>
          <p style={{ fontSize: '16px', maxWidth: '800px', marginTop: '5px' }}>
            <a href="https://www.sbnation.com/college-football/2019/2/11/18219163/2019-college-football-rankings-projections">S&amp;P+</a>
          </p>
        </li>
        <li>
          <p style={{ fontSize: '16px', maxWidth: '800px', marginTop: '5px' }}>
            <a href="http://www.timetravelsports.com/colfb.html">Entropy</a>
          </p>
        </li>
        <li>
          <p style={{ fontSize: '16px', maxWidth: '800px', marginTop: '5px' }}>
            <a href="https://www.masseyratings.com/cf/fbs">Massey (half of Massey-Peabody)</a>
          </p>
        </li>
      </ul>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        The power ratings are used to calculate an average power rating for each team, which is then combined with a 2.5 point home
        field advantage to determine the projected margin. The projected margin is then translated to a win likelihood -- see below for more detail on the translation.
      </p>
      <Header as="h4" style={{ marginTop: '20px' }}>
        2) Using those win likelihoods to simulate the regular season.
      </Header>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        For every game in the 837-game regular season, a random floating point number between 0.000 and 1.000 is generated.
        If the number generated is greater than the home team's win probability, it is marked as a loss for the home team and a win for
        the away team. For example, if the home team has a 90% win likelihood, the game will be marked as a win for the home
        team if the floating point number randomly generated is less than 0.900, which it will be 90% of the time.
      </p>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        Wins and losses are then aggregated by team, and an overall record and conference record is calculated for each team.
      </p>
      <Header as="h4" style={{ marginTop: '20px' }}>
        3) Determining division champs (or conference title game participants for conferences without divisions)
      </Header>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        At this point all 837 games have been simulated and the final conference record for each team has been compiled.
        Two-way ties are broken using head-to-head record and 3+ ways are broken randomly.
      </p>
      <Header as="h4" style={{ marginTop: '20px' }}>
        4) Simulate the conference championship games and determine conference champs for each conference
      </Header>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        The simulation of the conference championship games is similar to that of a regular season game. For each conference championship,
        a projected margin is calculated using the power ratings and the game is simulated using the random floating point number
        generation described above.
      </p>
      <Header as="h4" style={{ marginTop: '20px' }}>
        5) Repeat 100,000 times
      </Header>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        College football is a wacky sport. A bad bounce here or there can be the difference between making the playoff and going 8-4.
        Just as the results of once season can be noisy, so can the results of a simulation. As such 100,000 simulations are run in
        order to smooth out the simulation results. If 100 or 1,000 simulations were run a few wacky simulated seasons could overstate
        a bad teams true odds. Rutgers has approximately a 0.01% chance to win the Big Ten. A large denominator is needed to ensure
        the simulated likelihood is accurate.
      </p>
      <Header as="h2" style={{ marginTop: '35px' }}>
        Why isn't the College Football Playoff simulated?
      </Header>
      <p style={{ fontSize: '16px', maxWidth: '800px' }}>
        At some point in the future I plan to simulate the College Football Playoff. However, for now I've decided
        that simulating the playoff would be inserting too much subjectivity into the model, as it is difficult to determine
        who makes the playoff without factoring opinions into the simulation.
      </p>
      <Header as="h2" style={{ marginTop: '35px' }}>
        What other external resources are used?
      </Header>
      <p style={{ marginTop: '25px', maxWidth: '800px', fontSize: '16px' }}>
        Schedule and team information is pulled from <a href="https://CollegeFootballData.com">CollegeFootballData.com</a>.
      </p>
      <Header as="h2" style={{ marginTop: '35px' }}>
        How is projected margin used to calculate win likelihood?
      </Header>
      <p style={{ marginTop: '15px', maxWidth: '800px', fontSize: '16px' }}>
        All college football prediction models map projected margins to probability of victory. Historically, college football
        teams projected to win by 12 have won 75% of the time. The simulation can't predict every game accurately, but that
        is part of the reason 100,000 simulations are run. Win likelihoods based on projected margin used
        in this simulation have been set up to match those used in ESPN's FPI.
      </p>
      <p style={{ marginTop: '15px', maxWidth: '800px', fontSize: '16px' }}>
        The win probabilities (as decimals) used for a given projected margin are as follows:
      </p>
      <div style={{ maxHeight: '450px', overflowY: 'scroll', marginTop: '15px' }}>
        <Gist id='df8808759a0958e0cad42aebea62da29' />
      </div>
      <Header as="h2" style={{ marginTop: '35px' }}>
        How often are the simulations updated?
      </Header>
      <p style={{ marginTop: '25px', maxWidth: '800px', fontSize: '16px' }}>
        The simulations are updated to include current win/loss records and updated power rankings once per week. The current status of the simulations is shown on the home page.
      </p>
      <Header as="h2" style={{ marginTop: '35px', marginBottom: '25px' }}>
        Why is home field advantage 2.5 points per game?
      </Header>
      <TwitterTweetEmbed tweetId={'1161624961334861827'} />
      <Header as="h2" style={{ marginTop: '35px' }}>
        Other:
      </Header>
      <p style={{ marginTop: '25px', maxWidth: '800px', fontSize: '16px' }}>
        Enjoying the simulation numbers? Find a profitable angle on a conference future or win total? Please share!
      </p>
      <TwitterShareButton
        url={'https://simulate.run'}
        options={{ text: '🗣️️️️️🗣️🗣️ ______ is going to be really [GOOD_OR_BAD] this year - look at the numbers!' }}
      />
      <Header as="h2" style={{ marginTop: '35px' }}>
        About the developer
      </Header>
      <p style={{ marginTop: '25px', maxWidth: '800px', fontSize: '16px' }}>
        I'm a Fullstack Software Engineer based in New York City who loves college football, particularly
        the Minnesota Gophers.
      </p>
      <p style={{ maxWidth: '800px', fontSize: '16px' }}>
        Follow me on Twitter for the latest site updates and interesting insights related to the simulations.
      </p>
      <p style={{ maxWidth: '800px', fontSize: '16px' }}>
        (or tweet at me to let me know why the simulations are trash and disrespected your favorite team)
      </p>
      <TwitterTimelineEmbed
        sourceType="profile"
        screenName="twagner55"
        options={{height: 500}}
      />
      <TwitterFollowButton
        screenName={'twagner55'}
      />
      <Header as="h2" style={{ marginTop: '35px' }}>
        Random housekeeping
      </Header>
      <Header as="h4" style={{ marginTop: '20px' }}>
        LinkedIn
      </Header>
      <p style={{ maxWidth: '800px', fontSize: '16px' }}>
      <a href="https://www.linkedin.com/in/twagnercpa/">Connect with me on LinkedIn</a> to hire me as a freelance developer, offer me a job, or refer me to FAANG/your unicorn startup.
      </p>
      <Header as="h4" style={{ marginTop: '20px' }}>
        Really, really like the site?
      </Header>
      <a href="https://www.buymeacoffee.com/w9DG2yHF8" rel="noopener noreferrer" target="_blank">
        <Image src="https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/custom_images/orange_img.png"></Image>
      </a>
      <Header as="h4" style={{ marginTop: '20px' }}>
        Really, really, really like the site?
      </Header>
      <p style={{ maxWidth: '800px', fontSize: '16px' }}>
        DM me on Twitter if you want to buy it, or have me take it down and hire me to build it for you.
      </p>
    </Responsive>
  );
};

export default FAQ;
