import React, { useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { fetchSingleNews, selectNews } from './singleNewsSlice'
import {
  useParams
} from "react-router-dom";

import Container from '@material-ui/core/Container';

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
    {news ? <div>
      <h1>{news.title}</h1>
      <div className="content" dangerouslySetInnerHTML={{__html: news.content}}></div>
    </div> :
    <div></div>
    }
  </Container>);
}

export default NewsDetails;
