import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import zkToken from '../../../artifacts/contracts/zkToken.sol/zkToken.json';
import { Provider } from '../../../utils/provider';
// import { SectionDivider } from './SectionDivider';
import { strictEqual } from 'assert';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input, InputProps,
  FormHelperText,
  useMultiStyleConfig,
  Card,
  CardHeader, Text,
  Heading,
  CardBody,
  CardFooter,
  Button,
  Center,
} from '@chakra-ui/react'
import React from 'react';

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
  const [address, setAddress] = useState<String>('');
  const [input, setInput] = useState<Array<String>>();
  const [proof, setProof] = useState<ProofJson>();

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

    let address: string = "0x31eEB76500299284113C029C9B3dC5c0f442689c";
    const ZKT = new ethers.Contract(address, zkToken.abi, signer);

    async function instContract(zkt: Contract): Promise<void> {
      const name = await zkt.name();
      console.log("name: ", name);
      setContract(zkt);
    }

    instContract(ZKT);
  }, [zktContract]);

  function handleMint(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    // only deploy the W3PH contract one time, when a signer is defined
    if (zktContract || !signer) {
      return;
    }

    let address: string = "0x31eEB76500299284113C029C9B3dC5c0f442689c";
    const ZKT = new ethers.Contract(address, zkToken.abi, signer);

    async function submitMint(zkt: Contract): Promise<void> {
      console.log("STEP 1")

      try {
        const registrationTx = await zkt.mint(
          address,
          [proof.pi_a[0], proof.pi_a[1]],
          [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]],
          ],
          [proof.pi_c[0], proof.pi_c[1]],
          input, { gasLimit: 100000 });

        // TODO: spinner on

        // Транзакция
        let txReceipt = await registrationTx.wait();
        console.log("txReceipt: ", txReceipt);

        // TODO: spinner off

        // События
        const filter = zkt.filters.Registration();
        let events = await zkt.queryFilter(filter).then(console.log);
        console.log("Registration Events: ", events)

      } catch (error: any) {
        console.log(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }
    submitMint(ZKT);
  }

  function handleAddress(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setAddress(event.target.value);
    console.log("address: ", address)
  }

  function handleProof(e: any): void {
    let obj: ProofJson;
    const fileReader = new FileReader();

    // TODO: check e.target.files exists -- if (e.target.files)
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      obj = JSON.parse(e.target.result);
      console.log("obj: ", obj);
      setProof(obj);
    };
  }

  function handleInput(e: any): void {
    const fileReader = new FileReader();
    let array: Array<String>;

    // TODO: check e.target.files exists --   if (e.target.files)
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      array = JSON.parse(e.target.result);
      console.log("arr: ", array)
      setInput(array);
    };

  }

  const styles = useMultiStyleConfig("Button", { variant: "outline" });


  return (

    <Card borderColor={"blackAlpha.700"} borderWidth={"1px"} borderRadius={"sm"}>
      <CardHeader>
        <Heading size='md'>Mint</Heading>
        <Text size='sm'>Description</Text>

      </CardHeader>
      <CardBody>
        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input type='text' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }}
            onChange={handleAddress}

          />
          <br />
          <br />
          <FormLabel>Proof</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }}
            onChange={handleProof}

          />
          <br />
          <br />
          <FormLabel>Input</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }}
            onChange={handleInput}
          />
        </FormControl>

      </CardBody>
      <Center><CardFooter>
        <Button colorScheme='blue' onClick={handleMint}>Mint</Button>
      </CardFooter></Center>
    </Card>

  );
}
