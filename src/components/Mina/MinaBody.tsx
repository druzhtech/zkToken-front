import React from 'react';
import {
    Box,
    Text,
    Stack,
    useDisclosure,
} from '@chakra-ui/react';
import { Outlet, Link as RouterLink } from "react-router-dom";

export default function MinaBody() {

    return (

        <Stack
            as={Box}
            textAlign={'center'}
            spacing={{ base: 8, md: 14 }}
            py={{ base: 20, md: 36 }}>

            <Text color={'gray.500'}>
                Completely anonymous Mina token created using ZKProofs.
            </Text>
        </Stack>

    );
}
