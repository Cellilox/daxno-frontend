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
            src="/logo.png"
            alt="Cellilox"
            width={64}
            height={64}
            priority
          />
        </Link>
        <div className="hidden md:block">
          {userId && <Link href='/dashboard' className='ml-7 p-4'>Dashboard</Link>}
          {userId && <Link href='/agents' className='ml-7 p-4'>Agents</Link>}
          <Link href='/#pricing' className='ml-7 p-4'>Pricing</Link>
          <Link href='/blogs' className='ml-7 p-4'>Blogs</Link>
          <Link href='/careers' className='ml-7 p-4'>Careers</Link>
        </div>
      </div>


      <div className='md:flex md:items-center'>
        <div className='md:mr-3'>
          <SignedIn>
            <CurrentPlan transactions={transactions} billingConfig={billingConfig} />
          </SignedIn>
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-right'>
            <SignedOut>
              <SignInButton mode="modal">
                <button data-testid="signin-button" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/auth/logout" />
            </SignedIn>
          </div>
          {/* Mobile nav — available to everyone (visitors get Home/Pricing/Blogs). */}
          <div className="md:hidden">
            <MobileMenu userId={userId} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default Header
