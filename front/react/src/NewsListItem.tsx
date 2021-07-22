import React, { FC, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Link } from "react-router-dom";
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

import { NewsItem } from './newsSlice'
import { addURL } from './archivedSlice'
import { getUserId } from './userSlice'
import brief from './images/brief.svg'

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    margin: 8,
  },
  title: {
    fontSize: 14,
  },
});


const NewsListItem: FC<{news: NewsItem, selected: boolean, position: number}> = ({news, selected, position}) => {
  const classes = useStyles();
  const dispatch = useDispatch()
  const userId = useSelector(getUserId)

  const [wasSelected, setWasSelected] = useState(false)

  const ref = useRef(null)
  if (selected && !wasSelected) {
    setTimeout(() => {
        if (!ref || !ref.current) {
          return
        }
        const bbox = (ref.current as any).getBoundingClientRect()
        if (bbox.top < 0) {
          window.scrollTo(window.scrollX, window.scrollY + bbox.top - 80)
        }
        if (bbox.bottom > window.innerHeight) {
          window.scrollTo(window.scrollX, window.scrollY + bbox.bottom - window.innerHeight)
        }
    })
  }
  if (selected !== wasSelected) {
    setWasSelected(selected)
  }
  const top = [({
    'AR': '🇦🇷',
    'UY': '🇺🇾',
    'CL': '🇨🇱',
  } as {[key: string]: string})[news.country], news.volanta].filter((x) => !!x).join(' | ')

  const bottom = [
    news.section,
    news.source,
    news.date ? new Intl.DateTimeFormat('es').format(new Date(news.date)) : '',
  ].filter((x) => !!x).join(' | ')
  return (
    <Paper className={classes.root} style={{margin: 6, outline: selected ? 'solid': 'none'}} ref={ref}>
      <Box style={{padding: 20, display: 'flex', flexDirection: 'column-reverse'}}>
        <Typography color="textSecondary">
          {bottom}
        </Typography>
        {selected && <Typography color="textPrimary">
          {news.summary}
        </Typography>}
        <Typography variant="h6" component="h2">
          <Link to={'/url/' + encodeURIComponent(news.url)} title={news.summary} id={position === 0 ? 'firstLink' : undefined}>{news.title}</Link>
        </Typography>
        <Typography className={classes.title} color="textSecondary" gutterBottom style={{display: 'flex', height: 28}}>
          <div style={{height: '1.2rm', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flexGrow: 1 }}>{top}</div>
          <div style={{display: 'flex', flexShrink: 1}}>
              {news.summary && (
                <Tooltip disableFocusListener title={news.summary} aria-label="add">
                  <Button aria-label="Leer resumen"><img src={brief} alt='Leer resumen' style={{height: 26}} /></Button>
                </Tooltip>
              )}
              <Button onClick={() => userId && dispatch(addURL(news.url, userId))} style={{marginTop: -8}} aria-label="archivar"><MoveToInboxIcon /></Button>
          </div>
        </Typography>
      </Box>
    </Paper>
  );
}
export default NewsListItem
