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
import Chip from '@material-ui/core/Chip';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { TimeSeries } from "pondjs";
import { Charts, ChartContainer, ChartRow, YAxis, LineChart } from "react-timeseries-charts";

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
import { fetchTrends } from './fetchTrendsSlice'
import NewsListItem from './NewsListItem'
import type { RootState } from './store'
import { getUserEmail } from './userSlice'

const keyMap = {
  NEXT: "j",
  PREVIOUS: "k",
  OPEN_NEWS: "enter",
  ARCHIVE: "a",
  SEARCH: "/",
  REFRESH: "r",
};

function NewsList() {
  const wide = useMediaQuery('(min-width:960px)');
  const history = useHistory()
  const dispatch = useDispatch()
  const archived = useSelector(archivedURLs)
  const selectedSections = useSelector(hiddenSections)
  const selectedSources = useSelector(hiddenSources)
  const searchCriteria = useSelector((state: RootState) => state.newsList.searchCriteria)
  const searchNews = useSelector(selectSearchNews)
  const searchHistoryCount = useSelector((state: RootState) => state.newsList.searchHistoryCount)
  const series1 = new TimeSeries({
    name: 'Tendencia',
    columns: ["time", "value"],
    points: searchHistoryCount.map((row) => [new Date(row.created_at), row.count]),
  });
  const maxSeries = Math.max.apply(null, searchHistoryCount.map((x) => x.count))
  const allNews = useSelector(selectAllNews)
  const news = (searchCriteria ? searchNews : allNews.filter((n: NewsItem) => (
    !archived.includes(n.url) &&
    !selectedSections.includes(n.section) &&
    !selectedSources.includes(n.source)
  ))).slice(0, 16)
  const selected = useSelector(selectedValue)

  const entitiesStatus  = useSelector((state: RootState) => state.entities.status)
  const trendsStatus  = useSelector((state: RootState) => state.trends.status)
  const searchNewsStatus = useSelector((state: RootState) => state.newsList.searchStatus)
  const entities = useSelector((state: RootState) => state.entities.entities)
  const trends = useSelector((state: RootState) => state.trends.trends)
  const userEmail = useSelector(getUserEmail)

  const handlers = {
    NEXT: () => dispatch(increment()),
    PREVIOUS: () => dispatch(decrement()),
    OPEN_NEWS: () => {
      if (!['BUTTON', 'A'].includes((document.activeElement || {}).tagName || '')) {
        history.push('/url/' + encodeURIComponent(news[selected].url))
      }
    },
    ARCHIVE: () => {
      dispatch(addURL(news[selected].url, userEmail))
    },
    SEARCH: (e: KeyboardEvent | undefined) => {
      e?.preventDefault();
      (document.querySelector('[aria-label="Buscar"]') as HTMLInputElement).focus()
    },
    REFRESH: (e: KeyboardEvent | undefined) => {
      e?.preventDefault();
      dispatch(fetchNews(userEmail))
    },
  };
  const [searchCriteriaInput, setSearchCriteriaInput] = useState('')

  useEffect(() => {
    if (entitiesStatus === 'idle') {
      dispatch(fetchEntities())
    }
  }, [entitiesStatus, dispatch])

  useEffect(() => {
    if (trendsStatus === 'idle') {
      dispatch(fetchTrends())
    }
  }, [trendsStatus, dispatch])

  useEffect(() => {
    dispatch(fetchNews(userEmail))
  }, [dispatch, userEmail])

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
  const doSearch = (val?: string) => {
    val = val || searchCriteriaInput
    if (val !== searchCriteriaInput) {
        setSearchCriteriaInput(val)
    }
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
      {trends.map((t) => <Chip key={t} label={t} style={{marginRight: 4}} onClick={() => doSearch(t)} />)}
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
                            onClick={() => doSearch()}
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
      {searchHistoryCount.length > 0 && wide &&
        <ChartContainer timeRange={series1.timerange()} width={900} style={{marginTop: 20}}>
            <ChartRow height="200">
                <YAxis id="axis1" width="60" type="linear" min={0} max={maxSeries * 1.2} />
                <Charts>
                    <LineChart axis="axis1" series={series1}/>
                </Charts>
            </ChartRow>
        </ChartContainer>
      }
      {(searchCriteria === '' || searchNewsStatus !== 'loading') && (
        news.map((n: NewsItem, i: number) => (
          <NewsListItem key={n.url} news={n} selected={i === selected} position={i} />
        ))
      )}
    </GlobalHotKeys>
  );
}

export default NewsList;
