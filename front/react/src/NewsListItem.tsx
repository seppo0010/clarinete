import React, { FC, useState, useRef } from "react";
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Link } from "react-router-dom";
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';

import { NewsItem } from './newsSlice'
import { addURL } from './archivedSlice'

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    margin: 8,
  },
  title: {
    fontSize: 14,
  },
});



const NewsListItem: FC<{news: NewsItem, selected: boolean}> = ({news, selected}) => {
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
          window.scrollTo(window.scrollX, window.scrollY + bbox.top)
        }
        if (bbox.bottom > window.innerHeight) {
          window.scrollTo(window.scrollX, window.scrollY + bbox.bottom - window.innerHeight)
        }
    })
  }
  if (selected !== wasSelected) {
    setWasSelected(selected)
  }
  const top = [news.volanta, {
    0: '😄',
    1: '🙏',
    2: '😠',
    3: '😢',
  }[news.sentiment]].filter((x) => !!x).join(' | ')
  const bottom = [news.section, news.source].filter((x) => !!x).join(' | ')
  return (
    <Card className={classes.root} style={{outline: selected ? 'solid': 'none'}} ref={ref}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {top}
          <Button onClick={() => dispatch(addURL(news.url))}><MoveToInboxIcon /></Button>
        </Typography>
        <Typography variant="h5" component="h2">
          <Link to={'/' + encodeURIComponent(news.url)} title={news.summary}>{news.title}</Link>
        </Typography>
        <Typography color="textSecondary">
          {bottom}
        </Typography>
      </CardContent>
    </Card>
  );
}
export default NewsListItem
