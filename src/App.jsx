import { useState, useEffect, useRef } from 'react'
import { Player, PitchShift, Buffer, Transport } from 'tone'
import { Button, Box, Slider } from '@mui/material'
import './App.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { default as Play } from '@mui/icons-material/PlayArrow'
import { default as Pause } from '@mui/icons-material/Pause'
import { default as File } from '@mui/icons-material/AudioFile'
import { default as Stop } from '@mui/icons-material/Stop'
import { default as Loop } from '@mui/icons-material/Loop'
import { default as VolumeUp } from '@mui/icons-material/VolumeUp'
import { default as VolumeDown } from '@mui/icons-material/VolumeDown'
import { default as VolumeOff } from '@mui/icons-material/VolumeOff';
import { default as Light } from '@mui/icons-material/LightMode'
import { KeyboardReturnRounded } from '@mui/icons-material'

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
  const [speedValue, setSpeedValue] = useState(1.0)
  const [loop, setLoop] = useState(false)
  const [duration, setDuration] = useState(0)
  const [rangeValue, setRangeValue] = useState([0, 0])
  const [singleValue, setSingleValue] = useState(0)
  const [position, setPosition] = useState('00:00:00')
  const [timer, setTimer] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [volume, setVolume] = useState(0)
  const [prevVolume, setPrevVolume] = useState(0)
  const [light, setLight] = useState(false)
  const [mute, setMute] = useState(false)

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

  // play and pause
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



  const stop = () => {
    sound.stop()
    Transport.stop()
    setPlay(false)
    setLoop(false)
    setSingleValue(0)
    setRangeValue([0, duration])
    setPosition(formatTime(0))
  }

  useEffect(() => {
    if (Math.round(seconds) === Math.round(duration) && !loop) { // is playback position at the end?
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

  const toggleLight = () => {
    light ? setLight(false) : setLight(true)

  }

  const styles = {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 0 2em 0',
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

  const clickVolUp = () => {
    if (!sound) return
    sound.mute = false
    setMute(false)
    setVolume(0)
    sound.volume.value = 0
  }

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
    
  };

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
    <Box className='shell center' sx={styles}>

      <div style={{ background: light ? 'linear-gradient(135deg, #00dbf6, #00dbf6)' : 'linear-gradient(135deg, #D6D5D0, #A5A59B)' }} className='time-display screen'>
        <div className={sound ? 'marquee' : ''}><p style={{
          overflow: 'hidden', fontSize: '.9em', whiteSpace: 'nowrap', textAlign: 'center',
          marginLeft: '10px', marginRight: '10px'
        }} className='display-text pixel'>{fileName}</p></div>
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
          style={{ position: 'absolute', width: '70%', height: '10%', padding: '0em', top: '25%' }}
          defaultValue={0} getAriaLabel={() => 'Default'}
          valueLabelDisplay='off' valueLabelFormat={position} />

        { /* loop controls */}
        <Slider
          onChange={setLoopRange}
          value={rangeValue}
          sx={{
            visibility: loop ? 'visible' : 'hidden', color: 'lightgrey', '& .MuiSlider-thumb': { borderRadius: '1px', height: '.5em', width: '.5em', color: 'black' },
            '& .MuiSlider-rail': { backgroundColor: 'transparent' }, '& .MuiSlider-track': { color: 'black' },
            '& .MuiSlider-valueLabel': { backgroundColor: 'transparent', color: 'lightgrey', top: '3.5em', fontStyle: 'italic' }
          }}
          style={{ position: 'relative', width: '70%', padding: '0em', top: '28%' }}
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
          style={{ zIndex: '1', position: 'absolute', left: '37.5%', top: '43.5%' }}
          onClick={playLoop}><Loop className={loop ? 'rotate' : ''} sx={{ fontSize: '2.0em', color: 'black' }} />
        </Button>

        {loop ? <div style={{ position: 'relative', top: '27%', display: 'flex', justifyContent: 'space-around' }}>
          <p style={{ fontSize: '1em' }} className='display-text pixel'>{formatTime(rangeValue[0])}</p>
          <p style={{ fontSize: '1em' }} className='display-text pixel'>{formatTime(rangeValue[1])}</p>
        </div> : null}

      </div>
      <div>
      </div>

      <div>
        {/* play controls */}
        <div style={{ width: '100%', height: '30px', display: 'flex', justifyContent: 'center', position: 'absolute', left: '0px', top: '45%' }}>
          <Button sx={{ width: 'fit-content', height: 'fit-content', color: 'black', position: 'relative', top: '20%' }} component='label'><File sx={{ fontSize: '3em' }} />
            <input onChange={fileSelect} type='file' hidden accept='.mp3, .wav, .ogg, .aac, .m4a' /></Button>
          <Button style={{ width: 'fit-content', height: 'fit-content', color: 'black' }} onClick={playMode}>{play ? <Pause sx={{ fontSize: '4em' }} /> :
            <Play sx={{ fontSize: '4em' }} />}</Button>
          <Button onClick={stop} style={{ width: 'fit-content', height: 'fit-content', color: 'black' }} ><Stop sx={{ fontSize: '4em' }} /></Button>
        </div>

        {/* volume controls */}
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

        { /* speed controls */}
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

        <button onClick={toggleLight} className='center-button'><Light sx={{position:'relative', right:'3px', bottom:'-2px', fontSize:'3em'}} /></button>
      </div>
    </Box>
  )
}

export default App
