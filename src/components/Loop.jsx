import React from 'react'
import { Button, Slider } from '@mui/material'
import { default as LoopIcon } from '@mui/icons-material/Loop'
import { Transport } from 'tone'

const Loop = ({ sound, loop, setLoop, rangeValue, setRangeValue, formatTime, duration, setSeconds }) => {

    const playLoop = () => {
        if (!sound) return
        if (!loop) {
            sound.loop = true
            Transport.scheduleRepeat(() => {
                setSeconds(Math.round(Transport.seconds))
            }, '1s')

        } else {
            sound.loop = false

        }
        loop ? setLoop(false) : setLoop(true)
    }

    const setLoopRange = (e, newVal) => {
        if (!sound) return
        setRangeValue(e.target.value)
        sound.loopStart = newVal[0]
        sound.loopEnd = newVal[1]

    }

    const loopWheel = (e) => {
        const thumbIndex = e.target.getAttribute('data-index')
        if (thumbIndex === '0') { // min slider
            if (e.deltaY < 0) { // up
                let newRange = rangeValue
                if (newRange[0] + 1 >= rangeValue[1]) return
                newRange[0]++
                setRangeValue(newRange)
            }
            if (e.deltaY > 0) { // down
                let newRange = rangeValue
                if (newRange[0] - 1 < 0) return
                newRange[0]--
                setRangeValue(newRange)


            }

        }
        if (thumbIndex === '1') { // max slider
            if (e.deltaY < 0) { // up
                let newRange = rangeValue
                if (newRange[1] + 1 >= duration) return
                newRange[1]++
                setRangeValue(newRange)
            }
            if (e.deltaY > 0) { // down
                let newRange = rangeValue
                if (newRange[1] - 1 <= rangeValue[0]) return
                newRange[1]--
                setRangeValue(newRange)

            }
        }


    }

    return (
        <div>
            <Slider
                onChange={setLoopRange}
                value={rangeValue}
                sx={{
                    visibility: loop ? 'visible' : 'hidden', color: 'lightgrey', '& .MuiSlider-thumb': { borderRadius: '1px', height: '.5em', width: '.5em', color: 'black' },
                    '& .MuiSlider-rail': { backgroundColor: 'transparent' }, '& .MuiSlider-track': { color: 'black' },
                    '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', top: '3.5em', fontStyle: 'italic' }
                }}
                style={{ zIndex:'2', position: 'absolute', width: '70%', padding: '0em', top: '37.5%', left: '15%' }}
                min={0}
                step={1}
                onWheel={loopWheel}
                defaultValue={rangeValue}
                max={duration}
                getAriaLabel={() => ['Min', 'Max']}
                valueLabelDisplay='off'
                valueLabelFormat={(text, index) => { return formatTime(text) }}
            />

            <Button
                style={{ zIndex: '1', position:'absolute', top:'41%', left:'37.5%' }}
                onClick={playLoop}><LoopIcon className={loop ? 'rotate' : ''} sx={{ fontSize: '2.0em', color: 'black' }} />
            </Button>


            {loop ? <div style={{ width:'100%', position: 'absolute', top: '39%', left: '0%', display: 'flex', justifyContent: 'space-around' }}>
                <p style={{ fontSize: '.8em' }} className='display-text pixel'>{formatTime(rangeValue[0])}</p>

                <p style={{ fontSize: '.8em' }} className='display-text pixel'>{formatTime(rangeValue[1])}</p>
            </div> : null}

        </div>
    )
}

export default Loop
