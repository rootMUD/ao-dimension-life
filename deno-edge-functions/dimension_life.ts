import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import Arweave from "https://cdn.skypack.dev/arweave";
import {ethers} from "npm:ethers";

// import { EthereumSigner } from "https://github.com/leeduckgo/arbundles/raw/master/src/signing/chains/ethereumSigner.ts";

import { createData } from "https://cdn.skypack.dev/arseeding-arbundles/src/file/createData.ts";

// import { InjectedEthereumSigner } from "https://cdn.skypack.dev/arseeding-arbundles/src/signing/index.ts";

// import {
//   dryrun,
//   message,
//   createDataItemSigner,
// } from "https://esm.sh/@permaweb/aoconnect@0.0.58";
import {
  dryrun,
  message,
} from "npm:@permaweb/aoconnect@0.0.58";

console.log("Hello from dimension Life!");
const arweave = Arweave.init({});
const key = Deno.env.get("API_KEY") || "34e968837d573dc61e965e58fa29cc05";
const AO_PET =
  Deno.env.get("AO_PET") || "cO4thcoxO57AflN5hfXjce0_DydbMJclTU9kC3S75cg";
const PRIV = Deno.env.get("PRIV_KEY");

let arweaveWallet: any;
if (PRIV) {
  arweaveWallet = JSON.parse(PRIV);
} else {
  arweaveWallet = await getWallet();
}

const kv = await Deno.openKv(); // Open the key-value store

async function createDataItemSigner({
  data,
  tags = [],
  target,
  anchor,
}: {
  data: any;
  tags?: { name: string; value: string }[];
  target?: string;
  anchor?: string;
}): Promise<{ id: string; raw: ArrayBuffer }> {
  // Use the locally created or loaded Ethereum wallet
  const wallet = await getWallet();
const signer = null;
  // const signer = new EthereumSigner("8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f");
  const dataItem = createData(data, signer, { tags, target, anchor });
  console.log("dataItem:", dataItem);
  // Sign the data item
  await dataItem.sign(signer);

  return {
    id: dataItem.id,
    raw: dataItem.getRaw(),
  };
}

async function getPet(address: string) {
  const result = await getDataFromAO(AO_PET, "getPet", { address: address });
  return result;
}

// Ethereum related functions

async function getWallet() {
  if (PRIV) {
    // Load the wallet from the provided private key
    const wallet = new ethers.Wallet(PRIV);
    return wallet;
  } else {
    // Generate a new Ethereum wallet
    const wallet = ethers.Wallet.createRandom();
    return wallet;
  }
}

// TODO: Implement the messageToAO and the initPet Get Method.
async function messageToAO(
  process: string,
  data: { [key: string]: unknown },
  action: string
) {
  try {
    let ethWallet = await getWallet();
    console.log("ethWallet:", ethWallet);
    const messageId = await message({
      process: "Rijbx6FduUMdCZM0tJ4PPxXljUNy1m0u_kmMIFGFM5c",
      signer: createDataItemSigner(ethWallet),
      tags: [{ name: "Action", value: "AddNew" }],
      data: "data",
    });

    // console.log("messageId:", messageId)
    return messageId;
  } catch (error) {
    console.log("messageToAO -> error:", error);
    return "";
  }
}

async function getDataFromAO(process: string, action: string, data?: any) {
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

  // console.log('action', action);
  // console.log('result', result);

  const resp = result.Messages[0].Data;

  let end = performance.now();
  // console.log(`<== [getDataFromAO] [${Math.round(end - start)} ms]`);

  return JSON.parse(resp);
}

// Function to generate a random hexadecimal string
function generateRandomHex(length: number) {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("");
}

// function decodeBase64ToBuffer(base64String) {
//   const binaryString = atob(base64String); // Decode the Base64 string to a binary string
//   const bytes = new Uint8Array(binaryString.length);
//   for (let i = 0; i < binaryString.length; i++) {
//       bytes[i] = binaryString.charCodeAt(i); // Convert each character to a byte
//   }
//   return Buffer.from(bytes); // Convert Uint8Array to Buffer
// }

