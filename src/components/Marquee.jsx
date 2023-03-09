import React from 'react'

const Marquee = ({ sound, fileName }) => {
    return (

        <div className={sound ? 'marquee' : ''}><p style={{
            overflow: 'hidden', fontSize: '.9em', whiteSpace: 'nowrap', textAlign: 'center',
            marginLeft: '10px', marginRight: '10px'
        }} className='display-text pixel'>{fileName}</p></div>


    )
}

export default Marquee
