import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { GlobalHotKeys } from "react-hotkeys";

import Container from '@material-ui/core/Container';
import Grid, { GridSize } from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';
import ShareIcon from '@material-ui/icons/Share';
import { fetchSingleNews, selectNews, deduplicatedIndex } from './singleNewsSlice'
import {
  useParams,
  useHistory,
  Link,
} from "react-router-dom";
import { addURL } from './archivedSlice'
import type { RootState } from './store'
import { SingleNewsItem } from './singleNewsSlice'
import { getUserEmail } from './userSlice'


const keyMap = {
  ARCHIVE: "a",
}

function NewsDetails() {
  let { url, source } = useParams<{url: string, source?: string}>()
  url = decodeURIComponent(url)

  const history = useHistory()
  const dispatch = useDispatch()
  const maybeNews = useSelector(selectNews)
  const userEmail = useSelector(getUserEmail)
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
  const sources = maybeNews && maybeNews.news ? maybeNews.news.map((news: SingleNewsItem) => news.source) : []
  if (source) {
    let selectedIndex = sources.indexOf(source)
    if (selectedIndex === -1) {
      selectedIndex = 0
    }
    if (selectedIndex !== maybeNews.deduplicatedIndex) {
      dispatch(deduplicatedIndex(selectedIndex))
    }
  }

  const archive = () => {
    if (news && userEmail) {
      dispatch(addURL(news.url, userEmail))
      history.push('/')
    }
  }
  const handlers = {
    ARCHIVE: archive,
  };

  const newsStatus = useSelector((state: RootState) => state.singleNews.status)

  useEffect(() => {
    if (newsStatus === 'idle' || (newsStatus === 'succeeded' && !news)) {
      dispatch(fetchSingleNews(url))
    }
  }, [newsStatus, dispatch, url, news])
  const canShare = 'share' in navigator
  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap} allowChanges={true}>
      <Container maxWidth='sm'>
        {news ? <div style={{marginTop: 10, lineHeight: 1.2, paddingTop: 80}}>
          <Grid container>
            <Grid item xs={!canShare ? 4 : 3} style={{textAlign: 'center'}}>
              <Link to="/">
                <ArrowBackIcon />
              </Link>
            </Grid>
            <Grid item xs={!canShare ? 4 : 3} style={{textAlign: 'center'}}>
              <Button onClick={archive}>
                <MoveToInboxIcon />
              </Button>
            </Grid>
            {canShare && <Grid item xs={3} style={{textAlign: 'center'}}>
              <Button onClick={() => navigator.share({title: news.title, url: news.url}) }>
                <ShareIcon />
              </Button>
            </Grid>}
            <Grid item xs={!canShare ? 4 : 3} style={{textAlign: 'center'}}>
              <Button href={news.url} rel="noreferrer" target="_blank">
                <OpenInNewIcon />
              </Button>
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
              <Link to={`/url/${encodeURIComponent(canonicalURL)}/${source}`} title={news.summary}>{source}</Link>
            </Grid>
            ))}
          </Grid>}
          <h1>{news.title}</h1>
          {news.summary && <Paper elevation={3} style={{padding: 10}}>{news.summary}</Paper>}
          <div className="content" dangerouslySetInnerHTML={{__html: news.content}}></div>
        </div> :
        <div></div>
        }
      </Container>
    </GlobalHotKeys>
  );
}

export default NewsDetails;
