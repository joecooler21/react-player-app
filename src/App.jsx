import { useState, useEffect, useRef } from 'react'
import { Player, PitchShift, Buffer, Transport } from 'tone'
import { Button, Box, ButtonGroup, Slider, TextField, Select, InputLabel, MenuItem, FormControl } from '@mui/material'
import './App.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { default as Play } from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import { default as Pause } from '@mui/icons-material/PauseCircleOutlineOutlined'
import { default as File } from '@mui/icons-material/AudioFileOutlined';
import { default as Stop } from '@mui/icons-material/StopCircleOutlined';
import { default as Loop } from '@mui/icons-material/Loop';

// valid playback rates and pitch correction values
const pb_rates = { '1.0': 0, '0.95': 1, '0.90': 2, '0.85': 3, '0.80': 4, '0.75': 5,
'0.70': 6, '0.65': 7.5, '0.60': 9, '0.55': 10.5, '0.50': 12 }

const marks = [{value: 1.0,}, {value: 0.95},{value: 0.90,},{value: 0.85,},{value: 0.80,},{value: 0.75,},
  {value: 0.70,}, {value: 0.65,},{value: 0.60,},{value: 0.55,},{value: 0.50,},];


function App() {

  const [play, setPlay] = useState(false)
  const [fileName, setFileName] = useState('No File Loaded')
  const [sound, setSound] = useState(null)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [loop, setLoop] = useState(false)
  const [duration, setDuration] = useState(0)
  const [rangeValue, setRangeValue] = useState([0, 0])
  const [singleValue, setSingleValue] = useState(0)
  const [position, setPosition] = useState('00:00:00')
  const [timer, setTimer] = useState(null)
  const [seconds, setSeconds] = useState(0)

  const getpc = (pbr) => { // get proper pitch correction for the specified playback rate

    return pb_rates[pbr.toString()]

  }

  function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600)
    var minutes = Math.floor((seconds - (hours * 3600)) / 60)
    var remainingSeconds = seconds - (hours * 3600) - (minutes * 60)

    // Add leading zeros if necessary
    if (hours < 10) {
      hours = "0" + hours
    }
    if (minutes < 10) {
      minutes = "0" + minutes
    }
    if (remainingSeconds < 10) {
      remainingSeconds = "0" + remainingSeconds
    }
    if (remainingSeconds < 10)
      return hours + ":" + minutes + ":" + "0" + Math.trunc(remainingSeconds);
    else
      return hours + ":" + minutes + ":" + Math.trunc(remainingSeconds);

  }

  // play and stop
  const playMode = () => {

    if (!sound) return

    if (!play) {
      
      const playback_rate = playbackSpeed
      // set playback rate
      sound.playbackRate = playback_rate
      sound.toDestination();
      // pitch correction
      let pc = getpc(playback_rate)
      let pitch_shift = new PitchShift({ pitch: pc }).toDestination()
      sound.disconnect();

      sound.connect(pitch_shift);

      sound.start()
      sound.seek(singleValue, '+0')
      Transport.start()

      setTimer(setInterval(() => {

        setSeconds(Math.round(Transport.seconds)) // set current playback position
      }, 1000 * playbackSpeed))

    }


    if (play) {
      Transport.pause()
      sound.stop()
    }


    play ? setPlay(false) : setPlay(true)
  }

  const playLoop = () => {
    if (!sound) return
    if (!loop) {
      clearInterval(timer)
      sound.loop = true
      /* sound.seek(rangeValue[0])
      sound.start() */

      setTimer(setInterval(() => {
        setSeconds(Math.round(Transport.seconds))

      }, Math.round(1000 / playbackSpeed)))

    } else {
      sound.loop = false

    }
    loop ? setLoop(false) : setLoop(true)
  }

  const fileSelect = (e) => {
    setFileName(e.target.files[0].name)
    let audioFile = URL.createObjectURL(e.target.files[0])

    setSound(new Player(audioFile).toDestination())
    let buffer = new Buffer(audioFile, () => {
      setDuration(buffer.duration)
      setRangeValue([0, buffer.duration])
    })

  }

  const seek = (e, newVal) => {
    if (!sound) return
    sound.seek(e.target.value, '+0')
    setSingleValue(newVal)
    Transport.seconds = newVal
    setPosition(formatTime(newVal))
  }

  const setLoopRange = (e, newVal) => {
    if (!sound) return
    setRangeValue(e.target.value)
    sound.loopStart = newVal[0]
    sound.loopEnd = newVal[1]

  }

  const styles = {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '250px',
    height: '350px',
    padding: '0 0 2em 0',
    borderRadius: '10px',
  }

  const stop = () => {
    setPlay(false)
    setLoop(false)
    sound.stop()
    Transport.stop()
    setSingleValue(0)
    setRangeValue([0, duration])
    setPosition(formatTime(0))
  }

  useEffect(() => {
    if (Math.round(seconds) === Math.round(duration)) { // is playback position at the end?
      clearInterval(timer)
      Transport.stop()
      setPlay(false)
    }
    setSingleValue(seconds)
    setPosition(formatTime(seconds))
    if (loop) {
      if (seconds >= rangeValue[1]) {
        Transport.seconds = rangeValue[0]
        sound.seek(rangeValue[0], '+0')
        setSingleValue(rangeValue[0])
        setPosition(formatTime(rangeValue[0]))
      }
      if (seconds <= rangeValue[0]) {
        Transport.seconds = rangeValue[0]
        sound.seek(rangeValue[0], '+0')
        setSingleValue(rangeValue[0])
        setPosition(formatTime(rangeValue[0]))
      }
    }
    console.log(seconds)

  }, [seconds])

  useEffect(() => {
    if (loop) {
      Transport.seconds = rangeValue[0]
      setSeconds(Math.round(Transport.seconds))
      setSingleValue(rangeValue[0])
    }

  }, [loop])

  useEffect (() => {
    clearInterval(timer)
    setInterval(()=>{
      setSeconds(Math.round(Transport.seconds))

    }, Math.round(1000 / playbackSpeed))

  }, [playbackSpeed])

  const changePlaybackSpeed = (e) => {
    let pbr = null
    // need to format value from slider to match valid pbr array values
    if (e.target.value === 1.0) { pbr = '1.0' } else {
      pbr = e.target.value.toString().padEnd(4, 0)
    }
    setPlaybackSpeed(pbr)
    if (!sound) return
    // set a delay for changing the playback speed otherwise results in too much lag/distortion
    setTimeout(() => {
      let pc = getpc(pbr)
      sound.playbackRate = pbr
      let pitch_shift = new PitchShift({ pitch: pc }).toDestination()
      sound.disconnect()
      sound.connect(pitch_shift)
    }, 2000)
  }


  return (
    <Box className='glass center' sx={styles}>

      <div className='time-display'>
        <p style={{fontSize:'.5em'}} className='display-text pixel'>{fileName}</p>
        <p style={{ fontSize: '1.2em' }} className='display-text pixel'>{position}</p>
        <p style={{fontSize:'.5em', position:'absolute', left:'32%', top:'24%'}}
         className='display-text pixel'>speed: {playbackSpeed}</p>

        {loop ? <div style={{position:'relative', bottom:'-15%',display:'flex', justifyContent:'space-around'}}>
          <p style={{fontSize: '.5em'}} className='display-text pixel'>{formatTime(rangeValue[0])}</p>
          <Loop style={{position:'absolute', top:'20%', fontSize:'.9em', color:'black'}} />
          <p style={{fontSize:'.5em'}} className='display-text pixel'>{formatTime(rangeValue[1])}</p>
        </div> : null}

      </div>

      <div>
        <Slider className='darken'
          sx={{
            color: 'lightgrey', '& .MuiSlider-thumb': { borderRadius: '1px', width: '.5em' },
            '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', fontStyle: 'italic' }
          }}
          value={singleValue}
          min={0}
          max={duration}
          onChange={seek}
          style={{ width: '70%', padding: '0em', marginBottom: '1em' }}
          defaultValue={0} getAriaLabel={() => 'Default'}
          valueLabelDisplay='off' valueLabelFormat={position} />

        <Slider
          onChange={setLoopRange}
          value={rangeValue}
          sx={{
            visibility: loop ? 'visible' : 'hidden', color: 'lightgrey', '& .MuiSlider-thumb': { borderRadius: '1px', width: '.2em' },
            '& .MuiSlider-rail': { backgroundColor: 'transparent' }, '& .MuiSlider-track': { color: 'lightgreen' },
            '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', top: '3.5em', fontStyle: 'italic' }
          }}
          style={{ width: '70%', padding: '0em', marginBottom: '2em' }}
          min={0}
          defaultValue={rangeValue}
          max={duration}
          getAriaLabel={() => 'Default'}
          valueLabelDisplay='off'
          valueLabelFormat={(text, index) => { return formatTime(text) }}
        />
      </div>

      <div>

        <Button style={{ color: 'lightgrey' }} component='label'><File />
        <input onChange={fileSelect} type='file' hidden accept='.mp3, .wav, .ogg, .aac, .m4a' /></Button>

        <Button sx={{ color: 'lightgrey', transform: 'scale(1.5)' }} onClick={playMode}>{play ? <Pause /> : <Play />}</Button>
        <Button onClick={stop} style={{ color: 'lightgrey' }} ><Stop /></Button>

        <Button
          sx={{ color: loop ? 'lightgreen' : 'lightgrey', position: 'absolute', left: '2em', bottom: '3em' }}
          onClick={playLoop}><Loop /></Button>



        <Slider
          sx={{
            '& .MuiSlider-thumb': { borderRadius: '1px', width: '.5em' },
            width: '100px', color: 'lightgrey', position: 'absolute', right: '20%', bottom: '12%',
            '& .MuiSlider-valueLabel': {
              backgroundColor: 'transparent', color: 'lightgrey',
               top:'1%',fontStyle: 'italic'
            }
          }}
          aria-label="Custom marks"
          defaultValue={1.0}
          step={0.05}
          max={1.0}
          min={.5}
          valueLabelDisplay="auto"
          marks={marks}
          onChange={changePlaybackSpeed}
        />
      </div>
    </Box>
  )
}

export default App
