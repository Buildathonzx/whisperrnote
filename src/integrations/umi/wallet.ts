import { updateUser, getCurrentUser } from '../../lib/appwrite';

export async function getUmiAccount(): Promise<string> {
  const [account] = await window.ethereum!.request({ method: 'eth_requestAccounts' });
  return account;
}

/**
 * Link the current user's Umi wallet address to their WhisperNote profile.
 */
export async function linkUmiWalletToProfile() {
  const walletAddress = await getUmiAccount();
  const user = await getCurrentUser();
  if (!user || !user.$id) throw new Error('User not authenticated');
  await updateUser(user.$id, { walletAddress });
  return walletAddress;
}
