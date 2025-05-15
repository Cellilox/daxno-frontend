import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { currentUser } from "@clerk/nextjs/server"
import Link from 'next/link'
import React from 'react'
import CurrentPlan from './CurrentPlan'
import { getTransactions } from '@/actions/transaction-actions'
import Image from 'next/image'

const Header = async () => {
  const user = await currentUser()
  const userId = user?.id
  const transactions = await getTransactions()
  return (
    <div className='p-4 flex justify-between'>
      <div className='md:flex items-center'>
      {/* <Link href="/">
        <div className="flex flex-col items-center group">
          <div className="flex items-center space-x-2 md:space-x-3">
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-blue-600 group-hover:text-blue-800 transition-colors duration-300"
              viewBox="0 0 64 64"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M32 2C18 2 8 12 8 26c0 10 6 20 16 24-4-6-2-13 4-17 5-3 12-2 16 2 4-4 11-5 16-2 6 4 8 11 4 17 10-4 16-14 16-24C56 12 46 2 32 2z" />
            </svg>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-800 group-hover:to-indigo-800 transition-colors duration-300">
              TheWings
            </h1>
          </div>
          <p className="hidden md:block text-xs tracking-widest text-blue-600 group-hover:text-blue-800 transition-colors duration-300">
            ___---__---___
          </p>
        </div>
      </Link> */}
<Link href="/">
  {/* <div className="flex flex-col items-center group cursor-pointer">
    <div className="">
      <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-800 group-hover:to-blue-800 transition-colors duration-300">
        ||_cellilox.ai
      </h1>
    </div>
  </div> */}
   <Image
      src="/logo3.png"
      alt="My Image"
      width={80}
      height={60}
    />
</Link>
      {userId && <Link href='/dashboard' className='ml-7'>Dashboard</Link>}
      </div>


      <div className='md:flex md:items-center'>
        <div className='md:mr-3'>
        <SignedIn>
        <CurrentPlan transactions={transactions}/>
        </SignedIn>
        </div>
        <div className='text-right mt-3 md:mt-0'>
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
        <SignedIn>
          <UserButton/>
        </SignedIn>
        </div>
      </div>
    </div>
  )
}
export default Header
