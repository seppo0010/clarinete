import React from 'react';
import Container from '@material-ui/core/Container';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import NewsList from './NewsList'
import NewsDetails from './NewsDetails'
import Menu from './Menu'
import AddDevice from './AddDevice'
import AddDeviceConfirmation from './AddDeviceConfirmation'


function App() {
  return (
    <Router>
      <Container fixed>
        <Menu />
        <Switch>
          <Route path="/" exact>
            <NewsList />
          </Route>
          <Route path="/agregardispositivo" exact>
            <AddDevice />
          </Route>
          <Route path="/agregardispositivo/:userId" exact>
            <AddDeviceConfirmation />
          </Route>
          <Route path="/url/:url" exact>
            <NewsDetails />
          </Route>
          <Route path="/url/:url/:source" exact>
            <NewsDetails />
          </Route>
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
