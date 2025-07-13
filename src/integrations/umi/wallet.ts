import { updateUser, getCurrentUser } from '../../lib/appwrite';

export async function getUmiAccount(): Promise<string> {
  const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' });
  return account;
}
