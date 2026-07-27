'use client';
/** AI 生成：ECharts 客户端封装——手动管理 init / resize / dispose 生命周期 */
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface Props {
  option: EChartsOption;
  height?: number;
  className?: string;
}

export default function Chart({ option, height = 260, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  // 初始化只执行一次；echarts 必须在浏览器端执行，所以放在 useEffect 里
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;
    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  // option 变化时整体重设；notMerge=true 避免旧系列残留导致图例错乱
  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={containerRef} style={{ height }} className={className} />;
}
