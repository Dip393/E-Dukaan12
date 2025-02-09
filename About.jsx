import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
      <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16 '>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo nulla aut veritatis esse numquam ratione culpa! Optio ea placeat modi quo vitae, ipsa maiores odit numquam ad tenetur explicabo, laboriosam sunt? Provident quod consectetur eum saepe repudiandae accusantium sunt commodi cupiditate corrupti repellat, sapiente consequuntur, nisi numquam? Magnam, quod nulla.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iure, odit quas porro soluta ipsum reiciendis unde sapiente dolore dicta praesentium magnam consequatur! Vel optio consequuntur sit quis ea numquam dolores!</p>
          <b className='text-gray-800'>Our Mission</b>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea et voluptates deleniti blanditiis deserunt temporibus quasi delectus ratione facere. Deserunt!</p>
        </div>
      </div>
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
        <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Quality Assurance</b>
            <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, deleniti totam id magnam optio sapiente.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Convenience</b>
            <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, deleniti totam id magnam optio sapiente.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Exceptional Customer Services</b>
            <p className='text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, deleniti totam id magnam optio sapiente.</p>
          </div>
        </div>
      </div>
      <NewsletterBox/>
    </div>
    
  )
}

export default About
