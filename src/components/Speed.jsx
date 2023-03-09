import React from 'react'
import { PitchShift } from 'tone'
import { Slider } from '@mui/material'

const Speed = ({ sound, getpc, setPlaybackSpeed, playbackSpeed, setSpeedValue, speedValue }) => {

    const marks = [{ value: 1.0, }, { value: 0.95 }, { value: 0.90, }, { value: 0.85, }, { value: 0.80, }, { value: 0.75, },
        { value: 0.70, }, { value: 0.65, }, { value: 0.60, }, { value: 0.55, }, { value: 0.50, },];

    const changePlaybackSpeed = (e) => {
        let pbr = null
        // need to format value from slider to match valid pbr array values
        if (e.target.value === 1.0) { pbr = '1.0' } else {
          pbr = e.target.value.toString().padEnd(4, 0)
        }
        setPlaybackSpeed(pbr)
        setSpeedValue(e.target.value)
      }
     
    
      const changePlaybackSpeedComitted = () => {
    
        if (!sound) return
        let pc = getpc(playbackSpeed)
        sound.playbackRate = playbackSpeed
        let pitch_shift = new PitchShift({ pitch: pc }).toDestination()
        sound.disconnect()
        sound.connect(pitch_shift)
    
      }
  return (
    <div style={{ width: '300px', display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '25%', left: '-12%' }}>
    <p style={{ fontSize: '1em', marginRight:'5%' }}
      className='display-text pixel'>Speed: {`${Math.round(speedValue * 100)}%`}</p>
    <Slider
      sx={{
        width: '75px', borderRadius: '0px', '& .MuiSlider-mark': { backgroundColor: 'transparent' },
        '& .MuiSlider-thumb': { borderRadius: '1px', width: '10px', height: '10px', color: 'black' },
        color: 'black', position: 'absolute', bottom: '20%', right: '7%'
      }}
      aria-label="Custom marks"
      value={speedValue}
      defaultValue={speedValue}
      step={0.05}
      max={1.0}
      min={.5}
      valueLabelDisplay="off"
      marks={marks}
      onChangeCommitted={changePlaybackSpeedComitted}
      onChange={changePlaybackSpeed}
    /></div>
  )
}

export default Speed
