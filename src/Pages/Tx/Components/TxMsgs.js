import React, { Fragment, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import {
  camelToSentence,
  capitalize,
  formatDenom,
  getUTCTime,
  isArray,
  isEmpty,
  isObject,
  maxLength,
} from 'utils';
import { Content, InfiniteScroll, Loading, Summary, Filters } from 'Components';
import { useTxs } from 'redux/hooks';

const DataRow = styled.div`
  display: flex;
  flex-basis: 100%;
  margin-bottom: 10px;
  word-break: ${({ nobreak }) => (nobreak ? 'normal' : 'break-all')};
  align-items: flex-start;
`;

const DataTitle = styled.div`
  min-width: ${({ size }) => (size ? size : '200px')};
  color: ${({ color, theme }) => (color ? color : theme.FONT_TITLE_INFO)};
`;

const MsgContainer = styled.div`
  flex-basis: 100%;
  margin-bottom: 10px;
  padding: 10px 20px;
  border: 1px solid lightgray;
  border-radius: 4px;

  &:last-child {
    margin: 0;
  }
`;

const FiltersWrapper = styled.div`
  position: relative;
  margin-left: 18px;
  margin-bottom: 4px;
`;

const TxMsgs = () => {
  const [filterMsgType, setFilterMsgType] = useState('');
  const {
    txInfo,
    getTxMsgs,
    resetTxMsgs,
    txMsgs,
    txMsgsLoading,
    txMsgsPages,
    txMsgsTotal,
    getTxMsgTypes,
    txMsgTypes,
    txMsgLoading,
  } = useTxs();
  const { txHash } = useParams();

  const loadMsgs = useCallback(
    (page) => {
      getTxMsgs({ txHash, count: 10, page, msgType: filterMsgType });
    },
    [getTxMsgs, txHash, filterMsgType]
  );

  // Get all the Message types for this tx
  useEffect(() => {
    getTxMsgTypes(txHash);
  }, [getTxMsgTypes, txHash]);

  useEffect(() => {
    loadMsgs(1);
    return () => resetTxMsgs(txHash);
  }, [loadMsgs, resetTxMsgs, txHash, filterMsgType]);

  // Use this to check for a reset to 'all' where we will pass '' as the type
  const updateMsgFilterType = (newType) => {
    const finalType = newType === 'allTxTypes' ? '' : newType;
    setFilterMsgType(finalType);
  };

  const msgs = txMsgs?.[txHash]?.map((msg) => [
    { title: 'Tx Type', value: capitalize(msg.type) },
    ...Object.entries(msg?.msg).map(([key, value]) => {
      const title = camelToSentence(key);
      switch (key) {
        case 'amount': {
          let amt = formatDenom(value.amount, value.denom);
          if (isArray(value)) {
            amt = value.map((v) => formatDenom(v.amount, v.denom)).join(', ');
          }
          return {
            title,
            value: amt,
          };
        }
        case 'delegatorAddress': //fallthrough
        case 'fromAddress': // fallthrough
        case 'invoker': // fallthrough
        case 'proposer': // fallthrough
        case 'toAddress': // fallthrough
        case 'validatorAddress': //fallthrough
        case 'voter': //fallthrough
          return {
            title,
            value: txInfo?.monikers?.[value] || maxLength(value, 24, 10),
            link: `/accounts/${value}`,
          };
        case 'time':
          return {
            title,
            value: `${getUTCTime(value)}+UTC`,
          };

        default:
          if (isArray(value) || isObject(value)) {
            return { title, value: JSON.stringify(value), isJson: true };
          }

          return { title, value };
      }
    }),
  ]);

  const infoExists = !isEmpty(msgs);
  const msgTypesExist = Object.keys(txMsgTypes).length > 2;
  // Messate Type Filter Data
  const filterData = [
    {
      title: '',
      type: 'dropdown',
      options: txMsgTypes,
      action: updateMsgFilterType,
    },
  ];

  return (
    <Content
      title={`Messages (${txMsgsTotal})`}
      headerContent={
        !txMsgLoading &&
        msgTypesExist && (
          <FiltersWrapper>
            <Filters filterData={filterData} flush />
          </FiltersWrapper>
        )
      }
    >
      {txMsgsLoading && !infoExists && <Loading />}
      {infoExists ? (
        <InfiniteScroll loading={txMsgsLoading} onLoadMore={loadMsgs} totalPages={txMsgsPages}>
          {({ sentryRef, hasNextPage }) => (
            <Fragment>
              {msgs?.map((tx) => (
                <MsgContainer key={JSON.stringify(tx)}>
                  <Summary data={tx} />
                </MsgContainer>
              ))}
              {(hasNextPage || txMsgsLoading) && <Loading ref={sentryRef} />}
            </Fragment>
          )}
        </InfiniteScroll>
      ) : (
        !txMsgsLoading && (
          <DataRow>
            <DataTitle>No information exists for transaction {txHash}</DataTitle>
          </DataRow>
        )
      )}
    </Content>
  );
};

export default TxMsgs;
