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
import zkToken from '../../artifacts/contracts/zkToken.sol/zkToken.json';
import { Provider } from '../../utils/provider';
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
  CardHeader,
  Heading,
  CardBody,
  CardFooter,
  Button,
  Center,
} from '@chakra-ui/react'
import React from 'react';

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledServiceDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

export function Registration(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [zktContract, setW3phContract] = useState<Contract>();
  const [zktContractAddr, setZKTContractAddr] = useState<string>('');
  const [proofA, setProofA] = useState();
  const [files, setFiles] = useState("");

  const [version, setVersion] = useState<string>('');
  const [addressInput, setAddressInput] = useState<string>('');

  const [projType, setProjType] = useState<string>('');
  const [projectInput, setProjectInput] = useState<string>('');

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

    async function getW3phContract(zktContract: Contract): Promise<void> {
      const _version = await zktContract.name();

      if (_version !== version) {
        setVersion(_version);
      }
    }

    getW3phContract(zktContract);
  }, [zktContract, version]);

  function handleRegistration(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    console.log("REFIST")

    if (!zktContract) {
      window.alert('Undefined zktContract');
      return;
    }
    // if (!projectInput) {
    //   window.alert('Version cannot be empty');
    //   return;
    // }

    async function submitRegistration(zktContract: Contract): Promise<void> {
      try {

        const options = { value: ethers.parseEther("0.0001") };
        const createProjectTx = await zktContract.createProject(options);

        // Транзакция
        let txReceipt = await createProjectTx.wait();
        console.log("txReceipt: ", txReceipt);
        const project = await zktContract.getProjectByOwner(signer?.getAddress());
        window.alert(`Project info: ${project}`);

        // События
        const filter = zktContract.filters.NewProjectCreated();
        let events = await zktContract.queryFilter(filter).then(console.log);
        console.log("events: ", events)

      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }
    submitRegistration(zktContract);
  }


  function handleProofA(e: any): void {
    console.log("json: ", e.target.files[0])

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      setFiles(e.target.result);
    };

    if (e.target.files) {
      setProofA(e.target.files[0]);
    }
    // event.preventDefault();
    // setProofA(event.target.value);
  }

  function handleProofB(e: any): void {
    console.log("json: ", e.target.files[0])

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      setFiles(e.target.result);
    };

    if (e.target.files) {
      setProofA(e.target.files[0]);
    }
    // event.preventDefault();
    // setProofA(event.target.value);
  }

  function handleProofC(e: any): void {
    console.log("json: ", e.target.files[0])

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      setFiles(e.target.result);
    };

    if (e.target.files) {
      setProofA(e.target.files[0]);
    }
    // event.preventDefault();
    // setProofA(event.target.value);
  }

  function handleInput(e: any): void {
    console.log("json: ", e.target.files[0])

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      console.log("e.target.result", e.target.result);
      setFiles(e.target.result);
    };

    if (e.target.files) {
      setProofA(e.target.files[0]);
    }
    // event.preventDefault();
    // setProofA(event.target.value);
  }


  const styles = useMultiStyleConfig("Button", { variant: "outline" });

  return (

    <Card borderColor={"blackAlpha.700"} borderWidth={"1px"} borderRadius={"sm"}>
      <CardHeader>
        <Heading size='md'>Registration</Heading>
        <Heading size='sm'>This step reuired for</Heading>

      </CardHeader>
      <CardBody>
        <FormControl>
          <FormLabel>Proof A</FormLabel>
          <Input type="file"
            sx={{
              "::file-selector-button": {
                border: "none",
                outline: "none",
                mr: 2,
                ...styles,
              }

            }}
            onChange={handleProofA}
          />
          <br />
          <br />
          <FormLabel>Proof B</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }} onChange={handleProofB}
          />
          <br />
          <br />          <FormLabel>Proof C</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }} onChange={handleProofC} />
          <br />
          <br />

          <FormLabel>Input <small>value</small></FormLabel>
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
      </CardFooter></Center>
    </Card>

  );
}
