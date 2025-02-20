import Pricing from "@/components/Pricing";
import { auth, currentUser } from "@clerk/nextjs/server"
export default async function Demo() {
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
    <div className="min-h-screen bg-gray-50">
      {/* ... Previous Sections (Navigation, Hero, Features) ... */}

      {/* Interactive Demo Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See It in Action
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch how TheWings AI transforms document processing in 90 seconds
            </p>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video bg-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/6XwSZ9x6ZRQ?si=Ly71GTA0yQhHnA2u"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>

          {/* Demo Features List */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center p-6">
              <div className="text-blue-600 text-2xl mb-2">1.</div>
              <h3 className="font-semibold mb-2">Define Your Template</h3>
              <p className="text-gray-600">Set up custom fields in minutes</p>
            </div>
            <div className="text-center p-6">
              <div className="text-blue-600 text-2xl mb-2">2.</div>
              <h3 className="font-semibold mb-2">Capture Documents</h3>
              <p className="text-gray-600">Scan or upload any file type</p>
            </div>
            <div className="text-center p-6">
              <div className="text-blue-600 text-2xl mb-2">3.</div>
              <h3 className="font-semibold mb-2">Watch Magic Happen</h3>
              <p className="text-gray-600">Real-time data extraction & sync</p>
            </div>
          </div>
        </div>
      </div>

       <Pricing headers={headers} userId = {userId}/>
    </div>
  );
}
