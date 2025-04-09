import React from 'react'
import './style/TraductionToggle.css'
const TraductionToggle = () => {
  return (
        <div className="checkbox-wrapper-8">
            <input type="checkbox" id="cb3-8" className="tgl tgl-skewed"/>
            <label htmlFor="cb3-8" data-tg-on="FR" data-tg-off="ENG" className="tgl-btn"></label>
        </div>
  )
}

export default TraductionToggle