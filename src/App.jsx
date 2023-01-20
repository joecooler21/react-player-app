import { useState } from 'react'
import { Player, PitchShift, Buffer } from 'tone'
import { Button, Box, ButtonGroup, Slider, TextField, Select, InputLabel, MenuItem, FormControl} from '@mui/material'
import './App.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { default as Play } from '@mui/icons-material/PlayCircleFilledWhiteOutlined'
import { default as Pause } from '@mui/icons-material/PauseCircleOutlineOutlined'
import { default as File } from '@mui/icons-material/AudioFileOutlined';
import { default as Stop } from '@mui/icons-material/StopCircleOutlined';

const pb_rates = [1.00, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50] // available playback rates

function App() {

  const [play, setPlay] = useState(false)
  const [fileName, setFileName] = useState('')
  const [sound, setSound] = useState(null)
  const [speed, setSpeed] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loop, setLoop] = useState({start:null, end:null})
  const [duration, setDuration] = useState(0)

  const getpc = (pbr) => { // get proper pitch correction for the specified playback rate

    if (pbr === 1.0) return 0
    if (pbr === 0.95) return 1
    if (pbr === 0.90) return 2
    if (pbr === 0.85) return 3
    if (pbr === 0.80) return 4
    if (pbr === 0.75) return 5
    if (pbr === 0.70) return 6
    if (pbr === 0.65) return 7.5
    if (pbr === 0.60) return 9
    if (pbr === 0.55) return 10.5
    if (pbr === 0.5) return 12

  }

  // play and stop
  const playMode = () => {

    if (!sound) return

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

    }

    if (play) {
      sound.stop()
    }


    play ? setPlay(false) : setPlay(true)
  }

  const setA = () => {
    if (!sound) return
    sound.loopStart = 5
    sound.loopEnd = 10
    sound.loop = true
    sound.start()
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

    if (!sound) return

    let pbr = e.target.value // new playback rate
    let pc = getpc(pbr)



    setPlaybackSpeed(pbr)


    sound.playbackRate = pbr
    let pitch_shift = new PitchShift({ pitch: pc }).toDestination()
    sound.disconnect()
    sound.connect(pitch_shift)


  }

  const sliderChange = (e) => {
    if (!sound) return
    sound.seek(e.target.value, '+0')
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '5em' }}>

      <div>
        
      </div>

      <div>
        <Slider onChange={sliderChange} min={0} max={duration} style={{ width: '24em' }} defaultValue={0} aria-label="Default" valueLabelDisplay="auto" />
      </div>

      <div>
        <ButtonGroup style={{ scale:'1.2', marginTop: '1em' }} variant="outlined" aria-label="outlined primary button group">
          <Button component='label'><File /><input onChange={fileSelect} type='file' hidden /></Button>
          <Button><Pause /></Button>
          <Button onClick={playMode}>{play ? <Stop /> : <Play />}</Button>
          <Button onClick={setA}>A</Button>
          <Button>B</Button>

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Speed</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={playbackSpeed}
              label="Speed"
              onChange={inputChange}
              placeholder='1'
              defaultValue='1'
            >
              {pb_rates.map(e => { return <MenuItem key={e} value={e}>{e.toString()}</MenuItem> })}
            </Select>
          </FormControl>



        </ButtonGroup>
      </div>



    </div>
  )
}

export default App
