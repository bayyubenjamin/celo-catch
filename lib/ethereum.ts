export interface MiniPayProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (args: any) => void) => void;
  removeListener: (eventName: string, handler: (args: any) => void) => void;
  isMiniPay?: boolean;
}

export function getMiniPayProvider(): MiniPayProvider | undefined {
  if (typeof window !== "undefined" && (window as any).ethereum?.isMiniPay) {
    return (window as any).ethereum;
  }
  return undefined;
}

export async function getMiniPayAddress(
  provider: MiniPayProvider
): Promise<string | undefined> {
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    return accounts?.[0];
  } catch (error) {
    console.error("Failed to get Minipay address", error);
    return undefined;
  }
}

export async function ensureExpectedChain(
  provider: MiniPayProvider,
  expectedChainId: number
): Promise<boolean> {
  try {
    const chainIdHex = await provider.request({ method: "eth_chainId" });
    const chainId = parseInt(chainIdHex, 16);
    return chainId === expectedChainId;
  } catch (error) {
    console.error("Failed to check chain ID", error);
    return false;
  }
}

export function injectMiniPayStyle(): void {
  // Pengecekan aman untuk shadowRoot agar tidak error TS2304 di Vercel
  if (typeof window !== "undefined" && "shadowRoot" in window) {
    // Modifikasi lingkungan MiniPay jika diperlukan
  }
}
