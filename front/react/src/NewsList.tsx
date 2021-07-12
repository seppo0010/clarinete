import React, { useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import { NewsItem, selectAllNews, hiddenSections } from './newsSlice'
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
  const selectedSections = useSelector(hiddenSections)
  const news = useSelector(selectAllNews).filter((n: NewsItem) => (
    !archived.includes(n.url) &&
    !selectedSections.includes(n.section)
  )).slice(0, 51)
  const selected = useSelector(selectedValue)

  const newsStatus = useSelector((state: RootState) => state.newsList.status)
  const lastUpdate = useSelector((state: RootState) => state.newsList.updateDate)

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
    if (newsStatus === 'idle' || (newsStatus === 'succeeded' && lastUpdate < Date.now() - 60 * 1000)) {
      dispatch(fetchNews())
    }
  }, [newsStatus, dispatch, lastUpdate])

  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
      <GridList cols={2} style={{paddingTop: 80}}>
          {news.map((n: NewsItem, i: number) => (
            <GridListTile key={n.url} cols={i > 0 && matches ? 1 : 2}>
                <NewsListItem news={n} selected={i === selected} />
            </GridListTile>
          ))}
      </GridList>
    </GlobalHotKeys>
  );
}

export default NewsList;
