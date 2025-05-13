'use client'
import React from 'react';
import {QRCodeSVG} from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const ProductQRCode = () => {
  const router = useRouter()
  const path = usePathname()
  const qrData = `${process.env.NEXT_PUBLIC_CLIENT_URL}/${path}`

  return (
    <div>
      <QRCodeSVG value={qrData} height={300} width={300}/>
    </div>
  );
};

export default ProductQRCode;