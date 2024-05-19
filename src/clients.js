import { DfnsApiClient, DfnsDelegatedApiClient } from "@dfns/sdk";
import { AsymmetricKeySigner } from "@dfns/sdk-keysigner";

export const apiClient = (appId, authToken) => {
  const signer = new AsymmetricKeySigner({
    credId: process.env.DFNS_CRED_ID,
    privateKey: process.env.DFNS_PRIVATE_KEY,
  });

  return new DfnsApiClient({
    appId: appId ?? process.env.DFNS_APP_ID,
    authToken: authToken ?? process.env.DFNS_AUTH_TOKEN,
    baseUrl: process.env.DFNS_API_URL,
    signer,
  });
};
export const initDfnsWallet = (walletId) => {
  const signer = new AsymmetricKeySigner({
    credId: process.env.DFNS_CRED_ID,
    privateKey: process.env.DFNS_PRIVATE_KEY,
  });

  const dfnsClient = new DfnsApiClient({
    appId: process.env.DFNS_APP_ID,
    authToken: process.env.DFNS_AUTH_TOKEN,
    baseUrl: process.env.DFNS_API_URL,
    signer,
  });

  return DfnsWallet.init({ walletId, dfnsClient });
};
export const delegatedClient = (appId, authToken) => {
  return new DfnsDelegatedApiClient({
    appId,
    authToken,
    baseUrl: process.env.DFNS_API_URL,
  });
};
// export const initDfnsWallet = async (appId, walletId, authToken) => {
//   const signer = new AsymmetricKeySigner({
//     credId: process.env.DFNS_CRED_ID,
//     privateKey: process.env.DFNS_PRIVATE_KEY,
//   });

//   const dfnsClient = new DfnsApiClient({
//     appId,
//     authToken,
//     baseUrl: "https://api.dfns.io",
//     signer,
//   });

//   return new DfnsWallet.init({ walletId, dfnsClient });
// };
