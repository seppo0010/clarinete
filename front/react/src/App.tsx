import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { nanoid } from 'nanoid'
import Container from '@material-ui/core/Container';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import NewsList from './NewsList'
import NewsDetails from './NewsDetails'
import Menu from './Menu'
import { getUserId, setUserId } from './userSlice'


function App() {
  const userId = useSelector(getUserId)
  const dispatch = useDispatch()
  useEffect(() => {
    if (!userId) {
      dispatch(setUserId(nanoid()))
    }
  })
  return (
    <Router>
      <Container fixed>
        <Menu />
        <Switch>
          <Route path="/" exact>
            <NewsList />
          </Route>
          <Route path="/:url" exact>
            <NewsDetails />
          </Route>
          <Route path="/:url/:source" exact>
            <NewsDetails />
          </Route>
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
