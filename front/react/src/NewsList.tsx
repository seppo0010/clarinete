import React, { useState, useEffect, useRef } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { NewsItem, selectAllNews, hiddenSections, selectSearchNews, search } from './newsSlice'
import { fetchNews, fetchSearchNews } from './fetchNewsSlice'
import { fetchEntities } from './fetchEntitiesSlice'
import { selectedValue, increment, decrement } from './selectedSlice'
import { archivedURLs, addURL } from './archivedSlice'
import NewsListItem from './NewsListItem'
import type { RootState } from './store'

const keyMap = {
  NEXT: "j",
  PREVIOUS: "k",
  OPEN_NEWS: "enter",
  ARCHIVE: "a",
  SEARCH: "/",
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
  const news = (searchCriteria ? searchNews : allNews.filter((n: NewsItem) => (
    !archived.includes(n.url) &&
    !selectedSections.includes(n.section)
  ))).slice(0, 16)
  const selected = useSelector(selectedValue)

  const newsStatus = useSelector((state: RootState) => state.newsList.status)
  const entitiesStatus  = useSelector((state: RootState) => state.entities.status)
  const searchNewsStatus = useSelector((state: RootState) => state.newsList.searchStatus)
  const lastUpdate = useSelector((state: RootState) => state.newsList.updateDate)
  const entities = useSelector((state: RootState) => state.entities.entities)
  const searchRef = useRef<HTMLInputElement>()

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
    SEARCH: (e: KeyboardEvent | undefined) => {
      e?.preventDefault()
      searchRef?.current?.focus()
    },
  };
  const [searchCriteriaInput, setSearchCriteriaInput] = useState('')

  useEffect(() => {
    if (entitiesStatus === 'idle') {
      dispatch(fetchEntities())
    }
  }, [entitiesStatus, dispatch])

  useEffect(() => {
    if (newsStatus === 'idle' || lastUpdate < Date.now() - 60 * 1000) {
      dispatch(fetchNews())
    }
  }, [newsStatus, dispatch, lastUpdate])

  const clearSearch = () => {
      setSearchCriteriaInput('')
      dispatch(search(''))
  }

  const keyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape'){
      searchRef?.current?.blur()
    }
  }
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
      <div style={{marginTop: 80, marginLeft: 10, marginRight: 10}} id="main">
      <Autocomplete
          options={entities}
          getOptionLabel={(entity) => entity.name}
          fullWidth
          freeSolo
          renderInput={(params) => <TextField
            {...params}
            fullWidth
            label="Buscar"
            value={searchCriteriaInput}
            onKeyPress={keyPress}
            onKeyDown={keyDown}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearchCriteriaInput((e.target as any).value)}
            inputProps={{ 'aria-label': 'Buscar', ref: searchRef, ...params.inputProps }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                  <InputAdornment position="end">
                      {searchCriteria && 
                          <IconButton
                              onClick={clearSearch}
                              >
                              <ClearIcon />
                          </IconButton>
                      }
                      {!searchCriteria && 
                          <SearchIcon />
                      }
                  </InputAdornment>
              ),
            }}
            />
          }
        />
      </div>
      {searchCriteria !== '' && searchNewsStatus === 'loading' && (<div style={{textAlign: 'center'}}>
        <CircularProgress style={{marginTop: 50}} />
      </div>)}
      {(searchCriteria === '' || searchNewsStatus !== 'loading') && (
        <GridList cols={2}>
            {news.map((n: NewsItem, i: number) => (
              <GridListTile key={n.url} cols={matches ? 1 : 2}>
                  <NewsListItem news={n} selected={i === selected} position={i} />
              </GridListTile>
            ))}
        </GridList>
      )}
    </GlobalHotKeys>
  );
}

export default NewsList;
