"use server"

import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

export async function getTransactions() {
   try {
      const url = buildApiUrl('/transactions/');
      const response = await fetchAuthed(url)
      if (!response.ok) {
         if (response.status !== 401) {
            console.error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
         }
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
      const url = buildApiUrl(`/transactions?t_id=${transaction_id}`);
      const response = await fetchAuthedJson(url, {
         method: 'DELETE'
      });

      if (!response.ok) {
         throw new Error('Failed to delete a transanction');
      }
   } catch (error) {
      console.log('Error', error)
   }
}

