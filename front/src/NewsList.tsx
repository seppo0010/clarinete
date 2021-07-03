import React, { useEffect, useState } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import { fetchNews, selectAllNews } from './newsSlice'
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

  const [selected, setSelected] = useState(-1)

  const dispatch = useDispatch()
  const news = useSelector(selectAllNews)
  const [lastNews, setLastNews] = useState(news)
  if (JSON.stringify(lastNews) !== JSON.stringify(news)) {
    setLastNews(news)
  }
  const newsStatus = useSelector((state: RootState) => state.newsList.status)

  const handlers = {
    NEXT: () => setSelected((selected) => selected + 1),
    PREVIOUS: () => setSelected((selected) => Math.max(0, selected - 1)),
    OPEN_NEWS: () => setSelected((selected) => {
        setLastNews((lastNews) => {
          if (selected >= 0) {
              setTimeout(() => history.push(encodeURIComponent(lastNews[selected].url)))
          }
          return lastNews
        })
        return selected
    }),
  };

  useEffect(() => {
    if (newsStatus === 'idle') {
      dispatch(fetchNews())
    }
  }, [newsStatus, dispatch])

  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap}>
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
