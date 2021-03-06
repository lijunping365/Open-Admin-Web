import React, { useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import {Card, Col, Row, Statistic} from "antd";
import { Chart, Axis, Geom, Legend, Tooltip, LineAdvance } from 'bizcharts';
import { fetchSpiderNumber, fetchSpiderReport } from '@/services/open-admin/dashboard';

const TableList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [statisticNumber, setStatisticNumber] = useState<API.StatisticNumber>();
  const [statisticReport, setStatisticReport] = useState<API.StatisticReport[]>([]);

  // 数据源
  const data = [
    { genre: 'Sports', sold: 275, income: 2300 },
    { genre: 'Strategy', sold: 115, income: 667 },
    { genre: 'Action', sold: 120, income: 982 },
    { genre: 'Shooter', sold: 350, income: 5271 },
    { genre: 'Other', sold: 150, income: 3710 }
  ];

  // 定义度量
  const cols = {  sold: { alias: '销售量' },  genre: { alias: '游戏种类' }};

  const onFetchStatisticData = useCallback(async () => {
    const result = await fetchSpiderNumber();
    setStatisticNumber(result);
    const report = await fetchSpiderReport();
    setStatisticReport(report);
  }, []);

  useEffect(()=>{
    onFetchStatisticData().then(()=>setLoading(false));
  },[]);

  return (
    <PageContainer loading={loading}>
      <Row gutter={16} style={{marginTop:'20px'}}>
        <Col span={6}>
          <Card>
            <Statistic
              title="采集模板数量"
              value={statisticNumber?.spiderTotalNum}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="采集次数"
              value={statisticNumber?.spiderExeSucceedNum}
              suffix={`/ ${  statisticNumber?.spiderExeTotalNum}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="采集任务数量"
              value={statisticNumber?.taskRunningNum}
              suffix={`/ ${  statisticNumber?.taskTotalNum}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="任务执行次数"
              value={statisticNumber?.scheduleSucceedNum}
              suffix={`/ ${  statisticNumber?.scheduleTotalNum}`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{marginTop:'20px'}}>
        <Col span={6}>
          <Card>
            <Statistic
              title="执行器数量"
              value={statisticNumber?.executorOnlineNum}
              suffix={`/ ${  statisticNumber?.executorTotalNum}`}
              />
          </Card>
        </Col>
      </Row>

      <Card style={{marginTop: '20px'}}>
        <Row gutter={16} style={{marginTop:'20px'}}>
          <Col span={12}>
            <Card>
              <Chart padding={[10, 20, 50, 40]} autoFit height={400} data={statisticReport} >
                <LineAdvance
                  shape="smooth"
                  point
                  area
                  position="date*value"
                  color="name"
                />
              </Chart>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Chart width={600} height={400} data={data} scale={cols}>
                <Axis name="genre" />
                <Axis name="sold" />
                <Legend position="top" dy={-20} />
                <Tooltip />
                <Geom type="interval" position="genre*sold" color="genre" />
              </Chart>
            </Card>
          </Col>
        </Row>
      </Card>

    </PageContainer>
  );
};

export default TableList;
