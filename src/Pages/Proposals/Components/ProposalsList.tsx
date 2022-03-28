import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Table, Section as BaseSection, Loading } from 'Components';
import { useWallet } from '@provenanceio/wallet-lib';
import { useApp, useGovernance, useProposal } from 'redux/hooks';
import { isEmpty } from 'utils';
import { ManageProposalModal } from ".";

const Section = styled(BaseSection)`
  display: flex;
`;

const ProposalsList = () => {
  const { tableCount } = useApp();
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const {
    getAllProposals,
    proposals,
    proposalsLoading: tableLoading,
    proposalsPages: tablePages,
  } = useGovernance();
  const { walletService } = useWallet();
  const { isLoggedIn } = useApp();
  const { handleProposal, ManageProposalBtn, modalFns } = useProposal();
  const [proposalMax, setProposalMax] = useState(1);

  // Calculate the current max proposal ID
  useEffect(() => {
    if (!isEmpty(proposals) && proposalMax === 1) {
      setProposalMax(proposals[0].header.proposalId + 1);
    }
  },[proposals, proposalMax]);

  const {
    state: { address },
  } = walletService;

  const tableData = proposals.map((d: {header: object, timings: object}) => ({ ...d.header, ...d.timings }));

  useEffect(() => {
    getAllProposals({ count: tableCount, page: tableCurrentPage });
  }, [getAllProposals, tableCount, tableCurrentPage]);

  const tableHeaders = [
    { displayName: 'ID', dataName: 'proposalId' },
    { displayName: 'Title', dataName: 'title' },
    { displayName: 'Status', dataName: 'status' },
    { displayName: 'Deposit Percentage', dataName: 'deposit' },
    { displayName: 'Submit Time', dataName: 'submitTime' },
    { displayName: 'Deposit End Time', dataName: 'depositEndTime' },
    { displayName: 'Voting End Time', dataName: 'votingTime.endTime' },
  ];

  return (
    <>
    {isLoggedIn && (
      <Section header>
        {!address ? <Loading /> :
        <ManageProposalBtn />}
        <ManageProposalModal 
          isLoggedIn={isLoggedIn}
          modalOpen={modalFns.modalOpen}
          onClose={modalFns.deactivateModalOpen}
          onProposal={handleProposal}
          proposalId={proposalMax}
          description={"blah"}
          voterId={address}
          title={"blah"}
        />
      </Section>
    )}
    <Section header={!isLoggedIn}>
      <Table
        tableHeaders={tableHeaders}
        tableData={tableData}
        currentPage={tableCurrentPage}
        changePage={setTableCurrentPage}
        totalPages={tablePages}
        isLoading={tableLoading}
        title="Proposals List"
      />
    </Section>
    </>
  );
};

export default ProposalsList;
