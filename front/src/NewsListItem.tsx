import React, { FC, useState, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Link } from "react-router-dom";

import { NewsItem } from './newsSlice'

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

  const [wasSelected, setWasSelected] = useState(false)
  const ref = useRef(null)
  if (selected && !wasSelected) {
    setTimeout(() => {
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
  return (
    <Card className={classes.root} style={{outline: selected ? 'solid': 'none'}} ref={ref}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {news.volanta}
          {news.sentiment === 0 && ' | 🙏'}
          {news.sentiment === 1 && ' | 🙏'}
          {news.sentiment === 2 && ' | 😠'}
          {news.sentiment === 3 && ' | 😢'}
        </Typography>
        <Typography variant="h5" component="h2">
          <Link to={'/' + encodeURIComponent(news.url)} title={news.summary}>{news.title}</Link>
        </Typography>
        <Typography color="textSecondary">
          {news.section} | {news.source}
        </Typography>
      </CardContent>
    </Card>
  );
}
export default NewsListItem
