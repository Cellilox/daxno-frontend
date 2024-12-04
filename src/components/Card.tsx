'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

type Project = {
    id: number,
    name: string,
    owner: string
  }

export default function Card({project}: any ) {
    console.log('Card rendered')
  return (
    <div className='bg-white w-full text-black p-3 rounded mt-3 flex justify-center items-center'>
      <Link href={`/projects/${project.id}`} key={project.id}>
        <p>{project.name}</p>
    </Link>
    </div>
  )
}
