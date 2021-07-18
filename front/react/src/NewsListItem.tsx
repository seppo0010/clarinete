import React, { FC, useState, useRef } from "react";
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Link } from "react-router-dom";
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';
import Tooltip from '@material-ui/core/Tooltip';

import { NewsItem } from './newsSlice'
import { addURL } from './archivedSlice'
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
    <Card className={classes.root} style={{outline: selected ? 'solid': 'none'}} ref={ref}>
      <CardContent style={{display: 'flex', flexDirection: 'column-reverse'}}>
        <Typography color="textSecondary">
          {bottom}
        </Typography>
        <Typography variant="h6" component="h2" style={{height: 72, overflow: 'hidden'}}>
          <Link to={'/' + encodeURIComponent(news.url)} title={news.summary} id={position === 0 ? 'firstLink' : undefined}>{news.title}</Link>
        </Typography>
        <Typography className={classes.title} color="textSecondary" gutterBottom style={{display: 'flex', height: 28}}>
          <div style={{height: '1.2rm', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flexGrow: 1 }}>{top}</div>
          <div>
              {news.summary && (
                <Tooltip disableFocusListener title={news.summary} aria-label="add">
                  <Button aria-label="Leer resumen"><img src={brief} alt='Leer resumen' style={{height: 26}} /></Button>
                </Tooltip>
              )}
              <Button onClick={() => dispatch(addURL(news.url))} style={{marginTop: -8}} aria-label="archivar"><MoveToInboxIcon /></Button>
          </div>
        </Typography>
      </CardContent>
    </Card>
  );
}
export default NewsListItem
