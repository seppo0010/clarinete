import React, { FC, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom";
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { styled } from "@mui/system";

import { NewsItem } from './newsSlice'
import { addURL } from './archivedSlice'
import { getUserEmail, getUserToken } from './userSlice'
import { setSelected } from './selectedSlice'

const Root = styled(Paper)({
  minWidth: 275,
  margin: 8,
});
const Title = styled(Typography)({
  fontSize: 14,
});


const NewsListItem: FC<{news: NewsItem, selected: boolean, position: number}> = ({news, selected, position}) => {
  const dispatch = useDispatch()
  const userEmail = useSelector(getUserEmail)
  const userToken = useSelector(getUserToken)

  const [wasSelected, setWasSelected] = useState(false)

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
    'US': '🇺🇸',
    'ES': '🇪🇸',
  } as {[key: string]: string})[news.country], news.volanta].filter((x) => !!x).join(' | ')

  const bottom = [
    news.section,
    news.source,
    news.date ? new Intl.DateTimeFormat('es').format(new Date(news.date)) : '',
  ].filter((x) => !!x).join(' | ')
  return (
    <Root style={{margin: 6, outline: selected ? 'solid': 'none'}} ref={ref}>
      <Box style={{padding: 20, display: 'flex', flexDirection: 'column-reverse'}}>
        <Typography color="textSecondary">
          {bottom}
        </Typography>
        {selected && <Typography color="textPrimary">
          {news.summary}
        </Typography>}
        <Typography variant="h6" component="h2">
          <Link to={'/url/' + encodeURIComponent(news.url)} title={news.summary} id={position === 0 ? 'firstLink' : undefined}>{news.title || '(sin título)'}</Link>
        </Typography>
        <Title color="textSecondary" gutterBottom style={{display: 'flex', height: 28}}>
          <div style={{height: '1.2rm', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flexGrow: 1 }}>{top}</div>
          <div style={{display: 'flex', flexShrink: 1}}>
              <Button onClick={() => dispatch(setSelected(position))}><VisibilityIcon /></Button>
              <Button onClick={() => dispatch(addURL(news.url, { userEmail, userToken }))} style={{marginTop: -8}} aria-label="archivar"><MoveToInboxIcon /></Button>
              {'share' in navigator && <Button onClick={() => navigator.share({title: news.title, url: news.url}) }><ShareIcon /></Button>}
          </div>
        </Title>
      </Box>
    </Root>
  );
}
export default NewsListItem
