import React from 'react';
import { Wrapper, Section, Header } from 'Components';
import { useBlocks } from 'redux/hooks';
import { BlocksList } from './Components';

const Blocks = () => {
  const { blocksHeight } = useBlocks();

  return (
    <Wrapper>
      <Header title="Blocks Latest Height" value={blocksHeight || 'N/A'} valueLink={blocksHeight ? `/block/${blocksHeight}` : null} />
      <Section header>
        <BlocksList />
      </Section>
    </Wrapper>
  );
};

export default Blocks;
