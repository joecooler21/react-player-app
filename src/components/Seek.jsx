import React from 'react'
import { Slider } from '@mui/material'

import { Transport } from 'tone'

const Seek = ({ sound, setSingleValue, setPosition, position, singleValue, duration, formatTime }) => {

    const seek = (e, newVal) => {
        if (!sound) return
        sound.seek(e.target.value, '+0')
        setSingleValue(newVal)
        Transport.seconds = newVal
        setPosition(formatTime(newVal / sound.playbackRate))
      }

    return (
        <div>
            <p style={{ fontSize: '2em', position: 'absolute', top: '10%' }} className='display-text pixel centered'>{position}</p>


            <Slider
                sx={{
                    color: 'lightgrey', '& .MuiSlider-thumb': { borderRadius: '1px', width: '.5em', color: 'black', height: '.5em', margin: '0px' },
                    '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', fontStyle: 'italic' },
                    '& .MuiSlider-rail': { color: 'black' }, '& .MuiSlider-track': { color: 'black' }
                }}
                value={singleValue}
                min={0}
                max={duration}
                onChange={seek}
                style={{ position: 'absolute', width: '70%', height: '10%', padding: '0em', top: '25%', left: '15%' }}
                defaultValue={0} getAriaLabel={() => 'Default'}
                valueLabelDisplay='off' valueLabelFormat={position} />

        </div>
    )
}

export default Seek
