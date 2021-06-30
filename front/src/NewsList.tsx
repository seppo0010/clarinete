import React, { useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { fetchNews, selectAllNews } from './newsSlice'

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import NewsListItem from './NewsListItem'
import type { RootState } from './store'

function NewsList() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const dispatch = useDispatch()
  const news = useSelector(selectAllNews)

  const newsStatus = useSelector((state: RootState) => state.newsList.status)

  useEffect(() => {
    if (newsStatus === 'idle') {
      dispatch(fetchNews())
    }
  }, [newsStatus, dispatch])
  return (
    <GridList cols={2}>
        {news.map((n, i) => (
          <GridListTile key={`${i}`} cols={i > 0 && matches ? 1 : 2}>
              <NewsListItem news={n} />
          </GridListTile>
        ))}
    </GridList>
  );
}

export default NewsList;
