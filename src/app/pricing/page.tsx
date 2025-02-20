import Pricing from '@/components/Pricing'
import { auth, currentUser } from '@clerk/nextjs/server'
import React from 'react'

export default async function page() {
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
  return (
    <div>
      <Pricing headers={headers} userId={userId}/>
    </div>
  )
}
