import React, { useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import { selectAllNews } from './newsSlice'
import { fetchNews } from './fetchNewsSlice'
import { selectedValue, increment, decrement } from './selectedSlice'
import NewsListItem from './NewsListItem'
import type { RootState } from './store'

const keyMap = {
  NEXT: "j",
  PREVIOUS: "k",
  OPEN_NEWS: "enter",
};

function NewsList() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const history = useHistory()
  const dispatch = useDispatch()
  const news = useSelector(selectAllNews)
  const selected = useSelector(selectedValue)

  const newsStatus = useSelector((state: RootState) => state.newsList.status)

  const handlers = {
    NEXT: () => dispatch(increment()),
    PREVIOUS: () => dispatch(decrement()),
    OPEN_NEWS: () => history.push(encodeURIComponent(news[selected].url)),
  };

  useEffect(() => {
    if (newsStatus === 'idle') {
      dispatch(fetchNews())
    }
  }, [newsStatus, dispatch])

  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
      <GridList cols={2}>
          {news.map((n, i) => (
            <GridListTile key={`${i}`} cols={i > 0 && matches ? 1 : 2}>
                <NewsListItem news={n} selected={i === selected} />
            </GridListTile>
          ))}
      </GridList>
    </GlobalHotKeys>
  );
}

export default NewsList;
