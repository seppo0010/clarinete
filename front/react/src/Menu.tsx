import React from 'react'

import { useSelector } from 'react-redux'
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

import { filter, map, images } from './sections'
import { selectAllNews } from './newsSlice'

function Menu() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const toggleSection = (text: string) => {
  }
  const sections = useSelector(selectAllNews).map((n) => n.section.toLowerCase().trim()).filter((s) => (!filter.includes(s))).map((s) => (map[s] || s)).filter((s, i, sections) => sections.indexOf(s) === i && s).sort().concat(['otros'])
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
        {sections.map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon><img src={images[text]} style={{height: 40}} alt="" /></ListItemIcon>
            <ListItemText primary={text} style={{paddingRight: 30}}
              onClick={() => toggleSection(text)}
              />
            <Switch
              color="primary"
              onClick={() => toggleSection(text)}
              />
          </ListItem>
        ))}
      </List>
    </Drawer>
  </div>)
}
export default Menu
