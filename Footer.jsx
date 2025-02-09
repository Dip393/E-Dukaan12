import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='bg-gray-100 p-5 mt-40'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 text-sm'>
            <div>
                <img src={assets.logo} className='mb-5 w-32' alt="" />
                <p className='w-full md:w-2/3 text-gray-600 text-justify '>
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Exercitationem fugiat numquam saepe facilis laudantium nam at perferendis sed a eos, quisquam illum aperiam commodi modi dolores tempore, voluptatum natus nisi veritatis necessitatibus deleniti minima quidem? Distinctio vero esse doloribus saepe.
                </p>
            </div>
            <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-1 text-gary-600'>
                    <li>Home</li>
                    <li>About Us</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                </ul>
            </div>
            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-1 text-gary-600'>
                    <li>+91 7384950612</li>
                    <li>contact@edukaan.com</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className='mt-5 text-sm text-center'>Copyright 2024@ edukaan.com - All Right Reserved</p>
    </div>
  )
}

export default Footer
