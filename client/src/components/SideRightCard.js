import React from 'react'
import './style/SideRightCard.css'

const SideRightCard = (props) => {
  return (
    <div>
        <div className="cardR">
            <div className="card-overlayR"></div>
            <div className="card-innerR">{props.content}</div>
        </div>
    </div>
  )
}

export default SideRightCard