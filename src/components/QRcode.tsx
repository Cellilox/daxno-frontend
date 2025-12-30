'use client'
import React from 'react';
import {QRCodeSVG} from 'qrcode.react';

type ProductQRCodeProps = {
  projectUrl: string;
}
const ProductQRCode = ({projectUrl}: ProductQRCodeProps) => {
  return (
    <div>
      <QRCodeSVG value={projectUrl} height={200} width={200}/>
    </div>
  );
};

export default ProductQRCode;