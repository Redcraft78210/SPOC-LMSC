import React, {useState} from 'react'
import './style/OnAir.css'
const OnAir = (props) => {
    const [isOnAir, setIsOnAir] = useState(false);
  return (
        <div className="temporary__storage_OnAir">
            <div className="card_OnAir">
                <div className="image_OnAir"></div>
                {/* <div className="image__overlay_OnAir"></div> */}
                <div className="content_OnAir">
                    <div className="content__text_OnAir">
                        {isOnAir ? (<span className="stream__title_OnAir">{props.title}</span>) : (<span className="stream__title_OnAir"></span>)}
                        <span className="categories_OnAir">
                            {isOnAir ? (<a className="categories__btn_OnAir" href="#">En ligne</a>) : (<a className="categories__btn_OnAir" href="#">Démarrer </a>)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default OnAir