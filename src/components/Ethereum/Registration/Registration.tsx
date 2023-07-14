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
  Input, Text,
  FormHelperText,
  useMultiStyleConfig,
  Card,
  CardHeader,
  Heading,
  CardBody,
  CardFooter,
  Button,
  Center,
} from '@chakra-ui/react'
import React from 'react';
// const snarkjs = require("snarkjs");
// import { groth16 } from 'snarkjs';


interface ProofJson {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: String;
  curve: String;
}

export function Registration(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active, } = context;

  const [signer, setSigner] = useState<Signer>();
  const [zktContract, setContract] = useState<Contract>();
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

    // async function instContract(zktContract: Contract): Promise<void> {
    // }
    // instContract(zktContract);
  }, [zktContract]);

  function handleRegistration(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    // only deploy the contract one time, when a signer is defined
    if (zktContract || !signer) {
      return;
    }

    let address: string = "0x31eEB76500299284113C029C9B3dC5c0f442689c";
    const ZKT = new ethers.Contract(address, zkToken.abi, signer);

    async function submitRegistration(zktContract: Contract): Promise<void> {
      console.log("STEP 1")
      try {

        const registrationTx = await zktContract.registration(
          [proof.pi_a[0], proof.pi_a[1]],
          [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]],
          ],
          [proof.pi_c[0], proof.pi_c[1]],
          input, { gasLimit: 100000 });

        // Транзакция
        let txReceipt = await registrationTx.wait();
        console.log("txReceipt: ", txReceipt);

        // События
        const filter = zktContract.filters.Registration();
        let events = await zktContract.queryFilter(filter).then(console.log);
        console.log("Registration Events: ", events)

      } catch (error: any) {
        console.log(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }
    submitRegistration(ZKT);
  }

  // async function calculateProof() {

  //   const vkey = await fetch("verification_key.json").then(function (res) {
  //     return res.json();
  //   });

  //   const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  //   console.log("res: ", res)
  // }

  function handleInput(e: any): void {
    const fileReader = new FileReader();
    let array: Array<String>;

    let wasmFile = "http://localhost:3000/registration.wasm";
    let registrationZkeyFile = "http://localhost:3000/registration_0001.zkey";

    console.log("wasmFile: ", wasmFile)

    const { proof, publicSignals } = snarkjs.groth16.fullProve({
      "encryptedBalance": "14482943719185885411",
      "balance": "0",
      "pubKey": ["11602453138767397513", "3192754792", "3822292349"]
    }, wasmFile, registrationZkeyFile)

    console.log("proof: ", proof)
    console.log("publicSignals: ", publicSignals)

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
        <Heading size='md'>Registration</Heading>
        <Text>This step required for</Text>

      </CardHeader>
      <CardBody>
        <FormControl>
          <FormLabel>keyPair<small>.json</small></FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }} onChange={handleInput} />
          <FormHelperText>We'll never share your email.</FormHelperText>

        </FormControl>

      </CardBody>
      <Center>   <CardFooter>
        <Button colorScheme='blue' onClick={handleRegistration}>Registration</Button>
        <button onClick={async () => {

          let wasmFile = "http://localhost:3000/registration.wasm";
          let registrationZkeyFile = "http://localhost:3000/registration_0001.zkey";

          const { proof, publicSignals } = await snarkjs.groth16.fullProve({
            "encryptedBalance": "14482943719185885411",
            "balance": "0",
            "pubKey": ["11602453138767397513", "3192754792", "3822292349"]
          }, wasmFile, registrationZkeyFile)


          console.log("proof: ", proof)
          console.log("publicSignals: ", publicSignals)
        }
        }> Button
        </button>
      </CardFooter></Center>
    </Card>

  );
}