'use client'

import React, { useState } from 'react'
import { motion } from "framer-motion";
import { useForm } from 'react-hook-form';
import { createSupportMessage } from '@/actions/support-messages-actions';
import LoadingSpinner from './ui/LoadingSpinner';
import MessageAlert from './ui/messageAlert';
import { messageTypeEnum } from '@/types';
import Image from 'next/image';

type SupportData = {
  fullname: string;
  email: string;
  subject: string;
  message: string;
}

// Animation variants
const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

export default function Testimonial() {

    const { register, resetField, control, handleSubmit, formState: { errors } } = useForm<SupportData>();
    const [isLoading, setIsLoading] = useState(false)
    const [showMessage, setShowMessage] = useState<boolean>(false)
    const sendMessage = async (data: SupportData) => {
        try {
            setIsLoading(true)
            await createSupportMessage(data);
            setShowMessage(true)
            setIsLoading(false)
            resetField('fullname')
            resetField('email')
            resetField('subject')
            resetField('message')
        } catch (error) {
            alert('Error sending support message')
            setIsLoading(false)
        }
    }

  const notification = {
    type: messageTypeEnum.SUCCESS,
    text: 'Message sucessfully sent!!'
  }

  return (
    <div className="overflow-x-hidden">
      <motion.div 
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Innovative Teams
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Join hundreds of companies transforming their operations with AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={cardVariants}>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-600 mb-4">
                  “Cellilox transformed our data workflows—cutting entry time by over 80% and delivering flawless accuracy on every file.”
                — Michael Lee, CTO, FinServe Solutions
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mr-4"></div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">COO, RetailTech Inc</div>
                  </div>
                </div>
              </div>
            </motion.div>

             <motion.div variants={cardVariants}>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-600 mb-4">
                  “Since integrating Cellilox, our team has reclaimed countless hours from manual tasks, boosting overall productivity by 50%.”
                  — Priya Singh, Operations Manager, HealthWave Corp.
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mr-4"></div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">COO, RetailTech Inc</div>
                  </div>
                </div>
              </div>
            </motion.div>

             <motion.div variants={cardVariants}>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-600 mb-4">
                  “Cellilox was a game‑changer: we eliminated human error entirely and accelerated our month‑end reporting cycle from days to hours.”
                  — Javier Morales, Director of Analytics, EcoTrade Global
                  </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 mr-4"></div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-gray-500">COO, RetailTech Inc</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Pricing Section with Animation */}
      <motion.div 
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 bg-gray-100"
      >
        {/* ... Existing Pricing Cards with motion.div wrappers ... */}
        <motion.div variants={cardVariants}>
          {/* Pricing Card Content */}
        </motion.div>
      </motion.div>

      {/* Contact Section */}
      <div className="py-16 bg-blue-50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: '-100%' }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Headquarters</h3>
                    <p className="text-gray-600">Gasabo<br/>Kigali, Rwanda</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Contact</h3>
                    <p className="text-gray-600">
                      Email: <a href="mailto:hello@thewings.ai" className="text-blue-600">hello@support.cellilox.com</a><br/>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Hours</h3>
                    <p className="text-gray-600">
                      Mon-Fri: 9AM - 5PM PST<br/>
                      Sat-Sun: Closed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <form onSubmit={handleSubmit(sendMessage)}
              className="space-y-6"
              >
                {showMessage && <MessageAlert message={notification} onClose={()=> setShowMessage(false)}/>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                  type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="fullname"
                  {...register('fullname', { required: 'Fullname is required' })}
                  />
                  <p className="text-red-500 text-sm mt-3">{errors.fullname?.message} </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                  type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="email"
                  {...register('email', { required: 'Email is required' })}
                  />
                  <p className="text-red-500 text-sm mt-3">{errors.email?.message} </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                  type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  id="subject"
                  {...register('subject', { required: 'Subject is required' })}
                  />
                  <p className="text-red-500 text-sm mt-3">{errors.subject?.message} </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                  id="message"
                  {...register('message', { required: 'Message is required' })}
                  rows={4} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  </textarea>
                  <p className="text-red-500 text-sm mt-3">{errors.message?.message} </p>
                </div>
                <button type="submit" className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                 {isLoading && <LoadingSpinner className='mr-3'/>}
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}