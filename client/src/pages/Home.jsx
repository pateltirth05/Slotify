import React from 'react'
import Navbard from '../components/Navbard'
import Footer from '../components/Footer'
import HowitWorks from '../components/HowitWorks'
import Hero from '../components/Hero'
import Featured from '../components/Featured'

const Home = () => {
  return (
    <>
    <Navbard/>
    <Hero/>
    <Featured/>
    <HowitWorks/>
    <Footer/>
    </>
  )
}

export default Home