import React from 'react'
import { default as Light } from '@mui/icons-material/LightMode'

const ToggleLight = ({light, setLight}) => {

    const toggleLight = () => {
        light ? setLight(false) : setLight(true)
    
      }

  return (
    <button onClick={toggleLight} className='center-button'><Light sx={{position:'relative',
     right:'3px', bottom:'-2px', fontSize:'3em'}} /></button>
  )
}

export default ToggleLight
