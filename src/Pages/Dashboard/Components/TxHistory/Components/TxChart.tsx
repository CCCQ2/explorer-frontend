import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import * as echarts from 'echarts';
import { format, parseISO } from 'date-fns';
import { breakpoints } from 'consts';
import { TxHistoryProps } from 'redux/services';
import { formatDenom, isEmpty, subtractDays } from 'utils';
import Big from 'big.js';
import { useMediaQuery, useOrderbook } from '../../../../../redux/hooks';

const StyledChart = styled.div`
  height: 300px;
  width: 100%;
`;
const StyledMessage = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const chartData = {
  color: [''],
  tooltip: {
    show: true,
    trigger: 'axis',
    axisPointer: {
      lineStyle: {
        color: '',
        width: '1',
      },
    },
    // Needed format for TypeScript
    // eslint-disable-next-line no-empty-pattern
    formatter: ([]) => '',
  },
  grid: {
    right: '15%',
    left: '15%',
  },
  legend: {
    data: ['Transactions', 'Fees'],
    textStyle: {},
    itemGap: 20,
    padding: 0,
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: {},
      axisLabel: {
        rotate: 45,
        color: '',
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      name: 'Transactions',
      alignTicks: true,
      position: 'left',
      offset: 0,
      axisLabel: {
        rotate: 0,
        color: '',
      },
      nameTextStyle: {
        align: 'left',
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '',
        },
      },
      splitLine: {
        lineStyle: {
          color: '',
        },
      },
    },
    {
      type: 'value',
      name: 'Fees (USD)',
      axisTick: {
        inside: true,
        show: true,
      },
      position: 'right',
      offset: 0,
      axisLine: {
        show: true,
        lineStyle: {
          color: '',
        },
      },
      axisLabel: {
        rotate: 0,
        color: '',
      },
      nameTextStyle: {
        align: 'right',
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: '',
        },
      },
    },
  ],
  series: [
    {
      name: 'Transactions',
      type: 'line',
      smooth: true,
      data: {},
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: '',
          },
          {
            offset: 1,
            color: '',
          },
        ]),
      },
    },
    {
      name: 'Fees',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: {},
      areaStyle: {
        color: 'none',
      },
      yAxisIndex: 1,
    },
  ],
};

interface ValueProps {
  value: number;
  name: string;
}

interface TxChartProps {
  data: TxHistoryProps[];
  txHistoryGran: string;
  span?: number;
  today?: Date;
}

interface ParamsArray {
  name: string;
  seriesName: string;
  data: { value: string; name: string };
}

