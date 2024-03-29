import React, { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";

import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';

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
import { Trend } from './trendsSlice'
import NewsListItem from './NewsListItem'
import type { RootState } from './store'
import { getUserEmail, getUserToken } from './userSlice'

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
  const showSearchHistoryCount = searchHistoryCount.reduce((a, b) => a + b.count, 0) > 0
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
  const trends = useSelector((state: RootState) => state.trends.trends).reduce(({ result, used }: { result: Trend[], used: string[]}, t) => {
    if (used.indexOf(t.name) === -1) {
      result.push(Object.assign({}, t, {name: [t.name].concat(t.related_topics).join(', ')}))
      used.push(t.name)
      used = used.concat(t.related_topics)
    }
    return { result, used }
  }, { result: [], used: []}).result
  const userEmail = useSelector(getUserEmail)
  const userToken = useSelector(getUserToken)

  const handlers = {
    NEXT: () => dispatch(increment()),
    PREVIOUS: () => dispatch(decrement()),
    OPEN_NEWS: () => {
      if (!['BUTTON', 'A'].includes((document.activeElement || {}).tagName || '')) {
        history.push('/url/' + encodeURIComponent(news[selected].url))
      }
    },
    ARCHIVE: () => {
      dispatch(addURL(news[selected].url, { userEmail, userToken }))
    },
    SEARCH: (e: KeyboardEvent | undefined) => {
      e?.preventDefault();
      (document.querySelector('[aria-label="Buscar"]') as HTMLInputElement).focus()
    },
    REFRESH: (e: KeyboardEvent | undefined) => {
      e?.preventDefault();
      dispatch(fetchNews({userEmail, userToken}))
      dispatch(fetchTrends())
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
    dispatch(fetchNews({userEmail, userToken}))
  }, [dispatch, userEmail, userToken])

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

  const [selectedTrend, setSelectedTrend] = useState<null | {name: string, title: string | null, url: string | null}>(null)

  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={selectedTrend !== null}
        onClose={() => setSelectedTrend(null)}
        >
        <Alert onClose={() => setSelectedTrend(null)} icon={false} color="info">
          {selectedTrend?.title || ''}
          <>
          <Button color="inherit" size="small" onClick={() => history.push('/url/' + encodeURIComponent(selectedTrend?.url || ''))}>
            Ver noticia
          </Button>
          <Button color="inherit" size="small" onClick={() => { doSearch(selectedTrend?.name.split(',')[0] || ''); setSelectedTrend(null) }}>
            Buscar más
          </Button>
          </>
        </Alert>
      </Snackbar>
      <div style={{marginTop: 80, marginLeft: 10, marginRight: 10}} id="main">
      {trends.slice(0, 10).map((t) => <Chip key={t.name} label={t.name} style={{marginRight: 4, marginBottom: 4}} onClick={() => setSelectedTrend(t)} />)}
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
      {showSearchHistoryCount && wide &&
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
