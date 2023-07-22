import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { ReactElement, useEffect, useState } from 'react';
import { Provider } from '../../utils/provider.ts';
import zkToken from '../../../artifacts/contracts/zkToken.sol/zkToken.json';
import {
  ChakraProvider,
  Box,
  Text,
  HStack,
  Center,
  FormLabel,
  Input,
} from '@chakra-ui/react';
type CleanupFunction = (() => void) | undefined;

function ChainId(): ReactElement {
  const { chainId } = useWeb3React<Provider>();

  return (
    <span>
      <strong>Chain Id:</strong> {chainId ?? ''}
    </span>
  );
}

function BlockNumber(): ReactElement {
  const { chainId, library } = useWeb3React<Provider>();

  const [blockNumber, setBlockNumber] = useState<number>();

  useEffect((): CleanupFunction => {
    if (!library) {
      return;
    }

    let stale = false;

    async function getBlockNumber(library: Provider): Promise<void> {
      try {
        const blockNumber: number = await library.getBlockNumber();

        if (!stale) {
          setBlockNumber(blockNumber);
        }
      } catch (error: any) {
        if (!stale) {
          setBlockNumber(undefined);
        }

        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    getBlockNumber(library);

    library.on('block', setBlockNumber);

    // cleanup function
    return (): void => {
      stale = true;
      library.removeListener('block', setBlockNumber);
      setBlockNumber(undefined);
    };
  }, [library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <span>
      <strong>Block:</strong>{' '}
      {blockNumber === null ? 'Error' : blockNumber ?? ''}
    </span>
  );
}

function Account(): ReactElement {
  const { account } = useWeb3React<Provider>();

  return (
    <>
      <span>
        <strong>Account:</strong>{' '}
        {typeof account === 'undefined'
          ? ''
          : account
          ? `${account.substring(0, 6)}...${account.substring(
              account.length - 4
            )}`
          : ''}
      </span>
    </>
  );
}

function Balance(): ReactElement {
  const { account, library, chainId } = useWeb3React<Provider>();

  const [balance, setBalance] = useState<ethers.BigNumber>();

  useEffect((): CleanupFunction => {
    if (typeof account === 'undefined' || account === null || !library) {
      return;
    }

    let stale = false;

    async function getBalance(
      library: Provider,
      account: string
    ): Promise<void> {
      const balance: ethers.BigNumber = await library.getBalance(account);

      try {
        if (!stale) {
          setBalance(balance);
        }
      } catch (error: any) {
        if (!stale) {
          setBalance(undefined);

          window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
          );
        }
      }
    }

    getBalance(library, account);

    // create a named balancer handler function to fetch the balance each block. in the
    // cleanup function use the fucntion name to remove the listener
    const getBalanceHandler = (): void => {
      getBalance(library, account);
    };

    library.on('block', getBalanceHandler);

    // cleanup function
    return (): void => {
      stale = true;
      library.removeListener('block', getBalanceHandler);
      setBalance(undefined);
    };
  }, [account, library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>
        <strong>Balance</strong>
      </span>
      <span role="img" aria-label="gold">
        💰
      </span>
      <span>
        {balance === null
          ? 'Error'
          : balance
          ? `${Math.round(+ethers.formatEther(balance.toString()) * 1e4) / 1e4}`
          : ''}
      </span>
    </>
  );
}

function TokenBalance(): ReactElement {
  const { account, library, chainId } = useWeb3React<Provider>();
  const [balance, setBalance] = useState<ethers.BigNumber>();

  useEffect((): (() => void) | undefined => {
    if (typeof account === 'undefined' || account === null || !library) {
      return undefined;
    }

    let stale = false;

    const getBalance = async (
      library: Provider,
      account: string
    ): Promise<void> => {
      const signer = library.getSigner();
      let address: string = '0xa753614F449d263487D506CD40c697E49e28d3d8';
      const ZKT = new ethers.Contract(address, zkToken.abi, signer);

      const balance: ethers.BigNumber = await ZKT.balanceOf(account);

      if (!stale) {
        setBalance(balance);
      }
    };

    getBalance(library, account);

    const getBalanceHandler = (): void => {
      getBalance(library, account);
    };

    library.on('block', getBalanceHandler);

    return (): void => {
      stale = true;
      library.removeListener('block', getBalanceHandler);
      setBalance(undefined);
    };
  }, [account, library, chainId]);

  return (
    <>
      <span>
        <strong>zkToken Balance </strong>
      </span>
      <span role="img" aria-label="gold">
        💰
      </span>
      <span>{balance === null ? 'Error' : balance ? `${balance}` : '0'}</span>
    </>
  );
}

// nonce: aka 'transaction count'
function NextNonce(): ReactElement {
  const { account, library, chainId } = useWeb3React<Provider>();

  const [nextNonce, setNextNonce] = useState<number>();

  useEffect((): CleanupFunction => {
    if (typeof account === 'undefined' || account === null || !library) {
      return;
    }

    let stale = false;

    async function getNextNonce(
      library: Provider,
      account: string
    ): Promise<void> {
      const nextNonce: number = await library.getTransactionCount(account);

      try {
        if (!stale) {
          setNextNonce(nextNonce);
        }
      } catch (error: any) {
        if (!stale) {
          setNextNonce(undefined);

          window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
          );
        }
      }
    }

    getNextNonce(library, account);

    // create a named next nonce handler function to fetch the next nonce each block.
    // in the cleanup function use the fucntion name to remove the listener
    const getNextNonceHandler = (): void => {
      getNextNonce(library, account);
    };

    library.on('block', getNextNonceHandler);

    // cleanup function
    return (): void => {
      stale = true;
      setNextNonce(undefined);
    };
  }, [account, library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  return (
    <>
      <span>
        <strong>Next Nonce:</strong>{' '}
        {nextNonce === null ? 'Error' : nextNonce ?? ''}
      </span>
    </>
  );
}

function StatusIcon(): ReactElement {
  const { active, error } = useWeb3React<Provider>();

  return <Text>{active ? '🟢' : error ? '🔴' : '🟠'}</Text>;
}

export function WalletStatus(): ReactElement {
  return (
    <Center>
      <HStack spacing="24px">
        <Box>
          <ChainId />
        </Box>

        <Box>{<BlockNumber />}</Box>

        <Box>
          <Account />
        </Box>

        <Box>
          <NextNonce />
        </Box>
        <Box>{<Balance />}</Box>
        <Box> </Box>
        <Box>{<TokenBalance />}</Box>
        <Box>
          <StatusIcon />
        </Box>
      </HStack>
    </Center>
  );
}