export const TxChart = ({ txHistoryGran, data, span, today }: TxChartProps) => {
  const [chart, setChart] = useState(null);
  const chartElementRef = useRef(null);
  const theme = useTheme();
  const { matches: isSmall } = useMediaQuery(breakpoints.down('sm'));
  const { matches: isLg } = useMediaQuery(breakpoints.down('lg'));
  const granIsDay = txHistoryGran === 'DAY';
  const granIsMonth = txHistoryGran === 'MONTH';
  const { getCurrentPricing, currentPricing } = useOrderbook();

  useEffect(() => {
    getCurrentPricing();
  }, [getCurrentPricing]);

  const txHistoryCount = data && data.length;

  const buildChartData = useCallback(() => {
    const transactions: ValueProps[] = [];
    const fees: ValueProps[] = [];
    const dateArray: TxHistoryProps[] = [];

    // If the txHistoryCount is different, we want to ensure we populate
    // zeros for each day in the time span
    if (txHistoryCount - 1 !== span) {
      // First, build the date array
      for (let i = Number(span); i >= 0; i--) {
        dateArray.push({
          date: new Date(format(subtractDays(today, i), 'yyyy-MM-dd')).getTime(),
          feepayer: null,
          txCount: 0,
          feeAmountInBaseToken: 0,
          gasWanted: 0,
          gasUsed: 0,
          feeAmountInToken: 0,
          feesPaidInUsd: 0,
          maxTokenPriceUsd: 0,
          minTokenPriceUsd: 0,
          avgTokenPriceUsd: 0,
        });
      }
      // Then, fill dateArray with data that exists
      dateArray.forEach((item, idx) => {
        const index = data.findIndex((element) => element.date === item.date);
        if (index !== -1) {
          dateArray[idx] = data[index];
        }
      });
    }
    // Populate series information
    const xAxisData = (dateArray.length === 0 ? data : dateArray).map(
      ({ txCount, date, feesPaidInUsd, feeAmountInToken }) => {
        transactions.push({
          value: txCount,
          name: new Date(date).toISOString(),
        });
        fees.push({
          value: feesPaidInUsd
            ? Number(feesPaidInUsd)
            : new Big(feeAmountInToken).times(currentPricing?.quote?.USD?.price || 0).toNumber(),
          name: new Date(date).toISOString(),
        });
        return format(
          parseISO(new Date(date).toISOString()),
          granIsDay ? 'MMM dd' : granIsMonth ? 'MMM' : 'MM/dd, hh:mm'
        );
      }
    );

    // Now set chart data dynamically
    const colors: string[] = [theme.CHART_LINE_MAIN, theme.CHART_PIE_YES];
    chartData.color = colors;
    // X axis
    chartData.xAxis[0].data = xAxisData;
    chartData.xAxis[0].axisLabel.color = theme.FONT_PRIMARY;
    // Y axis: transactions (left side)
    chartData.yAxis[0].axisLine.lineStyle.color = theme.FONT_PRIMARY;
    chartData.yAxis[0].offset = isSmall ? -14 : 0;
    chartData.yAxis[0].axisLabel.color = theme.FONT_PRIMARY;
    chartData.yAxis[0].axisLabel.rotate = isLg ? 45 : 0;
    chartData.series[0].data = transactions;
    chartData.series[0].areaStyle.color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: theme.CHART_LINE_GRADIENT_START,
      },
      {
        offset: 1,
        color: theme.CHART_LINE_GRADIENT_END,
      },
    ]);
    chartData.yAxis[0].splitLine.lineStyle.color = theme.FONT_PRIMARY;
    // Y axis: fees (right side)
    chartData.yAxis[1].axisLine.lineStyle.color = colors[1];
    chartData.yAxis[1].offset = isSmall ? -14 : 0;
    chartData.yAxis[1].axisLabel.color = theme.FONT_PRIMARY;
    chartData.yAxis[1].axisLabel.rotate = isLg ? -45 : 0;
    chartData.series[1].data = fees;
    chartData.yAxis[1].axisLabel.color = colors[1];
    // Tooltip
    chartData.tooltip.axisPointer.lineStyle.color = colors[0];
    chartData.tooltip.formatter = (params: ParamsArray[]) => {
      let returnString = '';
      let idx = 0;
      params.forEach((p) => {
        returnString += `
        <div style="display:flex;padding:2px;">
          <div 
            style="
              height:10px;
              width:10px;
              border-radius:50%;
              align-self:center;
              margin-right:10px;
              background-color:${colors[idx]};
            "
          >
          </div>
          <div style="text-align:center;">
            ${p.seriesName}: ${
          p.seriesName === 'Fees'
            ? `$${formatDenom(parseFloat(p.data.value), 'USD', {
                decimal: 2,
                minimumFractionDigits: 2,
              })}`
            : formatDenom(Number(p.data.value), '')
        }
          </div>
          </div>`;
        idx++;
      });
      returnString = `<div>${format(
        parseISO(params[0].data.name),
        granIsDay ? 'MMM dd' : 'MMM-yyyy'
      )}</div> ${returnString}`;
      return returnString;
    };
  }, [
    data,
    granIsDay,
    granIsMonth,
    isLg,
    isSmall,
    theme,
    currentPricing,
    span,
    today,
    txHistoryCount,
  ]);
  // Legend
  chartData.legend.textStyle = {
    color: theme.FONT_PRIMARY,
  };

  // Build chart with data
  useEffect(() => {
    let chart: echarts.ECharts | undefined;
    if (txHistoryCount > 0 && !isEmpty(currentPricing)) {
      if (chartElementRef.current) {
        chart =
          echarts.getInstanceByDom(chartElementRef.current as unknown as HTMLElement) ||
          echarts.init(chartElementRef.current as unknown as HTMLElement);
      }
      // Update chart with the data
      buildChartData();
      chart?.setOption(chartData);
      window.addEventListener('resize', () => {
        chart && chart.resize();
      });
    }
    return window.removeEventListener('resize', () => chart && chart.resize());
  }, [setChart, txHistoryCount, chart, buildChartData, currentPricing]);

  return txHistoryCount > 0 ? (
    <StyledChart ref={chartElementRef} />
  ) : (
    <StyledMessage>No transactions available</StyledMessage>
  );
};
