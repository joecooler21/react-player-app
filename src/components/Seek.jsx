import React from 'react'
import { Slider } from '@mui/material'

import { Transport } from 'tone'

const Seek = ({ sound, setSingleValue, setPosition, position,
     singleValue, duration, formatTime, globalTimer, setGlobalTimer, setSeconds }) => {

    const seek = (e, newVal) => {
        if (!sound) return
        
        setSingleValue(e.target.value)
        setPosition(formatTime(e.target.value))
       
      }

      const seekCommitted = () => {
        
        setGlobalTimer(Transport.scheduleRepeat(()=>{
            setSeconds(Math.round(Transport.seconds))

        }, '1s'))

        sound.seek(singleValue, '+0')
        Transport.seconds = singleValue
        
        

      }

    return (
        <div>
            <p style={{ fontSize: '2em', position: 'absolute', top: '10%' }}
             className='display-text pixel centered'>{position}</p>


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
                onChangeCommitted={seekCommitted}
                style={{ position: 'absolute', width: '70%', height: '10%', padding: '0em', top: '25%', left: '15%' }}
                defaultValue={0} getAriaLabel={() => 'Default'}
                valueLabelDisplay='off' valueLabelFormat={position} />

        </div>
    )
}

export default Seek
