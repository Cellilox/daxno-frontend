// import React, { useState, useEffect } from 'react';

// const GmailStatus = () => {
//   const [status, setStatus] = useState({
//     is_connected: false,
//     email: null,
//     watching: false
//   });

//   const checkStatus = async () => {
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gmail/status`);
//       const data = await response.json();
//       console.log('DATA', data)
//       setStatus(data);
//     } catch (error) {
//       console.error('Failed to check Gmail status:', error);
//     }
//   };

//   // Check status on component mount and every 30 seconds
//   useEffect(() => {
//     checkStatus();
//     const interval = setInterval(checkStatus, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="gmail-status">
//       <h3>Gmail Connection Status</h3>
//       {status.is_connected ? (
//         <div>
//           <p>✅ Connected to Gmail</p>
//           <p>Email: {status.email}</p>
//           <p>{status.watching ? '👀 Watching for new emails' : 'Not watching'}</p>
//         </div>
//       ) : (
//         <div>
//           <p>❌ Not connected to Gmail</p>
//           <button onClick={() => window.location.href = '/gmail/connect'}>
//             Connect Gmail
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default GmailStatus;