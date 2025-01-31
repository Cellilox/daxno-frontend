'use client';
import React from 'react';
import Link from 'next/link';

type Project = {
  id: number;
  name: string;
  owner: string;
};

export default function Card({ project }: { project: Project }) {
  return (
    <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden">
      <Link href={`/projects/${project.id}`} key={project.id}>
        <div className="p-4 cursor-pointer">
          <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{project.name}</h3>
          <p className="text-sm text-gray-600">Owner: {project.owner}</p>
        </div>
      </Link>
    </div>
  );
}
