import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

import NewsListItem from './NewsListItem'

function NewsList() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  return (
    <GridList cols={2}>
        <GridListTile cols={2}>
            <NewsListItem />
        </GridListTile>
        <GridListTile cols={matches ? 1 : 2}>
            <NewsListItem />
        </GridListTile>
        <GridListTile cols={matches ? 1 : 2}>
            <NewsListItem />
        </GridListTile>
        <GridListTile cols={matches ? 1 : 2}>
            <NewsListItem />
        </GridListTile>
        <GridListTile cols={matches ? 1 : 2}>
            <NewsListItem />
        </GridListTile>
    </GridList>
  );
}

export default NewsList;

