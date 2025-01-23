import React from 'react'
import './style/StatForClasse.css'

const StatForClasse = (props) => {
  return (
    <div>
        <div className="card">
            <div className="card-overlay"></div>
            <div className="card-inner">{props.content}</div>
        </div>
    </div>
  )
}

export default StatForClasse