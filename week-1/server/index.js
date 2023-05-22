const express = require("express");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  // 6ec9452b4e36967c0ed872d8bc52d00f7867a396379ae6517e4684a4297ec829
  "0xa3bb6438ea65ad835ad8a9e245d5ed74733a5263": 100,
  // 47d3e0b6dcc9f1a2217a6df6b8cb7f0d9deb1edfc38210b69c2e2104ad5b0795
  "0x098e55151a4b51a336e9afeee47c268a8700a7eb": 50,
  // d43ffac5df56fc30602ffb927ec82d9dafbb782eab028794335cf39faa123ceb
  "0x9ee609be3e9e4564b7981adcca9358011d0e41ee": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { from, amount, recipient, publicKey, signature } = req.body;
  const message = { from, amount: parseInt(amount), recipient }

  signature.r = BigInt(signature.r);
  signature.s = BigInt(signature.s);

  if (!secp256k1.verify(signature, Uint8Array.from(message), publicKey)) {
    res.status(400).send({ message: "Invalid signature" });
  }

  setInitialBalance(from);
  setInitialBalance(recipient);

  if (balances[from] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[from] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[from] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
