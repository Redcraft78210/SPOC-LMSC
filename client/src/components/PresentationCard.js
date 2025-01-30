import React from 'react'
import './style/PresentationCard.css'

const PresentationCard = (props) => {
  return (
    <div className="card">
      <div className="card-overlay"></div>
      <div className="card-inner">{props.content}</div>
    </div>
  )
}

export default PresentationCard