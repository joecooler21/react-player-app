import { useState, useEffect } from 'react'
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
import { default as Note } from '@mui/icons-material/MusicNote';

// valid playback rates and pitch correction values
const pb_rates = { '1.0': 0, '0.95': 1, '0.90': 2, '0.85': 3, '0.80': 4, '0.75': 5, '0.70': 6, '0.65': 7.5, '.60': 9, '0.55': 10.5, '0.50': 12 }

function App() {

  const [play, setPlay] = useState(false)
  const [fileName, setFileName] = useState('Isoloop - No File Loaded')
  const [sound, setSound] = useState(null)
  const [speed, setSpeed] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [loop, setLoop] = useState(false)
  const [duration, setDuration] = useState(0)
  const [rangeValue, setRangeValue] = useState([0, 0])
  const [singleValue, setSingleValue] = useState(0)
  const [position, setPosition] = useState('00:00:00')
  const [timer, setTimer] = useState(null)

  const defaultTextColor = '#3f50b5'

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

        let seconds = Transport.seconds // get current playback position

        if (Math.round(seconds) === Math.round(duration)) { // is playback position at the end?
          clearInterval(timer) // kill timer
          setPlay(false)
        }

        setSingleValue(Math.round(seconds))// move slider in accordance with current playback position
        setPosition(formatTime(seconds))
      }, 1000))

    }

    if (play) {
      sound.stop()
      Transport.stop()
      clearInterval(timer)
    }


    play ? setPlay(false) : setPlay(true)
  }

  const playLoop = () => {
    if (!sound) return
    if (!loop) {
      clearInterval(timer)
      sound.loop = true
      sound.seek(rangeValue[0])
      sound.start()
      
      setSingleValue(rangeValue[0])

      setTimer(setInterval(() =>{
        let seconds = Math.round(Transport.seconds)
        console.log(seconds)
        setSingleValue(seconds)
        setPosition(formatTime(seconds))

      }, 1000))

    } else {
      sound.loop = false

    }
    loop? setLoop(false) : setLoop(true)
  }

  const fileSelect = (e) => {
    setFileName('Isoloop - ' + e.target.files[0].name)
    let audioFile = URL.createObjectURL(e.target.files[0])

    setSound(new Player(audioFile).toDestination())
    let buffer = new Buffer(audioFile, () => {
      setDuration(buffer.duration)
      setRangeValue([0, buffer.duration])
    })

  }

  const inputChange = (e) => {
    let pbr = e.target.value // new playback rate
    setPlaybackSpeed(e.target.value)

    if (!sound) return

    let pc = getpc(pbr)
    sound.playbackRate = pbr
    let pitch_shift = new PitchShift({ pitch: pc }).toDestination()
    sound.disconnect()
    sound.connect(pitch_shift)

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
    position: 'absolute',
    left: '22.5%',
    top: '30%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '55%',
    height: 'fit-content',
    padding: '0 0 2em 0',
    borderRadius: '10px',
    overflow: 'hidden',
  }


  return (
    <Box className='glass' sx={styles}>

      <div style={{ border: 'none', marginBottom: '1em', fontStyle: 'italic' }}>
        <div className='text-shadow' style={{ padding: '.5em', fontSize: '1.1em', fontWeight: '100' }}>
          <Note sx={{ position: 'absolute', left: '0%', color: defaultTextColor }} />{fileName}</div>

        <hr style={{ opacity: '.5' }}></hr>
        <div className='time-display text-shadow'>{position}</div>

      </div>

      <div>
        <Slider className='darken'
         sx={{width: 300, color: 'success.primary','& .MuiSlider-thumb': { borderRadius: '1px', width: '.5em' },
         '& .MuiSlider-valueLabel': {backgroundColor:'transparent', color:'black', fontStyle:'italic'}}}
          value={singleValue}
          min={0}
          max={duration}
          onChange={seek}
          style={{ width: '90%', padding: '0em', marginBottom: '1em' }}
          defaultValue={0} getAriaLabel={() => 'Default'}
          valueLabelDisplay='auto' valueLabelFormat={position} />

        <Slider
        className='darken'
        onChange={setLoopRange}
        value={rangeValue}
          sx={{ width: 300, color: 'success.primary', '& .MuiSlider-thumb': { borderRadius: '1px', width: '.5em' },
           '& .MuiSlider-rail': {backgroundColor:'transparent'},
            '& .MuiSlider-valueLabel': {backgroundColor:'transparent', color:'black', top:'3.5em', fontStyle:'italic'}}}
          style={{ width: '90%', padding: '0em', marginBottom: '2em'}}
          min={0}
          defaultValue={rangeValue}
          max={duration}
          getAriaLabel={()=>'Default'}
          valueLabelDisplay='auto'
          valueLabelFormat={(text, index)=> {return formatTime(text)}}
          />
      </div>

      <div>

        <Button className='darken' component='label'><File /><input onChange={fileSelect} type='file' hidden /></Button>
        <Button className='darken'><Stop /></Button>
        <Button className='darken' onClick={playMode}>{play ? <Pause /> : <Play />}</Button>
        <Button className='darken'
          style={{ filter: loop ? 'brightness(100%)' : 'brightness(55%)', color: loop ? 'white':defaultTextColor}}
          onClick={playLoop}><Loop /></Button>


        <Select style={{ height: '40px', width: 'auto', background: 'white', margin: '1em', fontStyle: 'italic' }}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={playbackSpeed}
          onChange={inputChange}
          placeholder='1'
          defaultValue='1'
        >
          {Object.keys(pb_rates).map(e => { return <MenuItem style={{ fontStyle: 'italic' }} key={e.toString()} value={e.toString()}>{e.toString()}</MenuItem> })}
        </Select>


      </div>
    </Box>
  )
}

export default App
