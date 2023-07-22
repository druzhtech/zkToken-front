import { useWeb3React } from '@web3-react/core';
import { MouseEvent, ReactElement } from 'react';
import styled from 'styled-components';
import { Provider } from '../../../utils/provider';
// import { SectionDivider } from './SectionDivider';
import {
  Text,
  useMultiStyleConfig,
  Card,
  CardHeader,
  Heading,
  CardFooter,
  Button,
  Center,
} from '@chakra-ui/react';
import React from 'react';
import {
  generateRandomKeys,
  PublicKey,
  KeyPair,
  PrivateKey,
} from 'paillier-bigint';

export function KeyPairGeneration(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  function handleKeysGeneration(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    async function keygen(): Promise<void> {
      try {
        const keys: KeyPair = await generateRandomKeys(32);
        console.log('keys: ', keys);
        const element = document.createElement('a');
        const keyJson = {
          n: keys.publicKey.n.toString(),
          g: keys.publicKey.g.toString(),
          mu: keys.privateKey.mu.toString(),
          lambda: keys.privateKey.lambda.toString(),
        };

        console.log(keys.publicKey);
        console.log(keys.privateKey);

        const r = BigInt(
          Math.floor(Math.random() * Number(keyJson.n.toString()))
        );

        const pub = new PublicKey(
          BigInt(Number(keyJson.n)),
          BigInt(Number(keyJson.g))
        );

        const priv = new PrivateKey(
          BigInt(keyJson.lambda),
          BigInt(keyJson.mu),
          pub
        );

        console.log(pub);
        console.log(priv);

        const balanceZero = pub.encrypt(0n, r);

        console.log('balanceZero: ', balanceZero);

        console.log('Zero', priv.decrypt(balanceZero));

        const textFile = new Blob([JSON.stringify(keyJson)] as any, {
          type: 'text/plain',
        }); //pass data from localStorage API to blob
        element.href = URL.createObjectURL(textFile);
        element.download = 'keyPair.json';
        document.body.appendChild(element);
        element.click();
      } catch (error: any) {
        console.log(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }
    keygen();
  }

  const styles = useMultiStyleConfig('Button', { variant: 'outline' });

  return (
    <Card
      borderColor={'blackAlpha.700'}
      borderWidth={'1px'}
      borderRadius={'sm'}
    >
      <CardHeader>
        <Heading size="md">Key Pair Generation</Heading>
        <Text>This step required for</Text>
        <Center>
          <CardFooter>
            <Button colorScheme="blue" onClick={handleKeysGeneration}>
              Generation
            </Button>
          </CardFooter>
        </Center>
      </CardHeader>
    </Card>
  );
}
