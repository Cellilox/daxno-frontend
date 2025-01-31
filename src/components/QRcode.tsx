'use client'
import React from 'react';
import {QRCodeSVG} from 'qrcode.react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const ProductQRCode = () => {
  const router = useRouter()
  const path = usePathname()
  console.log('PATH',path)
//   const productId = "12345";
//   const ownerId = "67890";

//   // Prepare the data to encode
//   const qrData = JSON.stringify({ productId, ownerId });
  const qrData = `http://localhost:3000/${path}`

  return (
    <div>
      <QRCodeSVG value={qrData} height={300} width={300}/>
    </div>
  );
};

export default ProductQRCode;