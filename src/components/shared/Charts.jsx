import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { useLanguage } from '../../contexts/LanguageContext';

// Color palette matching Tabler/app theme
const colors = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280',
};

/**
 * Line Chart - for trends over time
 */
export const LineChart = ({
  series,
  categories,
  height = 240,
  colors: customColors,
  showLegend = true,
  title,
  curved = true,
}) => {
  const options = useMemo(() => ({
    chart: {
      type: 'line',
      height,
      toolbar: { show: false },
      fontFamily: 'inherit',
      sparkline: { enabled: false },
    },
    stroke: {
      width: 2.5,
      curve: curved ? 'smooth' : 'straight',
    },
    colors: customColors || [colors.primary, colors.success, colors.warning],
    xaxis: {
      categories,
      labels: {
        style: { colors: colors.gray, fontSize: '11px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: colors.gray, fontSize: '11px' },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      padding: { left: 0, right: 0 },
    },
    legend: {
      show: showLegend,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => val },
    },
    title: title ? {
      text: title,
      align: 'left',
      style: { fontSize: '14px', fontWeight: 600, color: '#1f2937' },
    } : undefined,
  }), [categories, customColors, height, showLegend, title, curved]);

  return <Chart options={options} series={series} type="line" height={height} />;
};

/**
 * Area Chart - for cumulative/volume data
 */
export const AreaChart = ({
  series,
  categories,
  height = 240,
  colors: customColors,
  showLegend = false,
  gradient = true,
}) => {
  const options = useMemo(() => ({
    chart: {
      type: 'area',
      height,
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    colors: customColors || [colors.primary],
    fill: gradient ? {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    } : { opacity: 0.3 },
    xaxis: {
      categories,
      labels: {
        style: { colors: colors.gray, fontSize: '11px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: colors.gray, fontSize: '11px' },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    legend: { show: showLegend },
    tooltip: { theme: 'light' },
    dataLabels: { enabled: false },
  }), [categories, customColors, height, showLegend, gradient]);

  return <Chart options={options} series={series} type="area" height={height} />;
};

/**
 * Bar Chart - for comparisons
 */
export const BarChart = ({
  series,
  categories,
  height = 240,
  colors: customColors,
  horizontal = false,
  stacked = false,
  showLegend = true,
}) => {
  const options = useMemo(() => ({
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      fontFamily: 'inherit',
      stacked,
    },
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 4,
        columnWidth: '60%',
        barHeight: '70%',
      },
    },
    colors: customColors || [colors.primary, colors.success, colors.warning],
    xaxis: {
      categories,
      labels: {
        style: { colors: colors.gray, fontSize: '11px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: colors.gray, fontSize: '11px' },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    legend: {
      show: showLegend,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
    },
    tooltip: { theme: 'light' },
    dataLabels: { enabled: false },
  }), [categories, customColors, height, horizontal, stacked, showLegend]);

  return <Chart options={options} series={series} type="bar" height={height} />;
};

/**
 * Donut Chart - for proportions
 */
export const DonutChart = ({
  series,
  labels,
  height = 240,
  colors: customColors,
  showLegend = true,
  centerText,
}) => {
  const options = useMemo(() => ({
    chart: {
      type: 'donut',
      height,
      fontFamily: 'inherit',
    },
    colors: customColors || [colors.success, colors.warning, colors.danger, colors.info, colors.purple],
    labels,
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: !!centerText,
            total: centerText ? {
              show: true,
              label: centerText.label || 'Total',
              formatter: () => centerText.value || '',
            } : undefined,
          },
        },
      },
    },
    legend: {
      show: showLegend,
      position: 'bottom',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    tooltip: { theme: 'light' },
  }), [labels, customColors, height, showLegend, centerText]);

  return <Chart options={options} series={series} type="donut" height={height} />;
};

/**
 * Radial Bar Chart - for progress/gauges
 */
export const RadialBarChart = ({
  series,
  labels,
  height = 240,
  colors: customColors,
  showLabel = true,
}) => {
  const options = useMemo(() => ({
    chart: {
      type: 'radialBar',
      height,
      fontFamily: 'inherit',
    },
    colors: customColors || [colors.primary],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '60%',
        },
        dataLabels: {
          show: showLabel,
          name: {
            fontSize: '14px',
            color: colors.gray,
          },
          value: {
            fontSize: '24px',
            fontWeight: 600,
            color: '#1f2937',
            formatter: (val) => `${val}%`,
          },
        },
        track: {
          background: '#e5e7eb',
          strokeWidth: '100%',
        },
      },
    },
    labels,
    stroke: {
      lineCap: 'round',
    },
  }), [labels, customColors, height, showLabel]);

  return <Chart options={options} series={series} type="radialBar" height={height} />;
};

