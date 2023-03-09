import React from 'react'
import { Button } from '@mui/material'

import { default as PlayIcon } from '@mui/icons-material/PlayArrow'
import { default as Pause } from '@mui/icons-material/Pause'
import { default as File } from '@mui/icons-material/AudioFile'
import { default as Stop } from '@mui/icons-material/Stop'

import { Player, PitchShift, Buffer, Transport } from 'tone'


const LoadPlayStop = ({ sound, setFileName, setSound, duration, setDuration, setRangeValue,
  play, playbackSpeed, getpc, setSeconds, setPlay, singleValue, setSingleValue, setLoop, setPosition, formatTime }) => {

  const fileSelect = (e) => {
    setFileName(e.target.files[0].name)
    let audioFile = URL.createObjectURL(e.target.files[0])

    setSound(new Player(audioFile).toDestination())
    let buffer = new Buffer(audioFile, () => {
      setDuration(buffer.duration)
      setRangeValue([0, buffer.duration])
    })

  }

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
      Transport.scheduleRepeat(() => {
        setSeconds(Math.round(Transport.seconds))

      }, '1s')

    }
    if (play) {
      Transport.pause()
      sound.stop()
    }


    play ? setPlay(false) : setPlay(true)
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

  return (

    <div style={{
      width: '100%', height: '30px', display: 'flex', justifyContent: 'center',
      position: 'absolute', left: '0px', top: '45%'
    }}>

      <Button sx={{ width: 'fit-content', height: 'fit-content', color: 'black', position: 'relative', top: '20%' }}
        component='label'><File sx={{ fontSize: '3em' }} />
        <input onChange={fileSelect} type='file' hidden accept='.mp3, .wav, .ogg, .aac, .m4a' /></Button>

      <Button style={{ width: 'fit-content', height: 'fit-content', color: 'black' }} onClick={playMode}>{play ? <Pause sx={{ fontSize: '4em' }} /> :
        <PlayIcon sx={{ fontSize: '4em' }} />}</Button>

      <Button onClick={stop} style={{ width: 'fit-content', height: 'fit-content', color: 'black' }} ><Stop sx={{ fontSize: '4em' }} /></Button>
    </div>

  )
}

export default LoadPlayStop
