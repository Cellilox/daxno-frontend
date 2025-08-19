// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic";

// export async function POST(req: Request) {
//   try {
//     const { password } = await req.json();
//     const TEMP_PASSWORD = process.env.TEMP_ACCESS_PASSWORD;

//     if (!TEMP_PASSWORD) {
//       return NextResponse.json(
//         { success: false, error: "Server configuration error" },
//         { status: 500 }
//       );
//     }

//     if (password === TEMP_PASSWORD) {
//       const response = NextResponse.json({ success: true });
//       response.cookies.set({
//         name: "temp-access",
//         value: TEMP_PASSWORD,
//         path: "/",
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 60 * 60 * 24 * 7, // 1 week
//       });
//       return response;
//     }

//     return NextResponse.json(
//       { success: false, error: "Invalid password" },
//       { status: 401 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, error: "Invalid request" },
//       { status: 400 }
//     );
//   }
// }