/**
 * Sparkline Chart - mini inline charts
 */
export const SparklineChart = ({
  data,
  height = 40,
  color,
  type = 'line',
}) => {
  const options = useMemo(() => ({
    chart: {
      type,
      height,
      sparkline: { enabled: true },
      fontFamily: 'inherit',
    },
    colors: [color || colors.primary],
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    fill: type === 'area' ? {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    } : undefined,
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      marker: { show: false },
    },
  }), [color, height, type]);

  const series = [{ data }];

  return <Chart options={options} series={series} type={type} height={height} />;
};

/**
 * Health Vitals Chart - specialized for health metrics
 */
export const VitalsChart = ({
  data,
  height = 200,
  type = 'blood_pressure',
}) => {
  const { language } = useLanguage();

  const chartConfig = useMemo(() => {
    switch (type) {
      case 'blood_pressure':
        return {
          series: [
            { name: language === 'ar' ? 'الانقباضي' : 'Systolic', data: data.systolic || [] },
            { name: language === 'ar' ? 'الانبساطي' : 'Diastolic', data: data.diastolic || [] },
          ],
          colors: [colors.danger, colors.info],
        };
      case 'heart_rate':
        return {
          series: [{ name: language === 'ar' ? 'معدل ضربات القلب' : 'Heart Rate', data: data.values || [] }],
          colors: [colors.danger],
        };
      case 'glucose':
        return {
          series: [{ name: language === 'ar' ? 'مستوى السكر' : 'Glucose Level', data: data.values || [] }],
          colors: [colors.warning],
        };
      case 'weight':
        return {
          series: [{ name: language === 'ar' ? 'الوزن' : 'Weight', data: data.values || [] }],
          colors: [colors.purple],
        };
      case 'oxygen':
        return {
          series: [{ name: language === 'ar' ? 'تشبع الأكسجين' : 'SpO2', data: data.values || [] }],
          colors: [colors.info],
        };
      default:
        return {
          series: [{ name: 'Value', data: data.values || [] }],
          colors: [colors.primary],
        };
    }
  }, [data, type, language]);

  const options = useMemo(() => ({
    chart: {
      type: 'area',
      height,
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    colors: chartConfig.colors,
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: data.labels || [],
      labels: {
        style: { colors: colors.gray, fontSize: '10px' },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: colors.gray, fontSize: '10px' },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      padding: { left: 5, right: 5 },
    },
    legend: {
      show: chartConfig.series.length > 1,
      position: 'top',
      fontSize: '11px',
    },
    tooltip: { theme: 'light' },
    dataLabels: { enabled: false },
  }), [data.labels, chartConfig, height]);

  return <Chart options={options} series={chartConfig.series} type="area" height={height} />;
};

/**
 * Activity Heatmap - for showing activity patterns
 */
export const ActivityHeatmap = ({
  data,
  height = 200,
}) => {
  const options = useMemo(() => ({
    chart: {
      type: 'heatmap',
      height,
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    colors: [colors.primary],
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        colorScale: {
          ranges: [
            { from: 0, to: 25, name: 'Low', color: '#d1fae5' },
            { from: 26, to: 50, name: 'Medium', color: '#6ee7b7' },
            { from: 51, to: 75, name: 'High', color: '#34d399' },
            { from: 76, to: 100, name: 'Very High', color: '#10b981' },
          ],
        },
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      labels: {
        style: { colors: colors.gray, fontSize: '10px' },
      },
    },
    tooltip: { theme: 'light' },
  }), [height]);

  return <Chart options={options} series={data} type="heatmap" height={height} />;
};

export default {
  LineChart,
  AreaChart,
  BarChart,
  DonutChart,
  RadialBarChart,
  SparklineChart,
  VitalsChart,
  ActivityHeatmap,
};
