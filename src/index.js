import cors from "cors";
// import * as cors from "cors";

import * as dotenv from "dotenv";
// import { Express, Request, Response } from "express";
import express from "express";
import asyncHandler from "express-async-handler";
// import * as asyncHandler from "express-async-handler";
import morgan from "morgan";
// import * as morgan from "morgan";
import { login } from "./handlers/login.js";
import { registerComplete, registerInit } from "./handlers/register.js";
import {
  generateSignatureComplete,
  generateSignatureInit,
  listWallets,
} from "./handlers/wallets.js";

dotenv.config();

const app = express();
app.use(morgan("combined"));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Dfns SDK Tutorial Server");
});

app.post("/login", asyncHandler(login));

app.post("/register/init", asyncHandler(registerInit));
app.post("/register/complete", asyncHandler(registerComplete));

app.post("/wallets/list", asyncHandler(listWallets));
app.post("/wallets/signatures/init", asyncHandler(generateSignatureInit));
app.post(
  "/wallets/signatures/complete",
  asyncHandler(generateSignatureComplete)
);

// static files to associate the domain with Android and iOS apps
app.use(
  "/.well-known",
  express.static("static", {
    setHeaders: (res) => {
      res.setHeader("content-type", "application/json");
    },
  })
);

const port = process.env.EXPRESS_PORT;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
