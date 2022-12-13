import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
//import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
const getConnection = () => {
  // const network = "https://api.devnet.solana.com/";
  const network = "https://api.metaplex.solana.com/";

  const connection = new Connection(network, "processed");
  return connection;
};

export const createTokenMetaData = async (wallet) => {
  const connection = getConnection();
  const mint = new PublicKey("G19MEg34am89VdJ4Exk17Xo5CTXkwXzy4jtA9qaSJyV");
  const collectionMint = new PublicKey(
    "88F2SFZbygxGg6Q6V9GeZ3teUb2pbDCckyxMiQMzFZvH"
  );
  const collectionKey = new PublicKey(
    "3HJQufwKGoof7W2s1aCLqfgUU7dwgZXBrpyQcoeNhgkE"
  );

  console.log("Mint id", mint.toString());
  const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
  const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
  const seed3 = Buffer.from(mint.toBytes());
  const [metadataPDA, _bump] = PublicKey.findProgramAddressSync(
    [seed1, seed2, seed3],
    mpl.PROGRAM_ID
  );

  const [collectionMetadataPDA, _bump3] = PublicKey.findProgramAddressSync(
    [seed1, seed2, Buffer.from(collectionMint.toBytes())],
    mpl.PROGRAM_ID
  );

  let verifyTransaction = mpl.createSetAndVerifyCollectionInstruction({
    metadata: metadataPDA,
    collectionAuthority: wallet.publicKey,
    payer: wallet.publicKey,
    updateAuthority: wallet.publicKey,
    collectionMint: collectionMint,
    collection: collectionKey,
    collectionMasterEditionAccount: collectionMetadataPDA,
  });

  const transaction = new Transaction().add(verifyTransaction);
  //transaction.add(ix);
  const {
    context: { slot: minContextSlot },
    value: { blockhash, lastValidBlockHeight },
  } = await connection.getLatestBlockhashAndContext();

  try {
    const signature = await wallet.sendTransaction(transaction, connection, {
      minContextSlot,
    });
    console.log(signature);
    const sign = await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
    console.log("check logs here: ", sign);
  } catch (error) {
    console.log(error);
  }
};
