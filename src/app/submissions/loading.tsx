import { PageProgressBar } from '@/components/ui/ProgressBar'
import React from 'react'

export default function Loading() {
    return (
        // <div className='flex justify-center items-center'>
        //     <div className="loader"></div>
        // </div>
        <>
            <PageProgressBar />
            <div className='h-screen flex justify-center items-center'>
            </div>
        </>
    )
}