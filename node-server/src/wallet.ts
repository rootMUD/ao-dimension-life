import path from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import Arweave from "arweave";
import { ethers } from "ethers";
import type { JWKInterface } from "arweave/node/lib/wallet";

export async function getARWallet():Promise<JWKInterface> {
  if (existsSync(path.resolve("./.aos-wallet.json"))) {
    return JSON.parse(
      readFileSync(path.resolve("./.aos-wallet.json"), "utf-8")
    );
  }
  const arweave = Arweave.init({});

  const wallet = await arweave.wallets.generate();
  writeFileSync(path.resolve("./.aos-wallet.json"), JSON.stringify(wallet));
  return wallet;
}
