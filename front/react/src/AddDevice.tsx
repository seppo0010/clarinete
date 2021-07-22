import React from 'react'
import Container from '@material-ui/core/Container';
import { useSelector } from 'react-redux'
import { Link } from "react-router-dom";

import { getUserId } from './userSlice'

function AddDevice() {
  const userId = useSelector(getUserId)
  return (<div>
    <Container maxWidth='sm'>
      <div style={{marginTop: 10, lineHeight: 1.2, paddingTop: 80}}>
        Una vez agregado el dispositivo toda la información se va a sincronizar.
        Para agregar un dispositivo abrir el siguiente link desde allí:<br /><br />
        <Link to={'/agregardispositivo/' + encodeURIComponent(userId)}>{window.location.href}/{encodeURIComponent(userId)}</Link>
      </div>
    </Container>
  </div>)
}
export default AddDevice
