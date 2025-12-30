"use server"

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getTransactions() {
   try {
      const response = await fetchAuthed(`${apiUrl}/transactions`)
      if (!response.ok) {
         console.error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
         return [];
      }
      return await response.json();
   } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
   }
}

export async function deleteTransaction(transaction_id: number) {
   try {
      const response = await fetchAuthedJson(`${apiUrl}/transactions?t_id=${transaction_id}`, {
         method: 'DELETE'
      });

      if (!response.ok) {
         throw new Error('Failed to delete a transanction');
      }
   } catch (error) {
      console.log('Error', error)
   }
}

