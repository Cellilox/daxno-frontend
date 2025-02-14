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
                <p className="text-xs tracking-widest text-blue-600 group-hover:text-blue-800 transition-colors duration-300">
                    ___fe---tch__ing--___
                </p>
            </div>
        </>
    )
}