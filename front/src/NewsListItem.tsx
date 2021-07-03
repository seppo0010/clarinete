import React, { FC } from "react";
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

const NewsListItem: FC<{news: NewsItem}> = ({news}) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {news.volanta}
          {news.sentiment === 0 && ' | ' + '🙏'}
          {news.sentiment === 1 && ' | ' + '🙏'}
          {news.sentiment === 2 && ' | ' + '😠'}
          {news.sentiment === 3 && ' | ' + '😢'}
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
