// import { GenerateSignatureBody } from "@dfns/sdk/generated/wallets";
// import { Request, Response } from "express";

import { apiClient, delegatedClient } from "../clients.js";
import { DfnsWallet } from "@dfns/lib-viem";
import { PaymasterMode, createSmartAccountClient } from "@biconomy/account";
import { createWalletClient, encodeFunctionData, http, parseAbi } from "viem";
import { toAccount } from "viem/accounts";
import { arbitrum, base, mainnet, polygon } from "viem/chains";

export const listWallets = async (req, res) => {
  const { appId, authToken } = req.body;
  const client = delegatedClient(appId, authToken);
  const wallets = await client.wallets.listWallets({});
  res.json(wallets);
};

export const generateSignatureInit = async (req, res) => {
  // Challange signing must use the appId and appOrigin of the client application.
  const { appId, authToken, walletId, message } = req.body;
  const client = delegatedClient(appId, authToken);

  const body = {
    kind: "Message",
    message: Buffer.from(message, "utf-8").toString("hex"),
  };
  const challenge = await client.wallets.generateSignatureInit({
    walletId,
    body,
  });

  console.debug(challenge);

  // The exact request body is needed to complete the signature action. You can
  // choose the approach to maintain the state. In the example, it is simply passed
  // back in the response, and included in the generateSignatureComplete request.
  res.json({
    requestBody: body,
    challenge,
  });
};

export const generateSignatureComplete = async (req, res) => {
  const { appId, authToken, walletId, requestBody, signedChallenge } = req.body;
  const client = delegatedClient(appId, authToken);

  // Use the original request body payload to complete the action.
  const signature = await client.wallets.generateSignatureComplete(
    {
      walletId,
      body: requestBody,
    },
    signedChallenge
  );
  console.debug(signature);
  res.json(signature);
};
export const getSmartAccountAddress = async (req, res) => {
  // Challange signing must use the appId and appOrigin of the client application
  const { appId, walletId, authToken } = req.body;
  console.log("request recieved=====", authToken, appId, walletId);
  let client = apiClient(appId, authToken);
  console.log("client recieved=====", client);
  let dfnsWWalletSigner = await DfnsWallet.init({
    walletId,
    dfnsClient: client,
  });
  console.log("wallet created recieved=====", dfnsWWalletSigner);

  const walletClient = createWalletClient({
    account: toAccount(dfnsWWalletSigner),
    chain: polygon,
    transport: http(),
  });
  console.log("viem client created recieved=====", walletClient);

  const smartAccountClient = await createSmartAccountClient({
    signer: walletClient,
    biconomyPaymasterApiKey: "UfZhdqxYR.528b38b4-89d7-4b33-9006-6856b9c82d64",
    bundlerUrl: `https://bundler.biconomy.io/api/v2/137/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f444`,
  });

  console.log("smart account client created =====", smartAccountClient);

  const scwAddress = await smartAccountClient.getAccountAddress();
  console.log("smart account address created =====", scwAddress);
  // The exact request body is needed to complete the signature action. You can
  // choose the approach to maintain the state. In the example, it is simply passed
  // back in the response, and included in the generateSignatureComplete request.
  res.json({
    scw: [
      {
        address: scwAddress,
        chainId: 137,
      },
    ],
  });
};
