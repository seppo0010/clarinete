import React, { FC } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
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
        </Typography>
        <Typography variant="h5" component="h2">
          {news.title}
        </Typography>
        <Typography color="textSecondary">
          {news.section}
        </Typography>
      </CardContent>
    </Card>
  );
}
export default NewsListItem
