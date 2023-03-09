import {useState, React} from 'react'
import { Slider } from '@mui/material'

import { default as VolumeUp } from '@mui/icons-material/VolumeUp'
import { default as VolumeDown } from '@mui/icons-material/VolumeDown'
import { default as VolumeOff } from '@mui/icons-material/VolumeOff';



const Volume = ({ sound, position }) => {

const [volume, setVolume] = useState(0)
const [prevVolume, setPrevVolume] = useState(0)
const [mute, setMute] = useState(false)

const volumeWheel = (e) => {
    let direction = e.deltaY;

    if (direction > 0) {
     let vol = volume
     vol--
     if (vol < -36) {
      setMute(true)
      if (!sound) return
      sound.mute = true
      return
     }
     setVolume(vol)
     if (!sound) return
     sound.volume.value = vol
    }
    if (direction < 0) {
      if (!sound || volume === 0) return
      let vol = volume
      vol++
      setVolume(vol)
      sound.volume.value = vol
      }
    
  }

  const volumeSlider = (e) => {
    if (e.target.value === -35) {
      setMute(true)
      setVolume(e.target.value)
      sound.mute = true
      return
    }
    setVolume(e.target.value)
    if (!sound) return
    sound.volume.value = (e.target.value)
    setMute(false)

  }

  const clickVolUp = () => {
    if (!sound) return
    sound.mute = false
    setMute(false)
    setVolume(0)
    sound.volume.value = 0
  }

  const clickMute = () => {
    if (!sound) return
    if (!mute) {
      sound.mute = true
      setPrevVolume(volume)
      setVolume(-35)
    }
    if (mute) {
      sound.mute = false
      setVolume(prevVolume)
    }
    mute ? setMute(false) : setMute(true)
  }

  return (
    <>
        <div style={{
          width: '200px', height: '30px', position: 'absolute', left: '16%', bottom: '35%', display: 'flex',
          flexDirection: 'row', justifyContent: 'space-between'
        }}>

          {mute ? <VolumeOff onClick={clickMute} className='volume-icon' sx={{ position: 'relative', bottom: '-2px' }} /> : <VolumeDown onClick={clickMute} className='volume-icon' sx={{ position: 'relative', bottom: '-2px' }} />}

          <Slider
            sx={{
              borderRadius: '0px', width: '125px', position: 'relative', right:'2%', bottom: '0px',
              color: 'black', '& .MuiSlider-thumb': { borderRadius: '1px', width: '10px', height: '10px' },
              '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', fontStyle: 'italic' }
            }}
            onWheel={volumeWheel}
            value={volume}
            min={-35}
            max={0}
            step={1}
            onChange={volumeSlider}
            defaultValue={volume} getAriaLabel={() => 'Default'}
            valueLabelDisplay='off' valueLabelFormat={position} />

          <VolumeUp onClick={clickVolUp} className='volume-icon' sx={{ position: 'relative', bottom: '-2px' }} />

        </div>
      
    </>
  )
}

export default Volume
