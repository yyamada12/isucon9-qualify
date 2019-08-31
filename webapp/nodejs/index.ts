import { IncomingMessage, ServerResponse } from "http";
import util from "util";
import childProcess from "child_process";
import path from "path";
import fs from "fs";

import TraceError from "trace-error";
import createFastify, { FastifyRequest, FastifyReply } from "fastify";
// @ts-ignore
import fastifyMysql from "fastify-mysql";
import fastifyCookie from "fastify-cookie";
import fastifyStatic from "fastify-static";

const execFile = util.promisify(childProcess.execFile);

type MySQLResultRows = Array<any> & { insertId: number };
type MySQLColumnCatalogs = Array<any>;

type MySQLResultSet = [MySQLResultRows, MySQLColumnCatalogs];

interface MySQLQueryable {
  query(sql: string, params?: ReadonlyArray<any>): Promise<MySQLResultSet>;
}

interface MySQLClient extends MySQLQueryable {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

declare module "fastify" {
  interface FastifyInstance<HttpServer, HttpRequest, HttpResponse> {
    mysql: MySQLQueryable & {
      getConnection(): Promise<MySQLClient>;
    };
  }

  interface FastifyRequest<HttpRequest> {
    // add types if needed
  }

  interface FastifyReply<HttpResponse> {
    // add types if needed
  }
}

// =============================================

function TODO() {
  throw new Error("Not yet implemented!");
}

const sessionName = "session_isucari";
const DefaultPaymentServiceURL = "http://localhost:5555";
const DefaultShipmentServiceURL = "http://localhost:7000";
const ItemMinPrice = 100;
const ItemMaxPrice = 1000000;
const ItemPriceErrMsg =
  "商品価格は100ｲｽｺｲﾝ以上、1,000,000ｲｽｺｲﾝ以下にしてください";
const ItemStatusOnSale = "on_sale";
const ItemStatusTrading = "trading";
const ItemStatusSoldOut = "sold_out";
const ItemStatusStop = "stop";
const ItemStatusCancel = "cancel";
const PaymentServiceIsucariAPIKey = "a15400e46c83635eb181-946abb51ff26a868317c";
const PaymentServiceIsucariShopID = "11";
const TransactionEvidenceStatusWaitShipping = "wait_shipping";
const TransactionEvidenceStatusWaitDone = "wait_done";
const TransactionEvidenceStatusDone = "done";
const ShippingsStatusInitial = "initial";
const ShippingsStatusWaitPickup = "wait_pickup";
const ShippingsStatusShipping = "shipping";
const ShippingsStatusDone = "done";
const BumpChargeSeconds = 3;
const ItemsPerPage = 48;
const TransactionsPerPage = 10;
const BcryptCost = 10;

type Config = {
  name: string;
  val: string;
};

type User = {
  id: number;
  account_name: string;
  hashed_password: string;
  address: string;
  num_sell_items: number;
  last_bump: Date;
  created_at: Date;
};

type UserSimple = {
  id: number;
  account_name: string;
  num_sell_items: number;
};

type Item = {
  id: number;
  seller_id: number;
  buyer_id: number;
  status: string;
  name: string;
  price: number;
  description: string;
  image_name: string;
  category_id: number;
  creaed_at: Date;
  updated_at: Date;
};

type ItemSimple = {
  id: number;
  seller_id: number;
  seller: UserSimple;
  status: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category_id: number;
  category: Category;
  creaed_at: Date;
};

type ItemDetail = {
  id: number;
  seller_id: number;
  seller: UserSimple;
  buyer_id: number;
  buyer: UserSimple;
  status: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category_id: number;
  category: Category;
  transaction_evidence_id: number;
  transaction_evidence_status: string;
  shipping_status: string;
  created_at: Date;
};

type TransactionEvidence = {
  id: number;
  seller_id: number;
  buyer_id: string;
  status: string;
  item_id: string;
  item_name: string;
  item_price: number;
  item_description: string;
  item_category_id: number;
  item_root_category_id: number;
  created_at: Date;
  updated_at: Date;
};

type Shipping = {};

type Category = {};

type ReqInitialize = {
  payment_service_url: string;
  shipment_service_url: string;
};

const fastify = createFastify({
  logger: true
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public")
});

fastify.register(fastifyMysql, {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || "3306",
  user: process.env.DB_USER || "isucari",
  password: process.env.DB_PASS || "isucari",
  database: process.env.DB_DATABASE || "isucari",

  promise: true
});

function buildUriFor<T extends IncomingMessage>(request: FastifyRequest<T>) {
  const uriBase = `http://${request.headers.host}`;
  return (path: string) => {
    return `${uriBase}${path}`;
  };
}

async function getConnection() {
  return fastify.mysql.getConnection();
}

// API

fastify.post("/initialize", async (req, reply) => {
  const ri: ReqInitialize = req.body;

  await execFile("../sql/init.sh");

  const conn = await getConnection();

  await conn.query(
    "INSERT INTO `configs` (`name`, `val`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `val` = VALUES(`val`)",
    ["payment_service_url", ri.payment_service_url]
  );

  await conn.query(
    "INSERT INTO `configs` (`name`, `val`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `val` = VALUES(`val`)",
    ["shipment_service_url", ri.shipment_service_url]
  );

  const res = {
    // Campaign 実施時は true にする
    is_campaign: false
  };

  reply
    .code(200)
    .type("application/json")
    .send(res);
});

fastify.get("/new_items.json", (_req, reply) => {
  TODO();
});

fastify.get("/new_items/:root_category_id.json", (req, reply) => {
  const rootCategoryId: string = req.params.root_category_id;
  TODO();
});

fastify.get("/users/transactions.json", (req, reply) => {
  TODO();
});

fastify.get("/users/:user_id.json", (req, reply) => {
  const userId: string = req.params.user_id;
  TODO();
});

fastify.get("/items/:item_id.json", (req, reply) => {
  const itemId: string = req.params.item_id;
  TODO();
});

fastify.post("/items/edit", (req, reply) => {
  TODO();
});

fastify.post("/buy", (req, reply) => {
  TODO();
});

fastify.post("/sell", (req, reply) => {
  TODO();
});

fastify.post("/ship", (req, reply) => {
  TODO();
});

fastify.post("/ship_done", (req, reply) => {
  TODO();
});

fastify.post("/complete", (req, reply) => {
  TODO();
});

fastify.get("/transactions/:transaction_evidence_id.png", (req, reply) => {
  const transactionEvidenceId: string = req.params.transaction_evidence_id;
  TODO();
});

fastify.post("/bump", (req, reply) => {
  TODO();
});

fastify.get("/settings", (req, reply) => {
  TODO();
});

fastify.post("/login", (req, reply) => {
  TODO();
});

fastify.post("/register", (req, reply) => {
  TODO();
});

fastify.get("/reports.json", (req, reply) => {
  TODO();
});

// Frontend

async function getIndex(_req: any, reply: FastifyReply<ServerResponse>) {
  const html = await fs.promises.readFile(
    path.join(__dirname, "public/index.html")
  );
  reply.type("text/html").send(html);
}

fastify.get("/", getIndex);
fastify.get("/login", getIndex);
fastify.get("/register", getIndex);
fastify.get("/timeline", getIndex);
fastify.get("/categories/:category_id/items", getIndex);
fastify.get("/sell", getIndex);
fastify.get("/items/:item_id/edit", getIndex);
fastify.get("/items/:item_id/buy", getIndex);
fastify.get("/buy/complete", getIndex);

fastify.listen(8000, (err, _address) => {
  if (err) {
    throw new TraceError("Failed to listening", err);
  }
});
