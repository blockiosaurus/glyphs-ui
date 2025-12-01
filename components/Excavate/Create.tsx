import { Button, Center, Fieldset, Flex, Image, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { CodeHighlightTabs } from '@mantine/code-highlight';
import { useDisclosure } from '@mantine/hooks';
import { generateSigner, publicKey, transactionBuilder } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
import { notifications } from '@mantine/notifications';
import { useUmi } from '@/providers/useUmi';
import { CreateFormProvider, useCreateForm } from './CreateFormContext';
import { ConfigurePlugins } from './ConfigurePlugins';
import { defaultAuthorityManagedPluginValues, validatePubkey, validateUri } from '@/lib/form';
import { CountdownCards } from './CountdownCards';

export function Create() {
  const umi = useUmi();

  return (
    <CountdownCards />
  );
}
