import React, { FC, useState, useRef, useEffect } from "react";
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


const MAX_TITLE_HEIGHT = 65
const NewsListItem: FC<{news: NewsItem, selected: boolean, position: number}> = ({news, selected, position}) => {
  const classes = useStyles();
  const dispatch = useDispatch()

  const [wasSelected, setWasSelected] = useState(false)

  const titleRef = useRef(null)
  const [fontSize, setFontSize] = useState(0)
  useEffect(() => {
    if (!titleRef.current) return
    if (fontSize !== 0) return
    const node = titleRef.current as unknown as HTMLElement
    if (!node.parentNode) return
    let heightTitle = node.getBoundingClientRect().height
    let f = 24
    while (heightTitle > MAX_TITLE_HEIGHT) {
      node.style.fontSize = (--f) + 'px'
      heightTitle = node.getBoundingClientRect().height
    }
    setFontSize(f)
  }, [fontSize])
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
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom style={{display: 'flex', height: 28}}>
          <div style={{width: 'calc(100% - 100px)', height: '1.2rm', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{top}</div>
          {news.summary && (
            <Tooltip disableFocusListener title={news.summary} aria-label="add">
              <Button aria-label="Leer resumen" tabIndex={position * 3 + 6}><img src={brief} alt='Leer resumen' style={{height: 26}} /></Button>
            </Tooltip>
          )}
          <Button onClick={() => dispatch(addURL(news.url))} style={{marginTop: -8}} aria-label="archivar" tabIndex={position * 3 + 5}><MoveToInboxIcon /></Button>
        </Typography>
        <div style={{height: 72}}>
          <Typography variant="h5" component="h2" ref={titleRef} style={{fontSize: fontSize || 24}}>
            <Link to={'/' + encodeURIComponent(news.url)} title={news.summary} id={position === 0 ? 'firstLink' : undefined} tabIndex={position * 3 + 4}>{news.title}</Link>
          </Typography>
        </div>
        <Typography color="textSecondary">
          {bottom}
        </Typography>
      </CardContent>
    </Card>
  );
}
export default NewsListItem
