import React, { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";

import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Autocomplete from '@material-ui/lab/Autocomplete';

import {
  NewsItem,
  selectAllNews,
  hiddenSections,
  hiddenSources,
  selectSearchNews,
  search,
} from './newsSlice'
import { fetchNews, fetchSearchNews } from './fetchNewsSlice'
import { fetchEntities } from './fetchEntitiesSlice'
import { selectedValue, increment, decrement } from './selectedSlice'
import { archivedURLs, addURL } from './archivedSlice'
import NewsListItem from './NewsListItem'
import type { RootState } from './store'
import { getUserId } from './userSlice'

const keyMap = {
  NEXT: "j",
  PREVIOUS: "k",
  OPEN_NEWS: "enter",
  ARCHIVE: "a",
  SEARCH: "/",
};

function NewsList() {
  const history = useHistory()
  const dispatch = useDispatch()
  const archived = useSelector(archivedURLs)
  const selectedSections = useSelector(hiddenSections)
  const selectedSources = useSelector(hiddenSources)
  const searchCriteria = useSelector((state: RootState) => state.newsList.searchCriteria)
  const searchNews = useSelector(selectSearchNews)
  const allNews = useSelector(selectAllNews)
  const news = (searchCriteria ? searchNews : allNews.filter((n: NewsItem) => (
    !archived.includes(n.url) &&
    !selectedSections.includes(n.section) &&
    !selectedSources.includes(n.source)
  ))).slice(0, 16)
  const selected = useSelector(selectedValue)

  const newsStatus = useSelector((state: RootState) => state.newsList.status)
  const entitiesStatus  = useSelector((state: RootState) => state.entities.status)
  const searchNewsStatus = useSelector((state: RootState) => state.newsList.searchStatus)
  const lastUpdate = useSelector((state: RootState) => state.newsList.updateDate)
  const entities = useSelector((state: RootState) => state.entities.entities)
  const userId = useSelector(getUserId)

  const handlers = {
    NEXT: () => dispatch(increment()),
    PREVIOUS: () => dispatch(decrement()),
    OPEN_NEWS: () => {
      if (!['BUTTON', 'A'].includes((document.activeElement || {}).tagName || '')) {
        history.push(encodeURIComponent(news[selected].url))
      }
    },
    ARCHIVE: () => {
      if (userId) {
        dispatch(addURL(news[selected].url, userId))
      }
    },
    SEARCH: (e: KeyboardEvent | undefined) => {
      e?.preventDefault();
      (document.querySelector('[aria-label="Buscar"]') as HTMLInputElement).focus()
    },
  };
  const [searchCriteriaInput, setSearchCriteriaInput] = useState('')

  useEffect(() => {
    if (entitiesStatus === 'idle') {
      dispatch(fetchEntities())
    }
  }, [entitiesStatus, dispatch])

  useEffect(() => {
    if (userId && (newsStatus === 'idle' || lastUpdate < Date.now() - 60 * 1000)) {
      dispatch(fetchNews(userId))
    }
  }, [newsStatus, dispatch, lastUpdate, userId])

  useState(() => {
    setSearchCriteriaInput(searchCriteria)
  })

  const clearSearch = () => {
      setSearchCriteriaInput('')
      dispatch(search(''))
  }

  const keyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape'){
      (document.querySelector('[aria-label="Buscar"]') as HTMLInputElement).blur()
    }
  }
  const doSearch = () => {
    const val = searchCriteriaInput
    dispatch(search(val))
    if (val) {
      dispatch(fetchSearchNews(val))
    }
  }
  const keyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter'){
      doSearch()
    }
  }

  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
      <div style={{marginTop: 80, marginLeft: 10, marginRight: 10}} id="main">
      <Autocomplete
          options={entities.map((e) => e.name)}
          getOptionLabel={(name) => name}
          fullWidth
          freeSolo
          value={searchCriteriaInput}
          onKeyPress={keyPress}
          onKeyDown={keyDown}
          onChange={(e: any, value: string | null) => setSearchCriteriaInput(value || '')}
          renderInput={(params) => <TextField
            {...params}
            fullWidth
            label="Buscar"
            inputProps={{ 'aria-label': 'Buscar',  ...params.inputProps }}
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
                        <IconButton
                            onClick={doSearch}
                            >
                          <SearchIcon />
                        </IconButton>
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
        news.map((n: NewsItem, i: number) => (
          <NewsListItem key={n.url} news={n} selected={i === selected} position={i} />
        ))
      )}
    </GlobalHotKeys>
  );
}

export default NewsList;
