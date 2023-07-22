import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import { ReactElement, useEffect, useState } from 'react';
import zkToken from '../../../artifacts/contracts/zkToken.sol/zkToken.json';
import { Provider } from '../../../utils/provider';

import {
  FormControl,
  FormLabel,
  Input,
  Text,
  useMultiStyleConfig,
  Card,
  CardHeader,
  Heading,
  CardBody,
  CardFooter,
  Button,
  Center,
} from '@chakra-ui/react';
import React from 'react';

import { PublicKey, PrivateKey } from 'paillier-bigint';

interface ProofJson {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: String;
  curve: String;
}

export function Mint(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [zktContract, setContract] = useState<Contract>();
  const [input, setInput] = useState<Array<String>>();
  const [proof, setProof] = useState<ProofJson>();
  const [publicSignals, setPublicSignals] = useState<Array<String>>();
  const [tokenQuantity, setTokenQuantity] = useState<string>('');

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!zktContract) {
      return;
    }
  }, [zktContract]);

  function handleMint(): void {
    if (zktContract || !signer) {
      return;
    }

    let address: string = '0xa753614F449d263487D506CD40c697E49e28d3d8';
    const ZKT = new ethers.Contract(address, zkToken.abi, signer);

    async function submitMint(zktContract: Contract): Promise<void> {
      console.log('STEP 2');
      console.log('proof: ', proof);
      console.log('publicSignals: ', publicSignals);

      try {
        const mintTx = await zktContract.mint(
          signer,
          [proof.pi_a[0], proof.pi_a[1]],
          [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]],
          ],
          [proof.pi_c[0], proof.pi_c[1]],
          publicSignals,
          { gasLimit: 1000000 }
        );
        console.log(mintTx);
      } catch (error: any) {
        console.log(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }
    async function checkMint(zktContract: Contract): Promise<void> {
      const pub = new PublicKey(BigInt(input.n), BigInt(input.g));

      const priv = new PrivateKey(BigInt(input.lambda), BigInt(input.mu), pub);

      const balance = await zktContract.balanceOf(signer);
      console.log(priv.decrypt(balance));
    }
    submitMint(ZKT);
    checkMint(ZKT);
  }

  function handleInput(e: any): void {
    const fileReader = new FileReader();
    let array: Array<String>;

    // TODO: check e.target.files exists --   if (e.target.files)
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = e => {
      array = JSON.parse(e.target.result);
      console.log('arr: ', array);
      setInput(array);
    };
  }

  const styles = useMultiStyleConfig('Button', { variant: 'outline' });

  return (
    <Card
      borderColor={'blackAlpha.700'}
      borderWidth={'1px'}
      borderRadius={'sm'}
    >
      <CardHeader>
        <Heading size="md">Self Mint</Heading>
        <Text>
          This step is necessary to mint tokens, here is an example of minting
          to oneself, but it is possible to mint tokens for all registered
          users.
        </Text>
      </CardHeader>
      <CardBody>
        <FormControl>
          <FormLabel>
            keyPair<small>.json</small>
          </FormLabel>
          <Input
            type="file"
            sx={{
              '::file-selector-button': {
                border: 'none',
                outline: 'none',
                mr: 2,
                ...styles,
              },
            }}
            onChange={handleInput}
          />
          <FormLabel>Token value</FormLabel>
          <Input
            type="number"
            placeholder="Enter value"
            value={tokenQuantity}
            onChange={e => setTokenQuantity(e.target.value)}
          />
        </FormControl>
      </CardBody>
      <Center>
        <CardFooter>
          <Button
            colorScheme="blue"
            onClick={async () => {
              let wasmFile = 'http://localhost:3000/mint.wasm';
              let mintZkeyFile = 'http://localhost:3000/mint_0001.zkey';

              console.log(wasmFile);

              const r = BigInt(
                Math.floor(Math.random() * Number(input.n.toString()))
              );

              const pub = new PublicKey(BigInt(input.n), BigInt(input.g));

              const priv = new PrivateKey(
                BigInt(input.lambda),
                BigInt(input.mu),
                pub
              );

              const balanceMint = pub.encrypt(BigInt(tokenQuantity), r);
              console.log(priv.decrypt(balanceMint));

              console.log('balanceMint: ', balanceMint);

              const inputMint = {
                encryptedValue: balanceMint.toString(),
                value: tokenQuantity.toString(),
                receiverPubKey: [
                  pub.g.toString(),
                  r.toString(),
                  pub.n.toString(),
                ],
              };
              console.log('inputMint: ', inputMint);
              const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                inputMint,
                wasmFile,
                mintZkeyFile
              );

              try {
                const proofFile = document.createElement('a');
                const pi_a = [
                  proof.pi_a[0].toString(),
                  proof.pi_a[1].toString(),
                  proof.pi_a[2].toString(),
                ];
                const pi_b = {
                  0: [proof.pi_b[0][0].toString(), proof.pi_b[0][1].toString()],
                  1: [proof.pi_b[1][0].toString(), proof.pi_b[1][1].toString()],
                  2: [proof.pi_b[2][0].toString(), proof.pi_b[2][1].toString()],
                };
                const pi_c = [
                  proof.pi_c[0].toString(),
                  proof.pi_c[1].toString(),
                  proof.pi_c[2].toString(),
                ];

                const proofJson = {
                  curve: proof.curve.toString(),
                  pi_a: pi_a,
                  pi_b: pi_b,
                  pi_c: pi_c,
                  protocol: proof.protocol.toString(),
                };
                const proofJsonFile = new Blob(
                  [JSON.stringify(proofJson)] as any,
                  { type: 'text/plain' }
                ); //pass data from localStorage API to blob

                proofFile.href = URL.createObjectURL(proofJsonFile);
                proofFile.download = 'proof.json';
                document.body.appendChild(proofFile);
                proofFile.click();
              } catch (error: any) {
                console.log(
                  'Error!' +
                    (error && error.message ? `\n\n${error.message}` : '')
                );
              }

              try {
                const signalFile = document.createElement('a');

                const signalsJson = [publicSignals[0].toString()];

                const signalJsonFile = new Blob(
                  [JSON.stringify(signalsJson)] as any,
                  { type: 'text/plain' }
                ); //pass data from localStorage API to blob
                signalFile.href = URL.createObjectURL(signalJsonFile);
                signalFile.download = 'signals.json';
                document.body.appendChild(signalFile);
                signalFile.click();
              } catch (error: any) {
                console.log(
                  'Error!' +
                    (error && error.message ? `\n\n${error.message}` : '')
                );
              }

              console.log('proof: ', proof);
              console.log('publicSignals: ', publicSignals);

              setProof(proof);
              setPublicSignals(publicSignals);
              handleMint();
            }}
          >
            Mint
          </Button>
        </CardFooter>
      </Center>
    </Card>
  );
}
