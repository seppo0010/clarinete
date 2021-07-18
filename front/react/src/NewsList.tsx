import React, { useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import TextField from '@material-ui/core/TextField';

import { NewsItem, selectAllNews, hiddenSections, selectSearchNews, search } from './newsSlice'
import { fetchNews, fetchSearchNews } from './fetchNewsSlice'
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
  const searchCriteria = useSelector((state: RootState) => state.newsList.searchCriteria)
  const searchNews = useSelector(selectSearchNews)
  const allNews = useSelector(selectAllNews)
  const news = (searchCriteria ? searchNews : allNews).filter((n: NewsItem) => (
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
    if (newsStatus === 'idle' || lastUpdate < Date.now() - 60 * 1000) {
      dispatch(fetchNews())
    }
  }, [newsStatus, dispatch, lastUpdate])

  const keyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter'){
      const val = (e.target as any).value
      dispatch(search(val))
      if (val) {
        dispatch(fetchSearchNews(val))
      }
    }
  }

  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
      <div style={{marginTop: 80, marginLeft: 10, marginRight: 10}}>
        <TextField fullWidth label="Search" onKeyPress={keyPress} />
      </div>
      <GridList cols={2}>
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
