import React, { useEffect } from 'react'
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';


import { fetchSingleNews, selectNews } from './singleNewsSlice'
import {
  useParams
} from "react-router-dom";

import type { RootState } from './store'

function NewsDetails() {
  let { url } = useParams<{url: string}>()
  url = decodeURIComponent(url)

  const dispatch = useDispatch()
  const maybeNews = useSelector(selectNews)
  const news = maybeNews && maybeNews.url === url ? maybeNews : null

  const newsStatus = useSelector((state: RootState) => state.singleNews.status)

  useEffect(() => {
    if (newsStatus === 'idle' || (newsStatus === 'succeeded' && !news)) {
      dispatch(fetchSingleNews(url))
    }
  }, [newsStatus, dispatch, url, news])
  return (<Container maxWidth='sm'>
    {news ? <div style={{marginTop: 10, lineHeight: 1.2}}>
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
      <h1>{news.title}</h1>
      {news.summary && <Paper elevation={3} style={{padding: 10}}>{news.summary}</Paper>}
      <div className="content" dangerouslySetInnerHTML={{__html: news.content}}></div>
    </div> :
    <div></div>
    }
  </Container>);
}

export default NewsDetails;