function decodeBase64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String); // Decode the Base64 string to a binary string
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i); // Convert each character to a byte
  }
  return bytes;
}

function encodeUint8ArrayToBase64(byteArray: Uint8Array) {
  const binaryString = Array.from(byteArray, (byte) =>
    String.fromCharCode(byte)
  ).join("");
  return btoa(binaryString);
}

const router = new Router();

router
  .get("/count", async (context) => {
    const replies = await getDataFromAO(AO_PET, "getCount");
    context.response.body = replies;
  })
  .get("/init_pet", async (context) => {
    const queryParams = context.request.url.searchParams;
    const name = queryParams.get("name");
    const description = queryParams.get("description");
    const address = queryParams.get("address");

    if (!name || !description || !address) {
      context.response.status = 400;
      context.response.body = { success: false, message: "Missing parameters" };
      return;
    }

    try {
      const messageID = await messageToAO(
        AO_PET,
        { name: name, description: description, address: address },
        "initPet"
      );
      console.log("messageID:", messageID);
      const petInfo = await getPet(address);
      context.response.body = { success: true, result: petInfo };
    } catch (error) {
      context.response.status = 500;
      context.response.body = { success: false, message: error.message };
    }
  })
  .get("/get_pet", async (context) => {
    const queryParams = context.request.url.searchParams;
    const address = queryParams.get("address");
    let result: Array<any> = [{}];
    if (address) {
      result = await getPet(address);
    } else {
      // Handle the case when address is null
      context.response.status = 400;
    }
    context.response.body = result[0];
  })
  .get("/get_pet_with_auth", async (context) => {
    const queryParams = context.request.url.searchParams;
    const token = queryParams.get("token") as string;
    // Attempt to retrieve the address associated with the token from the key-value store
    const v = await kv.get([token]);
    const address = v.value as string;
    console.log("address in get_pet_with_auth:", address);
    const result = await getPet(address);
    context.response.body = result[0];
  })
  // curl http://localhost:8000/gen_sig
  .get("/gen_sig", async (context) => {
    // Assuming `kv.get` returns the result directly as shown
    const result = await kv.get(["msg"]);
    console.log("Result:", result);

    // Extract the 'value' from the result object
    const data = result.value;
    console.log("msg signed:", data);
    const arweave = Arweave.init({});
    const walletA = await arweave.wallets.generate();
    const msg = new TextEncoder().encode(result.value as string);
    const hash = await crypto.subtle.digest("SHA-256", msg);
    const sigA = await arweave.crypto.sign(walletA, hash);
    context.response.body = {
      sig: encodeUint8ArrayToBase64(sigA),
      n: walletA.n,
      msg: msg,
    };
  })
  .get("/verify_token", async (context) => {
    const queryParams = context.request.url.searchParams;
    const token = queryParams.get("token");

    if (!token) {
      context.response.status = 400; // Bad Request
      context.response.body = { success: false, message: "No token provided" };
      return;
    }

    // Attempt to retrieve the address associated with the token from the key-value store
    const address = await kv.get([token]);

    if (address) {
      // If an address is found, return it
      context.response.body = { success: true, address: address };
    } else {
      // If no address is found, return a not found message
      context.response.status = 404; // Not Found
      context.response.body = { success: false, message: "Token not found" };
    }
  })
  /**
   * cURL Command for POST Request to Verify Signature:
   * This command sends a POST request to the /gen_token endpoint. It includes a JSON payload with
   * a digital signature, a public key identifier ('n'), and a hexadecimal message. The API should
   * verify the signature against the message and public key provided.
   *
   * Command:
   * curl -X POST http://<your-server-address>/gen_token \
   * -H "Content-Type: application/json" \
   * -d '{"sig":"{sig}", "n": "{n}"}'
   */
  .post("/gen_token", async (context) => {
    const arweave = Arweave.init({});
    const content = await context.request.body.text();
    const parsedContent = JSON.parse(content);
    const addr = parsedContent.addr;
    const sig = decodeBase64ToUint8Array(parsedContent.sig);
    const n = parsedContent.n;

    const result = await kv.get(["msg"]);
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
      resp = await kv.set([token], addr);
    } else {
      // do sth else you want!
      console.log("opps: ", addr);
    }
    context.response.body = {
      verification: verify,
      result: resp,
      token: token,
    };
  })
  // deno run --unstable-kv --unstable-cron -A ./dimension_life.tsx
  // .get("/set_msg", async (context) => {
  //   const queryParams = context.request.url.searchParams;
  //   const apiKey = queryParams.get("key"); // 'id' will be a string or null if not present
  //   // Generate a random hexadecimal message
  //   const msg = generateRandomHex(16); // Generates a 16-byte (32 characters) hex string
  //   // Verify the API key
  //   if (apiKey !== key) {
  //     context.response.status = 401; // Unauthorized status code
  //     context.response.body = {
  //       success: false,
  //       message: "Unauthorized: Invalid API key",
  //     };
  //     return; // Stop further execution if the API key is not valid
  //   }
  //   // Set the generated message in the key-value store with the key "msg"
  //   const result = await kv.set(["msg"], msg);
  //   console.log(result);
  //   // Optionally, send the result back to the client or a confirmation message
  //   context.response.body = {
  //     success: true,
  //     message: "Message set successfully",
  //     hex: msg,
  //   };
  // })
  .get("/msg", async (context) => {
    // Assuming `kv.get` returns the result directly as shown
    const result = await kv.get(["msg"]);
    console.log("Result:", result);

    // Extract the 'value' from the result object
    const msgValue = result.value;

    // Optionally, log the extracted message and send it back to the client
    console.log("msg:", msgValue);
    context.response.body = { message: msgValue };
  })

  .get("/policy", async (context) => {
    context.response.body =
      "# Privacy Policy for ChatGPT Bot with dimensionLife\n\n1. Introduction:\nThis Privacy Policy applies to the ChatGPT Bot integrated with Arweave Query functionality, hereafter referred to as 'the Bot'. The Bot is designed to provide users with the ability to query public data stored on the Arweave network.\n\n2. Data Collection:\nThe Bot collects data in two primary ways:\n- User-Provided Data: Information that users input directly, including queries and any personal data shared during interaction.\n- Automated Data Collection: Data collected automatically, such as user interaction patterns and usage statistics.\n\n3. Use of Data:\nCollected data is used for:\n- Responding to user queries.\n- Improving the Bot's functionality and user experience.\n- Research and development purposes.\n\n4. Data Sharing and Disclosure:\nPersonal data is not shared with third parties, except:\n- When required by law.\n- For safeguarding the rights and safety of individuals.\n- In an anonymized or aggregated format for research.\n\n5. Data Security:\nWe implement security measures to protect against unauthorized data access or breaches. However, absolute security cannot be guaranteed.\n\n6. User Rights:\nUsers have the right to:\n- Access personal data held by the Bot.\n- Request correction of incorrect data.\n- Request deletion of their data under certain conditions.\n\n7. Changes to This Policy:\nWe reserve the right to modify this policy. Changes will be communicated through the Bot's platform.\n\n8. Contact Information:\nFor queries regarding this policy, please contact [insert contact details].\n\n\n";
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

// Cron Part:
Deno.cron("sample cron", "0 * * * *", async () => {
  const msg = generateRandomHex(16); // Generates a 16-byte (32 characters) hex string
  // Set the generated message in the key-value store with the key "msg"
  const result = await kv.set(["msg"], msg);
  console.log(result);
});

console.info("CORS-enabled web server listening on port 8000");

await app.listen({ port: 8000 });
