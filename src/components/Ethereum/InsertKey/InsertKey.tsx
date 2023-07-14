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

interface KeysJson {
  n: String;
  g: String;
  mu: String;
  lambda: String;
}

export function InsertKey(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active, } = context;

  const [input, setInput] = useState<Array<String>>();
  const [keys, setKeys] = useState<KeysJson>();

  function handleInsertKey(e: any): void {
    let obj: KeysJson;
    const fileReader = new FileReader();

    // TODO: check e.target.files exists --   if (e.target.files)
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      obj = JSON.parse(e.target.result);
      // add to react storage
      setKeys(obj);
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
      <CardBody>
        <FormControl>
          <FormLabel>Keys</FormLabel>
          <Input type="file"
            sx={{
              "::file-selector-button": {
                border: "none",
                outline: "none",
                mr: 2,
                ...styles,
              }

            }}
            onChange={handleInsertKey}
          />
          {/* <br />
          <FormLabel>Private Key</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }} onChange={handleInput} />
          <FormHelperText>We'll never share your email.</FormHelperText> */}
        </FormControl>
      </CardBody>
    </Card>
  );
}
