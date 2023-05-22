import { useState } from "react";
import server from "./server";
import { secp256k1 } from 'ethereum-cryptography/secp256k1';
import { toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const publicKey = secp256k1.getPublicKey(privateKey, false)
      const address = "0x"+toHex(keccak256(publicKey.slice(1)).slice(-20))

      const message = {
        from: address,
        amount: parseInt(sendAmount),
        recipient
      }    

      const signature = secp256k1.sign(Uint8Array.from(message), privateKey)

      const {
        data: { balance },
      } = await server.post(`send`, {
        from: address,
        amount: parseInt(sendAmount),
        recipient,
        publicKey: toHex(publicKey),
        signature: JSON.parse(JSON.stringify(signature, (key, value) => typeof value === 'bigint' ? value.toString() : value))
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
