"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var arweave_1 = require("arweave");
var ethers_1 = require("ethers");
var aoconnect_1 = require("@permaweb/aoconnect");
var crypto_1 = require("crypto");
var keyv_file_1 = require("keyv-file");
var node_cron_1 = require("node-cron");
var arseeding_arbundles_1 = require("arseeding-arbundles");
var injectedEthereumSigner_1 = require("arseeding-arbundles/src/signing/chains/injectedEthereumSigner");
require("dotenv/config");
var wallet_1 = require("./wallet");
console.log("Hello from dimension Life!");
var useAR = false;
var key = process.env.API_KEY || "34e968837d573dc61e965e58fa29cc05";
var AO_PET = process.env.AO_PET || "cO4thcoxO57AflN5hfXjce0_DydbMJclTU9kC3S75cg";
var ETHEREUM_PRIV = process.env.ETHEREUM_PRIV_KEY;
var ARWEAVE_PRIV = process.env.ARWEAVE_PRIV_KEY;
var arweaveWallet;
var ethereumWallet;
var injectedEthereumSignerMinimalProvider;
var createDataItemEthereumSigner = function () {
    return function (_a) {
        var data = _a.data, _b = _a.tags, tags = _b === void 0 ? [] : _b, target = _a.target, anchor = _a.anchor;
        return __awaiter(void 0, void 0, void 0, function () {
            var signer, tagsItem, dataItem;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        signer = new injectedEthereumSigner_1.default(injectedEthereumSignerMinimalProvider);
                        return [4 /*yield*/, signer.setPublicKey()];
                    case 1:
                        _c.sent();
                        tagsItem = tags;
                        dataItem = (0, arseeding_arbundles_1.createData)(data, signer, {
                            tags: tagsItem,
                            target: target,
                            anchor: anchor,
                        });
                        console.log("dataItem:", dataItem);
                        // Sign the data item
                        return [4 /*yield*/, dataItem.sign(signer)];
                    case 2:
                        // Sign the data item
                        _c.sent();
                        return [2 /*return*/, {
                                id: dataItem.id,
                                raw: dataItem.getRaw(),
                            }];
                }
            });
        });
    };
};
function getDataFromAO(process, action, data) {
    return __awaiter(this, void 0, void 0, function () {
        var start, result, error_1, resp, end;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = performance.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, aoconnect_1.dryrun)({
                            process: process,
                            data: JSON.stringify(data),
                            tags: [{ name: "Action", value: action }],
                        })];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log("getDataFromAO --> ERR:", error_1);
                    return [2 /*return*/, ""];
                case 4:
                    console.log('action', action);
                    console.log('result', result);
                    resp = result.Messages[0].Data;
                    end = performance.now();
                    // console.log(`<== [getDataFromAO] [${Math.round(end - start)} ms]`);
                    return [2 /*return*/, JSON.parse(resp)];
            }
        });
    });
}
function messageToAO(process, data, action) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (useAR) {
                return [2 /*return*/, messageToAOByArweave(process, data, action)];
            }
            else {
                return [2 /*return*/, messageToAOByEthereum(process, data, action)];
            }
            return [2 /*return*/];
        });
    });
}
function messageToAOByEthereum(process, data, action) {
    return __awaiter(this, void 0, void 0, function () {
        var messageId, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("ethWallet:", ethereumWallet);
                    return [4 /*yield*/, (0, aoconnect_1.message)({
                            process: process,
                            signer: createDataItemEthereumSigner(),
                            tags: [{ name: "Action", value: action }],
                            data: JSON.stringify(data),
                        })];
                case 1:
                    messageId = _a.sent();
                    // console.log("messageId:", messageId)
                    return [2 /*return*/, messageId];
                case 2:
                    error_2 = _a.sent();
                    console.log("messageToAO -> error:", error_2);
                    return [2 /*return*/, ""];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function messageToAOByArweave(process, data, action) {
    return __awaiter(this, void 0, void 0, function () {
        var messageId, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, aoconnect_1.message)({
                            process: process,
                            signer: (0, aoconnect_1.createDataItemSigner)(arweaveWallet),
                            tags: [{ name: "Action", value: action }],
                            data: JSON.stringify(data),
                        })];
                case 1:
                    messageId = _a.sent();
                    // console.log("messageId:", messageId);
                    return [2 /*return*/, messageId];
                case 2:
                    error_3 = _a.sent();
                    console.log("messageToAO -> error:", error_3);
                    return [2 /*return*/, ""];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getPet(address) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDataFromAO(AO_PET, "getPet", { address: address })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
(function initApp() {
    return __awaiter(this, void 0, void 0, function () {
        var kv, app, PORT;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!ARWEAVE_PRIV) return [3 /*break*/, 1];
                    arweaveWallet = JSON.parse(ARWEAVE_PRIV);
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, wallet_1.getARWallet)()];
                case 2:
                    arweaveWallet = _a.sent();
                    _a.label = 3;
                case 3:
                    if (ETHEREUM_PRIV) {
                        ethereumWallet = new ethers_1.ethers.Wallet(ETHEREUM_PRIV);
                    }
                    else {
                        ethereumWallet = new ethers_1.ethers.Wallet(ethers_1.ethers.Wallet.createRandom().privateKey);
                    }
                    injectedEthereumSignerMinimalProvider = {
                        getSigner: function () {
                            return {
                                signMessage: function (message) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, ethereumWallet.signMessage(message)];
                                        });
                                    });
                                },
                            };
                        },
                    };
                    kv = new keyv_file_1.KeyvFile({ filename: "./kv-store.json" });
                    app = (0, express_1.default)();
                    app.use((0, cors_1.default)());
                    app.use(express_1.default.json());
                    // 路由定义
                    app.get("/count", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var replies;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getDataFromAO(AO_PET, "getCount")];
                                case 1:
                                    replies = _a.sent();
                                    res.json(replies);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/init_pet", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, name, description, address, messageID, petInfo, error_4;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = req.query, name = _a.name, description = _a.description, address = _a.address;
                                    if (!name || !description || !address) {
                                        return [2 /*return*/, res
                                                .status(400)
                                                .json({ success: false, message: "Missing parameters" })];
                                    }
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 4, , 5]);
                                    return [4 /*yield*/, messageToAO(AO_PET, { name: name, description: description, address: address }, "initPet")];
                                case 2:
                                    messageID = _b.sent();
                                    console.log("messageID:", messageID);
                                    return [4 /*yield*/, getPet(address)];
                                case 3:
                                    petInfo = _b.sent();
                                    res.json({ success: true, result: petInfo });
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_4 = _b.sent();
                                    res
                                        .status(500)
                                        .json({ success: false, message: error_4.message });
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/get_pet", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var queryParams, address, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    queryParams = req.query;
                                    address = queryParams.address;
                                    result = [{}];
                                    if (!address) return [3 /*break*/, 2];
                                    return [4 /*yield*/, getPet(address)];
                                case 1:
                                    result = _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    // Handle the case when address is null
                                    res.statusCode = 400;
                                    _a.label = 3;
                                case 3:
                                    res.json({ success: true, result: result[0] });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/get_pet_with_auth", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var queryParams, token, v, address, result;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    queryParams = req.query;
                                    token = queryParams.token;
                                    return [4 /*yield*/, kv.get(token)];
                                case 1:
                                    v = _a.sent();
                                    address = v.value;
                                    console.log("address in get_pet_with_auth:", address);
                                    return [4 /*yield*/, getPet(address)];
                                case 2:
                                    result = _a.sent();
                                    res.json({ success: true, result: result[0] });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // curl http://localhost:8000/gen_sig
                    app.get("/gen_sig", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, data, arweave, walletA, msg, hash, sigA;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, kv.get("msg")];
                                case 1:
                                    result = _a.sent();
                                    console.log("Result:", result);
                                    data = result.value;
                                    console.log("msg signed:", data);
                                    arweave = arweave_1.default.init({});
                                    return [4 /*yield*/, arweave.wallets.generate()];
                                case 2:
                                    walletA = _a.sent();
                                    msg = new TextEncoder().encode(result.value);
                                    return [4 /*yield*/, crypto_1.default.subtle.digest("SHA-256", msg)];
                                case 3:
                                    hash = _a.sent();
                                    return [4 /*yield*/, arweave.crypto.sign(walletA, new Uint8Array(hash))];
                                case 4:
                                    sigA = _a.sent();
                                    res.json({
                                        success: true,
                                        result: {
                                            sig: encodeUint8ArrayToBase64(sigA),
                                            n: walletA.n,
                                            msg: msg,
                                        },
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/verify_token", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var queryParams, token, address;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    queryParams = req.query;
                                    token = queryParams.token;
                                    if (!token) {
                                        res.status(400).json({ success: false, message: "No token provided" }); // Bad Request
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, kv.get(token)];
                                case 1:
                                    address = _a.sent();
                                    if (address) {
                                        // If an address is found, return it
                                        res.json({ success: true, address: address });
                                    }
                                    else {
                                        // If no address is found, return a not found message
                                        res.status(404).json({ success: false, message: "Token not found" }); // Not Found
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/gen_token", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var arweave, content, parsedContent, addr, sig, n, result, msg, hash, verify, _a, _b, token, resp;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    arweave = arweave_1.default.init({});
                                    return [4 /*yield*/, req.body.text()];
                                case 1:
                                    content = _c.sent();
                                    parsedContent = JSON.parse(content);
                                    addr = parsedContent.addr;
                                    sig = decodeBase64ToUint8Array(parsedContent.sig);
                                    n = parsedContent.n;
                                    return [4 /*yield*/, kv.get("msg")];
                                case 2:
                                    result = _c.sent();
                                    // Extract the 'value' from the result object
                                    console.log("msg:", result.value);
                                    msg = new TextEncoder().encode(result.value);
                                    return [4 /*yield*/, crypto_1.default.subtle.digest("SHA-256", msg)];
                                case 3:
                                    hash = _c.sent();
                                    _b = (_a = arweave.crypto).verify;
                                    return [4 /*yield*/, n];
                                case 4: return [4 /*yield*/, _b.apply(_a, [_c.sent(), new Uint8Array(hash),
                                        sig])];
                                case 5:
                                    verify = _c.sent();
                                    token = "";
                                    if (!(verify === true)) return [3 /*break*/, 7];
                                    // do sth you want!
                                    token = generateRandomHex(16); // Generates a 16-byte (32 characters) hex string
                                    return [4 /*yield*/, kv.set(token, addr)];
                                case 6:
                                    resp = _c.sent();
                                    return [3 /*break*/, 8];
                                case 7:
                                    // do sth else you want!
                                    console.log("opps: ", addr);
                                    _c.label = 8;
                                case 8:
                                    res.json({
                                        verification: verify,
                                        result: resp,
                                        token: token,
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/msg", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var result, msgValue;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, kv.get("msg")];
                                case 1:
                                    result = _a.sent();
                                    console.log("Result:", result);
                                    msgValue = result.value;
                                    // Optionally, log the extracted message and send it back to the client
                                    console.log("msg:", msgValue);
                                    res.json({ message: msgValue });
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/policy", function (req, res) {
                        res.send("# Privacy Policy for ChatGPT Bot with dimensionLife\n\n1. Introduction:\nThis Privacy Policy applies to the ChatGPT Bot integrated with Arweave Query functionality, hereafter referred to as 'the Bot'. The Bot is designed to provide users with the ability to query public data stored on the Arweave network.\n\n2. Data Collection:\nThe Bot collects data in two primary ways:\n- User-Provided Data: Information that users input directly, including queries and any personal data shared during interaction.\n- Automated Data Collection: Data collected automatically, such as user interaction patterns and usage statistics.\n\n3. Use of Data:\nCollected data is used for:\n- Responding to user queries.\n- Improving the Bot's functionality and user experience.\n- Research and development purposes.\n\n4. Data Sharing and Disclosure:\nPersonal data is not shared with third parties, except:\n- When required by law.\n- For safeguarding the rights and safety of individuals.\n- In an anonymized or aggregated format for research.\n\n5. Data Security:\nWe implement security measures to protect against unauthorized data access or breaches. However, absolute security cannot be guaranteed.\n\n6. User Rights:\nUsers have the right to:\n- Access personal data held by the Bot.\n- Request correction of incorrect data.\n- Request deletion of their data under certain conditions.\n\n7. Changes to This Policy:\nWe reserve the right to modify this policy. Changes will be communicated through the Bot's platform.\n\n8. Contact Information:\nFor queries regarding this policy, please contact [insert contact details].\n\n\n");
                    });
                    PORT = process.env.PORT || 8000;
                    app.listen(PORT, function () {
                        console.log("CORS-enabled web server listening on port ".concat(PORT));
                    });
                    // Cron 任务
                    node_cron_1.default.schedule("0 * * * *", function () { return __awaiter(_this, void 0, void 0, function () {
                        var msg;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    msg = generateRandomHex(16);
                                    return [4 /*yield*/, kv.set("msg", msg)];
                                case 1:
                                    _a.sent();
                                    console.log("Cron job executed, new message set:", msg);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
})();
// 辅助函数
function generateRandomHex(length) {
    return crypto_1.default.randomBytes(length).toString("hex");
}
function decodeBase64ToUint8Array(base64String) {
    return Buffer.from(base64String, "base64");
}
function encodeUint8ArrayToBase64(byteArray) {
    return Buffer.from(byteArray).toString("base64");
}
