import { useWeb3React } from '@web3-react/core';
import {
  MouseEvent,
  ReactElement,
} from 'react';
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
} from '@chakra-ui/react'
import React from 'react';
import { generateRandomKeys, encrypt, KeyPair } from 'paillier-bigint';

export function KeyPairGeneration(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active, } = context;

  function handleKeysGeneration(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    async function keygen(): Promise<void> {
      try {
        const keys: KeyPair = await generateRandomKeys(32);
        console.log("keys: ", keys);
        const element = document.createElement("a");
        const keyJson = {
          n: keys.publicKey.n.toString(),
          g: keys.publicKey.g.toString(),
          mu: keys.privateKey.mu.toString(),
          lambda: keys.privateKey.lambda.toString(),
        }
        const textFile = new Blob([JSON.stringify(keyJson)] as any, { type: 'text/plain' }); //pass data from localStorage API to blob
        element.href = URL.createObjectURL(textFile);
        element.download = "keyPair.json";
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

  const styles = useMultiStyleConfig("Button", { variant: "outline" });

  return (
    <Card borderColor={"blackAlpha.700"} borderWidth={"1px"} borderRadius={"sm"}>
      <CardHeader>
        <Heading size='md'>Key Pair Generation</Heading>
        <Text>This step required for</Text>
        <Center>
          <CardFooter>
            <Button colorScheme='blue' onClick={handleKeysGeneration}>Generation</Button>
          </CardFooter>
        </Center>
      </CardHeader>
    </Card>
  );
}
