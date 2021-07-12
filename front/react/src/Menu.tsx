import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';

import { NewsItem } from './newsSlice'
import { images } from './sections'
import { selectAllNews, hiddenSections, addHiddenSection, removeHiddenSection } from './newsSlice'
import type { RootState } from './store'

function Menu() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const selected = useSelector(hiddenSections)
  const dispatch = useDispatch()
  const lastUpdate = useSelector((state: RootState) => state.newsList.updateDate)

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const toggleSection = (text: string) => {
    if (!selected.includes(text)) {
      dispatch(addHiddenSection(text))
    } else {
      dispatch(removeHiddenSection(text))
    }
  }
  const sections = useSelector(selectAllNews).map(
    (n: NewsItem) => n.section.trim()
  ).filter(
    (s: string, i: number, sections: string[]) => s !== 'Otros' && sections.indexOf(s) === i && s
  ).sort().concat(['Otros'])
  return (<div>
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap>
          Clarinete
        </Typography>
      </Toolbar>
    </AppBar>
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
    >
      <div>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </div>
      <Divider />
      <List>
        {sections.map((text: string, index: number) => (
          <ListItem button key={text}>
            <ListItemIcon><img src={images[text]} style={{height: 40}} alt="" /></ListItemIcon>
            <ListItemText primary={text} style={{paddingRight: 30}}
              onClick={() => toggleSection(text)}
              />
            <Switch
              color="primary"
              checked={!selected.includes(text)}
              onClick={() => toggleSection(text)}
              />
          </ListItem>
        ))}
        <ListItem>
          Last update {new Date(lastUpdate).toISOString()}
        </ListItem>
      </List>
    </Drawer>
  </div>)
}
export default Menu
