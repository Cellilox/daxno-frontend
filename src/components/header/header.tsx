import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { currentUser } from "@clerk/nextjs/server"
import Link from 'next/link'
import React from 'react'
import CurrentPlan from './CurrentPlan'
import { getTransactions } from '@/actions/transaction-actions'
import Image from 'next/image'
import MobileMenu from './MobileMenu'

const Header = async () => {
  const user = await currentUser()
  const userId = user?.id
  const transactions = await getTransactions()
  return (
    <div className='p-4 flex justify-between'>
      <div className='md:flex items-center'>
        <Link href="/">
          <Image
            src="/modified-logo.svg"
            alt="My Image"
            width={80}
            height={60}
          />
        </Link>
        <div className="hidden md:block">
          {userId && <Link href='/dashboard' className='ml-7 p-4'>Dashboard</Link>}
          {userId && <Link href='/projects' className='ml-7 p-4'>Projects</Link>}
        </div>
      </div>


      <div className='md:flex md:items-center'>
        <div className='md:mr-3'>
          <SignedIn>
            <div className='flex justify-between'>
              <CurrentPlan transactions={transactions} />
              <div className="md:hidden -mt-2 ml-3">
                <MobileMenu userId={userId!}/>
              </div>
            </div>
          </SignedIn>
        </div>
        <div className='text-right'>
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </div>
  )
}
export default Header
