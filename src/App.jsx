import { useState } from 'react'
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
const pb_rates = { '1.0': 0, '0.95': 1, '0.90': 2, '0.85': 3, '0.80': 4, '0.75': 5, '0.70': 6, '0.65': 7.5, '.60': 9, '0.55': 10.5, '0.50': 12 }

function App() {

  const [play, setPlay] = useState(false)
  const [fileName, setFileName] = useState('No File Loaded')
  const [sound, setSound] = useState(null)
  const [speed, setSpeed] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [loop, setLoop] = useState({ start: null, end: null })
  const [duration, setDuration] = useState(0)
  const [rangeValue, setRangeValue] = useState([0, 0])
  const [singleValue, setSingleValue] = useState(0)
  const [loopMode, setLoopMode] = useState('false')
  const [position, setPosition] = useState('0')

  const getpc = (pbr) => { // get proper pitch correction for the specified playback rate

    return pb_rates[pbr.toString()]

  }

  // play and stop
  const playMode = () => {

    if (!sound) return

    let timer = null

    if (!play) {
      const playback_rate = playbackSpeed
      const transpose_by = 0
      var pitch_shift = null

      // set playback rate
      sound.playbackRate = playback_rate
      sound.toDestination();


      // set pitch shift
      if (playback_rate == 1) {
        pitch_shift = new PitchShift({
          pitch: transpose_by.toString()
        }).toDestination();
      } else {
        let trans = transpose_by
        trans = trans.toString()
        pitch_shift = new PitchShift({
          pitch: trans
        }).toDestination();
      }
      sound.disconnect();
      sound.connect(pitch_shift);

      sound.start()
      Transport.start()
      timer = setInterval(() => {
        let seconds = Transport.seconds // get current playback position

        if (Math.round(seconds) === Math.round(duration)) { // is playback position at the end?
          clearInterval(timer) // kill timer
        }

        setSingleValue(Math.round(seconds)) // move slider in accordance with current playback position
      }, 1000)

    }

    if (play) {
      sound.stop()
      Transport.stop()
      clearInterval(timer)
    }


    play ? setPlay(false) : setPlay(true)
  }

  const playLoop = () => {
    loopMode ? setLoopMode(false) : setLoopMode(true)
    /* if (!sound) return
    sound.loopStart = value[0]
    sound.loopEnd = value[1]
    sound.loop = true
    sound.start()*/
  }

  const fileSelect = (e) => {
    setFileName(e.target.files[0].name)
    let audioFile = URL.createObjectURL(e.target.files[0])

    setSound(new Player(audioFile).toDestination())
    let buffer = new Buffer(audioFile, () => {
      setDuration(buffer.duration)
    })

  }

  const inputChange = (e) => {
    let pbr = e.target.value // new playback rate

    if (!sound) return

    let pc = getpc(pbr)

    sound.playbackRate = pbr
    let pitch_shift = new PitchShift({ pitch: pc }).toDestination()
    sound.disconnect()
    sound.connect(pitch_shift)
    setPlaybackSpeed(e.target.value)


  }

  const sliderChange = (e, newVal) => {
    if (!sound) return
    sound.seek(loopMode ? e.target.value : e.target.value[0], '+0')
    loopMode ? setSingleValue(newVal) : setRangeValue(newVal)
    Transport.seconds = newVal
  }

  const styles = {
    position: 'absolute',
    left: '30%',
    top: '30%',
    border: '1px lightgrey solid',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '40%',
    height: 'fit-content',
    padding: '0 0 2em 0',
    borderRadius: '10px',
    overflow: 'hidden',
  }


  return (
    <Box sx={styles}>

      <div style={{ borderBottom: '1px lightgrey solid' }}>
        <h2 style={{ fontFamily: 'roboto', fontWeight: '400' }}>{fileName}</h2>
        <h1 style={{ fontWeight: '400' }}>{position}</h1>

      </div>

      <div>
        <Slider sx={{
    width: 300,
    color: 'success.primary',
    '& .MuiSlider-thumb': {
      borderRadius: '1px',
      width:'.5em'
    },
  }} value={loopMode ? singleValue : rangeValue} min={0} max={duration} onChange={sliderChange}
          style={{ width: '90%', padding: '0em', marginBottom: '1em' }} defaultValue={0} getAriaLabel={() => 'Default'} valueLabelDisplay="auto" />
      </div>

      <div>
        <ButtonGroup style={{ paddingTop: '1.5em', scale: '1.3', width: '45%' }} variant="outlined" aria-label="outlined primary button group">
          <Button component='label'><File /><input onChange={fileSelect} type='file' hidden /></Button>
          <Button><Pause /></Button>
          <Button onClick={playMode}>{play ? <Stop /> : <Play />}</Button>
          <Button style={{ backgroundColor: loopMode ? 'white' : '#1976d2', color: loopMode ? '#1976d2' : 'white' }} onClick={playLoop}><Loop /></Button>

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Speed</InputLabel>
            <Select style={{ height: '45px', width: 'fit-content' }}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={playbackSpeed}
              label="Speed"
              onChange={inputChange}
              placeholder='1'
              defaultValue='1'
            >
              {Object.keys(pb_rates).map(e => { return <MenuItem key={e.toString()} value={e.toString()}>{e.toString()}</MenuItem> })}
            </Select>
          </FormControl>
          </ButtonGroup>
      </div>
      </Box>
  )
}

export default App
