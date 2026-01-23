import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { auth } from "@clerk/nextjs/server"
import Link from 'next/link'
import React from 'react'
import CurrentPlan from './CurrentPlan'
import { getTransactions } from '@/actions/transaction-actions'
import { getBillingConfig } from '@/actions/settings-actions'
import Image from 'next/image'
import MobileMenu from './MobileMenu'
import { getSafeUrl } from '@/lib/api-utils'

const Header = async () => {
  let userId = null;
  try {
    const authObj = await auth();
    userId = authObj.userId;
  } catch (error) {
    console.error('[Header] Clerk auth() failed:', error);
  }

  // Fetch these only if we have a user to avoid redundant failing requests
  const transactions = userId ? await getTransactions() : [];
  const billingConfig = userId ? await getBillingConfig() : null;
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
              <CurrentPlan transactions={transactions} billingConfig={billingConfig} />
              <div className="md:hidden -mt-2 ml-3">
                <MobileMenu userId={userId!} />
              </div>
            </div>
          </SignedIn>
        </div>
        <div className='text-right'>
          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl={getSafeUrl(process.env.NEXT_PUBLIC_ONYX_URL || '/api/proxy/onyx', `/auth/logout-bridge?next=${process.env.NEXT_PUBLIC_CLIENT_URL}`)} />
          </SignedIn>
        </div>
      </div>
    </div>
  )
}
export default Header
