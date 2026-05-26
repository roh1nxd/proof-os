"use client";

import { useCallback, useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { getAddress, isAddress } from "viem";

import { apiFetch } from "@/lib/api/client-fetch";

export type SystemStatus = {
  service?: string;
  version?: string;
  config?: {
    sessionConfigured?: boolean;
    sessionHint?: string;
    arkivWriterConfigured?: boolean;
    relayerAddress?: string | null;
  };
  arkiv: {
    role: string;
    network: string;
    chainId: number;
    explorer: string | null;
    rpc?: string;
    docs?: string;
    writerConfigured: boolean;
    writerNote: string;
  };
  publicApi: { baseUrl: string; docs: string; openApi: string };
};

export function useProofosAuth() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  const refreshSession = useCallback(async () => {
    const res = await apiFetch<{ authenticated: boolean; wallet: string | null }>(
      "/api/auth/me",
    );
    if (res.ok && res.data.authenticated && res.data.wallet) {
      setWallet(res.data.wallet);
    } else {
      setWallet(null);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    const [statusRes, healthRes] = await Promise.all([
      apiFetch<SystemStatus>("/api/status"),
      apiFetch<{
        ready: boolean;
        issues: string[];
        relayerAddress: string | null;
        arkivWriter: boolean;
        session: boolean;
      }>("/api/health"),
    ]);
    if (statusRes.ok) {
      const data = statusRes.data;
      if (healthRes.ok) {
        data.config = {
          ...data.config,
          sessionConfigured: healthRes.data.session,
          arkivWriterConfigured: healthRes.data.arkivWriter,
          relayerAddress: healthRes.data.relayerAddress,
        };
        if (healthRes.data.ready) {
          data.arkiv.writerConfigured = true;
          data.arkiv.writerNote = "Ready — saves will write to Arkiv Braga";
        } else if (healthRes.data.issues?.length) {
          data.arkiv.writerNote = healthRes.data.issues.join(" · ");
          data.arkiv.writerConfigured = healthRes.data.arkivWriter;
        }
      }
      setStatus(data);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await Promise.all([refreshSession(), loadStatus()]);
      setLoading(false);
    })();
  }, [refreshSession, loadStatus]);

  const connect = useCallback(async () => {
    setError(null);
    setConnecting(true);

    try {
      const ethereum = window.ethereum;
      if (!ethereum) {
        setError("Install MetaMask, Rabby, or another Web3 wallet.");
        return null;
      }

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const address = accounts[0];
      if (!address || !isAddress(address)) {
        setError("No valid wallet address returned.");
        return null;
      }

      const checksumAddress = getAddress(address);
      const chainIdHex = (await ethereum.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);

      const nonceRes = await apiFetch<{ nonce: string }>("/api/auth/nonce");
      if (!nonceRes.ok) {
        setError(
          nonceRes.body.error ??
            nonceRes.body.hint ??
            "Session error — run npm run setup and restart the server.",
        );
        return null;
      }

      const siwe = new SiweMessage({
        domain: window.location.host,
        address: checksumAddress,
        statement: "Sign in to ProofOS",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce: nonceRes.data.nonce,
        issuedAt: new Date().toISOString(),
      });

      const prepared = siwe.prepareMessage();
      const signature = (await ethereum.request({
        method: "personal_sign",
        params: [prepared, checksumAddress],
      })) as string;

      const verifyRes = await apiFetch<{ wallet: string }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ message: prepared, signature }),
      });

      if (!verifyRes.ok) {
        setError(verifyRes.body.error ?? `Sign-in failed (${verifyRes.status})`);
        return null;
      }

      setWallet(verifyRes.data.wallet);
      setError(null);
      return verifyRes.data.wallet;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Wallet sign-in failed";
      if (msg.toLowerCase().includes("user rejected")) {
        setError("Signature rejected in wallet.");
      } else {
        setError(msg);
      }
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setWallet(null);
    setError(null);
  }, []);

  const canWrite = Boolean(status?.arkiv.writerConfigured);

  return {
    wallet,
    loading,
    connecting,
    error,
    status,
    canWrite,
    connect,
    disconnect,
    refreshSession,
    loadStatus,
    setError,
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}
