"use server";
import { currentUser } from "@clerk/nextjs/server";
export const loggedInUserId = async () => {
  const loggedInUser = await currentUser();
  if (!loggedInUser) {
    throw new Error ('No logged in user found')
  }
  return loggedInUser.id;
}

// export const loggedInUserEmail = async () => {
//     const loggedInUser = await currentUser();
//     if (!loggedInUser) {
//       throw new Error ('No logged in user found')
//     }
//     return loggedInUser.emailAddresses[0].emailAddress;
//   }