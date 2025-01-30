import React from 'react'
import './style/NotificationCard.css'

const NotificationCard = (props) => {
  return (
        <div className="cardR">
            <div className="card-overlayR"></div>
            <div className="card-innerR">{props.content}</div>
        </div>
  )
}

export default NotificationCard