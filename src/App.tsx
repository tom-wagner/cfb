import React from 'react';
import { Menu, Responsive } from 'semantic-ui-react';
import ApplicationWrapper from './Modules/ApplicationWrapper';

const App: React.FC = () => (
  <Responsive style={{ margin: '10px 60px' }}>
    {/* // TODO: Add styling to navbar */}
    <Menu>
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
    <ApplicationWrapper />
  </Responsive>
);

export default App;
