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
import { archivedURLs, addURL } from './archivedSlice'
import NewsListItem from './NewsListItem'
import type { RootState } from './store'

const keyMap = {
  NEXT: "j",
  PREVIOUS: "k",
  OPEN_NEWS: "enter",
  ARCHIVE: "a",
};

function NewsList() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const history = useHistory()
  const dispatch = useDispatch()
  const archived = useSelector(archivedURLs)
  const news = useSelector(selectAllNews).filter((n) => !archived.includes(n.url))
  const selected = useSelector(selectedValue)

  const newsStatus = useSelector((state: RootState) => state.newsList.status)

  const handlers = {
    NEXT: () => dispatch(increment()),
    PREVIOUS: () => dispatch(decrement()),
    OPEN_NEWS: () => {
      if (!['BUTTON', 'A'].includes((document.activeElement || {}).tagName || '')) {
        history.push(encodeURIComponent(news[selected].url))
      }
    },
    ARCHIVE: () => {
      dispatch(addURL(news[selected].url))
    },
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
            <GridListTile key={n.url} cols={i > 0 && matches ? 1 : 2}>
                <NewsListItem news={n} selected={i === selected} />
            </GridListTile>
          ))}
      </GridList>
    </GlobalHotKeys>
  );
}

export default NewsList;
