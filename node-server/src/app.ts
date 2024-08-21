import express, { Request, Response } from "express";
import cors from "cors";
import Arweave from "arweave";
import { ethers } from "ethers";
import { dryrun, message, createDataItemSigner } from "@permaweb/aoconnect";
import crypto from "crypto";
import { KeyvFile } from "keyv-file";
import cron from "node-cron";
import { createData, DataItem } from "arseeding-arbundles";
import  InjectedEthereumSigner  from "arseeding-arbundles/src/signing/chains/injectedEthereumSigner";
import "dotenv/config";
import { getARWallet } from "./wallet";
import type { JWKInterface } from "arweave/node/lib/wallet";
import {
  InjectedEthereumSignerMinimalProvider,
  // InjectedEthereumSigner,
} from "./signer";

console.log("Hello from dimension Life!");
const useAR = process.env.USE_AR || true;
const key = process.env.API_KEY || "34e968837d573dc61e965e58fa29cc05";
const AO_PET =
  process.env.AO_PET || "cO4thcoxO57AflN5hfXjce0_DydbMJclTU9kC3S75cg";
const ETHEREUM_PRIV = process.env.ETHEREUM_PRIV_KEY;
const ARWEAVE_PRIV = process.env.ARWEAVE_PRIV_KEY;

let arweaveWallet: JWKInterface;
let ethereumWallet: ethers.Wallet;
let injectedEthereumSignerMinimalProvider: InjectedEthereumSignerMinimalProvider;
const createDataItemEthereumSigner =
  () =>
  async ({
    data,
    tags = [],
    target,
    anchor,
  }: {
    data?: any;
    tags?: { name?: string; value?: string }[];
    target?: string;
    anchor?: string;
  }): Promise<{ id: string; raw: ArrayBuffer }> => {
    // const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
    const signer = new InjectedEthereumSigner(
      injectedEthereumSignerMinimalProvider as any
    );
    await signer.setPublicKey();
    const tagsItem = tags as { name: string; value: string }[];
    const dataItem = createData(data, signer, {
      tags: tagsItem,
      target,
      anchor,
    });
    console.log("dataItem:", dataItem);
    // Sign the data item
    await dataItem.sign(signer);

    return {
      id: dataItem.id,
      raw: dataItem.getRaw(),
    };
  };

async function getDataFromAO(
  process: string,
  action: string,
  data?: any
): Promise<any> {
  let start = performance.now();
  // console.log('==> [getDataFromAO]');

  let result;
  try {
    result = await dryrun({
      process,
      data: JSON.stringify(data),
      tags: [{ name: "Action", value: action }],
    });
  } catch (error) {
    console.log("getDataFromAO --> ERR:", error);
    return "";
  }

  console.log('action', action);
  console.log('result', result);

  const resp = result.Messages[0].Data;

  let end = performance.now();
  // console.log(`<== [getDataFromAO] [${Math.round(end - start)} ms]`);

  return JSON.parse(resp);
}

async function messageToAO(
  process: string,
  data: any,
  action: string
): Promise<string> {
  if (useAR) {
    return messageToAOByArweave(process, data, action);
  } else {
    return messageToAOByEthereum(process, data, action);
  }
}

async function messageToAOByEthereum(
  process: string,
  data: any,
  action: string
): Promise<string> {
  try {
    console.log("ethWallet:", ethereumWallet);
    const messageId = await message({
      process,
      signer: createDataItemEthereumSigner(),
      tags: [{ name: "Action", value: action }],
      data: JSON.stringify(data),
    });

    // console.log("messageId:", messageId)
    return messageId;
  } catch (error) {
    console.log("messageToAO -> error:", error);
    return "";
  }
}

async function messageToAOByArweave(
  process: string,
  data: any,
  action: string
): Promise<string> {
  try {
    const messageId = await message({
      process: process,
      signer: createDataItemSigner(arweaveWallet),
      tags: [{ name: "Action", value: action }],
      data: JSON.stringify(data),
    });

    // console.log("messageId:", messageId);
    return messageId;
  } catch (error) {
    console.log("messageToAO -> error:", error);
    return "";
  }
}

async function getPet(address: string): Promise<any> {
  const result = await getDataFromAO(AO_PET, "getPet", { address: address });
  return result;
}
(async function initApp() {
  if (ARWEAVE_PRIV) {
    arweaveWallet = JSON.parse(ARWEAVE_PRIV);
  } else {
    arweaveWallet = await getARWallet();
  }

  if (ETHEREUM_PRIV) {
    ethereumWallet = new ethers.Wallet(ETHEREUM_PRIV);
  } else {
    ethereumWallet = new ethers.Wallet(ethers.Wallet.createRandom().privateKey);
  }
  injectedEthereumSignerMinimalProvider = {
    getSigner() {
      return {
        async signMessage(message: string | Uint8Array): Promise<string> {
          return ethereumWallet.signMessage(message);
        },
      };
    },
  };

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/update_level", async (req: Request, res: Response) => {
    const { address } = req.query;
    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing parameters" });
    }

    try {
      const messageID = await messageToAO(
        AO_PET,
        { address },
        "updateLevel"
      );
      console.log("messageID:", messageID);
      const petInfo = await getPet(address as string);
      res.json({ success: true, result: petInfo });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
});
  app.get("/init_pet", async (req: Request, res: Response) => {
    const { name, description, address } = req.query;

    if (!name || !description || !address) {
      return res
        .status(400)
        .json({ success: false, message: "Missing parameters" });
    }

    try {
      const messageID = await messageToAO(
        AO_PET,
        { name, description, address },
        "initPet"
      );
      console.log("messageID:", messageID);
      const petInfo = await getPet(address as string);
      res.json({ success: true, result: petInfo });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  });

  // 启动服务器
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`CORS-enabled web server listening on port ${PORT}`);
  });

})();