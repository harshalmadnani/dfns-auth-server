import { UserAuthKind } from "@dfns/sdk/codegen/datamodel/Auth";
import { Request, Response } from "express";

import { apiClient } from "../clients";

export const registerInit = async (req, res) => {
  // You can perform the registration flow of your system before starting the
  // Dfns delegated registration.
  const { appId, username } = req.body;

  // Registration must use the appId and appOrigin of the client application,
  // otherwise the challenge returned does not have the appropriate relying
  // party and origin to create the WebAuthn or Passkeys credential
  console.log("app id....", username, appId);
  const client = apiClient(appId);
  console.log("app client....", client);
  const challenge = await client.auth.createDelegatedRegistrationChallenge({
    body: { kind: "EndUser", email: username },
  });
  console.log("app challenge....", challenge);
  console.debug(challenge);
  res.json(challenge);
};

export const registerComplete = async (req, res) => {
  // Complete the registration with the appId of the client application and
  // the temporary auth token from the original challenge.
  const { appId, signedChallenge, temporaryAuthenticationToken } = req.body;
  console.log("client initialized......started");
  const client = apiClient(appId, temporaryAuthenticationToken);
  console.log("client initialized......finished");
  const registration = await client.auth.registerEndUser({
    body: {
      ...signedChallenge,
      wallets: [{ network: "PolygonAmoy" }],
      // wallets: [{ network: "Polygon" },{ network: "Ethereum" },{ network: "Base" },{ network: "ArbitrumOne" }],
    },
  });

  console.debug(registration);

  res.json(registration);
};
