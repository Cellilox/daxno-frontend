import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { auth, currentUser } from "@clerk/nextjs/server"
import Link from 'next/link'
import React from 'react'
import CurrentPlan from './CurrentPlan'

const Header = async () => {
  const authObj = await auth()
  const user = await currentUser()
  console.log('USER', user?.id)
  console.log('SessionId', authObj.sessionId)
  const userId = user?.id
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${await authObj.getToken()}`);
  if (authObj.sessionId) {
    headers.append('sessionId', authObj.sessionId);
  }
  const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions/transactions?t_ref=${userId}`
  const response = await fetch(url, {
    method: 'GET',
    headers: headers
  })
  const transactions = await response.json()
  console.log('RRRRES', transactions[0])


  return (
    <div className='p-4 flex justify-between'>
      <Link href="/">
        <div className="flex flex-col items-center group">
          {/* Top row: Icon + Company Name */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Wing Icon */}
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-blue-600 group-hover:text-blue-800 transition-colors duration-300"
              viewBox="0 0 64 64"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M32 2C18 2 8 12 8 26c0 10 6 20 16 24-4-6-2-13 4-17 5-3 12-2 16 2 4-4 11-5 16-2 6 4 8 11 4 17 10-4 16-14 16-24C56 12 46 2 32 2z" />
            </svg>
            {/* Company Name with gradient effect */}
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-800 group-hover:to-indigo-800 transition-colors duration-300">
              TheWings
            </h1>
          </div>
          {/* Decorative Tagline/Design Element */}
          <p className="hidden md:block text-xs tracking-widest text-blue-600 group-hover:text-blue-800 transition-colors duration-300">
            ___---__---___
          </p>
        </div>
      </Link>

      <div className='flex items-center'>
        <div className='mr-3'>
        <CurrentPlan currentTransaction={transactions[0]} headers={headers}/>
        </div>
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}
export default Header
