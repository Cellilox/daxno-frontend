import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import React from 'react'

const Header = () => {
  return (
    <div className='p-4 flex justify-between'>
      <div>
      <h1>TheWings AI</h1>
      </div>
      <SignedOut>
            <SignInButton mode="modal"/>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
    </div>
  )
}

export default Header
