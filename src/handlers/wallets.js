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
export const getPaymasterKeyOnName = (chain) => {
  switch (chain) {
    case "Polygon":
      return "UfZhdqxYR.528b38b4-89d7-4b33-9006-6856b9c82d64";
    case "Ethereum":
      return "ulygsZ3qd.607cfa98-67a7-4dce-99f0-f9b7552b70d6";
    case "Base":
      return "PsoPGd6TZ.7cfbc00c-7cee-4bf8-815c-2cab0db4a8e1";
    case "ArbitrumOne":
      return "3OjDX_U5v.7a176ce5-e0bb-4906-8186-729255e8ef7c";
    default:
      return "UfZhdqxYR.528b38b4-89d7-4b33-9006-6856b9c82d64";
  }
};
export const getIdOnChain = (chain) => {
  switch (chain) {
    case "Polygon":
      return "137";
    case "Ethereum":
      return "1";
    case "ArbitrumOne":
      return "42161";
    case "Base":
      return "8453";
  }
};
export const getProviderOnName = (chain) => {
  switch (chain) {
    case "Polygon":
      return polygon;
    case "Ethereum":
      return mainnet;
    case "Base":
      return base;
    case "ArbitrumOne":
      return arbitrum;
    default:
      return polygon;
  }
};
export const getSmartAccountAddress = async (req, res) => {
  // Challange signing must use the appId and appOrigin of the client application
  const { appId, walletId, authToken } = req.body;
  const result = await Promise.all(
    walletId.map(async (x, i) => {
      let client = apiClient(appId, authToken);
      let dfnsWWalletSigner = await DfnsWallet.init({
        walletId: x?.id,
        dfnsClient: client,
      });
      const walletClient = createWalletClient({
        account: toAccount(dfnsWWalletSigner),
        chain: getProviderOnName(x?.network),
        transport: http(),
      });
      const smartAccountClient = await createSmartAccountClient({
        signer: walletClient,
        biconomyPaymasterApiKey: getPaymasterKeyOnName(x?.network),
        bundlerUrl: `https://bundler.biconomy.io/api/v2/${getIdOnChain(
          x?.network
        )}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f444`,
      });
      console.log("smart account client created =====", smartAccountClient);

      const scwAddress = await smartAccountClient.getAccountAddress();
      console.log("smart account address created =====", scwAddress);
      return {
        address: scwAddress,
        chainId: getIdOnChain(x?.network),
      };
    })
  );

  // The exact request body is needed to complete the signature action. You can
  // choose the approach to maintain the state. In the example, it is simply passed
  // back in the response, and included in the generateSignatureComplete request.
  res.json({
    scw: result,
  });
};
