import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { Link } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from "@mui/system";

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
import { fetchTrends } from './fetchTrendsSlice'
import type { RootState } from './store'
import { login, logout, getUserEmail, getUserToken } from './userSlice'

const SkipLink = styled('a')({
  skip: {
    left: 0,
    top: '50%',
    position: 'absolute',
    transform: 'translateX(-100%)',
    color: 'white',
    zIndex: 10000,
    "&:focus": {
      transform: 'translateX(0%)',
    },
  },
});

function Menu() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const selectedSections = useSelector(hiddenSections)
  const selectedSources = useSelector(hiddenSources)
  const dispatch = useDispatch()
  const lastUpdate = useSelector((state: RootState) => state.newsList.updateDate)
  const userEmail = useSelector(getUserEmail)
  const userToken = useSelector(getUserToken)

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
    dispatch(fetchNews({userEmail, userToken}))
    dispatch(fetchTrends())
  }
  return (<div>
    <SkipLink href="#main" onClick={() => {
        setTimeout(() => document.getElementById('firstLink')?.focus(), 0)
      }} aria-label="Saltar a contenido">
      Saltar a contenido
    </SkipLink>
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
          {userEmail && <Button onClick={() => dispatch(logout())}>Salir</Button>}
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
