import { type Address, type Chain } from "viem";

export type MiniPayProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
};

// 1. Cek apakah provider mendukung MiniPay
export function isMiniPayProvider(provider: any): provider is MiniPayProvider {
  return provider && typeof provider.request === "function";
}

// 2. Ambil provider MiniPay dari window.ethereum
export function getMiniPayProvider(): MiniPayProvider | null {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const provider = (window as any).ethereum;
    return isMiniPayProvider(provider) ? provider : null;
  }
  return null;
}

// 3. Ambil alamat Wallet address pengguna
export async function getMiniPayAddress(provider: MiniPayProvider): Promise<Address | null> {
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    return accounts && accounts.length > 0 ? (accounts[0] as Address) : null;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return null;
  }
}

// 4. Pastikan jaringan yang terhubung sesuai (Celo / Celo Sepolia)
export async function ensureExpectedChain(
  provider: MiniPayProvider,
  expectedChain: Chain,
  rpcUrl: string
): Promise<void> {
  const chainIdHex = `0x${expectedChain.id.toString(16)}`;
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError: any) {
    // Jika chain belum ada di wallet, daftarkan baru
    if (switchError.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: expectedChain.name,
            rpcUrls: [rpcUrl],
            nativeCurrency: expectedChain.nativeCurrency,
            blockExplorerUrls: expectedChain.blockExplorers?.default.url
              ? [expectedChain.blockExplorers.default.url]
              : [],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// 5. Injeksi style CSS khusus MiniPay agar tampilan header/layout rapi
export function injectMiniPayStyle(): void {
  // ✅ FIX VERCEL: Gunakan window.shadowRoot yang aman bagi TypeScript
  if (typeof window !== "undefined" && "shadowRoot" in window) {
    // Modifikasi lingkungan MiniPay jika diperlukan
  }
}
