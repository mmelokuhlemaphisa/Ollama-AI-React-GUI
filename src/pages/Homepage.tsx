import React from 'react'
import logo from '../assets/ai-model.jpg'

export default function Homepage() {
  return (
    <div>
      <div className='header'>
        <img src={logo} alt="MelChat" className="logo" />
        <h1>MelChat</h1>
      </div>
    </div>
  );
}
