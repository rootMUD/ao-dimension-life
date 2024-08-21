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

  const kv = new KeyvFile({ filename: "./kv-store.json" });

  const app = express();
  app.use(cors());
  app.use(express.json());

  // 路由定义
  app.get("/count", async (req: Request, res: Response) => {
    const replies = await getDataFromAO(AO_PET, "getCount");
    res.json(replies);
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

  app.get("/get_pet", async (req: Request, res: Response) => {
    const queryParams = req.query;
    const address = queryParams.address as string;
    let result: Array<any> = [{}];
    if (address) {
      result = await getPet(address);
    } else {
      // Handle the case when address is null
      res.statusCode = 400;
    }
    res.json({ success: true, result: result[0] });
  });
  app.get("/get_pet_with_auth", async (req: Request, res: Response) => {
    const queryParams = req.query;
    const token = queryParams.token as string;
    // Attempt to retrieve the address associated with the token from the key-value store
    const v = await kv.get(token);
    const address = v.value as string;
    console.log("address in get_pet_with_auth:", address);
    const result = await getPet(address);
    res.json({ success: true, result: result[0] });
  });
  // curl http://localhost:8000/gen_sig
  app.get("/gen_sig", async (req: Request, res: Response) => {
    // Assuming `kv.get` returns the result directly as shown
    const result = await kv.get("msg");
    console.log("Result:", result);

    // Extract the 'value' from the result object
    const data = result.value;
    console.log("msg signed:", data);
    const arweave = Arweave.init({});
    const walletA = await arweave.wallets.generate();
    const msg = new TextEncoder().encode(result.value as string);
    const hash = await crypto.subtle.digest("SHA-256", msg);
    const sigA = await arweave.crypto.sign(walletA, new Uint8Array(hash));
    res.json({
      success: true,
      result: {
        sig: encodeUint8ArrayToBase64(sigA),
        n: walletA.n,
        msg: msg,
      },
    });
  });
  app.get("/verify_token", async (req: Request, res: Response) => {
    const queryParams = req.query;
    const token = queryParams.token as string;

    if (!token) {
      res.status(400).json({ success: false, message: "No token provided" }); // Bad Request
      return;
    }

    // Attempt to retrieve the address associated with the token from the key-value store
    const address = await kv.get(token);

    if (address) {
      // If an address is found, return it
      res.json({ success: true, address: address });
    } else {
      // If no address is found, return a not found message
      res.status(404).json({ success: false, message: "Token not found" }); // Not Found
    }
  });

  app.post("/gen_token", async (req: Request, res: Response) => {
    const arweave = Arweave.init({});
    const content = await req.body.text();
    const parsedContent = JSON.parse(content);
    const addr = parsedContent.addr;
    const sig = decodeBase64ToUint8Array(parsedContent.sig);
    const n = parsedContent.n;

    const result = await kv.get("msg");
    // Extract the 'value' from the result object
    console.log("msg:", result.value);
    // same as:
    // > https://docs.arconnect.io/api/sign-message
    const msg = new TextEncoder().encode(result.value as string);
    const hash = await crypto.subtle.digest("SHA-256", msg);

    const verify = await arweave.crypto.verify(
      await n,
      new Uint8Array(hash),
      sig
    );

    let token = "";
    let resp: any;
    if (verify === true) {
      // do sth you want!
      token = generateRandomHex(16); // Generates a 16-byte (32 characters) hex string
      resp = await kv.set(token, addr);
    } else {
      // do sth else you want!
      console.log("opps: ", addr);
    }
    res.json({
      verification: verify,
      result: resp,
      token: token,
    });
  });

  app.get("/msg", async (req: Request, res: Response) => {
    // Assuming `kv.get` returns the result directly as shown
    const result = await kv.get("msg");
    console.log("Result:", result);

    // Extract the 'value' from the result object
    const msgValue = result.value;

    // Optionally, log the extracted message and send it back to the client
    console.log("msg:", msgValue);
    res.json({ message: msgValue });
  });

  app.get("/policy", (req: Request, res: Response) => {
    res.send(
      "# Privacy Policy for ChatGPT Bot with dimensionLife\n\n1. Introduction:\nThis Privacy Policy applies to the ChatGPT Bot integrated with Arweave Query functionality, hereafter referred to as 'the Bot'. The Bot is designed to provide users with the ability to query public data stored on the Arweave network.\n\n2. Data Collection:\nThe Bot collects data in two primary ways:\n- User-Provided Data: Information that users input directly, including queries and any personal data shared during interaction.\n- Automated Data Collection: Data collected automatically, such as user interaction patterns and usage statistics.\n\n3. Use of Data:\nCollected data is used for:\n- Responding to user queries.\n- Improving the Bot's functionality and user experience.\n- Research and development purposes.\n\n4. Data Sharing and Disclosure:\nPersonal data is not shared with third parties, except:\n- When required by law.\n- For safeguarding the rights and safety of individuals.\n- In an anonymized or aggregated format for research.\n\n5. Data Security:\nWe implement security measures to protect against unauthorized data access or breaches. However, absolute security cannot be guaranteed.\n\n6. User Rights:\nUsers have the right to:\n- Access personal data held by the Bot.\n- Request correction of incorrect data.\n- Request deletion of their data under certain conditions.\n\n7. Changes to This Policy:\nWe reserve the right to modify this policy. Changes will be communicated through the Bot's platform.\n\n8. Contact Information:\nFor queries regarding this policy, please contact [insert contact details].\n\n\n"
    );
  });

  // 启动服务器
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`CORS-enabled web server listening on port ${PORT}`);
  });

  // Cron 任务
  cron.schedule("0 * * * *", async () => {
    const msg = generateRandomHex(16);
    await kv.set("msg", msg);
    console.log("Cron job executed, new message set:", msg);
  });
})();

// 辅助函数
function generateRandomHex(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}

function decodeBase64ToUint8Array(base64String: string): Uint8Array {
  return Buffer.from(base64String, "base64");
}

function encodeUint8ArrayToBase64(byteArray: Uint8Array): string {
  return Buffer.from(byteArray).toString("base64");
}
