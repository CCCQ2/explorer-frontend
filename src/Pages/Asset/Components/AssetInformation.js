import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Content, Summary, Loading } from 'Components';
import { numberFormat } from 'utils';
import { useAssets } from 'redux/hooks';

const AssetInformation = () => {
  const { assetId } = useParams();
  const { getAssetInfo, assetInfo, assetInfoLoading } = useAssets();

  useEffect(() => {
    getAssetInfo(assetId);
  }, [assetId, getAssetInfo]);

  const { marker, ownerAddress, supply = {}, mintable, holderCount, txnCount } = assetInfo;
  const { circulation: supplyCirculation, total: supplyTotal } = supply;
  const summaryData = [
    { title: 'Asset Name', value: marker },
    { title: 'Owner', value: ownerAddress, link: `/accounts/${ownerAddress}`, copy: ownerAddress },
    { title: 'Supply', value: `${numberFormat(supplyCirculation)} / ${numberFormat(supplyTotal)}` },
    { title: 'Mintable', value: `${mintable}` },
    { title: 'Holders', value: holderCount },
    { title: 'Transactions', value: numberFormat(txnCount) },
  ];

  return <Content title="Asset Information">{assetInfoLoading ? <Loading /> : <Summary data={summaryData} />}</Content>;
};

export default AssetInformation;
