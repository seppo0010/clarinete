import React from 'react';
import Container from '@material-ui/core/Container';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


import NewsList from './NewsList'
import NewsDetails from './NewsDetails'

function App() {
  return (
    <Router>
      <Container fixed>
        <Switch>
          <Route path="/" exact>
            <NewsList />
          </Route>
          <Route path="/:url" exact>
            <NewsDetails />
          </Route>
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
