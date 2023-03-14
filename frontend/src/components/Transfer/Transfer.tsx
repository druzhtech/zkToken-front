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
  CardHeader, Text,
  Heading,
  CardBody,
  CardFooter,
  Button,
} from '@chakra-ui/react'
import React from 'react';

export function Transfer(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [zktContract, setW3phContract] = useState<Contract>();
  const [zktContractAddr, setZKTContractAddr] = useState<string>('');
  const [recieverAddr, setRecieverAddr] = useState<string>('');

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

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the W3PH contract one time, when a signer is defined
    if (zktContract || !signer) {
      return;
    }

    // filter = {
    //   address: zktContractAddr,
    //   topics: [
    //     utils.id("Transfer(address,address,uint256)"),
    //     hexZeroPad(myAddress, 32)
    //   ]
    // };

    async function deployZkTokenContract(signer: Signer): Promise<void> {
      const W3PH = new ethers.ContractFactory(
        zkToken.abi,
        zkToken.bytecode,
        signer
      );


      try {
        const zktContract = await W3PH.deploy(1);
        await zktContract.deployed();
        const vers = await zktContract.name();
        setW3phContract(zktContract);
        setVersion(vers);
        window.alert(`ZkToken deployed to: ${zktContract.adreess}`);

        setZKTContractAddr(zktContract.address);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployZkTokenContract(signer);
  }

  function handleInstContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the W3PH contract one time, when a signer is defined
    if (zktContract || !signer) {
      return;
    }

    async function deployZkTokenContract(signer: Signer): Promise<void> {

      let address: string = "0x31eEB76500299284113C029C9B3dC5c0f442689c";

      const ZKT = new ethers.Contract(address, zkToken.abi, signer);

      try {
        console.log(`ZkToken deployed to: ${ZKT.address}`);


        // const vers = await ZKT.w3phVersion();

        setW3phContract(ZKT);
        // setVersion(vers);

        setZKTContractAddr(ZKT.address);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployZkTokenContract(signer);
  }

  function handleAddressChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setAddressInput(event.target.value);
  }

  function handleGetBalanceSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!zktContract) {
      window.alert('Undefined zktContract');
      return;
    }

    if (!addressInput) {
      window.alert('Version cannot be empty');
      return;
    }

    async function getBalance(zktContract: Contract): Promise<void> {
      try {
        console.log("addressInput: ", addressInput)
        const balance = await zktContract.balanceOf(addressInput);
        console.log("setVersionTx: ", balance);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    getBalance(zktContract);
  }

  // Пример вызова функции с отправкой ether
  // https://docs.ethers.org/v5/api/contract/contract/#Contract-functionsCall 
  function handleRegistration(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!zktContract) {
      window.alert('Undefined zktContract');
      return;
    }

    // TODO: check 

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

  function handleProjTypeChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setProjType(event.target.value);
  }

  //TODO: Пример отправки ether на адрес
  function handleSendEthTo(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!zktContract) {
      window.alert('Undefined zktContract');
      return;
    }

    async function submitSendEth(): Promise<void> {
      try {
        // Отправка 1 ETH
        const tx = signer?.sendTransaction({
          to: recieverAddr,
          value: ethers.parseEther("1.0")
        });

      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    submitSendEth();
  }

  const styles = useMultiStyleConfig("Button", { variant: "outline" });


  return (

    <Card borderColor={"blackAlpha.700"} borderWidth={"1px"} borderRadius={"sm"}>
      <CardHeader>
        <Heading size='md'>Transfer</Heading>
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
          />
          <FormHelperText>We'll never share your email.</FormHelperText>
          <FormLabel>Proof A</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }}
          />
          <FormHelperText>We'll never share your email.</FormHelperText>
          <FormLabel>Proof B</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }} />
          <FormHelperText>We'll never share your email.</FormHelperText>
          <FormLabel>Proof C</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }} />
          <FormHelperText>We'll never share your email.</FormHelperText>
          <FormLabel>Input</FormLabel>
          <Input type='file' sx={{
            "::file-selector-button": {
              border: "none",
              outline: "none",
              mr: 2,
              ...styles,
            },
          }} />
          <FormHelperText>We'll never share your email.</FormHelperText>
        </FormControl>

      </CardBody>
      <CardFooter>
        <Button colorScheme='blue'>View here</Button>
      </CardFooter>
    </Card>

  );
}
