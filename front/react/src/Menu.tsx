import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { Link } from "react-router-dom";
import { useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import { NewsItem } from './newsSlice'
import { images } from './sections'
import {
  selectAllNews,
  hiddenSections,
  addHiddenSection,
  removeHiddenSection,
  hiddenSources,
  addHiddenSource,
  removeHiddenSource,
} from './newsSlice'
import { fetchNews } from './fetchNewsSlice'
import type { RootState } from './store'
import { login, getUserEmail } from './userSlice'

const useStyles = makeStyles((theme) => ({
  root: {
    '& .skip-to-content-link': {
        left: 0,
        top: '50%',
        position: 'absolute',
        transform: 'translateX(-100%)',
        color: 'white',
        zIndex: 10000,
    },
    '& .skip-to-content-link:focus': {
        transform: 'translateX(0%)',
    },
  },
}));


function Menu() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const selectedSections = useSelector(hiddenSections)
  const selectedSources = useSelector(hiddenSources)
  const dispatch = useDispatch()
  const lastUpdate = useSelector((state: RootState) => state.newsList.updateDate)
  const classes = useStyles();
  const userEmail = useSelector(getUserEmail)

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const newsStatus = useSelector((state: RootState) => state.newsList.status)
  const searchNewsStatus = useSelector((state: RootState) => state.newsList.searchStatus)
  const searchCriteria = useSelector((state: RootState) => state.newsList.searchCriteria)
  const toggleSource = (text: string) => {
    if (!selectedSources.includes(text)) {
      dispatch(addHiddenSource(text))
    } else {
      dispatch(removeHiddenSource(text))
    }
  }
  const toggleSection = (text: string) => {
    if (!selectedSections.includes(text)) {
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
  const sources = useSelector(selectAllNews).map(
    (n: NewsItem) => n.source
  ).filter(
    (s: string, i: number, sections: string[]) => sections.indexOf(s) === i && s
  ).sort()
  const refresh = () => {
    dispatch(fetchNews(userEmail))
  }
  return (<div className={classes.root}>
    <a href="#main" onClick={() => {
        setTimeout(() => document.getElementById('firstLink')?.focus(), 0)
      }} className="skip-to-content-link" aria-label="Saltar a contenido">
      Saltar a contenido
    </a>
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="ver menú"
          onClick={handleDrawerOpen}
          edge="start"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap style={{flexGrow: 1}}>
          Clarinete
        </Typography>
        {(newsStatus === 'idle' || newsStatus === 'succeeded') &&
          (searchNewsStatus === 'idle'|| searchNewsStatus === 'succeeded' || searchCriteria === '') && (<Button aria-label="actualizar">
          <RefreshIcon htmlColor="white" onClick={refresh} />
        </Button>)}
        {newsStatus === 'loading' && (<Button>
          <CircularProgress color="secondary" size={20}  aria-label="cargando" />
        </Button>)}
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
      <Box style={{padding: '10px 20px'}}>
        <Typography color="textPrimary">
          {userEmail || <Button onClick={() => dispatch(login())}>Ingresar con cuenta de Google</Button>}
        </Typography>
      </Box>
      <Divider />
      <Box style={{padding: '10px 20px 0'}}>
        <Typography color="textPrimary">
          Filtros por origen
        </Typography>
      </Box>
      <List>
        {sources.map((text: string, index: number) => (
          <ListItem button key={text}>
            <ListItemText primary={text} style={{paddingRight: 30}}
              onClick={() => toggleSection(text)}
              />
            <Switch
              color="primary"
              checked={!selectedSources.includes(text)}
              onClick={() => toggleSource(text)}
              />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box style={{padding: '10px 20px 0'}}>
        <Typography color="textPrimary">
          Filtros por sección
        </Typography>
      </Box>
      <List>
        {sections.map((text: string, index: number) => (
          <ListItem button key={text}>
            <ListItemIcon><img src={images[text]} style={{height: 40}} alt="" /></ListItemIcon>
            <ListItemText primary={text} style={{paddingRight: 30}}
              onClick={() => toggleSection(text)}
              />
            <Switch
              color="primary"
              checked={!selectedSections.includes(text)}
              onClick={() => toggleSection(text)}
              />
          </ListItem>
        ))}
      </List>
      <Box style={{padding: '10px 20px 0'}}>
        <Typography color="textSecondary">
          <Link to={'/agregardispositivo'} onClick={handleDrawerClose}>Agregar dispositivo</Link>
        </Typography>
      </Box>
      <Box style={{padding: '10px 20px 0'}}>
        <Typography color="textSecondary">
          Última actualización {new Date(lastUpdate).toISOString()}
        </Typography>
      </Box>
    </Drawer>
  </div>)
}
export default Menu
