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
  const news = useSelector(selectNews)

  const newsStatus = useSelector((state: RootState) => state.singleNews.status)

  useEffect(() => {
    if (newsStatus === 'idle') {
      dispatch(fetchSingleNews(url))
    }
  }, [newsStatus, dispatch, url])
  return (<Container maxWidth='sm'>
    {news ? <div>
      <div className="content" dangerouslySetInnerHTML={{__html: news.content}}></div>
    </div> :
    <div></div>
    }
  </Container>);
}

export default NewsDetails;
