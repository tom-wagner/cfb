import React from 'react';
import { Menu, Responsive } from 'semantic-ui-react';
import ApplicationWrapper from './Modules/ApplicationWrapper';

const App: React.FC = () => (
  <Responsive style={{ margin: '10px 10px' }}>
    {/* // TODO: Add styling to navbar */}
    {/* https://codesandbox.io/s/325y47xk36 */}
    {/* <Responsive maxWidth={499}>
      <Menu.Item>
        Home
      </Menu.Item>
      <Dropdown
        placeholder='Select Friend'
        fluid
        selection
        options={_.map(['About', 'FAQ', 'Report a bug', 'Buy me a coffee'], item => ({ key: item, text: item, value: item }))}
      />
    </Responsive> */}
    <Menu>
        <Menu.Item>
          Home
        </Menu.Item>
        <Menu.Item>
          FAQ
        </Menu.Item>
        {/* LATER */}
        {/* <Menu.Item >
          Report a bug
        </Menu.Item> */}
        {/* <Menu.Item>
          Buy me a coffee
        </Menu.Item> */}
      <Menu.Item position="right">
        {/* # TODO: pick name */}
        simulate.io
      </Menu.Item>
    </Menu>
    <ApplicationWrapper />
  </Responsive>
);

export default App;
