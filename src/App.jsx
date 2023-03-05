import { useState, useEffect, useRef } from 'react'
import { Player, PitchShift, Buffer, Transport } from 'tone'
import { Button, Box, Slider } from '@mui/material'
import './App.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { default as Play } from '@mui/icons-material/PlayArrow'
import { default as Pause } from '@mui/icons-material/PauseCircleOutlineOutlined'
import { default as File } from '@mui/icons-material/AudioFile'
import { default as Stop } from '@mui/icons-material/Stop'
import { default as Loop } from '@mui/icons-material/Loop'
import { default as VolumeUp } from '@mui/icons-material/VolumeUp'
import { default as VolumeDown } from '@mui/icons-material/VolumeDown'

// valid playback rates and pitch correction values
const pb_rates = {
  '1.0': 0, '0.95': 1, '0.90': 2, '0.85': 3, '0.80': 4, '0.75': 5,
  '0.70': 6, '0.65': 7.5, '0.60': 9, '0.55': 10.5, '0.50': 12
}

const marks = [{ value: 1.0, }, { value: 0.95 }, { value: 0.90, }, { value: 0.85, }, { value: 0.80, }, { value: 0.75, },
{ value: 0.70, }, { value: 0.65, }, { value: 0.60, }, { value: 0.55, }, { value: 0.50, },];


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
  const [volume, setVolume] = useState(100)

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

  const volumeSlider = (e) => {
    setVolume(e.target.value)
    if (!sound) return
    sound.volume.value = (e.target.value - 100)

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

  }, [seconds])

  useEffect(() => {
    if (loop) {
      Transport.seconds = rangeValue[0]
      setSeconds(Math.round(Transport.seconds))
      setSingleValue(rangeValue[0])
    }

  }, [loop])

  useEffect(() => {
    clearInterval(timer)
    setInterval(() => {
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
  }

  const changePlaybackSpeedComitted = (e) => {
    
    if (!sound) return
      let pc = getpc(playbackSpeed)
      sound.playbackRate = playbackSpeed
      let pitch_shift = new PitchShift({ pitch: pc }).toDestination()
      sound.disconnect()
      sound.connect(pitch_shift)
    
  }


  return (
    <Box className='shell center' sx={styles}>

      <div className='time-display screen'>
        <p style={{ fontSize: '.5em' }} className='display-text pixel'>{fileName}</p>
        <p style={{ fontSize: '1.2em', position: 'absolute', left: '22.5%', top:'3%' }} className='display-text pixel'>{position}</p>
        

        <Slider
          sx={{
            color: 'lightgrey', height: '.1em', '& .MuiSlider-thumb': { borderRadius: '1px', width: '.25em', color: 'black', height: '.5em' },
            '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', fontStyle: 'italic' },
            '& .MuiSlider-rail': { color: 'black' }, '& .MuiSlider-track': { color: 'black' }
          }}
          value={singleValue}
          min={0}
          max={duration}
          onChange={seek}
          style={{ width: '70%', padding: '0em', position: 'absolute', left: '15%', top: '30%' }}
          defaultValue={0} getAriaLabel={() => 'Default'}
          valueLabelDisplay='off' valueLabelFormat={position} />

          { /* loop controls */}
        <Slider
          onChange={setLoopRange}
          value={rangeValue}
          sx={{
            visibility: loop ? 'visible' : 'hidden', color: 'lightgrey', '& .MuiSlider-thumb': { borderRadius: '1px', height: '.5em', width: '.2em', color: 'black' },
            '& .MuiSlider-rail': { backgroundColor: 'transparent', width: '.2em' }, '& .MuiSlider-track': { color: 'black', width: '.2em' },
            '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', top: '3.5em', fontStyle: 'italic' }
          }}
          style={{ height: '.01em', width: '70%', padding: '0em', top: '15%' }}
          min={0}
          defaultValue={rangeValue}
          max={duration}
          getAriaLabel={() => 'Default'}
          valueLabelDisplay='off'
          valueLabelFormat={(text, index) => { return formatTime(text) }}
        />
        <Button
          style={{zIndex:'1', color: loop ? 'black' : 'darkgrey', position: 'absolute', left: '34%', top: '38%', transform: 'scale(.7)' }}
          onClick={playLoop}><Loop />
        </Button>

        {loop ? <div style={{ position: 'relative', top: '15%', display: 'flex', justifyContent: 'space-around' }}>
          <p style={{ fontSize: '.5em' }} className='display-text pixel'>{formatTime(rangeValue[0])}</p>



          <p style={{ fontSize: '.5em' }} className='display-text pixel'>{formatTime(rangeValue[1])}</p>
        </div> : null}

      </div>
      <div>
      </div>

      <div>
          {/* play controls */}
        <div style={{width:'100%', height:'30px', display:'flex', justifyContent:'center', position:'absolute', left:'0%', top:'55%'}}>
          <Button sx={{width:'auto', height:'100%', color:'black'}} component='label'><File />
        <input onChange={fileSelect} type='file' hidden accept='.mp3, .wav, .ogg, .aac, .m4a' /></Button>
        <Button style={{  width:'auto', height:'100%', color:'black' }} onClick={playMode}><Play /></Button>
        <Button  onClick={stop} style={{ width:'auto', height:'100%', color:'black'}} ><Stop /></Button>
        </div>

        {/* volume controls */}
        <div style={{width:'175px', height:'30px', position:'absolute', right:'15%', bottom:'20%', display:'flex',
         flexDirection:'row', justifyContent:'space-around'}}>
          <VolumeDown sx={{transform:'scale(.7)'}} />
        <Slider
          sx={{borderRadius:'0px', width:'100px', height:'1px', position:'relative', bottom:'5%',
            color: 'black', '& .MuiSlider-thumb': { borderRadius: '1px', width:'5px', height:'10px' },
            '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', fontStyle: 'italic' }
          }}
          value={volume}
          min={0}
          max={100}
          onChange={volumeSlider}
          defaultValue={100} getAriaLabel={() => 'Default'}
          valueLabelDisplay='off' valueLabelFormat={position}/>
          <VolumeUp sx={{transform:'scale(.7)'}} />
          </div>
          
          { /* speed controls */}
          <div style={{width:'150px', display:'flex', justifyContent:'center', position:'absolute', bottom:'10%', left:'20%'}}>
          <p style={{ fontSize: '.5em', marginRight:'5px'}}
          className='display-text pixel'>Speed: {playbackSpeed}</p>
        <Slider
          sx={{borderRadius:'0px', '& .MuiSlider-mark':{backgroundColor:'transparent'},
            '& .MuiSlider-thumb': { borderRadius: '1px', width: '5px', height:'10px', color:'black' },
            width: '50px', height:'1px', color:'black'
          }}
          aria-label="Custom marks"
          defaultValue={1.0}
          step={0.05}
          max={1.0}
          min={.5}
          valueLabelDisplay="off"
          marks={marks}
          onChangeCommitted={changePlaybackSpeedComitted}
          onChange={changePlaybackSpeed}
        />
        </div>
      </div>
    </Box>
  )
}

export default App
