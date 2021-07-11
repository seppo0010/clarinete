import React, { useEffect } from 'react'
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import Container from '@material-ui/core/Container';
import Grid, { GridSize } from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import { fetchSingleNews, selectNews, deduplicatedIndex } from './singleNewsSlice'
import {
  useParams
} from "react-router-dom";
import type { RootState } from './store'

function NewsDetails() {
  let { url, source } = useParams<{url: string, source?: string}>()
  url = decodeURIComponent(url)

  const dispatch = useDispatch()
  const maybeNews = useSelector(selectNews)
  const news = (maybeNews.news &&
          maybeNews.news[maybeNews.deduplicatedIndex] &&
          maybeNews.news[0].url === url ?
            maybeNews.news[maybeNews.deduplicatedIndex] :
            null
          )
  const canonicalURL = (maybeNews.news &&
          maybeNews.news[0] ?
            maybeNews.news[0].url :
            null
          )
  const sources = maybeNews && maybeNews.news ? maybeNews.news.map((news) => news.source) : []
  if (source) {
    let selectedIndex = sources.indexOf(source)
    if (selectedIndex === -1) {
      selectedIndex = 0
    }
    if (selectedIndex !== maybeNews.deduplicatedIndex) {
      dispatch(deduplicatedIndex(selectedIndex))
    }
  }

  const newsStatus = useSelector((state: RootState) => state.singleNews.status)

  useEffect(() => {
    if (newsStatus === 'idle' || (newsStatus === 'succeeded' && !news)) {
      dispatch(fetchSingleNews(url))
    }
  }, [newsStatus, dispatch, url, news])
  return (<Container maxWidth='sm'>
    {news ? <div style={{marginTop: 10, lineHeight: 1.2, paddingTop: 80}}>
      <Grid container>
        <Grid item xs={6}>
          <Link to="/">
            <ArrowLeftIcon />
            Volver
          </Link>
        </Grid>
        <Grid item xs={6} style={{textAlign: 'right'}}>
          <a href={news.url} rel="noreferrer" target="_blank">
            Ver original
            <OpenInNewIcon />
          </a>
        </Grid>
      </Grid>
      {canonicalURL && sources.length > 1 && <Grid container style={{marginTop: 20}}>
        {sources.map((source, index) => (<Grid item key={index} style={{
          textAlign: 'center',
        }} xs={({
          1: 12,
          2: 6,
          3: 4,
          4: 3,
          5: 2,
          6: 2,
        }[sources.length] || 1) as GridSize}>
          <Link to={`/${encodeURIComponent(canonicalURL)}/${source}`} title={news.summary}>{source}</Link>
        </Grid>
        ))}
      </Grid>}
      <h1>{news.title}</h1>
      {news.summary && <Paper elevation={3} style={{padding: 10}}>{news.summary}</Paper>}
      <div className="content" dangerouslySetInnerHTML={{__html: news.content}}></div>
    </div> :
    <div></div>
    }
  </Container>);
}

export default NewsDetails;
