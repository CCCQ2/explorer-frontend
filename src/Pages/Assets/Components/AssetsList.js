import React, { useState, useEffect } from 'react';
import { Table } from 'Components';
import { useApp, useAssets } from 'redux/hooks';

const AssetsList = () => {
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const { tableCount } = useApp();
  const {
    assets,
    assetsLoading: tableLoading,
    assetsPages: tablePages,
    assetMetadata,
    getAssetsList: getTableData,
  } = useAssets();

  const tableData = assets.map(a => ({
    ...a,
    displayDenom: assetMetadata.find(md => md.base === a.marker)?.display,
  }));

  useEffect(() => {
    getTableData({
      page: tableCurrentPage,
      count: tableCount,
    });
  }, [getTableData, tableCount, tableCurrentPage]);

  const tableHeaders = [
    { displayName: 'Name', dataName: 'marker' },
    { displayName: 'Price', dataName: 'pricePerToken' },
    { displayName: 'Supply', dataName: 'supply' },
    { displayName: 'Total Value', dataName: 'totalBalancePrice' },
    { displayName: 'Holding Account', dataName: 'holdingAccount' },
    { displayName: 'Marker Type', dataName: 'markerType' },
    { displayName: 'Last Tx', dataName: 'lastTxTimestamp' },
  ];

  return (
    <Table
      showAge="lastTxTimestamp"
      tableHeaders={tableHeaders}
      tableData={tableData}
      currentPage={tableCurrentPage}
      changePage={setTableCurrentPage}
      totalPages={tablePages}
      isLoading={tableLoading}
      title="Assets List"
    />
  );
};

export default AssetsList;
