import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useParams } from "react-router-dom";
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

import { getUserId, merge } from './userSlice'

function AddDeviceConfirmation() {
  const newUserId = useParams<{userId: string}>().userId
  const history = useHistory()
  const oldUserId = useSelector(getUserId)
  const dispatch = useDispatch()
  const no = () => history.push('/')
  const doMerge = async () => {
    if (!oldUserId) {
      return
    }
    await dispatch(merge(newUserId, oldUserId))
    no()
  }
  return (<div>
    <Container maxWidth='sm'>
      <div style={{marginTop: 10, lineHeight: 1.2, paddingTop: 80}}>
        ¿Estás segure que querés agregar un nuevo dispositivo?
        Una vez agregado el dispositivo toda la información se va a sincronizar.
        <br /><br />
        <Button aria-label="Sí" onClick={doMerge}>Sí</Button>
        <Button aria-label="No" onClick={no}>No</Button>
      </div>
    </Container>
  </div>)
}
export default AddDeviceConfirmation
