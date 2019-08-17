import React from 'react';
import { Menu, Responsive } from 'semantic-ui-react';
import SimulationTableWrapper from './Modules/TableWrapper';

const App: React.FC = () => {
  return (
    <Responsive style={{ margin: '10px 60px' }}>
      <Menu color="purple">
        <Menu.Item>
          Home
        </Menu.Item>
        <Menu.Item >
          About
        </Menu.Item>
        <Menu.Item>
          FAQ
        </Menu.Item>
        <Menu.Item >
          Report a bug
        </Menu.Item>
        <Menu.Item position="right">
          simulate.io
        </Menu.Item>
      </Menu>
      <SimulationTableWrapper />
    </Responsive>
  )
};

export default App;
