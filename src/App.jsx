import { useState, useEffect, useRef } from 'react'
import { Transport, Time } from 'tone'
import { Box } from '@mui/material'
import Marquee from './components/Marquee.jsx'
import Volume from './components/Volume.jsx'
import Loop from './components/Loop.jsx'
import LoadPlayStop from './components/LoadPlayStop.jsx'
import Seek from './components/Seek.jsx'
import Speed from './components/Speed.jsx'
import ToggleLight from './components/ToggleLight.jsx'
import './App.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

// valid playback rates and pitch correction values
const pb_rates = {
  '1.0': 0, '0.95': 1, '0.90': 2, '0.85': 3, '0.80': 4, '0.75': 5,
  '0.70': 6, '0.65': 7.5, '0.60': 9, '0.55': 10.5, '0.50': 12
}

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
  const [seconds, setSeconds] = useState(0)
  const [light, setLight] = useState(false)
  const [globalTimer, setGlobalTimer] = useState(null)

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
  
  useEffect(() => {
    if (!sound) return
    if (Math.round(seconds) === Math.round(duration) && !loop) { // is playback position at the end?
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
    if (!sound) return
    
    Transport.clear(globalTimer)
    setGlobalTimer(Transport.scheduleRepeat(() => {
      setSeconds(Math.round(Transport.seconds))
    }, '1s'))

  }, [playbackSpeed])

  useEffect(() => {
    if (!sound) return
    if (singleValue >= duration) {
      setPlay(false)
      sound.stop()
      Transport.stop()
    }
  }, [singleValue])

  const styles = {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 0 2em 0',
  }
  
  return (
    <Box className='shell center' sx={styles}>

      <div style={{ background: light ? 'linear-gradient(135deg, #00dbf6, #00dbf6)' : 'linear-gradient(135deg, #D6D5D0, #A5A59B)' }}
       className='time-display screen'>
        <Marquee sound={sound} fileName={fileName} />

        <Seek sound={sound} setSingleValue={setSingleValue} setPosition={setPosition} position={position}
         singleValue={singleValue} duration={duration} formatTime={formatTime} globalTimer={globalTimer}
         setGlobalTimer={setGlobalTimer} setSeconds={setSeconds} />
      
        <Loop sound={sound} loop={loop} setLoop={setLoop} rangeValue={rangeValue}
         setRangeValue={setRangeValue} formatTime={formatTime} duration={duration} setSeconds={setSeconds}
         singleValue={singleValue} setPosition={setPosition} setGlobalTimer={setGlobalTimer} globalTimer={globalTimer}
         playbackSpeed={playbackSpeed} />

      </div>

     
        <LoadPlayStop sound={sound} setFileName={setFileName} setSound={setSound} duration={duration} setDuration={setDuration} setRangeValue={setRangeValue}
     play={play} playbackSpeed={playbackSpeed} getpc={getpc} setSeconds={setSeconds} setPlay={setPlay} setSingleValue={setSingleValue}
      setLoop={setLoop} formatTime={formatTime} setPosition={setPosition} singleValue={singleValue} globalTimer={globalTimer} setGlobalTimer={setGlobalTimer} />

        <Volume sound={sound} position={position}/>

        <Speed sound={sound} getpc={getpc}  setPlaybackSpeed={setPlaybackSpeed} playbackSpeed={playbackSpeed}
         setSpeedValue={setSpeedValue} speedValue={speedValue} />

        <ToggleLight light={light} setLight={setLight} />
        
        </Box>
  )
}

export default App
