import React from 'react'
import './style/ClassicButton.css'
const ClassicButton = (props) => {
  return (
    <div>
        <button className='c_button'>{props.name}</button>
    </div>
  )
}

export default ClassicButton