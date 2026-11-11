import { cors } from "@elysia/cors";
import { Elysia } from "elysia";
import { env } from "../env";

export const httpCors = new Elysia({ name: "http-cors" }).use(
  cors({
    origin: env.webOrigin,
    credentials: true,
    allowedHeaders: ["Content-Type"],
  }),
);
