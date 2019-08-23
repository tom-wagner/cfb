import React, { useState } from 'react';
import { Menu, Responsive } from 'semantic-ui-react';
import ApplicationWrapper from './Modules/ApplicationWrapper';
import FAQ from './Modules/FAQ';

enum PageToShow {
  TABLE = 'TABLE',
  FAQ = 'FAQ'
}

const App: React.FC = () => {
  const [pageToShow, setPageToShow] = useState(PageToShow.FAQ);
  return (
    <Responsive style={{ margin: '15px 10px' }}>
      {/* // TODO: Add styling to navbar */}
      <Menu>
        <Menu.Item onClick={() => setPageToShow(PageToShow.TABLE)} active={pageToShow === PageToShow.TABLE}>
          Home
        </Menu.Item>
        <Menu.Item onClick={() => setPageToShow(PageToShow.FAQ)} active={pageToShow === PageToShow.FAQ}>
          FAQ
        </Menu.Item>
        {/* LATER */}
        {/* <Menu.Item >
          Report a bug
        </Menu.Item> */}
        {/* <Menu.Item>
          Buy me a coffee
        </Menu.Item> */}
        <Menu.Item position="right" style={{ fontWeight: 'bold' }}>
          simulations.run
        </Menu.Item>
      </Menu>
      <div id="outer-box" style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
        <div id="inner-box-to-be-centered" style={{ alignSelf: 'center', maxWidth: '1400px' }}>
          <div id="should-be-left-aligned">
            {/* // TODO: Move the wrapper/centering logic out here */}
            {pageToShow === PageToShow.TABLE && <ApplicationWrapper />}
            {pageToShow === PageToShow.FAQ && <FAQ />}
          </div>
        </div>
      </div>
    </Responsive>
  );
};

export default App;
