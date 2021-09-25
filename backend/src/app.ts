import express from "express";
import cookie_parser from "cookie-parser";
import { Server, createServer } from "http";
import path from 'path'
import cors from "cors";
import { Express, RequestHandler } from "express";
import { Server as SocketServer } from "socket.io";
import { createProxyMiddleware } from "http-proxy-middleware";
import { setup_io } from "./client";

const rootStatic = path.resolve(__dirname, '../../frontend/build');
const rootHtml = path.resolve(rootStatic, './index.html');

export const local_proxy = (app: Express): RequestHandler[] => {
  const proxy_host = "http://localhost:3000";
  const proxy_ware = createProxyMiddleware({
    target: proxy_host,
    changeOrigin: true,
  });
  app.get("*", proxy_ware);
  return [proxy_ware];
};


const find_and_stream_index = (req, res) => {
  res.sendFile(rootHtml)
}

export const app_setup = async (): Promise<{server:Server, io: SocketServer}> => {
  const should_proxy =
    process.env.ENV_NAME === "local";
  const app = express();
  let proxy_ware;
  app.use(cors());
  app.use(express.json());
  app.use(cookie_parser());
  const port = process.env.API_PORT;
  const server = createServer(app)
  const io = new SocketServer(server, {
    path: '/api/rooms'
  })
  setup_io(io)
  app.get("/health", (req, res) => {
    res.send('ok')
  });
  if (should_proxy) {
    proxy_ware = local_proxy(app);}
  else {
    express.static(rootStatic)
    app.get("*", find_and_stream_index);
  }
  if (proxy_ware)
    proxy_ware.forEach((int) => server.on("upgrade", int.upgrade));
  server.listen(port || 4000)
  return {server, io};
};

app_setup()
